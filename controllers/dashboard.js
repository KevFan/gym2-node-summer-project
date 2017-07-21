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
    const loggedInUser = accounts.getCurrentUser(request);
    logger.info('User id is' + loggedInUser.id);
    let classes = classStore.getClassById(request.params.id);
    logger.info('Classes id is ' + request.params.id);

    // For each loop
    classes.sessions.forEach(function (session) {
      // if user id is not found (result is -1)
      let result = session.enrolled.indexOf(loggedInUser.id);

      // If no member is enrolled
      if (result === -1 && session.availability > 0) {
        session.enrolled.push(loggedInUser.id);
        session.availability--;
        logger.info('Enrolling member: ' + loggedInUser.id + ' to session: ' + session.id + ' Availability ' + session.availability);
      } else {
        logger.info('Member ' + loggedInUser.id + ' is already enrolled to ' + session.id);
        logger.info('Or availability ' + session.availability);
      }
    });

    classStore.store.save();
    response.redirect('/classes/' + classes.id);
  },

  enrollSpecificSession(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    logger.info('User id is' + loggedInUser.id);
    const classId = request.params.id;
    const sessionId = request.params.sessionid;
    let specificSession = classStore.getSessionById(classId, sessionId);
    logger.info('Specific session is ', specificSession);

    // If there are members enrolled, find the first index of the user id
    let result = specificSession.enrolled.indexOf(loggedInUser.id);

    // if user id is not found (result is -1)
    if (result === -1 && specificSession.availability > 0) {
      specificSession.enrolled.push(loggedInUser.id);
      specificSession.availability--;
      logger.info('Enrolling member: ' + loggedInUser.id + ' to session: ' + specificSession.id);
      logger.info('Availability left ' + specificSession.availability);
    } else {
      logger.info('member: ' + loggedInUser.id + ' already enrolled to session: ' + specificSession.id);
      logger.info('Or availability ' + specificSession.availability);
    }

    classStore.store.save();
    response.redirect('/classes/' + classId);
  },

  unEnrollAllSession(request, response) {
    const loggedInUserId = accounts.getCurrentUser(request).id;
    let classes = classStore.getClassById(request.params.id);
    classes.sessions.forEach(function (session) {
      let result = session.enrolled.indexOf(loggedInUserId);
      if (result > -1) {
        session.enrolled.splice(result, 1);
        session.availability++;
        logger.info('Unenrolling user ' + loggedInUserId + ' from ' + session.id + ' Availability ' + session.availability);
      } else {
        logger.info('user ' + loggedInUserId + ' is not enrolled in ' + session.id);
      }

    });

    classStore.store.save();
    response.redirect('/classes/' + classes.id);
  },

  unEnrollSpecificSession(request, response) {
    const loggedInUserId = accounts.getCurrentUser(request).id;
    logger.info('User id is' + loggedInUserId);
    const classId = request.params.id;
    const sessionId = request.params.sessionid;

    let specificSession = classStore.getSessionById(classId, sessionId);
    logger.info('Specific session is ', specificSession);
    let result = specificSession.enrolled.indexOf(loggedInUserId);
    if (result > -1) {
      specificSession.enrolled.splice(result, 1);
      specificSession.availability++;
      logger.info('Unenrolling user ' + loggedInUserId + ' from ' + specificSession.id);
      logger.info('Availability left ' + specificSession.availability);
    } else {
      logger.info('user ' + loggedInUserId + ' is not enrolled in ' + specificSession.id);
    }

    classStore.store.save();
    response.redirect('/classes/' + classId);
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

module.exports = dashboard;
