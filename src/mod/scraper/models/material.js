// Material-Specicalized Bixby

import Bixby from "../bixby.js";

const pageOne = "https://vrmodels.store/other/materials/";

class MaterialBixby extends Bixby {
  constructor(statePath) {
    super(statePath);
  }

  getURLForPage(pageNumber) {
    if (pageNumber == 1) {
      return pageOne;
    }
    return `https://vrmodels.store/other/materials/page/${pageNumber}/`;
  }
}

export default MaterialBixby;
