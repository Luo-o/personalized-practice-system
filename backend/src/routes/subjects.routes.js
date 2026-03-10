const express = require("express");
const router = express.Router();

const {
  listSubjects,
  listChaptersBySubject,
  listKnowledgePointsBySubject,
} = require("../controllers/subject.controller");

router.get("/", listSubjects);
router.get("/:id/chapters", listChaptersBySubject);
router.get("/:id/knowledge-points", listKnowledgePointsBySubject);

module.exports = router;
