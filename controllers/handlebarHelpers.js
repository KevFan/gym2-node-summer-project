'use strict';

const goalStore = require('../models/goal-store');
const classStore = require('../models/class-store');

const Handlebars = require('handlebars');

/**
 * Handlebars helper function to return a boolean for whether the member has
 * any goals awaiting processing or open
 * Used to prompt message to set a new goal if boolean returns false
 */
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

/**
 * Handlebar helper function to return a boolean of whether a member is currently already enrolled
 * to a class session
 * Used to determine whether to display the enroll or un-enroll for member
 */
Handlebars.registerHelper('checkEnrolled', function (classId, sessionId, userId) {
  return (classStore.getSessionById(classId, sessionId).enrolled.indexOf(userId) !== -1);
});

/**
 * Handlebar helper function to return a string construct of a href for redirection
 * Used for member fitness programme session views
 */
Handlebars.registerHelper('constructHref', function (string1, string2) {
  if (string1 === 'classes') {
    return string1 + '/' + string2;
  } else {
    return 'routine/' + string1 + '/' + string2;
  }
});

module.exports = Handlebars;
