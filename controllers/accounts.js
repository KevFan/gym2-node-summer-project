'use strict';
const memberstore = require('../models/member-store');
const trainerstore = require('../models/trainer-store');
const logger = require('../utils/logger');
const uuid = require('uuid');

const accounts = {

  index(request, response) {
    const viewData = {
      title: 'Login or Signup',
    };
    response.render('start', viewData);
  },

  login(request, response) {
    const viewData = {
      title: 'Login to the Service',
    };
    response.render('login', viewData);
  },

  logout(request, response) {
    response.cookie('spacebook', '');
    response.redirect('/');
  },

  signup(request, response) {
    const viewData = {
      title: 'Login to the Service',
    };
    response.render('signup', viewData);
  },

  register(request, response) {
    const member = request.body;
    member.id = uuid();
    memberstore.addMember(member);
    logger.info(`registering ${member.email}`);
    response.redirect('/');
  },

  authenticate(request, response) {
    const member = memberstore.getMemberByEmail(request.body.email);
    const trainer = trainerstore.getTrainerByEmail(request.body.email);
    if (member && member.password === request.body.password) {
      response.cookie('user', member.email);
      logger.info(`logging in ${member.email}`);
      response.redirect('/dashboard');
    } else if (trainer && trainer.password === request.body.password) {
      response.cookie('user', trainer.email);
      logger.info(`logging in trainer ${trainer.email}`);
      response.redirect('/trainerDashboard');
    } else {
      response.redirect('/login');
    }
  },

  getCurrentUser(request) {
    const userEmail = request.cookies.user;
    let user = memberstore.getMemberByEmail(userEmail);
    if (!user) {
      user = trainerstore.getTrainerByEmail(userEmail);
    }

    return user;
  },

  userIsTrainer(request) {
    return (this.getCurrentUser(request) === trainerstore.getTrainerByEmail(request.cookies.user));
  },
};

module.exports = accounts;
