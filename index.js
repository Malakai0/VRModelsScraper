const scraper = require("./scraper");
const db = require("./database");

scraper.logEvent.on("avatar", (avatar) => {
  db.insertAvatar(avatar);
});

scraper.readFromLastAvatar();
(async () => {
  await scraper.catchUp();
  while (true) {
    await new Promise((r) => setTimeout(r, 60000));
    await scraper.catchUp();
  }
})();
