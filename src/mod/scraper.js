const https = require("https");
const events = require("events");
const fs = require("fs");
const cheerio = require("cheerio");

require("dotenv").config();

const pageOne = "https://vrmodels.store/avatars/";
const statePath = "db/state.json";

let state = {
  lastAvatarLogged: 0,
  lastPage: 0,
};

const logEvent = new events.EventEmitter();

const scrapeAvatarPage = (body) => {
  const $ = cheerio.load(body);
  const avatars = [];
  $(".li_info").each((i, el) => {
    const url = $(el).parent().attr("href");
    const name = $(el).find(".shorttitleupseg").text();
    avatars.push({
      url: url,
      name: name,
    });
  });
  return avatars;
};

const scrapeElement = ($, replace) => {
  return $(`span:contains("${replace}:")`)
    .last()
    .parent()
    .text()
    .replace(replace + ":", "")
    .trim();
};

const scrapeAvatar = (body, name, url) => {
  const $ = cheerio.load(body);
  const sdk = scrapeElement($, "SDK");
  const createdBy = scrapeElement($, "Сreated by");
  const platform = scrapeElement($, "Platform");
  const physbones = scrapeElement($, "Рhysbones");
  const fullBody = scrapeElement($, "Full body");
  const nsfw = scrapeElement($, "Nsfw");
  const dps = scrapeElement($, "DPS");
  const viewCount = scrapeElement($, "Views");
  const likeCount = $(`.rate_like .ratingtypeplus`).text().trim();
  const datetime = $(".date").attr("datetime");
  const tags = $(".tags_list a")
    .map((i, el) => $(el).text())
    .get()
    .join(", ");

  const avatar = {
    name: name,
    createdBy: createdBy,
    url: url,
    sdk: sdk,
    platform: platform,
    physbones: physbones == "Yes" ? true : false,
    fullbody: fullBody == "Yes" ? true : false,
    nsfw: nsfw == "Yes" ? true : false,
    dps: dps == "Yes" ? true : false,
    views: parseInt(viewCount.replace(/\s/g, "")),
    likes: parseInt(likeCount.replace(/\s/g, "")),
    date: datetime,
    tags: tags,
  };

  return avatar;
};

const checkIndex = (url) => {
  const index = url.match(/([0-9]+)/g);
  return index[0];
};

const get = async (pageNumber, retries) => {
  let url = `https://vrmodels.store/avatars/page/${pageNumber}/`;

  if (pageNumber == 1) {
    url = pageOne;
  }

  if (!retries) {
    retries = 0;
  }

  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve(scrapeAvatarPage(data));
        });
      })
      .on("error", (err) => {
        if (retries < 3) {
          setTimeout(() => {
            resolve(get(pageNumber, retries + 1));
          }, 1000);
        } else {
          reject(err);
        }
      });
  });
};

const getAvatar = async (name, url, retries) => {
  if (!retries) {
    retries = 0;
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "vrmodels.store",
      port: 443,
      path: url,
      method: "GET",
      headers: {
        Cookie: `dle_user_id=${process.env.USER_ID}; dle_password=${process.env.USER_PASS}; dle_newpm=0`,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve(scrapeAvatar(data, name, url));
      });
    });

    req.on("error", (error) => {
      if (retries < 3) {
        setTimeout(() => {
          resolve(getAvatar(name, url, retries + 1));
        }, 1000);
      } else {
        reject(error);
      }
    });

    req.end();
  });
};

const writeToState = () => {
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
};

const readState = () => {
  if (fs.existsSync(statePath)) {
    const loadedState = JSON.parse(fs.readFileSync(statePath, "utf8"));
    state = loadedState;
  } else {
    writeToState();
  }
};

const log = (avatar) => {
  logEvent.emit("avatar", avatar);
};

const findPageForAviIndex = async (avatarIndex, startingPage) => {
  let page = startingPage;
  let avatars = await get(page);

  while (avatars[0]) {
    for (const entry of avatars) {
      if (checkIndex(entry.url) == avatarIndex) {
        return page;
      }
    }

    if (maxPage && page >= maxPage) {
      return null;
    }

    page += 1;
    avatars = await get(page);
  }

  return null;
};

const catchUp = async () => {
  if (state.lastPage == 0 || state.lastAvatarLogged == 0) {
    let avatars = await get(1);
    const index = checkIndex(avatars[0].url);
    state.lastAvatarLogged = index;
    state.lastPage = 1;
    writeToState();
    return;
  }

  let lastPage = state.lastPage;

  let onLastPage = false;
  for (const entry of await get(lastPage)) {
    if (checkIndex(entry.url) == state.lastAvatarLogged) {
      onLastPage = true;
      break;
    }
  }

  if (!onLastPage) {
    lastPage = await findPageForAviIndex(state.lastAvatarLogged, lastPage);
  }

  if (lastPage == 1) {
    const avatars = await get(1);
    const index = checkIndex(avatars[0].url);

    if (index == state.lastAvatarLogged) {
      console.log("Already up to date"); // save some requests
      return;
    }
  }

  let reachedIndex = false;
  for (let pageNumber = lastPage; pageNumber >= 1; pageNumber--) {
    const avatars = await get(pageNumber);

    for (
      let avatarIndex = avatars.length - 1;
      avatarIndex >= 0;
      avatarIndex--
    ) {
      const entry = avatars[avatarIndex];
      const index = checkIndex(entry.url);

      if (reachedIndex) {
        log(await getAvatar(entry.name, entry.url));
        state.lastAvatarLogged = index;
        state.lastPage = pageNumber;
        writeToState();
      } else if (index == state.lastAvatarLogged) {
        reachedIndex = true;
      }
    }
  }
};

module.exports = {
  readState,
  catchUp,
  logEvent,
};
