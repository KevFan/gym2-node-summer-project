'use strict';

const logger = require('../utils/logger');
const bookingStore = require('../models/booking-store');
const trainers = require('../models/trainer-store');
const members = require('../models/member-store');
const uuid = require('uuid');

const bookings = {
  /**
   * Adds a booking to the booking list
   * @param request to add a booking. Contains the memberId, trainerId, and DateTime for booking
   * @param response adds the booking and redirect's back to the page where the request was from
   */
  addBooking(request, response) {
    const newBooking = {
      id: uuid(),
      userid: request.params.id,
      userName: members.getMemberById(request.params.id).name,
      trainerid: trainers.getTrainerByName(request.body.trainer).id,
      trainerName: request.body.trainer,
      dateTime: request.body.dateTime,
      status: 'Pending',
    };
    bookingStore.addBooking(newBooking);
    bookingStore.store.save();
    response.redirect('back');
  },

  /**
   * Deletes a booking
   * @param request to delete a booking, contains the bookingId to delete
   * @param response redirects back to the page where the request was from
   */
  deleteBooking(request, response) {
    bookingStore.removeBooking(request.params.id);
    response.redirect('back');
  },

  /**
   * Updates a booking
   * @param request to update a booking, contains the booking information to update
   * @param response redirects back to the page where the request was from
   */
  updateBooking(request, response) {
    let booking = bookingStore.getBookingById(request.params.id);
    booking.trainerName = request.body.trainer;
    booking.dateTime = request.body.dateTime;
    booking.trainerid = trainers.getTrainerByName(request.body.trainer).id;
    booking.comment = request.body.comment;
    booking.status = request.body.status;
    bookingStore.store.save();
    response.redirect('back');
  },
};

module.exports = bookings;
