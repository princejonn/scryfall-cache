import { readFileSync } from "fs";
import { join } from "path";
import { Logger, LogLevel } from "simple-winston";

const pkg = readFileSync(join(__dirname, "..", "..", "package.json"), { encoding: "utf8" });
const { name, version } = JSON.parse(pkg);

const logger = new Logger({
  packageName: name,
  packageVersion: version,
});

logger.addConsole(LogLevel.INFO);
logger.addTail(LogLevel.DEBUG);
logger.addFileTransport(LogLevel.ERROR);
logger.addFileTransport(LogLevel.SILLY);

export default logger;
