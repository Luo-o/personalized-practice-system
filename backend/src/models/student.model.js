const db = require("../config/db");

function getWrongQuestionsByStudentId(studentId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        wb.id,
        wb.student_id,
        wb.question_id,
        wb.status,
        wb.wrong_count,
        wb.last_wrong_at,
        wb.last_practice_at,
        q.title,
        q.analysis,
        q.difficulty,
        q.correct_answer,
        s.name AS subject_name,
        c.name AS chapter_name
      FROM wrong_book wb
      LEFT JOIN questions q ON wb.question_id = q.id
      LEFT JOIN subjects s ON q.subject_id = s.id
      LEFT JOIN chapters c ON q.chapter_id = c.id
      WHERE wb.student_id = ?
      ORDER BY wb.updated_at DESC
    `;

    db.all(sql, [studentId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

function getAnswerRecordsByStudentId(studentId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        ar.id,
        ar.submission_id,
        ar.exam_id,
        ar.student_id,
        ar.question_id,
        ar.selected_answer,
        ar.correct_answer,
        ar.is_correct,
        ar.answered_at,
        q.title,
        q.difficulty,
        s.name AS subject_name,
        c.name AS chapter_name
      FROM answer_records ar
      LEFT JOIN questions q ON ar.question_id = q.id
      LEFT JOIN subjects s ON q.subject_id = s.id
      LEFT JOIN chapters c ON q.chapter_id = c.id
      WHERE ar.student_id = ?
      ORDER BY ar.answered_at DESC, ar.id DESC
    `;

    db.all(sql, [studentId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

// 更新状态
function updateWrongQuestionStatusById(studentId, questionId, status) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE wrong_book
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE student_id = ? AND question_id = ?
    `;

    db.run(sql, [status, studentId, questionId], function (err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(this.changes);
    });
  });
}

module.exports = {
  getWrongQuestionsByStudentId,
  getAnswerRecordsByStudentId,
  updateWrongQuestionStatusById,
};
