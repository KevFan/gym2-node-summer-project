'use strict';

const _ = require('lodash');
const JsonStore = require('./json-store');
const logger = require('../utils/logger');

const bookingStore = {

  store: new JsonStore('./models/booking-store.json', { assessmentBookings: [] }),
  collection: 'assessmentBookings',

  getAllBookings() {
    return this.store.findAll(this.collection);
  },

  addBooking(booking) {
    this.store.add(this.collection, booking);
    this.store.save();
  },

  getBookingById(id) {
    return this.store.findOneBy(this.collection, { id: id });
  },

  removeBooking(bookingId) {
    const booking = this.getBookingById(bookingId);
    this.store.remove(this.collection, booking);
    this.store.save();
  },

  getAllUserBookings(userId) {
    let userBookings = [];
    this.getAllBookings().forEach(function (booking) {
      if (booking.userid === userId) {
        userBookings.push(booking);
      }
    });

    return userBookings;
  },

  getAllTrainerBookings(trainerId) {
    let trainerBookings = [];
    this.getAllBookings().forEach(function (booking) {
      if (booking.trainerid === trainerId) {
        trainerBookings.push(booking);
      }
    });

    return trainerBookings;
  },
};

module.exports = bookingStore;
