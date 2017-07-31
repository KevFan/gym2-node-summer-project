'use strict';

const logger = require('../utils/logger');
const accounts = require('./accounts.js');
const memberstore = require('../models/member-store');
const trainerstore = require('../models/trainer-store');
const cloudinary = require('cloudinary');
const path = require('path');

try {
  const env = require('../.data/.env.json');
  cloudinary.config(env.cloudinary);
}
catch (e) {
  logger.info('You must provide a Cloudinary credentials file - see README.md');
  process.exit(1);
}

const settings = {
  index(request, response) {
    logger.info('settings rendering');
    const viewData = {
      title: 'Settings',
      user: accounts.getCurrentUser(request),
      isTrainer: accounts.userIsTrainer(request),
    };
    response.render('settings', viewData);
  },

  updateSettings(request, response) {
    let loggedInUser = accounts.getCurrentUser(request);
    loggedInUser.name = request.body.name;
    loggedInUser.email = request.body.email;
    loggedInUser.password = request.body.password;
    loggedInUser.gender = request.body.gender;
    loggedInUser.address = request.body.address;
    loggedInUser.height = Number(request.body.height);
    loggedInUser.startingweight = Number(request.body.startingweight);
    if (accounts.userIsTrainer(request)) {
      logger.info('Updating account details for trainer: ' + loggedInUser.id);
      trainerstore.store.save();
    } else {
      logger.info('Updating account details for member: ' + loggedInUser.id);
      memberstore.store.save();
    }

    response.redirect('/settings');
  },

  updateProfilePicture(request, response) {
    let loggedInUser = accounts.getCurrentUser(request);

    if (loggedInUser.image) {
      const id = path.parse(loggedInUser.image);
      cloudinary.api.delete_resources([id.name], function (result) {
        console.log(result);
      });
    }

    request.files.image.mv('tempimage', err => {
      if (!err) {
        cloudinary.uploader.upload('tempimage', result => {
          console.log(result);
          loggedInUser.image = result.url;
          if (accounts.userIsTrainer(request)) {
            trainerstore.store.save();
          } else {
            memberstore.store.save();
          }

          response.redirect('/settings');
        });
      }
    });
  },
};

module.exports = settings;
