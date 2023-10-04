const state = require("./state.js");
const httpCall = require("./http.js");

const cheerio = require("cheerio");
const events = require("events");

// Bixby is responsible for scraping a segment of a catalog on VRModels.
// It's designed to be able to run in parallel with other Bixby instances.
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
      const itemURL = $(el).parent().attr("href");
      const itemName = $(el).find(".shorttitleupseg").text();
      items.push({
        url: itemURL,
        name: itemName,
      });
    });
    return items;
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

  async catchUp() {
    if (this.state.lastPage == 0 || this.state.lastAvatarLogged == "0") {
      let items = await this.getItemsOnPage(1);
      const index = this.getIndexOfItem(items[0].url);
      this.state.lastAvatarLogged = index;
      this.state.lastPage = 1;
      this.state.write();
      return;
    }

    let page = this.state.lastPage;

    let onLastPage = false;
    for (const entry of await this.getItemsOnPage(page)) {
      if (this.getIndexOfItem(entry.url) == this.state.lastAvatarLogged) {
        onLastPage = true;
        break;
      }
    }

    if (!onLastPage) {
      page = await this.findPageWithItem(this.state.lastAvatarLogged, page);
    }

    if (page == 1) {
      const items = await this.getItemsOnPage(1);
      const index = this.getIndexOfItem(items[0].url);

      if (index == this.state.lastAvatarLogged) {
        console.log("Already up to date"); // save some requests
        return;
      }
    }

    let reachedIndex = false;
    for (let pageNumber = page; pageNumber >= 1; pageNumber--) {
      const items = await this.getItemsOnPage(pageNumber);

      for (
        let avatarIndex = items.length - 1;
        avatarIndex >= 0;
        avatarIndex--
      ) {
        const entry = items[avatarIndex];
        const index = this.getIndexOfItem(entry.url);

        if (reachedIndex) {
          this.logEvent.emit(
            "item",
            await this.getItemInformation(entry.name, entry.url)
          );
          this.state.lastAvatarLogged = index;
          this.state.lastPage = pageNumber;
          this.state.write();
        } else if (index == this.state.lastAvatarLogged) {
          reachedIndex = true;
        }
      }
    }
  }
}

module.exports = Bixby;
