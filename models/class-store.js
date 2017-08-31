'use strict';

const _ = require('lodash');
const JsonStore = require('./json-store');

/**
 * Store/Controls a list of classes and class sessions
 */
const classStore = {

  store: new JsonStore('./models/class-store.json', { classes: [] }),
  collection: 'classes',

  /**
   * Gets all classes in the list
   * @returns {*} all classes in the list
   */
  getAllClasses() {
    return this.store.findAll(this.collection);
  },

  /**
   * Adds a class to the list
   * @param classes the class to add
   */
  addClass(classes) {
    this.store.add(this.collection, classes);
    this.store.save();
  },

  /**
   * Gets a class by id from the list
   * @param id of the class
   * @returns {*} the class matching the id
   */
  getClassById(id) {
    return this.store.findOneBy(this.collection, { id: id });
  },

  /**
   * Removes a class from the list
   * @param classId id of the class to remove
   */
  removeClass(classId) {
    const classList = this.getClassById(classId);
    this.store.remove(this.collection, classList);
    this.store.save();
  },

  /**
   * Adds a class session to a class list
   * @param id of the class
   * @param session to add to the class
   */
  addSession(id, session) {
    const classes = this.getClassById(id);
    classes.sessions.push(session);

    classes.numSessions = classes.sessions.length;
    this.store.save();
  },

  /**
   * Gets all non hidden classes from the list of classes
   * @returns {Array} all non hidden classes
   */
  getAllNonHiddenClasses() {
    return this.store.findBy(this.collection, { hidden: false });
  },

  /**
   * Removes a class session from a class list
   * @param id of the class
   * @param sessionId of the class session to remove
   */
  removeSession(id, sessionId) {
    const classes = this.getClassById(id);
    const sessions = classes.sessions;
    _.remove(sessions, { id: sessionId });
    classes.numSessions = classes.sessions.length;
    this.store.save();
  },

  /**
   * Gets the specific class session from a class list
   * @param classId id of the class
   * @param sessionId id of the class session
   * @returns {*} the specific class from the class list
   */
  getSessionById(classId, sessionId) {
    const classes = this.getClassById(classId);
    return _.find(classes.sessions, { id: sessionId });
  },

  /**
   * Gets the class by name from the list
   * @param name of the class
   * @returns {*} the class found matching the name
   */
  getClassByName(name) {
    return this.store.findOneBy(this.collection, { name: name });
  },

  /**
   * Get all classes assoicated to a trainer id
   * @param id of the trainer
   * @returns {*} an array of classes associated with the trainer id
   */
  getAllTrainerClasses(id) {
    return this.store.findBy(this.collection, { userid: id });
  },

  /**
   * Returns a matching class session from a trainer's list of classes if any
   * Used to check if trainer is already booked for a dateTime
   * @param id Id of the trainer to get the list of classes the trainer manages
   * @param date DateTime to session is there a matching session
   * @returns {*} A session matching the date passed in
   */
  getClassSessionByDate(id, date) {
    const trainerClasses = this.getAllTrainerClasses(id);
    let sessionMatch = null;
    trainerClasses.forEach(function (classes) {
      if (!sessionMatch) {
        sessionMatch = _.find(classes.sessions, { dateTime: date });
      }
    });

    return sessionMatch;
  },
};

module.exports = classStore;
