import * as cache from "./cache";

describe("cache.ts", () => {
  test("should exist", () => {
    expect(typeof cache.load).toBe("function");
    expect(typeof cache.enhance).toBe("function");
    expect(typeof cache.findCard).toBe("function");
    expect(typeof cache.findCards).toBe("function");
    expect(typeof cache.getCard).toBe("function");
    expect(typeof cache.getRulings).toBe("function");
  });
});
