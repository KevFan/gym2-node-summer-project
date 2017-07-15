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

  removeClass(classId) {
    const classList = this.getClassById(classId);
    this.store.remove(this.collection, classList);
    this.store.save();
  },

  addSession(id, session) {
    const classes = this.getClassById(id);
    classes.sessions.push(session);

    classes.numSessions = classes.sessions.length;
    this.store.save();
  },
};

module.exports = classStore;
