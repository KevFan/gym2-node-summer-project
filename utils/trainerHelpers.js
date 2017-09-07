const bookingStore = require('../models/booking-store');
const classStore = require('../models/class-store.js');
const uuid = require('uuid');
const _ = require('lodash');
const fitnessStore = require('../models/fitness-store');
const logger = require('../utils/logger');

const trainerHelper = {
  /**
   * Returns a boolean of whether a trainer is free at a particular time. Checks whether the trainer
   * has a booking or class session at the time passed in
   * @param trainerId Id of the trainer
   * @param dateTimeString Date time to check for
   * @returns {boolean} Boolean of whether trainer is free
   */
  isTrainerFree(trainerId, dateTimeString) {
    let trainerIsFree = (bookingStore.getBookingByDate(trainerId, dateTimeString)
      || classStore.getClassSessionByDate(trainerId, dateTimeString));
    return !trainerIsFree;
  },

  /**
   * Helper object to get return the class, routine or new custom routine when building a members fitness
   * programme
   * @param id the classId or workout routineId to find either the class/routine
   * @returns {*} the class, routine or new custom routine
   */
  getClassOrRoutine(id) {
    const classFound = classStore.getClassById(id);
    const routineFound = fitnessStore.getProgrammeById(id);
    if (classFound) {
      logger.info('The class found is ', classFound);
      return {
        id: uuid(),
        classId: classFound.id,
        image: classFound.image,
        name: classFound.name,
        type: 'classes',
      };
    } else if (routineFound) {
      logger.info('The routine found is ', routineFound);

      // Deep clone and stop same object reference - can also use JSON.parse(JSON.stringify(routineFound));
      let routineToAdd = _.cloneDeep(routineFound);
      routineToAdd.id = uuid();
      return routineToAdd;
    } else if (id === 'other') {
      logger.info('No class or routine found');
      return {
        id: uuid(),
        name: 'Custom Routine',
        description: 'A custom routine just for you',
        exercises: [],
      };
    }
  },

  /**
   * Helper object to create an array containing the next session of each class a trainer made
   * @param trainerId Id of the trainer to get all the classes the trainer manages
   * @returns {Array} array containing the next session of each class a trainer made
   */
  getNextSessionClass(trainerId) {
    let trainerClasses = classStore.getAllTrainerClasses(trainerId);
    let nextClassList = [];
    trainerClasses.forEach(function (specificClass) {
      let firstSessionInFuture = _.find(specificClass.sessions, function (specificSession) {
        return (new Date() < new Date(specificSession.dateTime));
      });

      if (firstSessionInFuture) {
        // push new object instead of the session found to avoid adding new properties to the session found
        nextClassList.push({
          name: specificClass.name,
          classId: specificClass.id,
          dateTime: firstSessionInFuture.dateTime,
          capacity: firstSessionInFuture.capacity,
          availability: firstSessionInFuture.availability,
        });
      } else {
        nextClassList.push({
          name: specificClass.name,
          classId: specificClass.id,
          dateTime: 'No future session scheduled',
        });
      }
    });

    return nextClassList;
  },
};

module.exports = trainerHelper;
