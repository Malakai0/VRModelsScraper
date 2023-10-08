module.exports = (database, scraper) => {
  scraper.logEvent.on("item", (item) => {
    database.insert(item);
  });

  return new Promise(async () => {
    await scraper.catchUp();
    while (true) {
      await new Promise((r) => setTimeout(r, 60000));
      await scraper.catchUp();
    }
  });
};
