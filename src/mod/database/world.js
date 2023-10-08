const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("db/sql/worlds.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the worlds database.");
});

db.run(`CREATE TABLE IF NOT EXISTS Worlds(
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

const insert = (world) => {
  db.get(`SELECT * FROM Worlds WHERE Url = ?`, [world.url], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if (!row) {
      db.run(
        `INSERT INTO Worlds(
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
          world.name,
          world.createdBy,
          world.url,
          world.downloadLink,
          world.likes,
          world.views,
          world.date,
          world.tags,
        ],
        function (err) {
          if (err) {
            console.log(world);
            return console.log(err.message);
          }
          console.log(`World ${world.name} inserted into the database.`);
        }
      );
    } else {
      console.log(`World ${world.name} already exists in the database.`);
    }
  });
};

exports.insert = insert;
