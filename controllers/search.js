'use strict';

const classStore = require('../models/class-store.js');
const members = require('../models/member-store');
const logger = require('../utils/logger');

const search = {
  /**
   * Searches the list of classes and redirects the the classes view if found
   * @param request to search class, contains the class name for search
   * @param response redirects the class view if found, otherwise redirect to current page
   */
  searchClassByName(request, response) {
    const searchClass = classStore.getClassByName(request.body.search);
    logger.info('The search is ', searchClass);
    if (searchClass) {
      logger.info('Redirecting to ' + searchClass.name);
      response.redirect('/classes/' + searchClass.id);
    } else {
      logger.info('No class with name ' + request.body.search);
      response.redirect('back');
    }
  },

  /**
   * Searches the list of member and redirect to the member view if found
   * @param request to search for member, contains the member name and unique email for search
   * @param response redirects the member view if found, otherwise redirect to current page
   */
  searchMember(request, response) {
    let search = request.body.search;
    let email = search.match(/([\w-\.]+)@((?:[\w]+\.)+)([a-zA-Z]{2,4})/g);
    if (email) {
      logger.info('The email is ' + email);
      const member = members.getMemberByEmail(email.toString());
      logger.debug('The member is', member);
      response.redirect('/trainerDashboard/members/' + member.id);
    } else {
      response.redirect('back');
    }
  },
};

module.exports = search;
