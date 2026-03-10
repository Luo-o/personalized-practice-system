const express = require("express");
const router = express.Router();

const { getStudentClasses } = require("../controllers/class.controller");

router.get("/:id/classes", getStudentClasses);

module.exports = router;
