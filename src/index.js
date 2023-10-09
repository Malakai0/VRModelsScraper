import scraper from "./mod/jobs/scraper.js";
import server from "./mod/jobs/server.js";

scraper.init();

/* If ran with the --update flag, update the database */
if (process.argv.includes("--update")) {
  scraper.update();
} else {
  new Promise((resolve) => {
    resolve(scraper.start());
  });

  new Promise((resolve) => {
    resolve(server());
  });
}
