/**
 * Created by kevin on 20/06/2017.
 */

'use strict';

const _ = require('lodash');
const logger = require('../utils/logger');
const JsonStore = require('./json-store');

/**
 * Stores/controls list of user assessment lists and assessments
 */
const assessmentStore = {
  store: new JsonStore('./models/assessment-store.json', { assessmentListCollection: [] }),
  collection: 'assessmentListCollection',

  /**
   * Adds an assessment to the beginning of the user assessment list.
   * Creates a user assessment list if one use not found with the userId
   * @param userId Id of the user
   * @param assessment Assessment to be added to user assessment list
   */
  addAssessment(userId, assessment) {
    let assessmentList = this.getAssessmentList(userId);
    if (!assessmentList) {
      assessmentList = {
        userid: userId,
        assessments: [],
      };
      this.store.add(this.collection, assessmentList);
      this.store.save();
    }

    assessmentList.assessments.unshift(assessment);
    this.store.save();
  },

  /**
   * Removes an assessment from the user assessment list
   * @param userId Id of the user
   * @param assessmentId Id of the assessment
   */
  removeAssessment(userId, assessmentId) {
    let assessmentList = this.getAssessmentList(userId);
    _.remove(assessmentList.assessments, { id: assessmentId });
    this.store.save();
  },

  /**
   * Returns the user assessment list
   * @param userid Id of the user
   * @returns {*} assessment list of the user
   */
  getAssessmentList(userid) {
    return this.store.findOneBy(this.collection, { userid: userid });
  },

  /**
   * Returns specific assessment from the user assessment list
   * @param userid Id of the user
   * @param assessmentid Id of the asssessment
   * @returns {*} Assessment matching the userId and assessmentId
   */
  getAssessmentById(userid, assessmentid) {
    const assessmentlist = this.getAssessmentList(userid).assessments;
    logger.info('assessmentlist is ', assessmentlist);
    let assessment = null;
    for (let i = 0; i < assessmentlist.length; i++) {
      if (assessmentid === assessmentlist[i].id) {
        assessment = assessmentlist[i];
      }
    }

    logger.info('assessment is ', assessment);
    return assessment;
  },

  /**
   * Deletes the user assessment list from the stored json file.
   * Used only when the user is removed from the user list by a trainer
   * @param userid Id of the user to get the user assessment list
   */
  removeAssessmentList(userid) {
    let assessmentList = this.getAssessmentList(userid);
    if (assessmentList) {
      this.store.remove(this.collection, assessmentList);
      this.store.save();
    }

    logger.info('assessmentlist to be removed is ', assessmentList);
  },
};

module.exports = assessmentStore;
