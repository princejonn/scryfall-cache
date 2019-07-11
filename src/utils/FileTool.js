import os from "os";
import fs from "fs";
import path from "path";
import dateFns from "date-fns";
import isObject from "lodash/isObject";

export default class FileTool {
  constructor() {
    this._cacheHours = 24;
    this._cwd = path.join(os.homedir(), ".mtg-tools", "downloads");

    if (!fs.existsSync(this._cwd)) {
      fs.mkdirSync(this._cwd, { recursive: true });
    }
  }

  /**
   * Returns true if the file doesn't exist, or the cache timeout has been reached.
   *
   * @param {BulkItem} bulkItem
   */
  async shouldDownload(bulkItem) {
    if (!isObject(bulkItem)) {
      throw new Error(`bulkItem undefined [ ${bulkItem} ]`);
    }

    const file = this.getFile(bulkItem);
    if (!file.exists) {
      return true;
    }

    const modified = new Date(file.info.mtime).toISOString();
    const date = new Date().toISOString();

    const hours = dateFns.differenceInHours(date, modified);

    return hours > this._cacheHours;
  }

  /**
   * Returns work directory for the package cache files
   *
   * @returns {string}
   */
  getCWD() {
    return this._cwd;
  }

  /**
   * Returns file information by comparing BulkItem data with what exists in the directory.
   *
   * @param {BulkItem} bulkItem
   * @returns {{path: string, exists: boolean, info: object}}
   */
  getFile(bulkItem) {
    if (!isObject(bulkItem)) {
      throw new Error(`bulkItem undefined [ ${bulkItem} ]`);
    }

    const { permalinkUri } = bulkItem;
    const split = permalinkUri.split("/");
    const fileName = split[split.length - 1];
    const filePath = path.join(this._cwd, fileName);

    let fileExists = false;
    let fileInfo = null;

    if (fs.existsSync(filePath)) {
      fileExists = true;
      fileInfo = fs.statSync(filePath);
    }

    return {
      path: filePath,
      exists: fileExists,
      info: fileInfo,
    };
  }

  /**
   * Reads a file into memory and parses as JSON.
   *
   * @param {string} filePath
   * @returns {Promise<object>}
   */
  async readFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, buffer) => {
        if (err) return reject(err);
        const string = buffer.toString();
        const json = JSON.parse(string);
        resolve(json);
      });
    });
  }
}
