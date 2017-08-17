'use strict';

const logger = require('../utils/logger');
const uuid = require('uuid');
const goalStore = require('../models/goal-store');

const goal = {
  /**
   * Adds a goal to a member's lists of goals
   * @param request to add a new goal, contains the userId and goal information
   * @param response adds the goal and redirects the page
   */
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

  /**
   * Deletes a goal from a user's list of goals
   * @param request to delete a goal, contains the userId and goalId
   * @param response deletes the goal and redirects the page
   */
  deleteGoal(request, response) {
    goalStore.removeGoal(request.params.userid, request.params.id);
    response.redirect('back');
  },
};

module.exports = goal;
