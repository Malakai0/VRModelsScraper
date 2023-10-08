const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("db/sql/materials.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the materials database.");
});

db.run(`CREATE TABLE IF NOT EXISTS Materials(
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

const insert = (material) => {
  db.get(
    `SELECT * FROM Materials WHERE Url = ?`,
    [material.url],
    (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (!row) {
        db.run(
          `INSERT INTO Materials(
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
            material.name,
            material.createdBy,
            material.url,
            material.downloadLink,
            material.likes,
            material.views,
            material.date,
            material.tags,
          ],
          function (err) {
            if (err) {
              console.log(material);
              return console.log(err.message);
            }
            console.log(
              `Material ${material.name} inserted into the database.`
            );
          }
        );
      } else {
        console.log(
          `Material ${material.name} already exists in the database.`
        );
      }
    }
  );
};

exports.insert = insert;
