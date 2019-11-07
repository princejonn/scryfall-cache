import { Stats } from "fs";

export interface IBulkItem {
  type: string;
  permalinkUri: string;
}

export interface IFiles {
  cards?: any;
  rulings?: any;
}

export interface IGetMetadataResult {
  name: string|null;
  path: string|null;
  exists: boolean;
  info: Stats|null;
}

export interface ILatinMap {
  [key: string]: string;
}
