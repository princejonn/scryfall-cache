import filter from "lodash/filter";
import find from "lodash/find";
import includes from "lodash/includes";
import startsWith from "lodash/startsWith";
import { readJSON } from "../utils/file-tool";
import latinise from "../utils/latinise";
import searchString from "../utils/search-string";
import download from "./download";
import winstonLogger from "../utils/logger";
import {
  RX_CARD_DRAW,
  RX_REMOVE_ARTIFACT,
  RX_REMOVE_CREATURE,
  RX_REMOVE_ENCHANTMENT,
  RX_REMOVE_PERMANENT,
  RX_REMOVE_PLANESWALKER,
  RX_TUTOR,
} from "../regex";

const logger = winstonLogger.createChildLogger("cache");

let LOADED = false;
let CARDS: any = [];
let RULINGS: any = [];

const load = async () => {
  if (LOADED) return;

  logger.debug("loading cache");

  const files = await download();

  logger.debug("loading card files into cache", files.cards);

  CARDS = await readJSON(files.cards);

  logger.debug("loading rulings files into cache", files.rulings);

  RULINGS = await readJSON(files.rulings);

  logger.debug("done loading files into cache");

  LOADED = true;
};

const getType = (card: any) => {
  const { type_line } = card;

  let type = type_line
    .toLowerCase()
    .replace(/hero/g, "")
    .replace(/token/g, "")
    .replace(/tribal/g, "")
    .replace(/world/g, "")
    .replace(/\'/g, "")
    .replace(/\,/g, "")
    .trim();

  if (includes(type, "//")) {
    const split = type.split("//");
    type = split[0].trim();
  }

  if (includes(type, "—")) {
    const split = type.split("—");
    type = split[0].trim();
  }

  type = type
    .replace(/\s/g, "_")
    .replace(/\_\_/g, "_");

  if (!type) {
    type = "special";
  }

  return type;
};

const getGroups = (card: any): object => {
  if (!card.oracle_text) return {};

  const lowerCase = card.oracle_text.toLowerCase();

  return {
    cardDraw: RX_CARD_DRAW.test(lowerCase),
    remove: {
      artifact: RX_REMOVE_ARTIFACT.test(lowerCase),
      creature: RX_REMOVE_CREATURE.test(lowerCase),
      enchantment: RX_REMOVE_ENCHANTMENT.test(lowerCase),
      permanent: RX_REMOVE_PERMANENT.test(lowerCase),
      planeswalker: RX_REMOVE_PLANESWALKER.test(lowerCase),
    },
    tutor: RX_TUTOR.test(lowerCase),
  };
};

const getCard = (id: string) => {
  if (!LOADED) {
    throw new Error("cache must be loaded before it can be used");
  }

  const exists = find(CARDS, { id });

  if (exists) {
    return exists;
  }

  throw new Error(`card by id not found [ ${id} ]`);
};

const getRulings = (id: string) => {
  if (!LOADED) {
    throw new Error("cache must be loaded before it can be used");
  }

  const card = getCard(id);
  const exists = filter(RULINGS, { oracle_id: card.oracle_id });

  if (exists) {
    return exists;
  }

  return [];
};

const enhance = () => {
  for (const card of CARDS) {
    card.rulings = getRulings(card.id);
    card.type = getType(card);
    card.groups = getGroups(card);
  }
};

const findCardAccurately = (name: string) => {
  logger.debug("finding a card with a more accurate method", name);

  for (const card of CARDS) {
    if (latinise(name) === latinise(card.name)) {
      return card;
    }

    if (searchString(name) === searchString(card.name)) {
      return card;
    }

    if (encodeURIComponent(name) === encodeURIComponent(card.name)) {
      return card;
    }

    if (startsWith(card.name, name)) {
      return card;
    }
  }

  throw new Error(`card by name could not be found [ ${name} ]`);
};

const findCard = (name: string) => {
  if (!LOADED) {
    throw new Error("cache must be loaded before it can be used");
  }

  const foundWithLodash = find(CARDS, { name: name.trim() });

  if (foundWithLodash) {
    return foundWithLodash;
  }

  return findCardAccurately(name);
};

const findCards = (name: string) => {
  if (!LOADED) {
    throw new Error("cache must be loaded before it can be used");
  }

  return filter(CARDS, { name });
};

export {
  load,
  enhance,
  findCard,
  findCards,
  getCard,
  getRulings,
};
