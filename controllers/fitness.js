'use strict';

const logger = require('../utils/logger');
const uuid = require('uuid');
const accounts = require('./accounts');
const fitnessStore = require('../models/fitness-store');

const fitness = {
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

  deleteRoutine(request, response) {
    logger.debug(`Deleting Class ${request.params.id}`);
    fitnessStore.removeProgramme(request.params.id);
    response.redirect('/fitness');
  },

  updateRoutine(request, response) {
    let routine = fitnessStore.getProgrammeById(request.params.id);
    routine.name = request.body.name;
    routine.description = request.body.description;
    routine.image = request.body.image;
    logger.info('Routine id to be edited is ' + request.params.id);
    fitnessStore.store.save();
    response.redirect('/fitness/');
  },

  listRoutineExercises(request, response) {
    const isTrainer = accounts.userIsTrainer(request);
    const routineId = request.params.id;
    logger.info('Routine id: ' + routineId);
    const viewData = {
      title: 'Fitness Routine',
      routine: fitnessStore.getProgrammeById(routineId),
      isTrainer: isTrainer,
    };
    response.render('fitnessExercises', viewData);
  },

  addExercise(request, response) {
    const routineId = request.params.id;
    const newExercise = {
      id: uuid(),
      name: request.body.name,
      reps: Number(request.body.reps),
      sets: Number(request.body.sets),
      rest: Number(request.body.rest),
    };
    logger.debug('New exercise', newExercise);
    fitnessStore.addExercise(routineId, newExercise);
    response.redirect('/fitness/' + routineId);
  },

  deleteExerecise(request, response) {
    const routineId = request.params.id;
    const exerciseId = request.params.exerciseid;
    logger.debug(`Deleting Excercise ${exerciseId} from Routine ${routineId}`);
    fitnessStore.removeExercise(routineId, exerciseId);
    response.redirect('/fitness/' + routineId);
  },
};

module.exports = fitness;
