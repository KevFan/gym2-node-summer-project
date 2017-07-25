'use strict';

const _ = require('lodash');
const JsonStore = require('./json-store');
const logger = require('../utils/logger');

const classStore = {

  store: new JsonStore('./models/assessment-store.json', { assessmentBookings: [] }),
  collection: 'classes',

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
    const bookingList = this.getClassById(bookingId);
    this.store.remove(this.collection, bookingList);
    this.store.save();
  },

  getBookingsByName(name) {
    return this.store.findOneBy(this.collection, { name: name });
  },
};

module.exports = classStore;
