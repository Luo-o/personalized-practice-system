const express = require("express");
const router = express.Router();
const practiceController = require("../controllers/practice.controller");

router.get("/meta", practiceController.getMeta);
router.get("/stats", practiceController.getStats);
router.post("/generate", practiceController.generate);
router.get("/:id", practiceController.detail);

module.exports = router;
