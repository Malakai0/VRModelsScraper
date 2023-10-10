// Animation-Specicalized Bixby

import Bixby from "../bixby.js";

const pageOne = "https://vrmodels.store/other/animations/";

class AnimationBixby extends Bixby {
  constructor(statePath) {
    super(statePath);
  }

  getURLForPage(pageNumber) {
    if (pageNumber == 1) {
      return pageOne;
    }
    return `https://vrmodels.store/other/animations/page/${pageNumber}/`;
  }
}

export default AnimationBixby;
