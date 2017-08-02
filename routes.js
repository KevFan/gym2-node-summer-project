'use strict';

const express = require('express');
const router = express.Router();

const dashboard = require('./controllers/dashboard.js');
const trainerDashboard = require('./controllers/trainerDashboard.js');
const about = require('./controllers/about.js');
const accounts = require('./controllers/accounts.js');
const classes = require('./controllers/classes.js');
const assessments = require('./controllers/assessments.js');
const settings = require('./controllers/settings.js');

router.get('/', accounts.index);
router.get('/login', accounts.login);
router.get('/signup', accounts.signup);
router.get('/logout', accounts.logout);
router.post('/register', accounts.register);
router.post('/authenticate', accounts.authenticate);

router.get('/dashboard', dashboard.index);
router.get('/about', about.index);

router.get('/trainerDashboard', trainerDashboard.index);
router.post('/trainerDashboard/addclass', trainerDashboard.addClass);
router.get('/trainerDashboard/classes/delete/:id', trainerDashboard.deleteClass);
router.get('/trainerDashboard/classes/hideOrUnhide/:id', trainerDashboard.hideOrUnhideClass);

router.get('/classes/', classes.index);
router.get('/classes/:id', classes.listClassSessions);
router.post('/classes/:id/addsession', classes.addSession);
router.get('/classes/:id/deletesession/:sessionid', classes.deleteSession);
router.post('/classes/:id/', classes.updateClass);
router.post('/classes/:id/enrolAll', dashboard.enrollAllSessions);
router.post('/classes/:id/enroll/:sessionid', dashboard.enrollSpecificSession);
router.get('/classes/:id/unEnrolAll', dashboard.unEnrollAllSession);
router.get('/classes/:id/unEnroll/:sessionid', dashboard.unEnrollSpecificSession);
router.post('/search/class', dashboard.searchClassByName);
router.post('/classes/:id/updateSession/:sessionid', classes.updateClassSession);

router.get('/assessments', assessments.index);
router.post('/assessments/addbooking', assessments.addBooking);
router.get('/assessments/booking/delete/:id', assessments.deleteBooking);
router.post('/assessments/booking/update/:id', assessments.updateBooking);
router.get('/assessments/member/:userid', assessments.viewMemberAssessments);
router.post('/assessments/addassessment/:id', assessments.addAssessment);
router.get('/assessments/deleteAssessment/:id', assessments.deleteAssessment);
router.post('/assessments/searchMember', assessments.searchMember);
router.post('/assessments/:userid/update/:id', assessments.updateAssessment);

router.get('/settings/', settings.index);
router.post('/updateSettings', settings.updateSettings);
router.post('/updateProfilePicture', settings.updateProfilePicture);

module.exports = router;
