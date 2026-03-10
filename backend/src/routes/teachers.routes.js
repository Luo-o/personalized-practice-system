const express = require("express");
const router = express.Router();

const { getTeacherClasses } = require("../controllers/class.controller");

router.get("/:id/classes", getTeacherClasses);

module.exports = router;
