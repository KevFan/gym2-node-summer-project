'use strict';

const logger = require('../utils/logger');
const accounts = require('./accounts');
const uuid = require('uuid');
const goalStore = require('../models/goal-store');
const assessmentStore = require('../models/assessment-store');
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
    setGoalStatusChecks(loggedInUser.id);
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

  deleteGoal(request, response) {
    goalStore.removeGoal(request.params.userid, request.params.id);
    response.redirect('back');
  },
};

const setGoalStatusChecks = function (userId) {
  let goalList = goalStore.getGoalList(userId);
  let today = new Date().setHours(0, 0, 0, 0);
  if (goalList) {
    goalList.goals.forEach(function (goal) {
      let goalDate = new Date(goal.date).getTime();
      let time = ((Number(today) - Number(goalDate)) / 1000 - 259200);
      logger.debug('Goal Date: ' + ((Number(today) - Number(goalDate)) / 1000));
      logger.debug('Time:' + time);
      if (goalDate > today) {
        goal.status = 'Open';
      } else if (time <= 0) {
        goal.status = 'Awaiting Processing';
        let assessment = assessmentStore.getFirstAssessmentWithinThreeDays(userId, goal.date);
        if (assessment[0]) {
          let assessmentDate = new Date(assessment[0].date).getTime();
          let resultingDate = ((goalDate - assessmentDate) / 1000 - 259200);
          logger.debug('Assessment Time: ' + assessmentDate);
          logger.debug('Resulting Time: ' + resultingDate);
          if (resultingDate < 0) {
            let compare = compareGoalToAssessment(assessment[0], goal);
            if (compare) {
              goal.status = 'Achieved';
            } else {
              goal.status = 'Missed';
            }
          }
        }
      }

      goalStore.store.save();
    });

  }
};

const compareGoalToAssessment = function (assessment, goal) {
  let totalAssessment = assessment.weight + assessment.chest + assessment.thigh + assessment.upperArm +
    assessment.waist + assessment.hips;
  let totalGoal = goal.weight + goal.chest + goal.thigh + goal.upperArm + goal.waist + goal.hips;
  return (totalAssessment < totalGoal);
};

module.exports = goal;
