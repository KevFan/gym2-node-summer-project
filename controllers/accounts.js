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
    member.startingweight = Number(member.startingweight);
    member.height = Number(member.height);
    member.program = [];
    if (memberstore.getMemberByEmail(member.email.toLowerCase()) || trainerstore.getTrainerByEmail(member.email.toLowerCase())) {
      response.render('signup', {
        messageType: 'negative',
        message: 'Email is not unique. Please use another email to sign up',
      });
    } else {
      memberstore.addMember(member);
      logger.info(`registering ${member.email}`);
      response.render('login', {
        messageType: 'positive',
        message: 'Successfully signed up. Login to begin !',
      });
    }

  },

  /**
   * Checks the user/trainer email with password entered and redirects to specific vies if correct
   * @param request to sign in with email & password
   * @param response redirect to view and begin specific user session
   */
  authenticate(request, response) {
    const theEmailToLowerCase = request.body.email.toLowerCase();
    const member = memberstore.getMemberByEmail(theEmailToLowerCase);
    const trainer = trainerstore.getTrainerByEmail(theEmailToLowerCase);
    if (member && member.password === request.body.password) {
      response.cookie('user', member.id);
      logger.info(`logging in ${member.id}`);
      response.redirect('/dashboard');
    } else if (trainer && trainer.password === request.body.password) {
      response.cookie('user', trainer.id);
      logger.info(`logging in trainer ${trainer.id}`);
      response.redirect('/trainerDashboard');
    } else {
      response.render('login', {
        messageType: 'negative',
        message: 'Email/Password do not match. Please try again.',
      });
    }
  },

  /**
   * Returns current user in session
   * @param request to get current user
   * @returns {*} current user from session
   */
  getCurrentUser(request) {
    const userId = request.cookies.user;
    let user = memberstore.getMemberById(userId);
    if (!user) {
      user = trainerstore.getTrainerById(userId);
    }

    return user;
  },

  /**
   * Returns a boolean of whether user in session is a trainer or member
   * @param request to determine whether the request is from a trainer
   * @returns {*} boolean of whether user in session is a trainer or member
   */
  userIsTrainer(request) {
    return (this.getCurrentUser(request) === trainerstore.getTrainerById(request.cookies.user));
  },
};

module.exports = accounts;
