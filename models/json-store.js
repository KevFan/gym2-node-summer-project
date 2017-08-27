'use strict';

const low = require('lowdb');
const fileAsync = require('lowdb/lib/storages/file-async');

/**
 * Object that uses lowdb to store and control local json collections
 */
class JsonStore {
  /**
   * Constructor for a JsonStore object
   */
  constructor(file, defaults) {
    this.db = low(file, { storage: fileAsync, });
    this.db.defaults(defaults).value();
  }

  /**
   * Writes to the json
   */
  save() {
    this.db.write();
  }

  /**
   * Adds an object to the json collection
   * @param collection Json collection
   * @param obj Object to add to json
   */
  add(collection, obj) {
    this.db.get(collection).push(obj).last().value();
  }

  /**
   * Removes an object from the json collection
   * @param collection Json collection
   * @param obj Object to remove from json
   */
  remove(collection, obj) {
    this.db.get(collection).remove(obj).value();
  }

  /**
   * Removes collection from the json
   * @param collection Collection to be removed
   */
  removeAll(collection) {
    this.db.get(collection).remove().value();
  }

  /**
   * Returns the collection of objects from the json
   * @param collection Collection to find all of
   */
  findAll(collection) {
    return this.db.get(collection).value();
  }

  /**
   * Returns the first object matching the filter in the json collection
   * @param collection Collection to filter
   * @param filter Object property to find
   */
  findOneBy(collection, filter) {
    const results = this.db.get(collection).filter(filter).value();
    return results[0];
  }

  /**
   * Returns an array of objects matching the filter from the json collection
   * @param collection Collection to filter
   * @param filter Object property to filter
   */
  findBy(collection, filter) {
    return this.db.get(collection).filter(filter).value();
  }
}

module.exports = JsonStore;
