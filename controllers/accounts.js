'use strict';
const memberstore = require('../models/member-store');
const trainerstore = require('../models/trainer-store');
const logger = require('../utils/logger');
const uuid = require('uuid');

const accounts = {
  /**
   * Renders the index view
   * @param request to render index view
   * @param response to render index view
   */
  index(request, response) {
    const viewData = {
      title: 'Login or Signup',
    };
    response.render('start', viewData);
  },

  /**
   * Renders the login view
   * @param request to render login view
   * @param response to render login view
   */
  login(request, response) {
    const viewData = {
      title: 'Login to the Service',
    };
    response.render('login', viewData);
  },

  /**
   * Logout the current user from session
   * @param request to logout user from session
   * @param response to logout user from session
   */
  logout(request, response) {
    response.cookie('user', '');
    response.redirect('/');
  },

  /**
   * Renders the signup view
   * @param request to render signup view
   * @param response to render signup view
   */
  signup(request, response) {
    const viewData = {
      title: 'Sign Up to the Service',
    };
    response.render('signup', viewData);
  },

  /**
   * Registers a new member
   * @param request to register a new member
   * @param response registers new member
   */
  register(request, response) {
    const member = request.body;
    member.id = uuid();
    memberstore.addMember(member);
    logger.info(`registering ${member.email}`);
    response.redirect('/');
  },

  /**
   * Checks the user/trainer email with password entered and redirects to specific vies if correct
   * @param request to sign in with email & password
   * @param response redirect to view and begin specific user session
   */
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

  /**
   * Returns current user in session
   * @param request to get current user
   * @returns {*} current user from session
   */
  getCurrentUser(request) {
    const userEmail = request.cookies.user;
    let user = memberstore.getMemberByEmail(userEmail);
    if (!user) {
      user = trainerstore.getTrainerByEmail(userEmail);
    }

    return user;
  },

  /**
   * Returns a boolean of whether user in session is a trainer or member
   * @param request to determine whether the request is from a trainer
   * @returns {*} boolean of whether user in session is a trainer or member
   */
  userIsTrainer(request) {
    return (this.getCurrentUser(request) === trainerstore.getTrainerByEmail(request.cookies.user));
  },
};

module.exports = accounts;
