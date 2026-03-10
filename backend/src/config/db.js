const path = require("path");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

const dbPath = path.resolve(
  process.cwd(),
  process.env.DB_PATH || "./database/app.db",
);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("数据库连接失败:", err.message);
  } else {
    console.log("数据库连接成功:", dbPath);
  }
});

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON;");
});

module.exports = db;
