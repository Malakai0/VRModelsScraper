// Script-Specicalized Bixby

import Bixby from "../bixby.js";

const pageOne = "https://vrmodels.store/other/scripts/";

class ScriptBixby extends Bixby {
  constructor(statePath) {
    super(statePath);
  }

  getURLForPage(pageNumber) {
    if (pageNumber == 1) {
      return pageOne;
    }
    return `https://vrmodels.store/other/scripts/page/${pageNumber}/`;
  }
}

export default ScriptBixby;
