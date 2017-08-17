'use strict';

const _ = require('lodash');
const JsonStore = require('./json-store');

/**
 * Stores/controls list of predefined workout routines and exercise sessions
 */
const fitnessStore = {

  store: new JsonStore('./models/fitness-store.json', { fitnessProgrammes: [] }),
  collection: 'fitnessProgrammes',

  /**
   * Gets all routines from the list
   * @returns {*} all routines from the list
   */
  getAllProgrammes() {
    return this.store.findAll(this.collection);
  },

  /**
   * Adds a new routine to the list
   * @param programme the new routine to add
   */
  addProgramme(programme) {
    this.store.add(this.collection, programme);
    this.store.save();
  },

  /**
   * Gets the routine by id from the list
   * @param id of the routine
   * @returns {*} the routine matching the id
   */
  getProgrammeById(id) {
    return this.store.findOneBy(this.collection, { id: id });
  },

  /**
   * Removes the routine from the list
   * @param programmeId id of the routine
   */
  removeProgramme(programmeId) {
    const programme = this.getProgrammeById(programmeId);
    this.store.remove(this.collection, programme);
    this.store.save();
  },

  /**
   * Adds an exercise to a workout routine
   * @param id of the routine
   * @param exercise to add to the routine
   */
  addExercise(id, exercise) {
    const routine = this.getProgrammeById(id);
    routine.exercises.push(exercise);
    this.store.save();
  },

  /**
   * Removes an exercise from a workout routine
   * @param id of the workout routine
   * @param exerciseId id of the exercise
   */
  removeExercise(id, exerciseId) {
    const routine = this.getProgrammeById(id);
    const exercises = routine.exercises;
    _.remove(exercises, { id: exerciseId });
    this.store.save();
  },

  /**
   * Gets the specific exercise from a workout routine
   * @param id of the routine
   * @param exerciseId id of the exercise
   * @returns {*} the exercise matching the exerciseId from the routine
   */
  getExerciseFromRoutine(id, exerciseId) {
    const routine = this.getProgrammeById(id);
    let specificExercise = null;
    routine.exercises.forEach(function (exercise) {
      if (exercise.id === exerciseId) {
        specificExercise = exercise;
      }
    });

    return specificExercise;
  },
};

module.exports = fitnessStore;
