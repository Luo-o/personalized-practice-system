const express = require("express");
const router = express.Router();

const {
  listClasses,
  getClassDetail,
  getClassStudents,
  createClassHandler,
  addStudentToClassHandler,
  removeStudentFromClassHandler,
  joinClassHandler,
  quitClassHandler,
} = require("../controllers/class.controller");

router.get("/", listClasses);
router.post("/", createClassHandler);
router.post("/join", joinClassHandler);

router.get("/:id", getClassDetail);
router.get("/:id/students", getClassStudents);
router.post("/:id/students", addStudentToClassHandler);
router.delete("/:id/students/:studentId", removeStudentFromClassHandler);
router.post("/:id/quit", quitClassHandler);

module.exports = router;
