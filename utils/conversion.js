/**
 * Created by kevin on 06/07/2017.
 */

'use strict';

const _ = require('lodash');

const conversion = {

  /**
   * Returns a number rounded to a certain number of decimal places
   * @param numberToConvert Number to round
   * @param precision Number of decimal places to round to
   * @returns {number} The rounded number
   */
  round(numberToConvert, precision) {
    let p = Math.pow(10, precision);
    return Math.round(numberToConvert * p) / p;
  },

  /**
   * Converts KG to pounds, rounded to a number of decimal places
   * @param numberToConvert Number in KG
   * @param precision Number of decimals places to round to
   * @returns {*|number} Rounded number in pounds
   */
  convertKGtoPounds(numberToConvert, precision) {
    return this.round(numberToConvert * 2.2, precision);
  },

  /**
   * Converts metres to inches rounded to a number of decimal places
   * @param numberToConvert Number in metre
   * @param precision Number of decimal places to round to
   * @returns {*|number} Rounder number in inches
   */
  convertMetresToInches(numberToConvert, precision) {
    return this.round(numberToConvert * 39.37, precision);
  },
};

module.exports = conversion;
