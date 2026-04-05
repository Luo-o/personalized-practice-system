const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    message: "backend is running",
  });
});

app.use("/api", routes);

app.use("/images", express.static(path.join(__dirname, "../public/images")));

app.use((err, req, res, next) => {
  if (err?.name === "MulterError") {
    return res.status(400).json({
      message: "文件上传失败",
      error: err.message,
    });
  }

  return next(err);
});

module.exports = app;
