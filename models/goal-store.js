'use strict';

const _ = require('lodash');
const logger = require('../utils/logger');
const JsonStore = require('./json-store');

/**
 * Stores/controls list of user goal lists and goals
 */
const goalStore = {
  store: new JsonStore('./models/goal-store.json', { goalListCollection: [] }),
  collection: 'goalListCollection',

  /**
   * Adds an goal to the beginning of the user goal list.
   * Creates a user goal list if one use not found with the userId
   * @param userId Id of the user
   * @param goal goal to be added to user goal list
   */
  addGoal(userId, goal) {
    let goalList = this.getGoalList(userId);
    if (!goalList) {
      goalList = {
        userid: userId,
        goals: [],
      };
      this.store.add(this.collection, goalList);
      this.store.save();
    }

    goalList.goals.unshift(goal);
    this.store.save();
  },

  /**
   * Removes an goal from the user goal list
   * @param userId Id of the user
   * @param goalId Id of the goal
   */
  removeGoal(userId, goalId) {
    let goalList = this.getGoalList(userId);
    _.remove(goalList.goals, { id: goalId });
    this.store.save();
  },

  /**
   * Returns the user goal list
   * @param userid Id of the user
   * @returns {*} goal list of the user
   */
  getGoalList(userid) {
    return this.store.findOneBy(this.collection, { userid: userid });
  },

  /**
   * Returns specific goal from the user goal list
   * @param userid Id of the user
   * @param goalid Id of the goal
   * @returns {*} goal matching the userId and goalId
   */
  getGoalById(userid, goalid) {
    const goallist = this.getGoalList(userid).goals;
    logger.info('goallist is ', goallist);
    let goal = null;
    for (let i = 0; i < goallist.length; i++) {
      if (goalid === goallist[i].id) {
        goal = goallist[i];
      }
    }

    logger.info('goal is ', goal);
    return goal;
  },

  /**
   * Deletes the user goal list from the stored json file.
   * Used only when the user is removed from the user list by a trainer
   * @param userid Id of the user to get the user goal list
   */
  removeGoalList(userid) {
    let goalList = this.getGoalList(userid);
    if (goalList) {
      this.store.remove(this.collection, goalList);
      this.store.save();
    }

    logger.info('goallist to be removed is ', goalList);
  },
};

module.exports = goalStore;
