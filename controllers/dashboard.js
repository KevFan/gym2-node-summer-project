'use strict';

const _ = require('lodash');
const logger = require('../utils/logger');
const accounts = require('./accounts.js');
const classStore = require('../models/class-store.js');
const trainers = require('../models/trainer-store');
const analytics = require('../utils/analytics');
const assessmentStore = require('../models/assessment-store');
const bookingStore = require('../models/booking-store');
const goalStore = require('../models/goal-store');

const dashboard = {
  index(request, response) {
    logger.info('dashboard rendering');
    const loggedInUser = accounts.getCurrentUser(request);
    setGoalStatusChecks(loggedInUser.id);
    const viewData = {
      title: 'Member Assessments',
      bookings: bookingStore.getAllUserBookings(loggedInUser.id),
      allTrainers: trainers.getAllTrainers(),
      assessmentlist: assessmentStore.getAssessmentList(loggedInUser.id),
      user: loggedInUser,
      stats: analytics.generateMemberStats(loggedInUser),
      goals: goalStore.getGoalList(loggedInUser.id),
    };
    response.render('dashboard', viewData);
  },

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

    saveAndRedirectHelper(classes.id, response, message, loggedInUserId);
    logger.info('Message is ' + message);
  },

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
    saveAndRedirectHelper(classId, response, message, loggedInUserId);
  },

  unEnrollAllSession(request, response) {
    const loggedInUserId = accounts.getCurrentUser(request).id;
    let classes = classStore.getClassById(request.params.id);
    let message = [];
    classes.sessions.forEach(function (session) {
      message.push(unEnrollChecksHelper(session, loggedInUserId));
    });

    saveAndRedirectHelper(classes.id, response, message, loggedInUserId);
  },

  unEnrollSpecificSession(request, response) {
    const loggedInUserId = accounts.getCurrentUser(request).id;
    logger.info('User id is' + loggedInUserId);
    const classId = request.params.id;
    const sessionId = request.params.sessionid;

    let specificSession = classStore.getSessionById(classId, sessionId);
    logger.info('Specific session is ', specificSession);
    let message = [];
    message.push(unEnrollChecksHelper(specificSession, loggedInUserId));

    saveAndRedirectHelper(classId, response, message, loggedInUserId);
  },
};

const enrollChecksHelper = function (specificSession, loggedInUserId) {
  let result = specificSession.enrolled.indexOf(loggedInUserId);

  // if user id is not found (result is -1)
  if (result === -1 && specificSession.availability > 0) {
    specificSession.enrolled.push(loggedInUserId);
    specificSession.availability--;
    logger.info('Enrolling member: ' + loggedInUserId + ' to session: ' + specificSession.id);
    logger.info('Availability left ' + specificSession.availability);
    return {
      message: '\nYou have just enrolled to class session on ' + specificSession.dateTime,
      positive: true,
    };
  } else {
    logger.info('member: ' + loggedInUserId + ' already enrolled to session: ' + specificSession.id);
    logger.info('Or availability ' + specificSession.availability);
    return {
      message: '\nYou are already enrolled in the class session ' + specificSession.dateTime,
      positive: false,
    };
  }
};

const unEnrollChecksHelper = function (specificSession, loggedInUserId) {
  let result = specificSession.enrolled.indexOf(loggedInUserId);
  if (result > -1) {
    specificSession.enrolled.splice(result, 1);
    specificSession.availability++;
    logger.info('Unenrolling user ' + loggedInUserId + ' from ' + specificSession.id);
    logger.info('Availability left ' + specificSession.availability);
    return {
      message: '\nYou have unenrolled from the class session on ' + specificSession.dateTime,
      positive: true,
    };
  } else {
    logger.info('user ' + loggedInUserId + ' is not enrolled in ' + specificSession.id);
    return {
      message: '\nYou are not enrolled in ' + specificSession.dateTime,
      positive: false,
    };
  }
};

const saveAndRedirectHelper = function (classId, response, message, loggedInUserId) {
  classStore.store.save();

  // response.redirect('/classes/' + classId);
  logger.info('classes id: ' + classId);
  const viewData = {
    title: 'Classes',
    classes: classStore.getClassById(classId),
    message: message,
    userId: loggedInUserId,
  };
  response.render('memberClassSessions', viewData);
};

const setGoalStatusChecks = function (userId) {
  let goalList = goalStore.getGoalList(userId);
  let today = new Date().setHours(0, 0, 0, 0);
  if (goalList) {
    goalList.goals.forEach(function (goal) {
      let goalDate = new Date(goal.date).getTime();
      let time = ((Number(today) - Number(goalDate)) / 1000 - 259200);
      logger.debug('Goal Date: ' + ((Number(today) - Number(goalDate)) / 1000));
      logger.debug('Time:' + time);
      if (goalDate > today) {
        goal.status = 'Open';
      } else if (time <= 0) {
        goal.status = 'Awaiting Processing';
        let assessment = assessmentStore.getFirstAssessmentWithinThreeDays(userId, goal.date);
        if (assessment[0]) {
          let assessmentDate = new Date(assessment[0].date).getTime();
          let resultingDate = ((goalDate - assessmentDate) / 1000 - 259200);
          logger.debug('Assessment Time: ' + assessmentDate);
          logger.debug('Resulting Time: ' + resultingDate);
          if (resultingDate < 0) {
            let compare = compareGoalToAssessment(assessment[0], goal);
            if (compare) {
              goal.status = 'Achieved';
            } else {
              goal.status = 'Missed';
            }
          }
        }
      }

      goalStore.store.save();
    });

  }
};

const compareGoalToAssessment = function (assessment, goal) {
  let totalAssessment = assessment.weight + assessment.chest + assessment.thigh + assessment.upperArm +
    assessment.waist + assessment.hips;
  let totalGoal = goal.weight + goal.chest + goal.thigh + goal.upperArm + goal.waist + goal.hips;
  return (totalAssessment < totalGoal);
};

module.exports = dashboard;
