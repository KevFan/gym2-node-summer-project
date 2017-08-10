'use strict';

const _ = require('lodash');
const JsonStore = require('./json-store');
const logger = require('../utils/logger');

const fitnessStore = {

  store: new JsonStore('./models/fitness-store.json', { fitnessProgrammes: [] }),
  collection: 'fitnessProgrammes',

  getAllProgrammes() {
    return this.store.findAll(this.collection);
  },

  addProgramme(programme) {
    this.store.add(this.collection, programme);
    this.store.save();
  },

  getProgrammeById(id) {
    return this.store.findOneBy(this.collection, { id: id });
  },

  removeProgramme(programmeId) {
    const programme = this.getProgrammeById(programmeId);
    this.store.remove(this.collection, programme);
    this.store.save();
  },

  addExercise(id, exercise) {
    const routine = this.getProgrammeById(id);
    routine.exercises.push(exercise);
    this.store.save();
  },
};

module.exports = fitnessStore;
