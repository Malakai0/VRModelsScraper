// World-Specicalized Bixby

import Bixby from "../bixby.js";

const pageOne = "https://vrmodels.store/models/worlds/";

class WorldBixby extends Bixby {
  constructor(statePath) {
    super(statePath);
  }

  getURLForPage(pageNumber) {
    if (pageNumber == 1) {
      return pageOne;
    }
    return `https://vrmodels.store/models/worlds/page/${pageNumber}/`;
  }
}

export default WorldBixby;
