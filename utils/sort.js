'use strict';
const logger = require('../utils/logger');

const sort = {
  sortDateTimeOldToNew(theArray) {
    let sortedArray = null;

    if (theArray.length === 0) {
      logger.info('The array has no entries to sort');
    } else if (theArray[0].dateTime) {
      sortedArray = theArray.sort(function (a, b) {
        return new Date(a.dateTime) - new Date(b.dateTime);
      });
    } else if (theArray[0].date) {
      sortedArray = theArray.sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
      });
    }

    logger.info('The sorted array old to new:', sortedArray);
    return sortedArray;
  },

  sortDateTimeNewToOld(theArray) {
    let sortedArray = null;

    if (theArray.length === 0) {
      logger.info('The array has no entries to sort');
    } else if (theArray[0].dateTime) {
      sortedArray = theArray.sort(function (a, b) {
        return new Date(b.dateTime) - new Date(a.dateTime);
      });
    } else if (theArray[0].date) {
      sortedArray = theArray.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });
    }

    logger.debug('The sorted array new to old: ', sortedArray);
    return sortedArray;
  },
};

module.exports = sort;
