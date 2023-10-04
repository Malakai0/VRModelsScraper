const fs = require("fs");

class SegmentState {
  constructor(path) {
    this.path = path;
    this.lastAvatarLogged = 0;
    this.lastPage = 0;
  }

  load() {
    if (fs.existsSync(this.path)) {
      const loadedState = JSON.parse(fs.readFileSync(this.path, "utf8"));

      this.lastAvatarLogged = loadedState.lastAvatarLogged;
      this.lastPage = loadedState.lastPage;
    } else {
      this.write();
    }
  }

  write() {
    fs.writeFileSync(this.path, this.serialize());
  }

  serialize() {
    return JSON.stringify(
      {
        lastAvatarLogged: this.lastAvatarLogged,
        lastPage: this.lastPage,
      },
      null,
      2
    );
  }
}

module.exports = SegmentState;
