'use strict';

const classStore = require('../models/class-store.js');
const members = require('../models/member-store');
const logger = require('../utils/logger');

const search = {
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
