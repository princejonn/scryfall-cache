const ScryfallCache = require("../lib/index");

describe("scryfall cache", () => {

  test("works", async () => {
    const cache = new ScryfallCache();
    await cache.load();

    const card = cache.findCard("Edgar Markov");
    const rulings = cache.getRulings(card.id);
    const cardFromId = cache.getCard(card.id);

    expect(card.name).toBe("Edgar Markov");
    expect(rulings.length).toBeGreaterThan(0);
    expect(cardFromId.name).toBe("Edgar Markov");
  }, 60000);

});
