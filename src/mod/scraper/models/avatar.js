// Avatar-Specicalized Bixby

import Bixby from "../bixby.js";
import cheerio from "cheerio";

import scrapeElement from "../util/scrapeElement.js";
import downloadGrabber from "../util/downloadGrabber.js";

const pageOne = "https://vrmodels.store/avatars/";

class AvatarBixby extends Bixby {
  constructor(statePath) {
    super(statePath);
  }

  scrapeItem(itemBody, itemName, itemURL) {
    const $ = cheerio.load(itemBody);
    const sdk = scrapeElement($, "SDK") || "Unknown";
    const createdBy = scrapeElement($, "Сreated by") || "Unknown";
    const platform = scrapeElement($, "Platform") || "Unknown";
    const physbones = scrapeElement($, "Рhysbones");
    const fullBody = scrapeElement($, "Full body");
    const nsfw = scrapeElement($, "Nsfw");
    const dps = scrapeElement($, "DPS");
    const viewCount = scrapeElement($, "Views") || "0";
    const likeCount = $(`.rate_like .ratingtypeplus`).text().trim() || "0";
    const datetime = $(".date").attr("datetime");
    const tags = $(".tags_list a")
      .map((i, el) => $(el).text())
      .get()
      .sort()
      .join(", ");

    const avatar = {
      name: itemName,
      createdBy: createdBy,
      url: itemURL,
      downloadLinks: downloadGrabber($),
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
  }

  getURLForPage(pageNumber) {
    if (pageNumber == 1) {
      return pageOne;
    }
    return `https://vrmodels.store/avatars/page/${pageNumber}/`;
  }
}

export default AvatarBixby;
