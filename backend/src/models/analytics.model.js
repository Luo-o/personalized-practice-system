const db = require("../config/db");

function getWrongQuestionsByStudent(studentId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        q.id AS question_id,
        q.title,
        q.analysis,
        q.difficulty,
        q.correct_answer,
        ar.selected_answer,
        ar.exam_id,
        e.title AS exam_title,
        ar.answered_at
      FROM answer_records ar
      INNER JOIN questions q ON ar.question_id = q.id
      LEFT JOIN exams e ON ar.exam_id = e.id
      WHERE ar.student_id = ?
      AND ar.is_correct = 0
      ORDER BY ar.answered_at DESC
    `;

    db.all(sql, [studentId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function getStudentStats(studentId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        COUNT(DISTINCT sub.exam_id) AS exam_count,
        SUM(sub.total_count) AS total_questions,
        SUM(sub.correct_count) AS total_correct,
        AVG(sub.score) AS avg_score
      FROM submissions sub
      WHERE sub.student_id = ?
    `;

    db.get(sql, [studentId], (err, row) => {
      if (err) reject(err);
      else resolve(row || {});
    });
  });
}

function getExamAnalytics(examId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        eq.question_id,
        q.title,
        COUNT(ar.id) AS answered_count,
        SUM(ar.is_correct) AS correct_count
      FROM exam_questions eq
      INNER JOIN questions q ON eq.question_id = q.id
      LEFT JOIN answer_records ar
        ON ar.question_id = eq.question_id
        AND ar.exam_id = eq.exam_id
      WHERE eq.exam_id = ?
      GROUP BY eq.question_id
      ORDER BY eq.sort_order ASC
    `;

    db.all(sql, [examId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

module.exports = {
  getWrongQuestionsByStudent,
  getStudentStats,
  getExamAnalytics,
};
