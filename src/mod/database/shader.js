const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("db/sql/shaders.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the shaders database.");
});

db.run(`CREATE TABLE IF NOT EXISTS Shaders(
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

const insert = (shader) => {
  db.get(`SELECT * FROM Shaders WHERE Url = ?`, [shader.url], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if (!row) {
      db.run(
        `INSERT INTO Shaders(
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
          shader.name,
          shader.createdBy,
          shader.url,
          shader.downloadLink,
          shader.likes,
          shader.views,
          shader.date,
          shader.tags,
        ],
        function (err) {
          if (err) {
            console.log(shader);
            return console.log(err.message);
          }
          console.log(`Shader ${shader.name} inserted into the database.`);
        }
      );
    } else {
      console.log(`Shader ${shader.name} already exists in the database.`);
    }
  });
};

exports.insert = insert;
