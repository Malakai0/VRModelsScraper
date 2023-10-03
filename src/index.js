const scraper = require("./mod/scraper");
const db = require("./mod/database");

scraper.logEvent.on("avatar", (avatar) => {
  db.insertAvatar(avatar);
});

scraper.readState();
(async () => {
  await scraper.catchUp();
  while (true) {
    await new Promise((r) => setTimeout(r, 60000));
    await scraper.catchUp();
  }
})();
