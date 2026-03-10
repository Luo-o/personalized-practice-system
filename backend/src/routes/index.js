const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const classesRoutes = require("./classes.routes");
const studentsRoutes = require("./students.routes");
const teachersRoutes = require("./teachers.routes");
const questionsRoutes = require("./questions.routes");
const subjectsRoutes = require("./subjects.routes");
const examsRoutes = require("./exams.routes");
const submissionsRoutes = require("./submissions.routes");
const studentExamsRoutes = require("./student-exams.routes");
const analyticsRoutes = require("./analytics.routes");

router.use("/auth", authRoutes);
router.use("/classes", classesRoutes);
router.use("/students", studentsRoutes);
router.use("/teachers", teachersRoutes);
router.use("/questions", questionsRoutes);
router.use("/subjects", subjectsRoutes);
router.use("/exams", examsRoutes);
router.use("/submissions", submissionsRoutes);
router.use("/", studentExamsRoutes);
router.use("/", analyticsRoutes);

module.exports = router;
