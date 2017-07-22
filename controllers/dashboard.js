'use strict';

const _ = require('lodash');
const logger = require('../utils/logger');
const accounts = require('./accounts.js');
const classStore = require('../models/class-store.js');

const dashboard = {
  index(request, response) {
    logger.info('dashboard rendering');
    const loggedInUser = accounts.getCurrentUser(request);
    const viewData = {
      title: 'Member Dashboard',
      user: loggedInUser,
    };
    response.render('dashboard', viewData);
  },

  enrollAllSessions(request, response) {
    const loggedInUserId = accounts.getCurrentUser(request).id;
    logger.info('User id is' + loggedInUserId);
    let classes = classStore.getClassById(request.params.id);
    logger.info('Classes id is ' + request.params.id);

    // For each session loop
    classes.sessions.forEach(function (session) {
      // Call function that checks whether member should be enrolled or not
      enrollChecksHelper(session, loggedInUserId);
    });

    saveAndRedirectHelper(classes.id, response);
  },

  enrollSpecificSession(request, response) {
    const loggedInUserId = accounts.getCurrentUser(request).id;
    logger.info('User id is' + loggedInUserId);
    const classId = request.params.id;
    const sessionId = request.params.sessionid;
    let specificSession = classStore.getSessionById(classId, sessionId);
    logger.info('Specific session is ', specificSession);

    // Call function that checks whether member should be enrolled or not
    enrollChecksHelper(specificSession, loggedInUserId);
    saveAndRedirectHelper(classId, response);
  },

  unEnrollAllSession(request, response) {
    const loggedInUserId = accounts.getCurrentUser(request).id;
    let classes = classStore.getClassById(request.params.id);
    classes.sessions.forEach(function (session) {
      unEnrollChecksHelper(session, loggedInUserId);
    });

    saveAndRedirectHelper(classes.id, response);
  },

  unEnrollSpecificSession(request, response) {
    const loggedInUserId = accounts.getCurrentUser(request).id;
    logger.info('User id is' + loggedInUserId);
    const classId = request.params.id;
    const sessionId = request.params.sessionid;

    let specificSession = classStore.getSessionById(classId, sessionId);
    logger.info('Specific session is ', specificSession);
    unEnrollChecksHelper(specificSession, loggedInUserId);

    saveAndRedirectHelper(classId, response);
  },

  searchClassByName(request, response) {
    const searchClass = classStore.getClassByName(request.body.search);
    logger.info('The search is ', searchClass);
    if (searchClass) {
      logger.info('Redirecting to ' + searchClass.name);
      response.redirect('/classes/' + searchClass.id);
    } else {
      logger.info('No class with name ' + request.body.search);
      response.redirect('/classes/');
    }
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
  } else {
    logger.info('member: ' + loggedInUserId + ' already enrolled to session: ' + specificSession.id);
    logger.info('Or availability ' + specificSession.availability);
  }
};

const unEnrollChecksHelper = function (specificSession, loggedInUserId) {
  let result = specificSession.enrolled.indexOf(loggedInUserId);
  if (result > -1) {
    specificSession.enrolled.splice(result, 1);
    specificSession.availability++;
    logger.info('Unenrolling user ' + loggedInUserId + ' from ' + specificSession.id);
    logger.info('Availability left ' + specificSession.availability);
  } else {
    logger.info('user ' + loggedInUserId + ' is not enrolled in ' + specificSession.id);
  }
};

const saveAndRedirectHelper = function (classId, response) {
  classStore.store.save();
  response.redirect('/classes/' + classId);
};

module.exports = dashboard;
