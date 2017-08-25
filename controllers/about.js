'use strict';

const logger = require('../utils/logger');
const accounts = require('./accounts');

const about = {
  /**
   * Renders the about view
   * @param request to render about view
   * @param response to render about view
   */
  index(request, response) {
    logger.info('about rendering');
    const viewData = {
      title: 'About Node Gym',
      user: accounts.getCurrentUser(request),
      isTrainer: accounts.userIsTrainer(request),
    };
    response.render('about', viewData);
  },
};

module.exports = about;
