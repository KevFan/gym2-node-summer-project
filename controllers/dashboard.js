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
      // If no member is enrolled
      if (session.enrolled.length === 0) {
        session.enrolled.push(loggedInUser.id);
        logger.info('i: enrolling member: ' + loggedInUser.id + ' to session: ' + session.id);
      } else {
        // If there are members enrolled, find the first index of the user id
        let result = session.enrolled.indexOf(loggedInUser.id);

        // if user id is not found (result is -1)
        if (result === -1) {
          session.enrolled.push(loggedInUser.id);
          logger.info('j: enrolling member: ' + loggedInUser.id + ' to session: ' + session.id);
        }
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
    if (result === -1) {
      specificSession.enrolled.push(loggedInUser.id);
      logger.info('enrolling member: ' + loggedInUser.id + ' to session: ' + specificSession.id);
    } else {
      logger.info('member: ' + loggedInUser.id + ' already enrolled to session: ' + specificSession.id);

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
      }

      logger.info('Unenrolling user ' + loggedInUserId + ' from ' + session.id);
    });

    classStore.store.save();
    response.redirect('/classes/' + classes.id);
  },
};

module.exports = dashboard;
