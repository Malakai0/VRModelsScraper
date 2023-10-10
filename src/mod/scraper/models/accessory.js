// Accessory-Specicalized Bixby

import Bixby from "../bixby.js";

const pageOne = "https://vrmodels.store/accessories/";

class AccessoryBixby extends Bixby {
  constructor(statePath) {
    super(statePath);
  }

  getURLForPage(pageNumber) {
    if (pageNumber == 1) {
      return pageOne;
    }
    return `https://vrmodels.store/accessories/page/${pageNumber}/`;
  }
}

export default AccessoryBixby;
