'use strict';

const logger = require('../utils/logger');
const accounts = require('./accounts.js');
const classStore = require('../models/class-store.js');
const uuid = require('uuid');
const trainers = require('../models/trainer-store');
const members = require('../models/member-store');
const analytics = require('../utils/analytics');
const assessmentStore = require('../models/assessment-store');
const bookingStore = require('../models/booking-store');
const goalStore = require('../models/goal-store');
const fitnessStore = require('../models/fitness-store');
const sort = require('../utils/sort');
const goalHelpers = require('../utils/goalHelpers');

const dashboard = {
  index(request, response) {
    logger.info('trainer dashboard rendering');
    const loggedInUser = accounts.getCurrentUser(request);
    const viewData = {
      title: 'Trainer Assessments',
      user: loggedInUser,
      bookings: sort.sortDateTimeOldToNew(bookingStore.getAllTrainerBookings(loggedInUser.id)),
      isTrainer: accounts.userIsTrainer(request),
      allTrainers: trainers.getAllTrainers(),
      allMembers: members.getAllMembers(),
    };
    response.render('trainerDashboard', viewData);
  },

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

  deleteClass(request, response) {
    logger.debug(`Deleting Class ${request.params.id}`);
    classStore.removeClass(request.params.id);
    response.redirect('/classes');
  },

  hideOrUnhideClass(request, response) {
    const classId = request.params.id;
    let classes = classStore.getClassById(classId);
    classes.hidden = !classes.hidden;
    classStore.store.save();
    logger.info('Setting class: ' + classId + ' Hidden:' + classes.hidden);
    response.redirect('/classes');
  },

  listAllMembers(request, response) {
    logger.info('trainer member view rendering');
    const viewData = {
      title: 'Trainer Members',
      isTrainer: accounts.userIsTrainer(request),
      allTrainers: trainers.getAllTrainers(),
      allMembers: members.getAllMembers(),
    };
    response.render('trainerMembers', viewData);
  },

  viewSpecificMember(request, response) {
    const userId = request.params.id;
    logger.info('id is ' + userId);
    if (goalStore.getGoalList(userId)) {
      sort.sortDateTimeNewToOld(goalStore.getGoalList(userId).goals);
      goalHelpers.setGoalStatusChecks(userId);
    }

    const viewData = {
      title: 'Trainer Dashboard',
      user: members.getMemberById(userId),
      isTrainer: accounts.userIsTrainer(request),
      allTrainers: trainers.getAllTrainers(),
      assessmentlist: assessmentStore.getAssessmentList(userId),
      stats: analytics.generateMemberStats(members.getMemberById(userId)),
      goals: goalStore.getGoalList(userId),
      bookings: sort.sortDateTimeOldToNew(bookingStore.getAllUserBookings(userId)),
    };
    response.render('dashboard', viewData);
  },

  buildFitnessProgramme(request, response) {
    const userId = request.params.id;
    const member = members.getMemberById(userId);
    logger.info('The member found is ', member);
    const program = [];
    program.push(getClassOrRoutine(request.body.first));
    program.push(getClassOrRoutine(request.body.second));
    program.push(getClassOrRoutine(request.body.third));
    program.push(getClassOrRoutine(request.body.fourth));
    program.push(getClassOrRoutine(request.body.fifth));
    member.program = program;
    members.store.save();
    response.redirect('/trainerDashboard/members/' + userId);
  },
};

const getClassOrRoutine = function (id) {
  const classFound = classStore.getClassById(id);
  const routineFound = fitnessStore.getProgrammeById(id);
  if (classFound) {
    logger.info('The class found is ', classFound);
    return {
      id: classFound.id,
      image: classFound.image,
      name: classFound.name,
      type: 'classes',
    };
  } else if (routineFound) {
    logger.info('The routine found is ', routineFound);
    return routineFound;
  } else {
    logger.info('No class or routine found');
  }
};

module.exports = dashboard;
