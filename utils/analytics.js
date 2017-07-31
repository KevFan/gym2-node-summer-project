'use strict';

const _ = require('lodash');
const logger = require('../utils/logger');
const conversion = require('./conversion');
let memberStats = require('./memberStats');
const assessmentStore = require('../models/assessment-store');

const analytics = {

  /**
   * Generates the member stats - BMI, isIdealWeight, Assessment Trend & BMI Category
   * @param member
   */
  generateMemberStats(member) {
    if (assessmentStore.getAssessmentList(member.id)) {
      let weight = member.startingweight;
      let assessmentlist = assessmentStore.getAssessmentList(member.id);
      if (assessmentlist.assessments.length > 0) {
        weight = assessmentlist.assessments[0].weight;
      }

      memberStats.bmi = this.calculateBMI(member, weight);
      memberStats.bmiCategory = this.determineBMICategory(member, weight);
      memberStats.isIdealBodyweight = this.isIdealBodyWeight(member, weight);
      memberStats.trend = true;
      if (assessmentlist.assessments.length > 1) {
        if (weight > assessmentlist.assessments[1].weight) {
          memberStats.trend = false;
        }
      }

      return memberStats;
    }

    return memberStats;
  },

  /**
   * Returns the BMI of the user
   * @param member User for details to calculate BMI
   * @param weight Weight of the user
   * @returns {*} BMI Integer of the user
   */
  calculateBMI(member, weight) {
    if (member.height <= 0)
      return 0;
    else
      return conversion.round((weight / (member.height * member.height)), 2);
  },

  /**
   * Returns the BMI Category of the user
   * @param member User to get details to determine BMI Category
   * @param weight Weight of the User
   * @returns {*} String of the user BMI Category
   */
  determineBMICategory(member, weight) {
    let bmi = this.calculateBMI(member, weight);

    if (bmi < 15) return 'VERY SEVERELY UNDERWEIGHT';
    else if (bmi < 16) return 'SEVERELY UNDERWEIGHT';
    else if (bmi < 18.5) return 'UNDERWEIGHT';
    else if (bmi < 25) return 'NORMAL';
    else if (bmi < 30) return 'OVERWEIGHT';
    else if (bmi < 35) return 'MODERATELY OBESE';
    else if (bmi < 40) return 'SEVERELY OBESE';
    else return 'VERY SEVERELY OBESE';
  },

  /**
   * Returns a boolean of whether the user is the ideal weight
   * @param member User to get details to determine ideal weight
   * @param weight Current weight of the user
   * @returns {boolean} Boolean of whether user is the ideal weight
   */
  isIdealBodyWeight(member, weight) {
    let fiveFeet = 60.0;
    let idealBodyWeight;

    let inches = conversion.convertMetresToInches(member.height, 2);

    if (inches <= fiveFeet) {
      if (member.gender === 'M') {
        idealBodyWeight = 50;
      } else {
        idealBodyWeight = 45.5;
      }
    } else {
      if (member.gender === 'M') {
        idealBodyWeight = 50 + ((inches - fiveFeet) * 2.3);
      } else {
        idealBodyWeight = 45.5 + ((inches - fiveFeet) * 2.3);
      }
    }

    logger.info('Ideal Weight: ' + idealBodyWeight);
    return ((idealBodyWeight <= (weight + 2.0))
      && (idealBodyWeight >= (weight - 2.0))
    );
  },
};

module.exports = analytics;
