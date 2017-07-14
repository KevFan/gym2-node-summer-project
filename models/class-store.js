'use strict';

const _ = require('lodash');
const JsonStore = require('./json-store');

const classStore = {

  store: new JsonStore('./models/class-store.json', { classes: [] }),
  collection: 'classes',

  getAllClasses() {
    return this.store.findAll(this.collection);
  },

  addClass(classes) {
    this.store.add(this.collection, classes);
    this.store.save();
  },

  getClassById(id) {
    return this.store.findOneBy(this.collection, { id: id });
  },
};

module.exports = classStore;
