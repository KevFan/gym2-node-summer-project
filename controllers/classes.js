/**
 * Created by kevin on 15/07/2017.
 */

'use strict';

const logger = require('../utils/logger');
const classStore = require('../models/class-store');
const uuid = require('uuid');

const classes = {
  index(request, response) {
    const classId = request.params.id;
    logger.info('classes id: ' + classId);
    const viewData = {
      title: 'Classes',
      classes: classStore.getClassById(classId),
    };
    response.render('trainerClassSessions', viewData);
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
};

module.exports = classes;
