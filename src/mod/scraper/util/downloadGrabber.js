// For downloads, its a list of buttons and versions.
// Most of them are formatted like this: there's a "loadd" class that holds the download link (btnDownload class) along with the version (versiyamobil class)
// Except the last one had to be special, and the version class is outside of the loadd class.
// If the download is hosted off-site and there's only one file, then the version class is still inside the loadd class.
// We need to grab all the versions and download links and compile them into a string like this "verison:downloadLink, version:downloadLink, version:downloadLink"

const formatVersion = (version) => {
  // It'll always have the "Model version: " prefix, so we can just remove that
  return version.replace("Model version: ", "");
};

export default ($) => {
  let dload = $(".dload");
  let dataSrc = dload.attr("data-src") || "";
  if (dataSrc.includes("adblock_icon")) {
    return "";
  }

  let downloadLinks = $(".loadd")
    .map((i, el) => {
      const e = $(el);
      const version = e.find(".versiyamobil").text().trim();
      const downloadLink = e.find(".btnDownload").attr("href");

      if (version == "" || downloadLink == "") {
        return "";
      }

      return `${formatVersion(version)}:${downloadLink}`;
    })
    .get()
    .filter((e) => e != "");

  if (downloadLinks.length == 0) {
    // If there's no download links, then it's probably hosted off-site
    // So we need to grab the download link and version from the "dload" class
    const version = formatVersion($(".versiyamobil").text().trim()) || "1.0";
    const downloadLink = $(".btnDownload").attr("href");
    downloadLinks.push(`${version}:${downloadLink}`);
  }

  return downloadLinks.join(", ");
};
