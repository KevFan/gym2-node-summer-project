'use strict';

const logger = require('../utils/logger');
const accounts = require('./accounts.js');

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
};

module.exports = dashboard;
