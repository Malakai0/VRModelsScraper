import scraper from "./mod/jobs/scraper.js";
import server from "./mod/jobs/server.js";

scraper.init();

new Promise((resolve) => {
  resolve(scraper.start());
});

new Promise((resolve) => {
  resolve(server());
});
