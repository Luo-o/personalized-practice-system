const express = require("express");
const router = express.Router();

const {
  getWrongQuestions,
  getStudentStatistics,
  getExamStatistics,
} = require("../controllers/analytics.controller");

router.get("/students/:id/wrong-questions", getWrongQuestions);
router.get("/students/:id/stats", getStudentStatistics);
router.get("/analytics/exams/:id", getExamStatistics);

module.exports = router;
