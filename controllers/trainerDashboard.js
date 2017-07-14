'use strict';

const logger = require('../utils/logger');
const accounts = require('./accounts.js');
const classStore = require('../models/class-store.js');
const uuid = require('uuid');

const dashboard = {
  index(request, response) {
    logger.info('trainer dashboard rendering');
    const loggedInUser = accounts.getCurrentUser(request);
    const viewData = {
      title: 'Trainer Dashboard',
      user: loggedInUser,
    };
    response.render('trainerDashboard', viewData);
  },

  trainerListClasses(request, response) {
    const viewData = {
      title: 'Trainer Classes',
      classes: classStore.getAllClasses(),
    };
    response.render('trainerClasses', viewData);
    logger.info('trainer classes rendering', viewData.classes);
  },

  addClass(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    const newClass = {
      id: uuid(),
      userid: loggedInUser.id,
      name: request.body.name,
      duration: request.body.duration,
      capacity: request.body.capacity,
      difficulty: request.body.difficulty,
      numSessions: Number(request.body.numSessions),
      sessions: [],
    };
    logger.debug('Creating a new Class', newClass);
    classStore.addClass(newClass);
    response.redirect('/trainerDashboard/classes');
  },
};

module.exports = dashboard;
