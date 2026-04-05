const express = require("express");
const router = express.Router();

const { getStudentClasses } = require("../controllers/class.controller");

const {
  getWrongQuestions,
  getStudentAnswerRecords,
  updateWrongQuestionStatus,
} = require("../controllers/student.controller");

router.get("/:id/classes", getStudentClasses);

router.get("/:id/wrong-questions", getWrongQuestions);

router.get("/:id/answer-records", getStudentAnswerRecords);

router.patch(
  "/:studentId/wrong-questions/:questionId/status",
  updateWrongQuestionStatus,
);

module.exports = router;
