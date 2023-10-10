import cheerio from "cheerio";

import scrapeElement from "../util/scrapeElement.js";
import downloadGrabber from "../util/downloadGrabber.js";

export default (itemBody, itemName, itemURL) => {
  const $ = cheerio.load(itemBody);
  const createdBy = scrapeElement($, "Сreated by") || "Unknown";
  const viewCount = scrapeElement($, "Views") || "0";
  const likeCount = $(`.rate_like .ratingtypeplus`).text().trim() || "0";
  const datetime = $(".date").attr("datetime");
  const downloadLinks = downloadGrabber($);
  const tags = $(".tags_list a")
    .map((i, el) => $(el).text())
    .get()
    .sort()
    .join(", ");

  const object = {
    name: itemName,
    createdBy: createdBy,
    url: itemURL,
    downloadLinks: downloadLinks,
    views: parseInt(viewCount.replace(/\s/g, "")),
    likes: parseInt(likeCount.replace(/\s/g, "")),
    date: datetime,
    tags: tags,
  };

  return object;
};
