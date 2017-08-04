'use strict';

const logger = require('../utils/logger');
const uuid = require('uuid');
const members = require('../models/member-store');
const analytics = require('../utils/analytics');
const assessmentStore = require('../models/assessment-store');

const assessments = {
  addAssessment(request, response) {
    const userId = request.params.id;
    const newAssessment = {
      id: uuid(),
      date: new Date().toUTCString(),
      weight: Number(request.body.weight),
      chest: Number(request.body.chest),
      thigh: Number(request.body.thigh),
      upperArm: Number(request.body.upperArm),
      waist: Number(request.body.waist),
      hips: Number(request.body.hips),
      trend: false,
      comment: request.body.comment,
    };
    assessmentStore.addAssessment(userId, newAssessment);
    let memberStats = analytics.generateMemberStats(members.getMemberById(userId));
    newAssessment.trend = memberStats.trend;
    assessmentStore.store.save();
    logger.debug('New Assessment = ', newAssessment);
    response.redirect('back');
  },

  deleteAssessment(request, response) {
    assessmentStore.removeAssessment(request.params.userid, request.params.id);
    response.redirect('back');
  },

  updateAssessment(request, response) {
    logger.info('userid:' + request.params.userid);
    logger.info('assessmentid:' + request.params.id);
    let specificAssessment = assessmentStore.getAssessmentById(request.params.userid, request.params.id);
    logger.info('assessment:', specificAssessment);
    specificAssessment.weight = Number(request.body.weight);
    specificAssessment.chest = Number(request.body.chest);
    specificAssessment.thigh = Number(request.body.thigh);
    specificAssessment.upperArm = Number(request.body.upperArm);
    specificAssessment.waist = Number(request.body.waist);
    specificAssessment.hips = Number(request.body.hips);
    specificAssessment.comment = request.body.comment;
    assessmentStore.store.save();
    response.redirect('back');
  },
};

module.exports = assessments;
