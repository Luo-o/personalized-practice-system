const express = require("express");
const router = express.Router();

const {
  listClasses,
  getClassDetail,
  getClassStudents,
} = require("../controllers/class.controller");

router.get("/", listClasses);
router.get("/:id", getClassDetail);
router.get("/:id/students", getClassStudents);

module.exports = router;
