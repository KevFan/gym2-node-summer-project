'use strict';

const _ = require('lodash');
const JsonStore = require('./json-store');
const logger = require('../utils/logger');

/**
 * Stores/controls the list of assessment bookings
 */
const bookingStore = {

  store: new JsonStore('./models/booking-store.json', { assessmentBookings: [] }),
  collection: 'assessmentBookings',

  /**
   * Gets all the bookings
   * @returns all the bookings
   */
  getAllBookings() {
    return this.store.findAll(this.collection);
  },

  /**
   * Adds a booking
   * @param booking to add
   */
  addBooking(booking) {
    this.store.add(this.collection, booking);
    this.store.save();
  },

  /**
   * Gets a booking by id
   * @param id of the booking to get
   * @returns {*} the booking found
   */
  getBookingById(id) {
    return this.store.findOneBy(this.collection, { id: id });
  },

  /**
   * Removes a booking from the list
   * @param bookingId id of the booking to remove
   */
  removeBooking(bookingId) {
    const booking = this.getBookingById(bookingId);
    this.store.remove(this.collection, booking);
    this.store.save();
  },

  /**
   * Finds all the user's bookings from the list
   * @param userId Id of the user
   * @returns {Array} list of bookings made by the user
   */
  getAllUserBookings(userId) {
    let userBookings = [];
    this.getAllBookings().forEach(function (booking) {
      if (booking.userid === userId) {
        userBookings.push(booking);
      }
    });

    return userBookings;
  },

  /**
   * Finds all the trainer's bookings from the list
   * @param trainerId Id of the trainer
   * @returns {Array} list of bookings for the trainer
   */
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
