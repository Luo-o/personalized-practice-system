const express = require("express");
const router = express.Router();

const {
  listExams,
  getExamDetail,
  getExamQuestionList,
  createExam,
  updateExam,
  removeExam,
} = require("../controllers/exam.controller");

router.get("/", listExams);
router.get("/:id", getExamDetail);
router.get("/:id/questions", getExamQuestionList);
router.post("/", createExam);
router.patch("/:id", updateExam);
router.delete("/:id", removeExam);

module.exports = router;
