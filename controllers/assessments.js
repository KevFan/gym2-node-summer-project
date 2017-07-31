'use strict';

const logger = require('../utils/logger');
const bookingStore = require('../models/booking-store');
const uuid = require('uuid');
const accounts = require('./accounts');
const trainers = require('../models/trainer-store');
const members = require('../models/member-store');
const analytics = require('../utils/analytics');
const assessmentStore = require('../models/assessment-store');

const bookings = {
  index(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    if (accounts.userIsTrainer(request)) {
      const viewData = {
        title: 'Trainer Assessments',
        bookings: bookingStore.getAllTrainerBookings(loggedInUser.id),
        isTrainer: accounts.userIsTrainer(request),
        allTrainers: trainers.getAllTrainers(),
      };
      response.render('assessments', viewData);
      logger.info('trainer bookings rendering', viewData.bookings);
    } else {
      const viewData = {
        title: 'Member Assessments',
        bookings: bookingStore.getAllUserBookings(loggedInUser.id),
        isTrainer: accounts.userIsTrainer(request),
        allTrainers: trainers.getAllTrainers(),
        assessmentlist: assessmentStore.getAssessmentList(loggedInUser.id),
        user: loggedInUser,
        stats: analytics.generateMemberStats(loggedInUser),
      };
      response.render('assessments', viewData);
      logger.info('member bookings rendering', viewData.bookings);
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
    bookingStore.addBooking(newBooking);
    bookingStore.store.save();
    response.redirect('/assessments');
  },

  deleteBooking(request, response) {
    bookingStore.removeBooking(request.params.id);
    response.redirect('/assessments');
  },

  updateBooking(request, response) {
    let booking = bookingStore.getBookingById(request.params.id);
    booking.trainerName = request.body.trainer;
    booking.dateTime = request.body.dateTime;
    booking.trainerid = trainers.getTrainerByName(request.body.trainer).id;
    booking.store.save();
    response.redirect('/assessments');
  },

  viewMemberAssessments(request, response) {
    const viewData = {
      title: 'Trainer Dashboard',
      user: members.getMemberById(request.params.userid),
      allTrainers: trainers.getAllTrainers(),
      assessmentlist: assessmentStore.getAssessmentList(request.params.userid),
      stats: analytics.generateMemberStats(members.getMemberById(request.params.userid)),
    };
    response.render('trainerAddAssessment', viewData);
  },
};

module.exports = bookings;
