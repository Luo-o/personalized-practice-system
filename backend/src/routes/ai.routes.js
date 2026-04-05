const express = require("express");
const multer = require("multer");
const { chatWithAI } = require("../controllers/ai.controller");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 6,
  },
});

router.post("/chat", upload.array("images", 6), chatWithAI);

module.exports = router;
