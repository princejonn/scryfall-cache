import download from "download";
import find from "lodash/find";
import humps from "lodash-humps";
import request from "request-promise-native";
import BulkItem from "models/BulkItem";
import FileTool from "utils/FileTool";
import Logger from "utils/Logger";

const ListType = {
  DEFAULT_CARDS: "default_cards",
  ORACLE_CARDS: "oracle_cards",
  RULINGS: "rulings",
  ALL_CARDS: "all_cards",
};

export default class ScryfallRequest {
  /**
   * @param {object} [options]
   * @param {number} [options.cacheHours]
   * @param {string} [options.workDir]
   * @param {string} [options.uri]
   */
  constructor(options = {}) {
    this._logger = Logger.getContextLogger("request");
    this._options = options;
    this._bulkDataURI = options.uri || "https://api.scryfall.com/bulk-data";
    this._bulkData = [];
    this._files = {};
  }

  /**
   * Downloads new bulk files if needed.
   *
   * @returns {Promise<void>}
   */
  async downloadFiles() {
    this._logger.debug("downloading files");

    await this._setBulkDataList();

    const defaultCards = find(this._bulkData, { type: ListType.DEFAULT_CARDS });
    const rulings = find(this._bulkData, { type: ListType.RULINGS });

    const defaultFile = await this._download(defaultCards);
    const rulingsFile = await this._download(rulings);

    this._files.defaultCards = defaultFile;
    this._files.rulings = rulingsFile;

    this._logger.debug("default cards file", defaultFile);
    this._logger.debug("rulings file", rulingsFile);
  }

  /**
   * Returns file paths
   *
   * @returns {Promise<{defaultCards: string, rulings: string}>}
   */
  async getFiles() {
    return this._files;
  }

  //
  // Private
  //

  /**
   * Downloads a new bulk file if needed.
   * Returns the file path when done.
   *
   * @param {BulkItem} bulkItem
   * @returns {Promise<string>}
   * @private
   */
  async _download(bulkItem) {
    const fileTool = new FileTool(this._options);

    const file = fileTool.getFile(bulkItem);
    const shouldDownload = await fileTool.shouldDownload(bulkItem);

    if (!shouldDownload) {
      return file.path;
    }

    const { permalinkUri } = bulkItem;
    const workDir = fileTool.getWorkDir();

    this._logger.debug("downloading from uri", permalinkUri);

    await download(permalinkUri, workDir);

    return file.path;
  }

  /**
   * Getting information about bulk data files from API
   *
   * @returns {Promise<void>}
   * @private
   */
  async _setBulkDataList() {
    const body = await request({
      method: "GET",
      url: this._bulkDataURI,
    });
    const json = JSON.parse(body);
    const data = json.data;

    for (const item of data) {
      const camelCase = humps(item);
      this._bulkData.push(new BulkItem(camelCase));
    }
  }
}
