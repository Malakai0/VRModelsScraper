const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("db/sql/animations.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the animations database.");
});

db.run(`CREATE TABLE IF NOT EXISTS Animations(
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    CreatedBy TEXT NOT NULL,
    Url TEXT NOT NULL,
    Download TEXT NOT NULL,
    Likes INTEGER NOT NULL,
    Views INTEGER NOT NULL,
    Date DATE NOT NULL,
    Tags TEXT NOT NULL
)`);

const insert = (animation) => {
  db.get(
    `SELECT * FROM Animations WHERE Url = ?`,
    [animation.url],
    (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (!row) {
        db.run(
          `INSERT INTO Animations(
                Name,
                CreatedBy,
                Url,
                Download,
                Likes,
                Views,
                Date,
                Tags
            ) VALUES(?,?,?,?,?,?,?,?)`,
          [
            animation.name,
            animation.createdBy,
            animation.url,
            animation.downloadLink,
            animation.likes,
            animation.views,
            animation.date,
            animation.tags,
          ],
          function (err) {
            if (err) {
              console.log(animation);
              return console.log(err.message);
            }
            console.log(
              `Animation ${animation.name} inserted into the database.`
            );
          }
        );
      } else {
        console.log(
          `Animation ${animation.name} already exists in the database.`
        );
      }
    }
  );
};

exports.insert = insert;
