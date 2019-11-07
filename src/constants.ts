import { homedir } from "os";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

export const TIMEOUT_HOURS = 24;
export const API_ENDPOINT = "https://api.scryfall.com/bulk-data";
export const WORK_DIR = join(homedir(), ".scryfall-cache");

if (!existsSync(WORK_DIR)) {
  mkdirSync(WORK_DIR, { recursive: true });
}
