import sqlite3 from "sqlite3";
import fuse from "fuse.js";

import avatars from "./models/avatar.js";
import genericDatabase from "./models/generic.js";

const databaseTables = {
  avatars,
  accessories: genericDatabase("Accessories"),
  animations: genericDatabase("Animations"),
  clothing: genericDatabase("Clothing"),
  materials: genericDatabase("Materials"),
  scripts: genericDatabase("Scripts"),
  shaders: genericDatabase("Shaders"),
  worlds: genericDatabase("Worlds"),
};
const database = new sqlite3.Database("db/sql/vrmodels.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the database.");
  for (const [databaseKey, db] of Object.entries(databaseTables)) {
    database.run(db.createTable, (err) => {
      if (err) {
        return console.error(err.message);
      }
    });
  }
});

// TODO: Use an ORM? This works for now but it's not very elegant
const generateQuery = (database, params) => {
  let query = `SELECT * FROM ${database}`;
  const queryParams = [];

  const whereClauses = [];

  if (params.tags) {
    whereClauses.push("Tags LIKE ?");
    queryParams.push(`%${params.tags}%`);
  }
  if (params.date) {
    whereClauses.push(`Date ${params.date === "before" ? "<" : ">"} ?`);
    queryParams.push(params.date);
  }
  if (params.likes) {
    whereClauses.push(`Likes ${params.likes === "greater" ? ">" : "<"} ?`);
    queryParams.push(params.likes);
  }
  if (params.views) {
    whereClauses.push(`Views ${params.views === "greater" ? ">" : "<"} ?`);
    queryParams.push(params.views);
  }
  if (params.creator) {
    whereClauses.push("CreatedBy LIKE ?");
    queryParams.push(`%${params.creator}%`);
  }
  if (params.sdk) {
    whereClauses.push("SDK LIKE ?");
    queryParams.push(`%${params.sdk}%`);
  }
  if (params.platform) {
    whereClauses.push("Platform LIKE ?");
    queryParams.push(`%${params.platform}%`);
  }
  if (params.nsfw) {
    whereClauses.push("NSFW = ?");
    queryParams.push(params.nsfw === "true" ? 1 : 0);
  }
  if (params.dps) {
    whereClauses.push("DPS = ?");
    queryParams.push(params.dps === "true" ? 1 : 0);
  }
  if (params.fullbody) {
    whereClauses.push("FullBody = ?");
    queryParams.push(params.fullbody === "true" ? 1 : 0);
  }
  if (params.physbones) {
    whereClauses.push("Physbones = ?");
    queryParams.push(params.physbones === "true" ? 1 : 0);
  }

  if (whereClauses.length > 0) {
    query += " WHERE " + whereClauses.join(" AND ");
  }

  if (params.sort) {
    query += ` ORDER BY ${
      params.sort === "date"
        ? "Date"
        : params.sort === "likes"
        ? "Likes"
        : "Views"
    } ${params.order === "asc" ? "ASC" : "DESC"}`;
  } else if (params.random) {
    query += " ORDER BY RANDOM()";
  }

  return { query, params: queryParams };
};

function genericFilter(req, res, db) {
  if (!databaseTables[db]) {
    return res.status(400).json({ error: "Invalid database." });
  }

  let {
    sort,
    tags,
    date,
    likes,
    views,
    creator,
    name,
    sdk,
    platform,
    nsfw,
    dps,
    fullbody,
    physbones,
    page,
    random,
    limit,
  } = req.query;

  limit = Math.min(Math.max(limit || 50, 1), 50);
  page = Math.max(page || 1, 1);

  const { query, params } = generateQuery(db, {
    sort,
    tags,
    date,
    likes,
    views,
    creator,
    sdk,
    platform,
    nsfw,
    dps,
    fullbody,
    physbones,
    random,
    limit,
  });

  database.all(query, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }

    if (name) {
      const options = {
          includeScore: true,
          keys: ["Name"],
        },
        fuseResults = new fuse(results, options).search(name);
      results = fuseResults.map((result) => result.item);
    }

    const total_pages = Math.ceil(results.length / limit);

    const start = (page - 1) * limit,
      end = start + limit;
    results.splice(0, start);
    results.splice(end, results.length - end);

    res.json({
      total_pages,
      results,
    });
  });
}

const insert = (databaseKey, item) => {
  const db = databaseTables[databaseKey];
  if (!db) {
    return console.error(`Invalid database: ${databaseKey}`);
  }

  database.run(db.select, [item.itemId], (err, row) => {
    if (err) {
      return console.error(err.message);
    }

    if (row) {
      console.log(`${databaseKey}: ALREADY EXISTS ${item.name}`);
      return;
    }

    const { query, params } = db.insert(item);
    database.run(query, params, (err) => {
      if (err) {
        return console.error(err.message);
      }

      console.log(`${databaseKey}: INSERTED ${item.name}`);
    });
  });
};

const update = (databaseKey, item) => {
  const db = databaseTables[databaseKey];
  if (!db) {
    return console.error(`Invalid database: ${databaseKey}`);
  }

  const { query, params } = db.update(item);
  database.run(query, params, (err) => {
    if (err) {
      return console.error(err.message);
    }

    console.log(`${databaseKey}: UPDATED ${item.name}`);
  });
};

const getTableItems = (databaseKey) => {
  const db = databaseTables[databaseKey];
  if (!db) {
    return console.error(`Invalid database: ${databaseKey}`);
  }

  return new Promise((resolve, reject) => {
    database.all(db.selectAll, (err, rows) => {
      if (err) {
        return reject(err);
      }

      resolve(rows);
    });
  });
};

export default {
  genericFilter,
  insert,
  update,
  getTableItems,
};
