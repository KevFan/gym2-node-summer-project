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
  /**
   * Renders the settings view with the user's current details
   * @param request to render settings view
   * @param response renders the settings view
   */
  index(request, response) {
    logger.info('settings rendering');
    const viewData = {
      title: 'Settings',
      user: accounts.getCurrentUser(request),
      isTrainer: accounts.userIsTrainer(request),
    };
    response.render('settings', viewData);
  },

  /**
   * Updates the user's details
   * @param request to update the user's details, contains the information to update
   * @param response updates the user details and redirects to the settings page
   */
  updateSettings(request, response) {
    let loggedInUser = accounts.getCurrentUser(request);
    const newEmailIsUsed = function () {
      const newEmail = request.body.email;
      return (trainerstore.getTrainerByEmail(newEmail) || memberstore.getMemberByEmail(newEmail));
    };

    loggedInUser.name = request.body.name;
    if (!newEmailIsUsed()) {
      loggedInUser.email = request.body.email;
    }

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

    if (newEmailIsUsed() && (request.body.email !== loggedInUser.email)) {
      response.render('settings', {
        messageType: 'negative',
        message: 'Cannot update to new email. New email already used by another member/trainer. Other settings are updated',
        user: loggedInUser,
        isTrainer: accounts.userIsTrainer(request),
      });
    } else {
      response.render('settings', {
        messageType: 'positive',
        message: 'Settings successfully updated',
        user: loggedInUser,
        isTrainer: accounts.userIsTrainer(request),
      });
    }

  },

  /**
   * Updates the user's profile picture and uploads to the supplied cloudinary account through keys
   * provided
   * @param request to update and upload new profile photo, contains the image to upload
   * @param response deletes old photo, uploads new photo and redirects the settings view
   */
  updateProfilePicture(request, response) {
    let loggedInUser = accounts.getCurrentUser(request);

    if (loggedInUser.image) {
      const id = path.parse(loggedInUser.image);
      cloudinary.api.delete_resources([id.name], function (result) {
        console.log(result);
      });
    }

    const uploadedPicture = request.files.image;
    if (uploadedPicture) {
      uploadedPicture.mv('tempimage', err => {
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
    } else {
      response.redirect('back');
    }

  },
};

module.exports = settings;
