export default ($, replace) => {
  return $(`span:contains("${replace}:")`)
    .last()
    .parent()
    .text()
    .replace(`${replace}:`, "")
    .trim();
};
