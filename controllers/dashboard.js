'use strict';

const _ = require('lodash');
const logger = require('../utils/logger');
const accounts = require('./accounts.js');
const classStore = require('../models/class-store.js');
const trainers = require('../models/trainer-store');
const members = require('../models/member-store');
const analytics = require('../utils/analytics');
const assessmentStore = require('../models/assessment-store');
const bookingStore = require('../models/booking-store');
const goalStore = require('../models/goal-store');
const sort = require('../utils/sort');
const goalHelpers = require('../utils/goalHelpers');

const dashboard = {
  /**
   * Renders the member dashboard view, passing all information needed to correctly render. Goals
   * are sorted by recent to old and each goal status is set on each request to render the dashboard
   * @param request to render dashboard view
   * @param response renders the dashboard view
   */
  index(request, response) {
    logger.info('dashboard rendering');
    const loggedInUser = accounts.getCurrentUser(request);
    if (goalStore.getGoalList(loggedInUser.id)) {
      sort.sortDateTimeNewToOld(goalStore.getGoalList(loggedInUser.id).goals);
      goalHelpers.setGoalStatusChecks(loggedInUser.id);
    }

    const viewData = {
      title: 'Member Dashboard',
      bookings: sort.sortDateTimeNewToOld(bookingStore.getAllUserBookings(loggedInUser.id)),
      allTrainers: trainers.getAllTrainers(),
      assessmentlist: assessmentStore.getAssessmentList(loggedInUser.id),
      user: loggedInUser,
      stats: analytics.generateMemberStats(loggedInUser),
      goals: goalStore.getGoalList(loggedInUser.id),
    };
    response.render('dashboard', viewData);
  },

  /**
   * Enrolls the member to all sessions in a class
   * @param request to enroll the member to all sessions
   * @param response enrolls the member and displays success/un-success messages
   */
  enrollAllSessions(request, response) {
    const loggedInUserId = accounts.getCurrentUser(request).id;
    logger.info('User id is' + loggedInUserId);
    let classes = classStore.getClassById(request.params.id);
    logger.info('Classes id is ' + request.params.id);
    let message = [];

    // For each session loop
    classes.sessions.forEach(function (session) {
      // Call function that checks whether member should be enrolled or not
      message.push(enrollChecksHelper(session, loggedInUserId));
    });

    saveAndRedirectHelper(classes.id, response, message, request);
    logger.info('Message is ' + message);
  },

  /**
   * Enrolls the member to specific sessions in a class
   * @param request to enroll the member to a specific session
   * @param response enrolls the member and displays success/un-success message
   */
  enrollSpecificSession(request, response) {
    const loggedInUserId = accounts.getCurrentUser(request).id;
    logger.info('User id is' + loggedInUserId);
    const classId = request.params.id;
    const sessionId = request.params.sessionid;
    let specificSession = classStore.getSessionById(classId, sessionId);
    logger.info('Specific session is ', specificSession);

    // Call function that checks whether member should be enrolled or not
    let message = [];
    message.push(enrollChecksHelper(specificSession, loggedInUserId));
    saveAndRedirectHelper(classId, response, message, request);
  },

  /**
   * Un-enrolls the member from all sessions in a class
   * @param request to un-enroll the member from all sessions
   * @param response un-enrolls the member and displays success/un-success messages
   */
  unEnrollAllSession(request, response) {
    const loggedInUserId = accounts.getCurrentUser(request).id;
    let classes = classStore.getClassById(request.params.id);
    let message = [];
    classes.sessions.forEach(function (session) {
      message.push(unEnrollChecksHelper(session, loggedInUserId));
    });

    saveAndRedirectHelper(classes.id, response, message, request);
  },

  /**
   * Un-enrolls the member from a specific session in a class
   * @param request to un-enroll the member from a specific session
   * @param response un-enrolls the member and displays success/un-success message
   */
  unEnrollSpecificSession(request, response) {
    const loggedInUserId = accounts.getCurrentUser(request).id;
    logger.info('User id is' + loggedInUserId);
    const classId = request.params.id;
    const sessionId = request.params.sessionid;

    let specificSession = classStore.getSessionById(classId, sessionId);
    logger.info('Specific session is ', specificSession);
    let message = [];
    message.push(unEnrollChecksHelper(specificSession, loggedInUserId));

    saveAndRedirectHelper(classId, response, message, request);
  },

  /**
   * Renders the individual personal routine from the member's fitness programme
   * @param request
   * @param response
   */
  viewPersonalRoutine(request, response) {
    const routineId = request.params.id;
    const userId = request.params.userid;
    const isTrainer = accounts.userIsTrainer(request);
    let user = members.getMemberById(userId);
    let routine = _.find(user.program, { id: routineId });

    logger.info('The routine is ', routine);
    logger.info('User is trainer? ' + isTrainer);
    const viewData = {
      title: 'Fitness Routine',
      routine: routine,
      isTrainer: isTrainer,
      userId: userId,
      user: user,
    };

    response.render('fitnessExercises', viewData);
  },
};

/**
 * Helper object that performs the checks for enrolling a member to a session in a class.
 * Checks are there any available spaces left and is the member already enrolled
 * @param specificSession the class session
 * @param loggedInUserId the memberId
 * @returns {{message: string, positive: boolean}} a string and boolean of whether the enrollment
 * was successful
 */
const enrollChecksHelper = function (specificSession, loggedInUserId) {
  let result = specificSession.enrolled.indexOf(loggedInUserId);

  // if user id is not found (result is -1)
  if (result === -1 && specificSession.availability > 0 && new Date() < new Date(specificSession.dateTime)) {
    specificSession.enrolled.push(loggedInUserId);
    specificSession.availability--;
    logger.info('Enrolling member: ' + loggedInUserId + ' to session: ' + specificSession.id);
    logger.info('Availability left ' + specificSession.availability);
    return {
      messageType: 'positive',
      message: 'You have just enrolled to class session on ' + specificSession.dateTime,
    };
  }
};

/**
 * Helper object that performs the checks for un-enrolling a member from a session in a class.
 * Checks is the member already un-enrolled
 * @param specificSession the class session
 * @param loggedInUserId the memberId
 * @returns {{message: string, positive: boolean}} a string and boolean of whether the un-enrollment
 * was successful
 */
const unEnrollChecksHelper = function (specificSession, loggedInUserId) {
  let result = specificSession.enrolled.indexOf(loggedInUserId);
  if (result > -1 && new Date() < new Date(specificSession.dateTime)) {
    specificSession.enrolled.splice(result, 1);
    specificSession.availability++;
    logger.info('Unenrolling user ' + loggedInUserId + ' from ' + specificSession.id);
    logger.info('Availability left ' + specificSession.availability);
    return {
      message: '\nYou have unenrolled from the class session on ' + specificSession.dateTime,
      messageType: 'positive',
    };
  }
};

/**
 * Helper object to save and re-render the page with the success/un-successful messages in enrolling
 * or un-enrolling in a class
 * @param classId Id of the class to get at sessions
 * @param response to render the memberClassSessions view
 * @param message array of success/un-successful messages
 * @param loggedInUserId member Id
 */
const saveAndRedirectHelper = function (classId, response, message, request) {
  classStore.store.save();
  logger.info('classes id: ' + classId);
  const viewData = {
    title: 'Classes',
    classes: classStore.getClassById(classId),
    message: message,
    user: accounts.getCurrentUser(request),
  };
  response.render('memberClassSessions', viewData);
};

module.exports = dashboard;
