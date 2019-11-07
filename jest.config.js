/* eslint-disable */
module.exports = {
  roots: ["src"],
  coverageDirectory: "./coverage",
  coverageReporters: ["lcov"],
  transform: { "^.+\\.tsx?$": "ts-jest" },
  collectCoverageFrom: [
    "**/*.{ts, tsx}",
    // Non-library folders/files
    "!**/node_modules/**",
    "!**/coverage/**",
    "!**/dist/**",
    "!jest.config.js",
  ],
};
