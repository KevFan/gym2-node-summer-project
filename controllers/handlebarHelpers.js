'use strict';

const goalStore = require('../models/goal-store');
const classStore = require('../models/class-store');

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

Handlebars.registerHelper('checkEnrolled', function (classId, sessionId, userId) {
  return (classStore.getSessionById(classId, sessionId).enrolled.indexOf(userId) !== -1);
});

Handlebars.registerHelper('constructHref', function (string1, string2) {
  if (string1 === 'classes') {
    return string1 + '/' + string2;
  } else {
    return 'routine/' + string1 + '/' + string2;
  }
});

module.exports = Handlebars;
