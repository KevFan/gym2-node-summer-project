'use strict';

const logger = require('../utils/logger');
const accounts = require('./accounts.js');
const classStore = require('../models/class-store.js');
const uuid = require('uuid');
const trainerStore = require('../models/trainer-store');
const memberStore = require('../models/member-store');
const analytics = require('../utils/analytics');
const assessmentStore = require('../models/assessment-store');
const bookingStore = require('../models/booking-store');
const goalStore = require('../models/goal-store');
const fitnessStore = require('../models/fitness-store');
const sort = require('../utils/sort');
const goalHelpers = require('../utils/goalHelpers');
const _ = require('lodash');

const trainerDashboard = {
  /**
   * Renders the trainerDashboard view
   * @param request to render the trainerDashboard view
   * @param response renders the trainerDashboard view
   */
  index(request, response) {
    logger.info('trainer dashboard rendering');
    const loggedInUser = accounts.getCurrentUser(request);
    const viewData = {
      title: 'Trainer Assessments',
      user: loggedInUser,
      bookings: sort.sortDateTimeOldToNew(bookingStore.getAllTrainerBookings(loggedInUser.id)),
      isTrainer: accounts.userIsTrainer(request),
      allTrainers: trainerStore.getAllTrainers(),
      allMembers: memberStore.getAllMembers(),
    };
    response.render('trainerDashboard', viewData);
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
   * Renders the trainerMembers view and lists all members in the gym
   * @param request to render trainerMembers view
   * @param response renders the trainerMembers view to list all members in the gym
   */
  listAllMembers(request, response) {
    logger.info('trainer member view rendering');
    const viewData = {
      title: 'Trainer Members',
      isTrainer: accounts.userIsTrainer(request),
      allTrainers: trainerStore.getAllTrainers(),
      allMembers: memberStore.getAllMembers(),
      allClasses: classStore.getAllNonHiddenClasses(),
      allRoutines: fitnessStore.getAllProgrammes(),
    };
    response.render('trainerMembers', viewData);
  },

  /**
   * Renders the member dashboard view from a trainer
   * @param request to render the dashboard view of a member from a trainer
   * @param response renders the member dashboard view with additional trainer options
   */
  viewSpecificMember(request, response) {
    const userId = request.params.id;
    logger.info('id is ' + userId);
    if (goalStore.getGoalList(userId)) {
      sort.sortDateTimeNewToOld(goalStore.getGoalList(userId).goals);
      goalHelpers.setGoalStatusChecks(userId);
    }

    const viewData = {
      title: 'Trainer Dashboard',
      user: memberStore.getMemberById(userId),
      isTrainer: accounts.userIsTrainer(request),
      allTrainers: trainerStore.getAllTrainers(),
      assessmentlist: assessmentStore.getAssessmentList(userId),
      stats: analytics.generateMemberStats(memberStore.getMemberById(userId)),
      goals: goalStore.getGoalList(userId),
      bookings: sort.sortDateTimeOldToNew(bookingStore.getAllUserBookings(userId)),
      allClasses: classStore.getAllNonHiddenClasses(),
      allRoutines: fitnessStore.getAllProgrammes(),
    };
    response.render('dashboard', viewData);
  },

  /**
   * Builds a fitness programme for a member comprised of a selection of classes, workout routines
   * or new custom routine
   * @param request to build a fitness programme for a member
   * @param response builds a fitness programme for the member and redirects the page
   */
  buildFitnessProgramme(request, response) {
    const userId = request.params.id;
    const member = memberStore.getMemberById(userId);
    logger.info('The member found is ', member);
    const program = [];
    program.push(getClassOrRoutine(request.body.first));
    program.push(getClassOrRoutine(request.body.second));
    program.push(getClassOrRoutine(request.body.third));
    program.push(getClassOrRoutine(request.body.fourth));
    program.push(getClassOrRoutine(request.body.fifth));
    member.program = program;
    memberStore.store.save();
    response.redirect('back');
  },

  /**
   * Deletes the entire fitness programme of a member
   * @param request to delete the member fitness programme
   * @param response deletes the member fitness programme and redirects the page
   */
  deleteFitnessProgramme(request, response) {
    const userId = request.params.id;
    const member = memberStore.getMemberById(userId);
    member.program.length = 0;
    memberStore.store.save();
    response.redirect('back');
  },

  /**
   * Deletes a specific exercise session from a members fitness programme
   * @param request to delete a specific exercise session from a member fitness programme
   * @param response deletes the specific exercise session and redirects the page
   */
  deleteFitnessRoutine(request, response) {
    const userId = request.params.userid;
    const routineId = request.params.id;
    const member = memberStore.getMemberById(userId);
    _.remove(member.program, { id: routineId });
    memberStore.store.save();
    response.redirect('back');
  },

  /**
   * Updates the information of an exercise session in a members fitness programme
   * @param request to update an exercise session in a members fitness programme
   * @param response updates the exercise session and redirects the page
   */
  editFitnessRoutine(request, response) {
    const userId = request.params.userid;
    const routineId = request.params.id;
    let routine = _.find(memberStore.getMemberById(userId).program, { id: routineId });
    routine.name = request.body.name;
    routine.image = request.body.image;
    if (routine.description) {
      routine.description = request.body.description;
    }

    memberStore.store.save();
    response.redirect('back');
  },
};

/**
 * Helper object to get return the class, routine or new custom routine when building a members fitness
 * programme
 * @param id the classId or workout routineId to find either the class/routine
 * @returns {*} the class, routine or new custom routine
 */
const getClassOrRoutine = function (id) {
  const classFound = classStore.getClassById(id);
  const routineFound = fitnessStore.getProgrammeById(id);
  if (classFound) {
    logger.info('The class found is ', classFound);
    return {
      id: uuid(),
      classId: classFound.id,
      image: classFound.image,
      name: classFound.name,
      type: 'classes',
    };
  } else if (routineFound) {
    logger.info('The routine found is ', routineFound);
    routineFound.id = uuid();
    return routineFound;
  } else {
    logger.info('No class or routine found');
    return {
      id: uuid(),
      name: 'Custom Routine',
      description: 'A custom routine just for you',
    };
  }
};

module.exports = trainerDashboard;
