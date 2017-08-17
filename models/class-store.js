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
    let allClasses = this.getAllClasses();
    let allNonHiddenClasses = [];
    allClasses.forEach(function (specificClass) {
      if (!specificClass.hidden) {
        allNonHiddenClasses.push(specificClass);
      }
    });

    return allNonHiddenClasses;
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
    let specificSession = null;
    classes.sessions.forEach(function (session) {
      if (session.id === sessionId) {
        specificSession = session;
      }
    });

    return specificSession;
  },

  /**
   * Gets the class by name from the list
   * @param name of the class
   * @returns {*} the class found matching the name
   */
  getClassByName(name) {
    return this.store.findOneBy(this.collection, { name: name });
  },
};

module.exports = classStore;
