const db = require("./mod/database");
const AvatarBixby = require("./mod/scraper/models/avatar");

const avatarScraper = new AvatarBixby("db/state.json");

avatarScraper.logEvent.on("item", (avatar) => {
  db.insertAvatar(avatar);
});

(async () => {
  await avatarScraper.catchUp();
  while (true) {
    await new Promise((r) => setTimeout(r, 60000));
    await avatarScraper.catchUp();
  }
})();
