const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("db/sql/accessories.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the accessories database.");
});

db.run(`CREATE TABLE IF NOT EXISTS Accessories(
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

const insert = (accessory) => {
  db.get(
    `SELECT * FROM Accessories WHERE Url = ?`,
    [accessory.url],
    (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (!row) {
        db.run(
          `INSERT INTO Accessories(
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
            accessory.name,
            accessory.createdBy,
            accessory.url,
            accessory.downloadLink,
            accessory.likes,
            accessory.views,
            accessory.date,
            accessory.tags,
          ],
          function (err) {
            if (err) {
              console.log(accessory);
              return console.log(err.message);
            }
            console.log(
              `Accessory ${accessory.name} inserted into the database.`
            );
          }
        );
      } else {
        console.log(
          `Accessory ${accessory.name} already exists in the database.`
        );
      }
    }
  );
};

exports.insert = insert;
