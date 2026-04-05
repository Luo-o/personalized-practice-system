const express = require("express");
const router = express.Router();

const {
  listQuestions,
  getQuestionDetail,
  getQuestionSubjectSummary,
  createQuestion,
  updateQuestion,
  removeQuestion,
} = require("../controllers/question.controller");

router.get("/summary/by-subject", getQuestionSubjectSummary);
router.get("/", listQuestions);
router.get("/:id", getQuestionDetail);
router.post("/", createQuestion);
router.patch("/:id", updateQuestion);
router.delete("/:id", removeQuestion);

module.exports = router;
