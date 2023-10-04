const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("db/sql/avatars.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the avatars database.");
});

db.run(`CREATE TABLE IF NOT EXISTS Avatars(
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    CreatedBy TEXT NOT NULL,
    Url TEXT NOT NULL,
    Likes INTEGER NOT NULL,
    Views INTEGER NOT NULL,
    Date DATE NOT NULL,
    SDK TEXT NOT NULL,
    Platform TEXT NOT NULL,
    Physbones BOOLEAN NOT NULL,
    FullBody BOOLEAN NOT NULL,
    NSFW BOOLEAN NOT NULL,
    DPS BOOLEAN NOT NULL,
    Tags TEXT NOT NULL
)`);

const insertAvatar = (avatar) => {
  db.get(`SELECT * FROM Avatars WHERE Url = ?`, [avatar.url], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if (!row) {
      db.run(
        `INSERT INTO Avatars(
                Name,
                CreatedBy,
                Url,
                Likes,
                Views,
                Date,
                SDK,
                Platform,
                Physbones,
                FullBody,
                NSFW,
                DPS,
                Tags
            ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          avatar.name,
          avatar.createdBy,
          avatar.url,
          avatar.likes,
          avatar.views,
          avatar.date,
          avatar.sdk,
          avatar.platform,
          avatar.physbones,
          avatar.fullbody,
          avatar.nsfw,
          avatar.dps,
          avatar.tags,
        ],
        function (err) {
          if (err) {
            return console.log(err.message);
          }
          console.log(`A row has been inserted with rowid ${this.lastID}`);
        }
      );
    } else {
      console.log(`Avatar ${avatar.name} already exists in the database.`);
    }
  });
};

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.log("Error running sql: " + sql);
        console.log(err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

exports.insertAvatar = insertAvatar;
exports.query = query;
