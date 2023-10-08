const AccessoryBixby = require("./mod/scraper/models/accessory");
const AccessoryDatabase = require("./mod/database/accessory");
const AccessoryScraper = new AccessoryBixby("db/state/accessory.json");

const AnimationBixby = require("./mod/scraper/models/animation");
const AnimationDatabase = require("./mod/database/animation");
const AnimationScraper = new AnimationBixby("db/state/animation.json");

const AvatarBixby = require("./mod/scraper/models/avatar");
const AvatarDatabase = require("./mod/database/avatar");
const AvatarScraper = new AvatarBixby("db/state/avatar.json");

const ClothingBixby = require("./mod/scraper/models/clothing");
const ClothingDatabase = require("./mod/database/clothing");
const ClothingScraper = new ClothingBixby("db/state/clothing.json");

const MaterialBixby = require("./mod/scraper/models/material");
const MaterialDatabase = require("./mod/database/material");
const MaterialScraper = new MaterialBixby("db/state/material.json");

const ScriptBixby = require("./mod/scraper/models/script");
const ScriptDatabase = require("./mod/database/script");
const ScriptScraper = new ScriptBixby("db/state/script.json");

const ShaderBixby = require("./mod/scraper/models/shader");
const ShaderDatabase = require("./mod/database/shader");
const ShaderScraper = new ShaderBixby("db/state/shader.json");

const WorldBixby = require("./mod/scraper/models/world");
const WorldDatabase = require("./mod/database/world");
const WorldScraper = new WorldBixby("db/state/world.json");

const Runtime = require("./mod/runtime");

// TODO: Combine databases into a single database under different tables.
const Pairs = [
  [AccessoryDatabase, AccessoryScraper],
  [AnimationDatabase, AnimationScraper],
  [AvatarDatabase, AvatarScraper],
  [ClothingDatabase, ClothingScraper],

  [MaterialDatabase, MaterialScraper],
  [ScriptDatabase, ScriptScraper],
  [ShaderDatabase, ShaderScraper],
  [WorldDatabase, WorldScraper],
];

for (const [database, scraper] of Pairs) {
  Runtime(database, scraper);
}
