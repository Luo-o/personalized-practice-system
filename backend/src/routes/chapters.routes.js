const express = require("express");
const router = express.Router();

const { createKnowledgePoint } = require("../controllers/subject.controller");

router.post("/:id/knowledge-points", createKnowledgePoint);

module.exports = router;
