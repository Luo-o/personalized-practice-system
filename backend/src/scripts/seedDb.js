const fs = require("fs");
const path = require("path");
const db = require("../config/db");

const seedPath = path.resolve(process.cwd(), "database/seed.sql");
const seedSql = fs.readFileSync(seedPath, "utf-8");

db.exec(seedSql, (err) => {
  if (err) {
    console.error("种子数据初始化失败:", err.message);
    process.exit(1);
  }

  console.log("种子数据初始化成功");
  db.close((closeErr) => {
    if (closeErr) {
      console.error("关闭数据库失败:", closeErr.message);
    } else {
      console.log("数据库连接已关闭");
    }
  });
});
