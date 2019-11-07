# scryfall-cache
Finding massive amounts of cards on scryfall without overloading the api

## Installation

```
npm install scryfall-cache
```

## What it does
This tool downloads default card data, and rulings from Scryfall, saves them on disk (with a 24h timeout), and loads the data into memory cache. This makes it very much quicker to find massive amounts of cards on scryfall without having rate limits.

### Why?
If you want to request ~1000 card details from scryfall, you will need ~200ms + ~100ms rate limit per card. This will take a lot of time. By downloading and loading into memory, you can reduce your time down to ~10-120ms (depending on how hard it is to find the card). 

## Example
```javascript
import { load, findCard, getCard, getRulings } from "scryfall-cache";

await load();

console.log(findCard("Jhoira, Weatherlight Captain"));
console.log(getCard("73cf8c6b-1322-4bc5-a604-6e372607fae4"));
## {
##   object: 'card',
##   id: '73cf8c6b-1322-4bc5-a604-6e372607fae4',
##   oracle_id: 'c803b788-4213-4fab-b841-7e5bbf66088e',
##   multiverse_ids: [ 443085 ],
##   mtgo_id: 67859,
##   arena_id: 67498,
##   tcgplayer_id: 162137,
##   name: 'Jhoira, Weatherlight Captain',
##   lang: 'en',
##   released_at: '2018-04-27',
##   uri: 'https://api.scryfall.com/cards/73cf8c6b-1322-4bc5-a604-6e372607fae4',
## ...


console.log(getRulings("73cf8c6b-1322-4bc5-a604-6e372607fae4"));
## [
##   {
##     object: 'ruling',
##     oracle_id: 'c803b788-4213-4fab-b841-7e5bbf66088e',
##     source: 'wotc',
##     published_at: '2018-04-27',
##     comment: 'A card, spell, or permanent is historic if it has the legendary ' +
##       'supertype, the artifact card type, or the Saga subtype. Having two ' +
##       'of those qualities doesn’t make an object more historic than another ' +
##       'or provide an additional bonus—an object either is historic or it ' +
##       'isn’t.'
##   },
## ...
```
