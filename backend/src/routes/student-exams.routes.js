const express = require("express");
const router = express.Router();

const {
  getStudentExamList,
  getExamSubmissionList,
} = require("../controllers/submission.controller");

router.get("/students/:id/exams", getStudentExamList);
router.get("/exams/:id/submissions", getExamSubmissionList);

module.exports = router;
