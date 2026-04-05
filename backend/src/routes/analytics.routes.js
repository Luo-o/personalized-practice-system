const express = require("express");
const router = express.Router();

const {
  getWrongQuestions,
  getStudentStatistics,
  getExamStatistics,
  getClassKnowledgeMastery,
} = require("../controllers/analytics.controller");

router.get("/students/:id/wrong-questions", getWrongQuestions);
router.get("/students/:id/stats", getStudentStatistics);
router.get("/analytics/exams/:id", getExamStatistics);
router.get(
  "/analytics/classes/:classId/knowledge-mastery",
  getClassKnowledgeMastery,
);

module.exports = router;
