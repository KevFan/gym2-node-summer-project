'use strict';
const logger = require('../utils/logger');
const goalStore = require('../models/goal-store');
const assessmentStore = require('../models/assessment-store');

/**
 * Goal Helper object
 */
const goalHelpers = {
  /**
   * Sets each goal status to either open, achieved, missed or awaiting processing depending on the
   * goal achieve by date, today's date and whether an assessment can be found within 3 days of the
   * goal date
   * @param userId Id of the member to get the goal list
   */
  setGoalStatusChecks(userId) {
    let today = new Date().setHours(0, 0, 0, 0);
    logger.info('Todays date: ' + today);
    let userGoalList = goalStore.getGoalList(userId);
    if (userGoalList) {
      userGoalList.goals.forEach(function (goal) {
        let goalDate = new Date(goal.date).getTime();
        logger.info('Goal Date2: ' + goalDate);
        logger.info('is Today = goal date: ' + (today === goalDate));
        let assessment = assessmentStore.getFirstAssessmentWithinThreeDays(userId, goalDate);
        if (goalDate > today) {
          goal.status = 'Open';
          logger.info('Still time left till goal date, setting status to open');
        } else if (!assessment[0] && (goalDate === today)) {
          goal.status = 'Awaiting Processing';
          logger.info('No assessment found, book assessment to process');
        } else if (assessment[0]) {
          if (compareGoalToAssessment(assessment[0], goal)) {
            goal.status = 'Achieved';
            logger.debug('setting status to achieved');
          } else {
            goal.status = 'Missed';
            logger.debug('setting status to missed');
          }
        } else if (!assessment[0] && (goalDate < today)) {
          logger.info('Goal date passed and no assessment found, setting status to missed')
          goal.status = 'Missed';
        }
      });
    }

    goalStore.store.save();
  },
};

/**
 * Helper object to determine if a goal has been achieved in comparison to an assessment result.
 * Returns true if the assessment net measurement is less than or equal to the goal net measurement
 * (Assumes the member is trying to lose weight)
 * @param assessment
 * @param goal
 * @returns {boolean}
 */
const compareGoalToAssessment = function (assessment, goal) {
  let totalAssessment = assessment.weight + assessment.chest + assessment.thigh + assessment.upperArm +
    assessment.waist + assessment.hips;
  let totalGoal = goal.weight + goal.chest + goal.thigh + goal.upperArm + goal.waist + goal.hips;
  return (totalAssessment <= totalGoal);
};

module.exports = goalHelpers;
