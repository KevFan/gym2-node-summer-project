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

  addClass(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    const newClass = {
      id: uuid(),
      userid: loggedInUser.id,
      name: request.body.name,
      duration: request.body.duration,
      capacity: request.body.capacity,
      difficulty: request.body.difficulty,
      hidden: true,
      numSessions: Number(request.body.numSessions),
      sessions: [],
    };
    logger.debug('Creating a new Class', newClass);
    classStore.addClass(newClass);
    response.redirect('/classes');
  },

  deleteClass(request, response) {
    logger.debug(`Deleting Class ${request.params.id}`);
    classStore.removeClass(request.params.id);
    response.redirect('/classes');
  },

  hideOrUnhideClass(request, response) {
    const classId = request.params.id;
    let classes = classStore.getClassById(classId);
    classes.hidden = !classes.hidden;
    classStore.store.save();
    logger.info('Setting class: ' + classId + ' Hidden:' + classes.hidden);
    response.redirect('/classes');
  },
};

module.exports = dashboard;
