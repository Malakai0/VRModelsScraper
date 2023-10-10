export default (table) => {
  return {
    select: `SELECT * FROM ${table} WHERE ItemId = ?`,
    selectAll: `SELECT * FROM ${table}`,
    createTable: `CREATE TABLE IF NOT EXISTS ${table}(
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            ItemId TEXT NOT NULL,
            Name TEXT NOT NULL,
            CreatedBy TEXT NOT NULL,
            Url TEXT NOT NULL,
            Download TEXT NOT NULL,
            Likes INTEGER NOT NULL,
            Views INTEGER NOT NULL,
            Date DATE NOT NULL,
            Tags TEXT NOT NULL
        )`,

    insert: (object) => {
      return {
        query: `INSERT INTO ${table}(Name, ItemId, CreatedBy, Url, Download, Likes, Views, Date, Tags) VALUES(?,?,?,?,?,?,?,?,?)`,
        params: [
          object.name,
          object.itemId,
          object.createdBy,
          object.url,
          object.downloadLinks,
          object.likes,
          object.views,
          object.date,
          object.tags,
        ],
      };
    },

    update: (object) => {
      return {
        query: `UPDATE ${table} SET Name = ?, CreatedBy = ?, Url = ?, Download = ?, Likes = ?, Views = ?, Date = ?, Tags = ? WHERE ItemId = ?`,
        params: [
          object.name,
          object.createdBy,
          object.url,
          object.downloadLinks,
          object.likes,
          object.views,
          object.date,
          object.tags,
          object.itemId,
        ],
      };
    },
  };
};
