/**
 * Created by kevin on 15/07/2017.
 */

'use strict';

const logger = require('../utils/logger');
const classStore = require('../models/class-store');
const uuid = require('uuid');
const accounts = require('./accounts');
const sort = require('../utils/sort');
const moment = require('moment');
const trainerStore = require('../models/trainer-store');
const trainerHelper = require('../utils/trainerHelpers');

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
        allTrainers: trainerStore.getAllTrainers(),
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
   * Adds a class
   * @param request to add a class, contains the class information
   * @param response adds the class, and redirects to the classes view
   */
  addClass(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    const newClass = {
      id: uuid(),
      userid: loggedInUser.id,
      name: request.body.name,
      description: request.body.description,
      duration: Number(request.body.duration),
      difficulty: request.body.difficulty,
      hidden: true,
      numSessions: 0,
      sessions: [],
      image: request.body.image,
    };
    logger.debug('Creating a new Class', newClass);
    classStore.addClass(newClass);
    response.redirect('/classes');
  },

  /**
   * Deletes a class
   * @param request to delete a class, contains the classId
   * @param response deletes the class and redirects to the classes view
   */
  deleteClass(request, response) {
    logger.debug(`Deleting Class ${request.params.id}`);
    classStore.removeClass(request.params.id);
    response.redirect('/classes');
  },

  /**
   * Hides or unhides a class
   * @param request to hide or unhide a class, contains the classId to determine class
   * @param response Hides/Unhides the class and redirects to the classes view
   */
  hideOrUnhideClass(request, response) {
    const classId = request.params.id;
    let classes = classStore.getClassById(classId);
    classes.hidden = !classes.hidden;
    classStore.store.save();
    logger.info('Setting class: ' + classId + ' Hidden:' + classes.hidden);
    response.redirect('/classes');
  },

  /**
   * Adds a session to an existing class
   * @param request to add a session to class
   * @param response adds the session, and redirects back to the classes page
   */
  addSession(request, response) {
    const classId = request.params.id;
    let messages = [];
    let weeksRun = Number(request.body.weeks);
    for (let i = 0; i < weeksRun; i++) {
      let weeklyDate = moment(new Date(request.body.dateTime)).add(7 * i, 'days').format('LLL');
      if (trainerHelper.isTrainerFree(accounts.getCurrentUser(request).id, weeklyDate)) {
        const newSession = {
          id: uuid(),
          location: request.body.location,
          dateTime: weeklyDate,
          capacity: Number(request.body.capacity),
          enrolled: [],
          availability: Number(request.body.capacity),
        };
        logger.debug('New session', newSession);
        classStore.addSession(classId, newSession);
      } else {
        messages.push({
          messageType: 'negative',
          message: 'Class not added. You have a booking/class at: ' + weeklyDate,
        });
        logger.info('Trainer is not free at ' + weeklyDate);
      }
    }

    response.render('trainerClassSessions', getClassSessionData(request, messages));
  },

  /**
   * Renders the memberClassSessions or trainerClassSessions view. Lists the sessions in the class,
   * sorts them by old to recent
   * @param request to list the class sessions in a class
   * @param response renders the memberClassSessions or trainerClassSessions view
   */
  listClassSessions(request, response) {
    const viewData = getClassSessionData(request);
    if (accounts.userIsTrainer(request)) {
      viewData.title = 'Trainer Class Sessions';
      response.render('trainerClassSessions', viewData);
    } else {
      viewData.title = 'Member Class Sessions';
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
    classes.userid = request.body.trainer;
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
    const newDateTime = request.body.dateTime;
    let messages = [];
    let specificSession = classStore.getSessionById(classId, sessionId);
    if (trainerHelper.isTrainerFree(accounts.getCurrentUser(request).id, newDateTime)
    || specificSession.dateTime === newDateTime) {
      specificSession.dateTime = newDateTime;
    } else {
      messages.push({
        messageType: 'negative',
        message: 'You have a booking/class at: ' + newDateTime + '. Other changes are updated',
      });
      logger.info('Trainer is not free ' + newDateTime + '. Other changes are updated');
    }

    specificSession.location = request.body.location;
    specificSession.capacity = Number(request.body.capacity);
    specificSession.availability = (specificSession.capacity - specificSession.enrolled.length);
    classStore.store.save();
    response.render('trainerClassSessions', getClassSessionData(request, messages));
  },
};

/**
 * Helper object to generate class session data and message as it's used in many functions
 * @param request to generate class session data
 * @param messageData messages to display if any
 * @returns {{title: string, classes: *, isTrainer: *, user: *, message: *}} Data to render
 */
const getClassSessionData = function (request, messageData) {
  const classId = request.params.id;
  logger.info('classes id: ' + classId);
  sort.sortDateTimeOldToNew(classStore.getClassById(classId).sessions);
  return {
    title: 'Classes',
    classes: classStore.getClassById(classId),
    isTrainer: accounts.userIsTrainer(request),
    user: accounts.getCurrentUser(request),
    message: messageData,
  };
};

module.exports = classes;
