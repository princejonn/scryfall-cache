import {
  existsSync,
  statSync,
  readFile,
} from "fs";
import { join } from "path";
import { differenceInHours } from "date-fns";
import isObject from "lodash/isObject";
import { TIMEOUT_HOURS, WORK_DIR } from "../constants";
import { IBulkItem, IGetMetadataResult } from "../interfaces";
import winstonLogger from "../utils/logger";

const logger = winstonLogger.createChildLogger("file-tool");

const getMetadata = (bulkItem: IBulkItem): IGetMetadataResult => {
  logger.debug("returning file for item", bulkItem);

  if (!isObject(bulkItem)) {
    throw new Error(`bulkItem undefined [ ${bulkItem} ]`);
  }

  const result: IGetMetadataResult = {
    name: null,
    path: null,
    exists: false,
    info: null,
  };

  const { permalinkUri } = bulkItem;
  logger.debug("permalinkUri resolved", permalinkUri);

  const split = permalinkUri.split("/");
  logger.debug("file split", split);

  const fileName = split[split.length - 1];
  logger.debug("file name resolved", fileName);

  const filePath = join(WORK_DIR, fileName);
  logger.debug("file path resolved", filePath);

  result.name = fileName;
  result.path = filePath;

  if (existsSync(filePath)) {
    result.exists = true;
    result.info = statSync(filePath);
  }

  logger.debug("returning file metadata", result);

  return result;
};

const readJSON = async (filePath: string): Promise<object> => {
  logger.debug("readJSON filePath", filePath);

  return new Promise((resolve, reject) => {
    readFile(filePath, (err, buffer) => {
      if (err) return reject(err);
      const string = buffer.toString();
      const json = JSON.parse(string);
      resolve(json);
    });
  });
};

const shouldDownload = async (bulkItem: IBulkItem): Promise<boolean> => {
  logger.debug("checking if cache should download for item", bulkItem);

  if (!isObject(bulkItem)) {
    throw new Error(`bulkItem undefined [ ${bulkItem} ]`);
  }

  const metadata = getMetadata(bulkItem);

  if (!metadata.exists) {
    logger.debug("file not found. a new download is required.");
    return true;
  }

  const date = new Date();
  const modified = new Date(metadata.info.mtime);
  logger.debug(`file found with modified date [ ${modified} ]`);

  const hours = differenceInHours(date, modified);
  logger.debug(`hours since modified [ ${hours} ]`);

  const shouldDownload = hours > TIMEOUT_HOURS;
  logger.debug(`should download: [ ${shouldDownload} ]`);

  return shouldDownload;
};

export {
  getMetadata,
  readJSON,
  shouldDownload,
}
