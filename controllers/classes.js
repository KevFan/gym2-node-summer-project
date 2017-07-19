/**
 * Created by kevin on 15/07/2017.
 */

'use strict';

const logger = require('../utils/logger');
const classStore = require('../models/class-store');
const uuid = require('uuid');
const accounts = require('./accounts');

const classes = {
  index(request, response) {
    logger.info('user is ' + accounts.userIsTrainer(request));
    const viewData = {
      title: 'Classes',
      classes: classStore.getAllClasses(),
    };
    if (accounts.userIsTrainer(request)) {
      viewData.title = 'Trainer Classes';
      response.render('trainerClasses', viewData);
      logger.info('trainer classes rendering', viewData.classes);
    } else {
      viewData.title = 'Member Classes';
      viewData.classes = classStore.getAllNonHiddenClasses();
      response.render('memberClasses', viewData);
      logger.info('member classes rendering', viewData.classes);
    }
  },

  addSession(request, response) {
    const classId = request.params.id;
    const classes = classStore.getClassById(classId);
    const newSession = {
      id: uuid(),
      location: request.body.location,
      dateTime: request.body.dateTime,
      capacity: request.body.capacity,
      enrolled: [],
    };
    logger.debug('New session', newSession);
    classStore.addSession(classId, newSession);
    response.redirect('/classes/' + classId);
  },

  listClassSessions(request, response) {
    const isTrainer = accounts.userIsTrainer(request);
    const classId = request.params.id;
    logger.info('classes id: ' + classId);
    const viewData = {
      title: 'Classes',
      classes: classStore.getClassById(classId),
      isTrainer: isTrainer,
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
    logger.info('Class id to be edited is ' + request.params.id);
    classStore.store.save();
    response.redirect('/classes/');
  },
};

module.exports = classes;
