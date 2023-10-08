// Script-Specicalized Bixby

const Bixby = require("../bixby");
const cheerio = require("cheerio");

const pageOne = "https://vrmodels.store/other/scripts/";

const scrapeElement = ($, replace) => {
  return $(`span:contains("${replace}:")`)
    .last()
    .parent()
    .text()
    .replace(`${replace}:`, "")
    .trim();
};

class ScriptBixby extends Bixby {
  constructor(statePath) {
    super(statePath);
  }

  scrapeItem(itemBody, itemName, itemURL) {
    const $ = cheerio.load(itemBody);
    const createdBy = scrapeElement($, "Сreated by") || "Unknown";
    const viewCount = scrapeElement($, "Views") || "0";
    const likeCount = $(`.rate_like .ratingtypeplus`).text().trim() || "0";
    const datetime = $(".date").attr("datetime");
    const downloadLink = $(".btnDownload").attr("href");
    const tags = $(".tags_list a")
      .map((i, el) => $(el).text())
      .get()
      .join(", ");

    const avatar = {
      name: itemName,
      createdBy: createdBy,
      url: itemURL,
      downloadLink: downloadLink,
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
    return `https://vrmodels.store/other/scripts/page/${pageNumber}/`;
  }
}

module.exports = ScriptBixby;
