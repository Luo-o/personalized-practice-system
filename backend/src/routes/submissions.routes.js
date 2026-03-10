const express = require("express");
const router = express.Router();

const {
  listSubmissions,
  getSubmissionDetail,
  createSubmission,
} = require("../controllers/submission.controller");

router.get("/", listSubmissions);
router.get("/:id", getSubmissionDetail);
router.post("/", createSubmission);

module.exports = router;
