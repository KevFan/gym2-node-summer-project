'use strict';

const logger = require('../utils/logger');
const assessmentStore = require('../models/assessment-store');
const uuid = require('uuid');
const accounts = require('./accounts');

const assessments = {
  index(request, response) {
    const viewData = {
      title: 'Assessments',
      assessments: assessmentStore.getAllBookings(),
      isTrainer: accounts.userIsTrainer(request),
    };
    if (accounts.userIsTrainer(request)) {
      viewData.title = 'Trainer Assessments';
      response.render('assessments', viewData);
      logger.info('trainer assessments rendering', viewData.classes);
    } else {
      viewData.title = 'Member Assessments';
      response.render('assessments', viewData);
      logger.info('member assessments rendering', viewData.classes);
    }
  },
};

module.exports = assessments;
