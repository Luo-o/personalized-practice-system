const db = require("../config/db");

function getAllSubjects() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        id,
        name,
        created_at
      FROM subjects
      ORDER BY id ASC
    `;

    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

function getSubjectById(subjectId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        id,
        name,
        created_at
      FROM subjects
      WHERE id = ?
      LIMIT 1
    `;

    db.get(sql, [subjectId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

function getChaptersBySubjectId(subjectId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        id,
        subject_id,
        name,
        sort_order,
        created_at
      FROM chapters
      WHERE subject_id = ?
      ORDER BY sort_order ASC, id ASC
    `;

    db.all(sql, [subjectId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

function getKnowledgePointsBySubjectId(subjectId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        kp.id,
        kp.chapter_id,
        kp.name,
        kp.sort_order,
        c.name AS chapter_name,
        c.subject_id
      FROM knowledge_points kp
      INNER JOIN chapters c ON kp.chapter_id = c.id
      WHERE c.subject_id = ?
      ORDER BY c.sort_order ASC, kp.sort_order ASC, kp.id ASC
    `;

    db.all(sql, [subjectId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

module.exports = {
  getAllSubjects,
  getSubjectById,
  getChaptersBySubjectId,
  getKnowledgePointsBySubjectId,
};
