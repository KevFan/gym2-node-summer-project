'use strict';

const logger = require('../utils/logger');
const accounts = require('./accounts');
const uuid = require('uuid');
const goalStore = require('../models/goal-store');
const Handlebars = require('handlebars');
Handlebars.registerHelper('checkForOpenGoals', function (userId) {
  const goalList = goalStore.getGoalList(userId);
  let result = null;
  if (goalList) {
    goalList.goals.forEach(function (goal) {
      if (goal.status === 'Open' || goal.status === 'Awaiting Processing') {
        result = true;
      }
    });
  } else {
    result = false;
  }

  return result;
});

const goal = {
  index(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    const userIsTrainer = accounts.userIsTrainer(request);
    if (userIsTrainer) {
      const viewData = {
        title: 'Trainer Goals',
        isTrainer: userIsTrainer,
        user: loggedInUser,
      };
      response.render('goals', viewData);
      logger.info('trainer goals rendering');
    } else {
      const viewData = {
        title: 'Member Goals',
        isTrainer: userIsTrainer,
        user: loggedInUser,
        goals: goalStore.getGoalList(loggedInUser.id),
      };
      response.render('goals', viewData);
      logger.info('member goals rendering');
    }
  },

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
};

module.exports = goal;
