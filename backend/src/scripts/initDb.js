const fs = require("fs");
const path = require("path");
const db = require("../config/db");

const schemaPath = path.resolve(process.cwd(), "database/schema.sql");
const schemaSql = fs.readFileSync(schemaPath, "utf-8");

db.exec(schemaSql, (err) => {
  if (err) {
    console.error("数据库初始化失败:", err.message);
    process.exit(1);
  }

  console.log("数据库表初始化成功");
  db.close((closeErr) => {
    if (closeErr) {
      console.error("关闭数据库失败:", closeErr.message);
    } else {
      console.log("数据库连接已关闭");
    }
  });
});
