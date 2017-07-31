'use strict';

const logger = require('../utils/logger');
const accounts = require('./accounts.js');

const settings = {
  index(request, response) {
    logger.info('about rendering');
    const viewData = {
      title: 'Settings',
      isTrainer: accounts.userIsTrainer(request),
    };
    response.render('settings', viewData);
  },
};

module.exports = settings;
