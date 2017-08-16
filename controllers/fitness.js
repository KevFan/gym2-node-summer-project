'use strict';

const logger = require('../utils/logger');
const uuid = require('uuid');
const accounts = require('./accounts');
const fitnessStore = require('../models/fitness-store');
const membersStore = require('../models/member-store');
const _ = require('lodash');

const fitness = {
  /**
   * Renders the fitness view with workout routines for trainer or the individual exercise sessions
   * for a member
   * @param request to render the fitness view
   * @param response renders the fitness view
   */
  index(request, response) {
    const user = accounts.getCurrentUser(request);
    const isTrainer = accounts.userIsTrainer(request);
    logger.info('user is trainer? ' + isTrainer);
    if (isTrainer) {
      const viewData = {
        title: 'Trainer Fitness Programmes',
        user: user,
        isTrainer: isTrainer,
        routines: fitnessStore.getAllProgrammes(),
      };
      response.render('fitness', viewData);
      logger.info('trainer fitness programmes rendering');
    } else {
      const viewData = {
        title: 'Member Fitness Programme',
        user: user,
      };
      response.render('fitness', viewData);
      logger.info('member fitness programmes rendering');
    }
  },

  /**
   * Adds a workout routine
   * @param request to add a workout routine, contains the routine info
   * @param response adds the new routine and redirects the page
   */
  addRoutine(request, response) {
    const newProgramme = {
      id: uuid(),
      name: request.body.name,
      image: request.body.image,
      description: request.body.description,
      exercises: [],
    };
    fitnessStore.addProgramme(newProgramme);
    logger.debug('New Routine = ', newProgramme);
    response.redirect('back');
  },

  /**
   * Deletes a workout routine
   * @param request to delete the workout routing of specific id
   * @param response deletes the routine and redirects the page
   */
  deleteRoutine(request, response) {
    logger.debug(`Deleting Class ${request.params.id}`);
    fitnessStore.removeProgramme(request.params.id);
    response.redirect('/fitness');
  },

  /**
   * Updates a workout routine
   * @param request to update a routine with new information
   * @param response updates the routine and redirects the page
   */
  updateRoutine(request, response) {
    let routine = fitnessStore.getProgrammeById(request.params.id);
    routine.name = request.body.name;
    routine.description = request.body.description;
    routine.image = request.body.image;
    logger.info('Routine id to be edited is ' + request.params.id);
    fitnessStore.store.save();
    response.redirect('/fitness/');
  },

  /**
   * Renders the fitnessExercises view with the individual exercises of the routine
   * @param request to render the exercises of a routine, contains the routine id to get routine
   * @param response renders the fitnessExercises view to list the individual exercises
   */
  listRoutineExercises(request, response) {
    const isTrainer = accounts.userIsTrainer(request);
    const routineId = request.params.id;
    logger.info('Routine id: ' + routineId);
    const viewData = {
      title: 'Fitness Routine',
      routine: fitnessStore.getProgrammeById(routineId),
      isTrainer: isTrainer,
      userId: accounts.getCurrentUser(request).id,
    };
    response.render('fitnessExercises', viewData);
  },

  /**
   * Adds a new exercise to a workout routine in either the member's personal routine or in a
   * predetermined routine by a trainer
   * @param request to add a new exercise, contains the exercise information
   * @param response adds the new exercise to the appropriate routine and redirects the page
   */
  addExercise(request, response) {
    const routineId = request.params.id;
    const userId = request.params.userid;
    const newExercise = {
      id: uuid(),
      name: request.body.name,
      reps: Number(request.body.reps),
      sets: Number(request.body.sets),
      rest: Number(request.body.rest),
    };
    logger.debug('New exercise', newExercise);
    if (membersStore.getMemberById(userId)) {
      let user = membersStore.getMemberById(userId);
      let routine = _.find(user.program, { id: routineId });
      routine.exercises.push(newExercise);
      membersStore.store.save();
      response.redirect('back');
    } else {
      fitnessStore.addExercise(routineId, newExercise);
      response.redirect('/fitness/' + routineId);
    }

  },

  /**
   * Deletes an exercise from either a member's personal routine or a predetermined routine by
   * a trainer
   * @param request to delete an exercise, contains the routine id, user id and exercise id
   * @param response deletes the exercise from the appropriate routine and redirects the page
   */
  deleteExercise(request, response) {
    const routineId = request.params.id;
    const exerciseId = request.params.exerciseid;
    const userId = request.params.userid;
    if (membersStore.getMemberById(userId)) {
      let user = membersStore.getMemberById(userId);
      let routine = _.find(user.program, { id: routineId });
      _.remove(routine.exercises, { id: exerciseId });
      membersStore.store.save();
    } else {
      fitnessStore.removeExercise(routineId, exerciseId);
    }

    logger.debug(`Deleting Exercise ${exerciseId} from Routine ${routineId}`);
    response.redirect('back');
  },

  /**
   * Updates an exercise from either a member's personal routine or a predetermined routine by a
   * trainer
   * @param request to update an exercise, contains the new information to update
   * @param response updates the exercise from the appropriate routine and redirects the page
   */
  updateExercise(request, response) {
    const routineId = request.params.id;
    const exerciseId = request.params.exerciseid;
    const userId = request.params.userid;
    let exercise = null;
    if (membersStore.getMemberById(userId)) {
      let user = membersStore.getMemberById(userId);
      let routine = _.find(user.program, { id: routineId });
      exercise = _.find(routine.exercises, { id: exerciseId });
    } else {
      exercise = fitnessStore.getExerciseFromRoutine(routineId, exerciseId);
    }

    exercise.name = request.body.name;
    exercise.sets = Number(request.body.sets);
    exercise.reps = Number(request.body.reps);
    exercise.rest = Number(request.body.rest);
    (membersStore.getMemberById(userId)) ? membersStore.store.save() : fitnessStore.store.save();
    response.redirect('back');
  },
};

module.exports = fitness;
