'use strict';

const logger = require('../utils/logger');
const accounts = require('./accounts');

const fitness = {
  index(request, response) {
    const user = accounts.getCurrentUser(request);
    const isTrainer = accounts.userIsTrainer(request);
    logger.info('user is trainer? ' + isTrainer);
    if (isTrainer) {
      const viewData = {
        title: 'Trainer Fitness Programmes',
        user: user,
        isTrainer: isTrainer,
      };
      response.render('fitness', viewData);
      logger.info('trainer fitness programmes rendering');
    } else {
      const viewData = {
        title: 'Member Fitness Programme',
        user: user,
      };
      response.render('fitness', viewData);
      logger.info('member fitness programmes rendering');
    }
  },
};

module.exports = fitness;
