const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const classesRoutes = require("./classes.routes");
const studentsRoutes = require("./students.routes");
const teachersRoutes = require("./teachers.routes");
const questionsRoutes = require("./questions.routes");
const subjectsRoutes = require("./subjects.routes");
const chaptersRoutes = require("./chapters.routes");
const examsRoutes = require("./exams.routes");
const submissionsRoutes = require("./submissions.routes");
const studentExamsRoutes = require("./student-exams.routes");
const analyticsRoutes = require("./analytics.routes");
const aiRoutes = require("./ai.routes");
const practiceRoutes = require("./practice.routes");
const questionImportRoutes = require("./question-import.routes");

router.use("/auth", authRoutes);
router.use("/classes", classesRoutes);
router.use("/students", studentsRoutes);
router.use("/teachers", teachersRoutes);
router.use("/questions", questionsRoutes);
router.use("/subjects", subjectsRoutes);
router.use("/chapters", chaptersRoutes);
router.use("/exams", examsRoutes);
router.use("/submissions", submissionsRoutes);
router.use("/practice", practiceRoutes);
router.use("/", studentExamsRoutes);
router.use("/", analyticsRoutes);
router.use("/ai", aiRoutes);
router.use("/question-bank", questionImportRoutes);

module.exports = router;
