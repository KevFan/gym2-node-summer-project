'use strict';

const logger = require('../utils/logger');
const uuid = require('uuid');
const goalStore = require('../models/goal-store');

const goal = {
  addGoal(request, response) {
    const userId = request.params.id;
    const newGoal = {
      id: uuid(),
      date: request.body.dateOnly,
      weight: Number(request.body.weight),
      chest: Number(request.body.chest),
      thigh: Number(request.body.thigh),
      upperArm: Number(request.body.upperArm),
      waist: Number(request.body.waist),
      hips: Number(request.body.hips),
      description: request.body.description,
      status: 'Open',
    };
    goalStore.addGoal(userId, newGoal);
    goalStore.store.save();
    logger.debug('New Goal = ', newGoal);
    response.redirect('back');
  },

  deleteGoal(request, response) {
    goalStore.removeGoal(request.params.userid, request.params.id);
    response.redirect('back');
  },
};

module.exports = goal;
