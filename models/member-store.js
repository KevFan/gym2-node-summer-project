'use strict';

const _ = require('lodash');
const JsonStore = require('./json-store');

/**
 * Stores/controls list of members
 */
const memberStore = {

  store: new JsonStore('./models/member-store.json', { members: [] }),
  collection: 'members',

  /**
   * Gets all members
   * @returns {*} all members
   */
  getAllMembers() {
    return this.store.findAll(this.collection);
  },

  /**
   * Adds a new member
   * @param member new member to add
   */
  addMember(member) {
    this.store.add(this.collection, member);
    this.store.save();
  },

  /**
   * Gets a member by id from the list
   * @param id of the member
   * @returns {*} the member matching the id
   */
  getMemberById(id) {
    return this.store.findOneBy(this.collection, { id: id });
  },

  /**
   * Gets a member by email from the list
   * @param email of the member
   * @returns {*} the member matching the email
   */
  getMemberByEmail(email) {
    return this.store.findOneBy(this.collection, { email: email });
  },
};

module.exports = memberStore;
