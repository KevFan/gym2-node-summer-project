/**
 * Created by kevin on 15/07/2017.
 */

'use strict';

const logger = require('../utils/logger');
const classStore = require('../models/class-store');
const uuid = require('uuid');
const accounts = require('./accounts');
const sort = require('../utils/sort');

const classes = {
  /**
   * Renders the memberClasses or trainerClasses view depending on which is logged in
   * @param request to render memberClasses or trainerClasses view
   * @param response to render memberClasses or trainerClasses view
   */
  index(request, response) {
    logger.info('user is ' + accounts.userIsTrainer(request));
    if (accounts.userIsTrainer(request)) {
      const viewData = {
        title: 'Trainer Classes',
        classes: classStore.getAllClasses(),
        user: accounts.getCurrentUser(request),
      };
      response.render('trainerClasses', viewData);
      logger.info('trainer classes rendering', viewData.classes);
    } else {
      const viewData = {
        title: 'Member Classes',
        classes: classStore.getAllNonHiddenClasses(),
        user: accounts.getCurrentUser(request),
      };
      response.render('memberClasses', viewData);
      logger.info('member classes rendering', viewData.classes);
    }
  },

  /**
   * Adds a session to an existing class
   * @param request to add a session to class
   * @param response adds the session, and redirects back to the classes page
   */
  addSession(request, response) {
    const classId = request.params.id;
    const newSession = {
      id: uuid(),
      location: request.body.location,
      dateTime: request.body.dateTime,
      capacity: Number(request.body.capacity),
      enrolled: [],
      availability: 0,
    };
    newSession.availability = (newSession.capacity - newSession.enrolled.length);
    logger.debug('New session', newSession);
    classStore.addSession(classId, newSession);
    response.redirect('/classes/' + classId);
  },

  /**
   * Renders the memberClassSessions or trainerClassSessions view. Lists the sessions in the class,
   * sorts them by old to recent
   * @param request
   * @param response
   */
  listClassSessions(request, response) {
    const isTrainer = accounts.userIsTrainer(request);
    const classId = request.params.id;
    sort.sortDateTimeOldToNew(classStore.getClassById(classId).sessions);
    logger.info('classes id: ' + classId);
    const viewData = {
      title: 'Classes',
      classes: classStore.getClassById(classId),
      isTrainer: isTrainer,
      user: accounts.getCurrentUser(request),
    };
    if (isTrainer) {
      response.render('trainerClassSessions', viewData);
    } else {
      response.render('memberClassSessions', viewData);
    }
  },

  /**
   * Deletes a session from a class
   * @param request to delete a session from a class, contains the classId and sessionId to get the
   * session to delete
   * @param response deletes the session and redirects back to the classes view
   */
  deleteSession(request, response) {
    const classId = request.params.id;
    const sessionId = request.params.sessionid;
    logger.debug(`Deleting Session ${sessionId} from Classes ${classId}`);
    classStore.removeSession(classId, sessionId);
    response.redirect('/classes/' + classId);
  },

  /**
   * Updates the class information
   * @param request to update a class, contains the class information to update
   * @param response updates the class and redirects back to the classes view
   */
  updateClass(request, response) {
    let classes = classStore.getClassById(request.params.id);
    classes.name = request.body.name;
    classes.difficulty = request.body.difficulty;
    classes.duration = Number(request.body.duration);
    classes.description = request.body.description;
    classes.image = request.body.image;
    logger.info('Class id to be edited is ' + request.params.id);
    classStore.store.save();
    response.redirect('/classes/');
  },

  /**
   * Updates a session in a class
   * @param request to update a session, contains the session information to update
   * @param response updates the session and redirects to the class sessions view
   */
  updateClassSession(request, response) {
    const classId = request.params.id;
    const sessionId = request.params.sessionid;
    let specificSession = classStore.getSessionById(classId, sessionId);
    specificSession.location = request.body.location;
    specificSession.capacity = Number(request.body.capacity);
    specificSession.dateTime = request.body.dateTime;
    specificSession.availability = (specificSession.capacity - specificSession.enrolled.length);
    classStore.store.save();
    response.redirect('/classes/' + classId);
  },
};

module.exports = classes;
