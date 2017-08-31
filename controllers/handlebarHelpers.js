'use strict';

const goalStore = require('../models/goal-store');
const classStore = require('../models/class-store');
const memberStore = require('../models/member-store');
const trainerStore = require('../models/trainer-store');
const _ = require('lodash');

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
    result = _.find(goalList.goals, function (goal) {
      return (goal.status === 'Open' || goal.status === 'Awaiting Processing');
    });
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

/**
 * Handlebars helper function to return a boolean for whether the member has
 * an existing fitness programme
 * Used to prompt message that rebuilding a fitness programme will lose all custom changes
 */
Handlebars.registerHelper('checkForProgramme', function (userId) {
  const member = memberStore.getMemberById(userId);
  return (member.program.length === 0);
});

/**
 * Handlebars helper function to check whether a dateString passed is in the past
 * Used to tell user that the session is no longer available
 */
Handlebars.registerHelper('checkIsInPast', function (dateString) {
  let compareDate = new Date(dateString);
  return (compareDate < new Date());
});

/**
 * Handlebar Helper function to return a member's name only by their id
 * Used to list enrolled members for a sessions which only contain their ids
 */
Handlebars.registerHelper('getMemberName', function (id) {
  return memberStore.getMemberById(id).name;
});

/**
 * Handlebar Helper function to check if cloudinary file is present
 * Used to disable profile picture options if not found
 */
Handlebars.registerHelper('checkForCloudinaryFile', function () {
  try {
    return require('../.data/.env.json');
  } catch (e) {
    return false;
  }
});

/**
 * Handlebar Helper function to return a trainer's name only by their id
 * Used to get current trainer name by id in when updating class
 */
Handlebars.registerHelper('getTrainerName', function (id) {
  return trainerStore.getTrainerById(id).name;
});

module.exports = Handlebars;
