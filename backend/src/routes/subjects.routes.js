const express = require("express");
const router = express.Router();

const {
  listSubjects,
  listChaptersBySubject,
  listKnowledgePointsBySubject,
  createSubject,
  createChapter,
} = require("../controllers/subject.controller");

router.get("/", listSubjects);
router.get("/:id/chapters", listChaptersBySubject);
router.get("/:id/knowledge-points", listKnowledgePointsBySubject);

router.post("/", createSubject);
router.post("/:id/chapters", createChapter);

module.exports = router;
