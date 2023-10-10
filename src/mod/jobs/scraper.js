import alexa from "../database/alexa.js";

import AccessoryBixby from "../scraper/models/accessory.js";
import AnimationBixby from "../scraper/models/animation.js";
import AvatarBixby from "../scraper/models/avatar.js";
import ClothingBixby from "../scraper/models/clothing.js";
import MaterialBixby from "../scraper/models/material.js";
import ScriptBixby from "../scraper/models/script.js";
import ShaderBixby from "../scraper/models/shader.js";
import WorldBixby from "../scraper/models/world.js";

import log from "../util/log.js";

const Pairs = [
  ["accessories", new AccessoryBixby("db/state/accessory.json")],
  ["animations", new AnimationBixby("db/state/animation.json")],
  ["avatars", new AvatarBixby("db/state/avatar.json")],
  ["clothing", new ClothingBixby("db/state/clothing.json")],

  ["materials", new MaterialBixby("db/state/material.json")],
  ["scripts", new ScriptBixby("db/state/script.json")],
  ["shaders", new ShaderBixby("db/state/shader.json")],
  ["worlds", new WorldBixby("db/state/world.json")],
];

const twirly = ["|", "/", "-", "\\"];

const initScraper = (scraper, databaseKey) => {
  scraper.logEvent.on("item", (item) => {
    alexa.insert(databaseKey, item);
  });

  scraper.logEvent.on("itemUpdate", async (item) => {
    const currentItem = await alexa.getItemFromId(databaseKey, item.itemId);

    if (item.downloadLinks == "") {
      // If the item has no download links (DMCA, been deleted, etc.), don't update the download links (so we still have access to the old ones :3)
      item.downloadLinks = currentItem.downloadLinks;
    }

    alexa.update(databaseKey, item);
  });
};

const startScraper = (scraper) => {
  return new Promise(async () => {
    while (true) {
      await scraper.catchUp();
      await new Promise((r) => setTimeout(r, 60000));
    }
  });
};

const updateScraper = (scraper, databaseKey) => {
  scraper.totalItems = "?";
  scraper.itemsScraped = 0;
  scraper.itemsAdded = 0;

  return new Promise(async () => {
    const items = await alexa.getTableItems(databaseKey);
    const perBatch = 50;

    scraper.totalItems = items.length;

    for (let i = 0; i < items.length; i += perBatch) {
      const promises = [];
      for (let j = i; j < i + perBatch && j < items.length; j++) {
        const promise = scraper.update(items[j].Name, items[j].Url);
        promise.then(() => {
          scraper.itemsScraped++;
        });
        promises.push(promise);
      }
      await Promise.all(promises);
    }

    scraper.itemsAdded = await scraper.catchUp();
  });
};

const updateScrapers = async () => {
  let twirlyIndex = 0;
  let errors = [];

  log.event.on("error", (err) => {
    errors.push(err);
  });

  setInterval(() => {
    let text = "";
    for (const [databaseKey, scraper] of Pairs) {
      let twirlyBoy = twirly[twirlyIndex];

      if (scraper.itemsScraped >= scraper.totalItems) {
        twirlyBoy = "!";
      }

      text += `${databaseKey} ${scraper.itemsScraped} / ${scraper.totalItems} (${scraper.itemsAdded} added) [${twirlyBoy}]\n`;
    }

    for (const error of errors) {
      text += error + "\n";
    }

    console.clear();
    process.stdout.write(text);
    twirlyIndex = (twirlyIndex + 1) % twirly.length;
  }, 250);

  const promises = [];
  for (const [databaseKey, scraper] of Pairs) {
    promises.push(updateScraper(scraper, databaseKey));
  }

  await Promise.all(promises);
  clearInterval();
};

const forAll = (func) => {
  for (const [databaseKey, scraper] of Pairs) {
    func(scraper, databaseKey);
  }
};

export default {
  init: () => {
    forAll(initScraper);
  },
  start: () => {
    forAll(startScraper);
  },
  update: () => {
    updateScrapers();
  },
};
