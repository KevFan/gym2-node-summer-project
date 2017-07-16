'use strict';

const express = require('express');
const router = express.Router();

const dashboard = require('./controllers/dashboard.js');
const trainerDashboard = require('./controllers/trainerDashboard.js');
const about = require('./controllers/about.js');
const accounts = require('./controllers/accounts.js');
const classes = require('./controllers/classes.js');

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

module.exports = router;
