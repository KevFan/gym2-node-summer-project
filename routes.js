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
const bookings = require('./controllers/bookings.js');
const search = require('./controllers/search.js');
const goals = require('./controllers/goals.js');
const handleBarHelpers = require('./controllers/handlebarHelpers.js');
const fitness = require('./controllers/fitness.js');

// Accounts
router.get('/', accounts.index);
router.get('/login', accounts.login);
router.get('/signup', accounts.signup);
router.get('/logout', accounts.logout);
router.post('/register', accounts.register);
router.post('/authenticate', accounts.authenticate);

// Member
router.get('/dashboard', dashboard.index);
router.get('/about', about.index);
router.get('/routine/:userid/:id', dashboard.viewPersonalRoutine);

// Trainer
router.get('/trainerDashboard', trainerDashboard.index);
router.post('/trainerDashboard/addclass', trainerDashboard.addClass);
router.get('/trainerDashboard/classes/delete/:id', trainerDashboard.deleteClass);
router.get('/trainerDashboard/classes/hideOrUnhide/:id', trainerDashboard.hideOrUnhideClass);
router.get('/trainerDashboard/members', trainerDashboard.listAllMembers);
router.get('/trainerDashboard/members/:id', trainerDashboard.viewSpecificMember);
router.post('/trainerDashboard/buildProgramme/:id', trainerDashboard.buildFitnessProgramme);

// Classes
router.get('/classes/', classes.index);
router.get('/classes/:id', classes.listClassSessions);
router.post('/classes/:id/addsession', classes.addSession);
router.get('/classes/:id/deletesession/:sessionid', classes.deleteSession);
router.post('/classes/:id/', classes.updateClass);
router.post('/classes/:id/enrolAll', dashboard.enrollAllSessions);
router.post('/classes/:id/enroll/:sessionid', dashboard.enrollSpecificSession);
router.get('/classes/:id/unEnrolAll', dashboard.unEnrollAllSession);
router.get('/classes/:id/unEnroll/:sessionid', dashboard.unEnrollSpecificSession);
router.post('/classes/:id/updateSession/:sessionid', classes.updateClassSession);

// Assessments
router.post('/assessments/addassessment/:id', assessments.addAssessment);
router.get('/assessments/deleteAssessment/:userid/:id', assessments.deleteAssessment);
router.post('/assessments/:userid/update/:id', assessments.updateAssessment);

// Bookings
router.post('/bookings/addbooking/:id', bookings.addBooking);
router.get('/bookings/delete/:id', bookings.deleteBooking);
router.post('/bookings/update/:id', bookings.updateBooking);

// Settings
router.get('/settings/', settings.index);
router.post('/updateSettings', settings.updateSettings);
router.post('/updateProfilePicture', settings.updateProfilePicture);

// Search
router.post('/search/class', search.searchClassByName);
router.post('/search/member', search.searchMember);

// Goals
router.post('/goals/addgoal/:id', goals.addGoal);
router.get('/goals/deleteGoal/:userid/:id', goals.deleteGoal);

// Fitness Programmes
router.get('/fitness', fitness.index);
router.post('/fitness/addroutine', fitness.addRoutine);
router.get('/fitness/delete/:id', fitness.deleteRoutine);
router.post('/fitness/update/:id', fitness.updateRoutine);
router.get('/fitness/:id', fitness.listRoutineExercises);
router.post('/fitness/:userid/addExercise/:id', fitness.addExercise);
router.get('/fitness/:userid/:id/deleteExercise/:exerciseid', fitness.deleteExerecise);
router.post('/fitness/:id/updateExercise/:exerciseid', fitness.updateExercise);

module.exports = router;
