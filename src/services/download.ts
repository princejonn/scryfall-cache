import { join } from "path";
import axios from "axios";
import camelCaseKeys from "camelcase-keys"
import download from "download";
import find from "lodash/find";
import { API_ENDPOINT, WORK_DIR } from "../constants";
import { IBulkItem, IFiles } from "../interfaces";
import { getMetadata, shouldDownload } from "../utils/file-tool";
import { ListType } from "../enums";
import winstonLogger from "../utils/logger";

const logger = winstonLogger.createChildLogger("download");

let DOWNLOADING = false;

const getBulkDataList = async (): Promise<Array<IBulkItem>> => {
  const list: Array<IBulkItem> = [];

  logger.debug("getting archive endpoints");

  const { data } = await axios.get(API_ENDPOINT);

  data.data.forEach((item: IBulkItem) => {
    const { type, permalinkUri }: any = camelCaseKeys(item, { deep: true });
    list.push({ type, permalinkUri });
  });

  logger.debug("returning list of archive endpoints", list);

  return list;
};

const downloadArchive = async (bulkItem: IBulkItem) => {
  const file = getMetadata(bulkItem);
  const should = await shouldDownload(bulkItem);

  if (!should) {
    return file.path;
  }

  const { permalinkUri } = bulkItem;

  logger.debug("downloading from uri", permalinkUri);

  await download(permalinkUri, WORK_DIR);

  const filePath = join(WORK_DIR, file.name);

  logger.debug("returning filePath", filePath);

  return filePath;
};

const downloadArchives = async (): Promise<IFiles> => {
  if (DOWNLOADING) return;

  const files: IFiles = {};

  try {
    DOWNLOADING = true;

    logger.debug("downloading all required archives");

    const list = await getBulkDataList();

    logger.debug("downloading cards");

    const oracleCards = find(list, { type: ListType.ORACLE_CARDS });

    files.cards = await downloadArchive(oracleCards);

    logger.debug("downloading rulings");

    const rulings = find(list, { type: ListType.RULINGS });

    files.rulings = await downloadArchive(rulings);

    logger.debug("downloads completed");
  } catch (err) {
    DOWNLOADING = false;
    throw err;
  }

  logger.debug("returning files object", files);

  DOWNLOADING = false;
  return files;
};

export default downloadArchives;
