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
  index(request, response) {
    logger.info('user is ' + accounts.userIsTrainer(request));
    if (accounts.userIsTrainer(request)) {
      const viewData = {
        title: 'Trainer Classes',
        classes: classStore.getAllClasses(),
      };
      response.render('trainerClasses', viewData);
      logger.info('trainer classes rendering', viewData.classes);
    } else {
      const viewData = {
        title: 'Member Classes',
        classes: classStore.getAllNonHiddenClasses(),
      };
      response.render('memberClasses', viewData);
      logger.info('member classes rendering', viewData.classes);
    }
  },

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

  listClassSessions(request, response) {
    const isTrainer = accounts.userIsTrainer(request);
    const classId = request.params.id;
    sort.sortDateTimeOldToNew(classStore.getClassById(classId).sessions);
    logger.info('classes id: ' + classId);
    const viewData = {
      title: 'Classes',
      classes: classStore.getClassById(classId),
      isTrainer: isTrainer,
      userId: accounts.getCurrentUser(request).id,
    };
    if (isTrainer) {
      response.render('trainerClassSessions', viewData);
    } else {
      response.render('memberClassSessions', viewData);
    }
  },

  deleteSession(request, response) {
    const classId = request.params.id;
    const sessionId = request.params.sessionid;
    logger.debug(`Deleting Session ${sessionId} from Classes ${classId}`);
    classStore.removeSession(classId, sessionId);
    response.redirect('/classes/' + classId);
  },

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
