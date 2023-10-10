// Clothing-Specicalized Bixby

import Bixby from "../bixby.js";

const pageOne = "https://vrmodels.store/clothess/";

class ClothingBixby extends Bixby {
  constructor(statePath) {
    super(statePath);
  }

  getURLForPage(pageNumber) {
    if (pageNumber == 1) {
      return pageOne;
    }
    return `https://vrmodels.store/clothess/page/${pageNumber}/`;
  }
}

export default ClothingBixby;
