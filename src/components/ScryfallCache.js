import filter from "lodash/filter";
import find from "lodash/find";
import includes from "lodash/includes";
import startsWith from "lodash/startsWith";
import FileTool from "utils/FileTool";
import Latinise from "utils/Latinise";
import Logger from "utils/Logger";
import ScryfallRequest from "utils/ScryfallRequest";
import SearchString from "utils/SearchString";

export default class ScryfallCache {
  /**
   * @param {object} [options]
   * @param {number} [options.cacheHours]
   * @param {string} [options.workDir]
   * @param {string} [options.uri]
   */
  constructor(options = {}) {
    this._logger = Logger.getContextLogger("cache");
    this._options = options;
    this._loaded = false;
    this._cache = null;
    this._rulings = null;
    this._names = [];
  }

  /**
   * Downloads cards and rulings and loads them into cache
   *
   * @returns {Promise<void>}
   */
  async load() {
    if (this._loaded) return;

    this._logger.debug("loading cache");

    const request = new ScryfallRequest(this._options);
    const tool = new FileTool(this._options);

    await request.downloadFiles();

    const files = await request.getFiles();

    this._logger.debug("loading files into cache");

    this._cache = await tool.readFile(files.defaultCards);
    this._rulings = await tool.readFile(files.rulings);

    this._logger.debug("caching card names");

    for (const card of this._cache) {
      if (!includes(this._names, card.name)) {
        this._names.push(card.name);
      }
    }

    this._loaded = true;
  }

  /**
   * Returns a card by scryfall card id
   *
   * @param {string} id
   * @returns {object}
   */
  getCard(id) {
    if (!this._loaded) {
      throw new Error("cache must be loaded before it can be used");
    }

    const exists = find(this._cache, { id });
    if (exists) {
      return exists;
    }

    throw new Error(`card by id not found [ ${id} ]`)
  }

  /**
   * Returns scryfall rulings by card id
   *
   * @param {string} id
   * @returns {Array<object>}
   */
  getRulings(id) {
    if (!this._loaded) {
      throw new Error("cache must be loaded before it can be used");
    }

    const card = this.getCard(id);
    const exists = filter(this._rulings, { oracle_id: card.oracle_id });
    if (exists) {
      return exists;
    }

    return [];
  }

  /**
   * @param {string} name
   * @returns {object}
   */
  findCard(name) {
    if (!this._loaded) {
      throw new Error("cache must be loaded before it can be used");
    }

    const foundWithLodash = find(this._cache, { name: name.trim() });
    if (foundWithLodash) {
      return foundWithLodash;
    }

    const foundWithMethod = this._findCard(name);
    if (foundWithMethod) {
      return foundWithMethod;
    }
  }

  //
  // Private
  //

  /**
   * Takes the slow route (10x slower than _.find) to find a card by manipulating the name until a card can be found.
   * Even though it is slower, it is sometimes needed to be able to find the card.
   *
   * @param {string} name
   * @returns {object}
   * @private
   */
  _findCard(name) {
    this._logger("finding card with more accurate method", name);

    for (const card of this._cache) {
      if (ScryfallCache._latinise(name) === ScryfallCache._latinise(card.name)) {
        return card;
      }

      if (ScryfallCache._searchString(name) === ScryfallCache._searchString(card.name)) {
        return card;
      }

      if (ScryfallCache._encoded(name) === ScryfallCache._encoded(card.name)) {
        return card;
      }

      if (startsWith(card.name, name)) {
        return card;
      }
    }

    throw new Error(`card by name could not be found [ ${name} ]`);
  }

  //
  // Static
  //

  /**
   * @param {string} name
   * @returns {string}
   * @private
   */
  static _latinise(name) {
    return Latinise(name).trim();
  }

  /**
   * @param {string} name
   * @returns {string}
   * @private
   */
  static _searchString(name) {
    return SearchString(ScryfallCache._latinise(name));
  }

  /**
   * @param {string} name
   * @returns {string}
   * @private
   */
  static _encoded(name) {
    return encodeURIComponent(ScryfallCache._latinise(name));
  }
}
