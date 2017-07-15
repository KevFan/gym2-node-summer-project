/**
 * Created by kevin on 15/07/2017.
 */

'use strict';

const logger = require('../utils/logger');
const classStore = require('../models/class-store');
const uuid = require('uuid');
const accounts = require('./accounts');

const classes = {
  index(request, response) {
    logger.info('user is ' + accounts.userIsTrainer(request));
    const viewData = {
      title: 'Classes',
      classes: classStore.getAllClasses(),
    };
    if (accounts.userIsTrainer(request)) {
      viewData.title = 'Trainer Classes';
      response.render('trainerClasses', viewData);
      logger.info('trainer classes rendering', viewData.classes);
    } else {
      viewData.title = 'Member Classes';
      response.render('memberClasses', viewData);
      logger.info('member classes rendering', viewData.classes);
    }
  },

  addSession(request, response) {
    const classId = request.params.id;
    const classes = classStore.getClassById(classId);
    const newSession = {
      id: uuid(),
      location: request.body.location,
      date: request.body.date,
      time: request.body.time,
    };
    logger.debug('New session', newSession);
    classStore.addSession(classId, newSession);
    response.redirect('/trainerDashboard/classes/' + classId);
  },

  listClassSessions(request, response) {
    const classId = request.params.id;
    logger.info('classes id: ' + classId);
    const viewData = {
      title: 'Classes',
      classes: classStore.getClassById(classId),
    };
    if (accounts.userIsTrainer(request)) {
      response.render('trainerClassSessions', viewData);
    } else {
      response.render('memberClassSessions', viewData);
    }
  },
};

module.exports = classes;
