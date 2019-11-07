import * as fileTool from "./file-tool";

describe("file-tool.ts", () => {
  test("should exist", () => {
    expect(typeof fileTool.getMetadata).toBe("function");
    expect(typeof fileTool.readJSON).toBe("function");
    expect(typeof fileTool.shouldDownload).toBe("function");
  });
});
