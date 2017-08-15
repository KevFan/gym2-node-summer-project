'use strict';

const logger = require('../utils/logger');

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
    };
    response.render('about', viewData);
  },
};

module.exports = about;
