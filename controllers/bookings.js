const logger = require('../utils/logger');
const bookingStore = require('../models/booking-store');
const trainers = require('../models/trainer-store');
const members = require('../models/member-store');
const uuid = require('uuid');

const bookings = {
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
    booking.comment = request.body.comment;
    booking.status = request.body.status;
    bookingStore.store.save();
    response.redirect('/assessments');
  },
};

module.exports = bookings;
