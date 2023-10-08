const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("db/sql/scripts.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the scripts database.");
});

db.run(`CREATE TABLE IF NOT EXISTS Scripts(
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

const insert = (script) => {
  db.get(`SELECT * FROM Scripts WHERE Url = ?`, [script.url], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if (!row) {
      db.run(
        `INSERT INTO Scripts(
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
          script.name,
          script.createdBy,
          script.url,
          script.downloadLink,
          script.likes,
          script.views,
          script.date,
          script.tags,
        ],
        function (err) {
          if (err) {
            console.log(script);
            return console.log(err.message);
          }
          console.log(`Script ${script.name} inserted into the database.`);
        }
      );
    } else {
      console.log(`Script ${script.name} already exists in the database.`);
    }
  });
};

exports.insert = insert;
