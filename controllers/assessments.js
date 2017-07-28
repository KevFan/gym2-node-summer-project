'use strict';

const logger = require('../utils/logger');
const assessmentStore = require('../models/assessment-store');
const uuid = require('uuid');
const accounts = require('./accounts');
const trainers = require('../models/trainer-store');

const assessments = {
  index(request, response) {
    if (accounts.userIsTrainer(request)) {
      const viewData = {
        title: 'Trainer Assessments',
        assessments: assessmentStore.getAllTrainerBookings(accounts.getCurrentUser(request).id),
        isTrainer: accounts.userIsTrainer(request),
        allTrainers: trainers.getAllTrainers(),
      };
      response.render('assessments', viewData);
      logger.info('trainer bookings rendering', viewData.assessments);
    } else {
      const viewData = {
        title: 'Member Assessments',
        assessments: assessmentStore.getAllUserBookings(accounts.getCurrentUser(request).id),
        isTrainer: accounts.userIsTrainer(request),
        allTrainers: trainers.getAllTrainers(),
      };
      response.render('assessments', viewData);
      logger.info('member bookings rendering', viewData.assessments);
    }
  },

  addBooking(request, response) {
    const newBooking = {
      id: uuid(),
      userid: accounts.getCurrentUser(request).id,
      userName: accounts.getCurrentUser(request).name,
      trainerid: trainers.getTrainerByName(request.body.trainer).id,
      trainerName: request.body.trainer,
      dateTime: request.body.dateTime,
      status: 'Pending',
    };
    assessmentStore.addBooking(newBooking);
    assessmentStore.store.save();
    response.redirect('/assessments');
  },

  deleteBooking(request, response) {
    assessmentStore.removeBooking(request.params.id);
    response.redirect('/assessments');
  },
};

module.exports = assessments;
