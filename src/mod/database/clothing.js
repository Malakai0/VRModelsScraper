const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("db/sql/clothing.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the clothing database.");
});

db.run(`CREATE TABLE IF NOT EXISTS Clothing(
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

const insert = (clothing) => {
  db.get(`SELECT * FROM Clothing WHERE Url = ?`, [clothing.url], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if (!row) {
      db.run(
        `INSERT INTO Clothing(
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
          clothing.name,
          clothing.createdBy,
          clothing.url,
          clothing.downloadLink,
          clothing.likes,
          clothing.views,
          clothing.date,
          clothing.tags,
        ],
        function (err) {
          if (err) {
            console.log(clothing);
            return console.log(err.message);
          }
          console.log(`Clothing ${clothing.name} inserted into the database.`);
        }
      );
    } else {
      console.log(`Clothing ${clothing.name} already exists in the database.`);
    }
  });
};

exports.insert = insert;
