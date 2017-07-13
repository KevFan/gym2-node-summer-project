'use strict';

const _ = require('lodash');
const JsonStore = require('./json-store');

const trainerStore = {

  store: new JsonStore('./models/trainer-store.json', { trainers: [] }),
  collection: 'trainers',

  /**
   * Return all trainers
   * @returns {*} All trainers stored in json
   */
  getAllTrainers() {
    return this.store.findAll(this.collection);
  },

  /**
   * Adds a trainer to the list of trainers
   * @param trainer to be added
   */
  addTrainer(trainer) {
    this.store.add(this.collection, trainer);
  },

  /**
   * Returns a trainer by id
   * @param id Id of the Trainer
   * @returns {*} Trainer with the id
   */
  getTrainerById(id) {
    return this.store.findOneBy(this.collection, { id: id });
  },

  /**
   * Returns a trainer by email
   * @param email Email of the trainer
   * @returns {*} Trainer with the email
   */
  getTrainerByEmail(email) {
    return this.store.findOneBy(this.collection, { email: email });
  },
};

module.exports = trainerStore;
