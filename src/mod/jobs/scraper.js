import alexa from "../database/alexa.js";

import AccessoryBixby from "../scraper/models/accessory.js";
import AnimationBixby from "../scraper/models/animation.js";
import AvatarBixby from "../scraper/models/avatar.js";
import ClothingBixby from "../scraper/models/clothing.js";
import MaterialBixby from "../scraper/models/material.js";
import ScriptBixby from "../scraper/models/script.js";
import ShaderBixby from "../scraper/models/shader.js";
import WorldBixby from "../scraper/models/world.js";

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

const initScraper = (scraper, databaseKey) => {
  scraper.logEvent.on("item", (item) => {
    alexa.insert(databaseKey, item);
  });

  scraper.logEvent.on("itemUpdate", (item) => {
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
  return new Promise(async () => {
    alexa.getTableItems(databaseKey).then((items) => {
      for (const item of items) {
        scraper.update(item.Name, item.Url);
      }
    });
  });
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
    forAll(updateScraper);
  },
};
