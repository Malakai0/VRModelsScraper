// Shader-Specicalized Bixby

import Bixby from "../bixby.js";

const pageOne = "https://vrmodels.store/other/shaders/";

class ShaderBixby extends Bixby {
  constructor(statePath) {
    super(statePath);
  }

  getURLForPage(pageNumber) {
    if (pageNumber == 1) {
      return pageOne;
    }
    return `https://vrmodels.store/other/shaders/page/${pageNumber}/`;
  }
}

export default ShaderBixby;
