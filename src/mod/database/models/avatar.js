const table = "Avatars";

export default {
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
              SDK TEXT NOT NULL,
              Platform TEXT NOT NULL,
              Physbones BOOLEAN NOT NULL,
              FullBody BOOLEAN NOT NULL,
              NSFW BOOLEAN NOT NULL,
              DPS BOOLEAN NOT NULL,
              Tags TEXT NOT NULL
          )`,

  insert: (avatar) => {
    return {
      query: `INSERT INTO ${table}(
              Name,
              ItemId,
              CreatedBy,
              Url,
              Download,
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
          ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      params: [
        avatar.name,
        avatar.itemId,
        avatar.createdBy,
        avatar.url,
        avatar.downloadLinks,
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
    };
  },

  update: (avatar) => {
    return {
      query: `UPDATE ${table} SET
              Name = ?,
              CreatedBy = ?,
              Url = ?,
              Download = ?,
              Likes = ?,
              Views = ?,
              Date = ?,
              SDK = ?,
              Platform = ?,
              Physbones = ?,
              FullBody = ?,
              NSFW = ?,
              DPS = ?,
              Tags = ?
              WHERE ItemId = ?`,
      params: [
        avatar.name,
        avatar.createdBy,
        avatar.url,
        avatar.downloadLinks,
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
        avatar.itemId,
      ],
    };
  },
};
