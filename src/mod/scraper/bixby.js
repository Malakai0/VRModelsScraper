const state = require("./state.js");
const httpCall = require("./http.js");

const cheerio = require("cheerio");
const events = require("events");
const fs = require("fs");

// Bixby is responsible for scraping a segment of a catalog on VRModels.
// Originally it was also only designed for the Avatar catalog, but it's
// been generalized to work with any catalog under the same domain.
class Bixby {
  constructor(statePath) {
    this.statePath = statePath;
    this.logEvent = new events.EventEmitter();
    this.state = new state(statePath);

    this.state.load();
  }

  // Overridable method that returns the scraped elements from a page.
  scrapeItem(itemBody, itemName, itemURL) {
    throw new Error("Not implemented");
  }

  // Overridable method that returns URL for a page.
  getURLForPage(pageNumber) {
    throw new Error("Not implemented");
  }

  getItemsOnPage(pageNumber) {
    return new Promise((resolve, reject) => {
      httpCall(this.getURLForPage(pageNumber))
        .then((body) => {
          const items = this.scrapeCatalogPage(body);
          resolve(items);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getLastPage() {
    return new Promise((resolve, reject) => {
      httpCall(this.getURLForPage(1))
        .then((body) => {
          const pages = this.scrapePageNavigation(body);
          if (pages.length == 0) {
            resolve(1);
          }

          resolve(pages[pages.length - 1].number);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getItemInformation(itemName, itemURL) {
    return new Promise((resolve, reject) => {
      httpCall(itemURL)
        .then((body) => {
          const item = this.scrapeItem(body, itemName, itemURL);
          resolve(item);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getIndexOfItem(itemURL) {
    return itemURL.match(/([0-9]+)/g)[0];
  }

  scrapeCatalogPage(body) {
    const $ = cheerio.load(body);
    const items = [];
    $(".li_info").each((i, el) => {
      const e = $(el);
      const itemURL = e.parent().attr("href");
      const itemName = e.find(".shorttitleupseg").text();
      const itemThumbnail = e.parent().find("img").attr("data-src");

      if (e.parent().parent().hasClass("blockpravoobladatel")) {
        // DMCA takedown
        return;
      }

      items.push({
        url: itemURL,
        name: itemName,
        thumbnail: `https://vrmodels.store${itemThumbnail}`,
      });
    });
    return items;
  }

  scrapePageNavigation(body) {
    const $ = cheerio.load(body);
    const pages = [];
    $(".navigation a").each((i, el) => {
      const e = $(el);
      const pageNumber = e.text().trim();
      const pageURL = e.attr("href");

      if (pageURL && pageNumber != "Next" && pageNumber != "Back") {
        pages.push({
          url: pageURL,
          number: parseInt(pageNumber),
        });
      }
    });

    pages.sort((a, b) => {
      return a.number - b.number;
    });

    return pages;
  }

  async findPageWithItem(itemIndex, startingPage) {
    let page = startingPage;
    let items = await this.getItemsOnPage(page);

    while (items[0]) {
      for (const entry of items) {
        if (this.getIndexOfItem(entry.url) == itemIndex) {
          return page;
        }
      }

      page += 1;
      items = await this.getItemsOnPage(page);
    }

    return null;
  }

  async downloadImage(id, url) {
    return new Promise((resolve, reject) => {
      const path = `db/thumbnails/${id}.jpg`;

      if (fs.existsSync(path)) {
        resolve();
        return;
      }

      httpCall(url, "binary")
        .then((data) => {
          fs.writeFileSync(path, data, "binary");
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async catchUp() {
    if (this.state.lastPage == 0 || this.state.lastItemLogged == "0") {
      if (process.env.FROM_START == "true") {
        const lastPage = await this.getLastPage();
        const items = await this.getItemsOnPage(lastPage);
        this.state.lastPage = lastPage;
        this.state.lastItemLogged = this.getIndexOfItem(
          items[items.length - 1].url
        );
        return await this.catchUp();
      }

      let items = await this.getItemsOnPage(1);
      const index = this.getIndexOfItem(items[0].url);
      this.state.lastItemLogged = index;
      this.state.lastPage = 1;
      this.state.write();
      return;
    }

    let page = this.state.lastPage;

    let onLastPage = false;
    for (const entry of await this.getItemsOnPage(page)) {
      if (this.getIndexOfItem(entry.url) == this.state.lastItemLogged) {
        onLastPage = true;
        break;
      }
    }

    if (!onLastPage) {
      page = await this.findPageWithItem(this.state.lastItemLogged, page);
    }

    if (page == 1) {
      const items = await this.getItemsOnPage(1);
      const index = this.getIndexOfItem(items[0].url);

      if (index == this.state.lastItemLogged) {
        // save some requests
        return;
      }
    }

    let reachedIndex = false;
    for (let pageNumber = page; pageNumber >= 1; pageNumber--) {
      const items = await this.getItemsOnPage(pageNumber);

      for (let itemIndex = items.length - 1; itemIndex >= 0; itemIndex--) {
        const entry = items[itemIndex];
        const index = this.getIndexOfItem(entry.url);

        if (index == this.state.lastItemLogged) {
          reachedIndex = true;
        }

        if (reachedIndex) {
          this.downloadImage(index, entry.thumbnail);
          this.getItemInformation(entry.name, entry.url)
            .then((item) => {
              this.logEvent.emit("item", item);
            })
            .catch((err) => {
              console.log(err);
            });

          this.state.lastItemLogged = index;
          this.state.lastPage = pageNumber;
          this.state.write();
        }
      }
    }
  }
}

module.exports = Bixby;
