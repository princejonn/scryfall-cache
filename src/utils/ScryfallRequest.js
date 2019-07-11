import download from "download";
import find from "lodash/find";
import humps from "lodash-humps";
import request from "request-promise-native";
import BulkItem from "models/BulkItem";
import FileTool from "utils/FileTool";

const ListType = {
  DEFAULT_CARDS: "default_cards",
  ORACLE_CARDS: "oracle_cards",
  RULINGS: "rulings",
  ALL_CARDS: "all_cards",
};

export default class ScryfallRequest {
  constructor() {
    this._bulkDataURI = "https://api.scryfall.com/bulk-data";

    this._bulkData = [];
    this._files = {};
  }

  /**
   * Downloads new bulk files if needed.
   *
   * @returns {Promise<void>}
   */
  async downloadFiles() {
    await this._setBulkDataList();

    const defaultCards = find(this._bulkData, { type: ListType.DEFAULT_CARDS });
    const rulings = find(this._bulkData, { type: ListType.RULINGS });

    const defaultFile = await this._download(defaultCards);
    const rulingsFile = await this._download(rulings);

    this._files.defaultCards = defaultFile;
    this._files.rulings = rulingsFile;
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
    const fileTool = new FileTool();

    const file = fileTool.getFile(bulkItem);
    const shouldDownload = await fileTool.shouldDownload(bulkItem);

    if (!shouldDownload) {
      return file.path;
    }

    const { permalinkUri } = bulkItem;
    const cwd = fileTool.getCWD();

    await download(permalinkUri, cwd);

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
