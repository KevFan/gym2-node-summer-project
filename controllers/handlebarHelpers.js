'use strict';

const goalStore = require('../models/goal-store');
const classStore = require('../models/class-store');
const members = require('../models/member-store');
const analytics = require('../utils/analytics');

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

Handlebars.registerHelper('getMemberStats', function (userId) {
  let stats = analytics.generateMemberStats(members.getMemberById(userId));
  return new Handlebars.SafeString(
    '<div class="meta">' + 'BMI: ' + stats.bmi + '</div>' +
    '<div class="meta">' + 'IsIdealWeight: ' + stats.isIdealBodyweight + '</div>' +
    '<div class="meta">' + 'BMI Category: ' + stats.bmiCategory + '</div>');
  //   '<section class="ui two column grid">' +
  //     '<section class="meta column">\n' +
  //       '<div class="row">BMI:</div>\n' +
  //       '<div class="row">IsIdealWeight:</div>\n' +
  //       '<div class="row">BMI Category: </div>\n' +
  //     '</section>' +
  //     '<section class="meta column">\n' +
  //     '<div class="row">' + stats.bmi + '</div>\n' +
  //     '<div class="row">' + stats.isIdealBodyweight + '</div>\n' +
  //     '<div class="row">' + stats.bmiCategory + '</div>\n' +
  //     '</section>' +
  //   '</section>'
  // );
});

Handlebars.registerHelper('checkEnrolled', function (classId, sessionId, userId) {
  return (classStore.getSessionById(classId, sessionId).enrolled.indexOf(userId) !== -1);
});

module.exports = Handlebars;
