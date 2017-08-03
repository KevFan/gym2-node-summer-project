'use strict';

const logger = require('../utils/logger');
const accounts = require('./accounts');

const goal = {
  index(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    const userIsTrainer = accounts.userIsTrainer(request);
    if (userIsTrainer) {
      const viewData = {
        title: 'Trainer Goals',
        isTrainer: userIsTrainer,
        user: loggedInUser,
      };
      response.render('goals', viewData);
      logger.info('trainer goals rendering');
    } else {
      const viewData = {
        title: 'Member Goals',
        isTrainer: userIsTrainer,
        user: loggedInUser,
      };
      response.render('goals', viewData);
      logger.info('member goals rendering');
    }
  },
};

module.exports = goal;
