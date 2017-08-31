'use strict';

const logger = require('../utils/logger');
const accounts = require('./accounts.js');
const classStore = require('../models/class-store.js');
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
const settings = require('./settings');
const trainerHelper = require('../utils/trainerHelpers');

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
      title: 'Trainer Dashboard',
      user: loggedInUser,
      bookings: sort.sortDateTimeOldToNew(bookingStore.getAllTrainerBookings(loggedInUser.id)),
      isTrainer: accounts.userIsTrainer(request),
      allTrainers: trainerStore.getAllTrainers(),
      allMembers: memberStore.getAllMembers(),
      nextClassList: sort.sortDateTimeOldToNew(trainerHelper.getNextSessionClass(loggedInUser.id)),
    };
    logger.debug('Hopefully List of first sessions,', viewData.nextClassList);
    response.render('trainerDashboard', viewData);
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
      user: accounts.getCurrentUser(request),
      isTrainer: accounts.userIsTrainer(request),
      allTrainers: trainerStore.getAllTrainers(),
      allMembers: memberStore.getAllMembers(),
      allClasses: classStore.getAllNonHiddenClasses(),
      allRoutines: fitnessStore.getAllProgrammes(),
    };
    if (accounts.userIsTrainer(request)) {
      response.render('trainerMembers', viewData);
    } else {
      response.redirect('back');
    }
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
      title: 'Trainer Members',
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
    if (accounts.userIsTrainer(request)) {
      response.render('dashboard', viewData);
    } else {
      response.redirect('back');
    }
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
    program.push(trainerHelper.getClassOrRoutine(request.body.first));
    program.push(trainerHelper.getClassOrRoutine(request.body.second));
    program.push(trainerHelper.getClassOrRoutine(request.body.third));
    program.push(trainerHelper.getClassOrRoutine(request.body.fourth));
    program.push(trainerHelper.getClassOrRoutine(request.body.fifth));

    // compact - to remove null objects if less than 5 exercise sessions were selected
    member.program = _.compact(program);
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

  /**
   * Deletes all member associated information from the local json stores
   * @param request to delete a specific member
   * @param response deletes the member and associated information from local json stores
   */
  deleteMember(request, response) {
    const userId = request.params.id;
    const member = memberStore.getMemberById(userId);
    memberStore.removeMember(member);
    assessmentStore.removeAssessmentList(userId);
    bookingStore.removeAllMemberBookings(userId);
    goalStore.removeGoalList(userId);
    settings.deleteFromCloud(member);
    response.redirect('back');
  },
};

module.exports = trainerDashboard;
