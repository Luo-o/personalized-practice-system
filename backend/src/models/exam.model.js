const db = require("../config/db");

function getAllExams() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        e.id,
        e.title,
        e.class_id,
        e.teacher_id,
        e.subject_id,
        e.publish_at,
        e.deadline_at,
        e.status,
        e.duration_minutes,
        e.total_score,
        e.created_at,
        e.updated_at,
        c.name AS class_name,
        t.name AS teacher_name,
        s.name AS subject_name,
        COUNT(DISTINCT eq.question_id) AS question_count,
        COUNT(DISTINCT sub.id) AS submission_count
      FROM exams e
      LEFT JOIN classes c ON e.class_id = c.id
      LEFT JOIN teachers t ON e.teacher_id = t.id
      LEFT JOIN subjects s ON e.subject_id = s.id
      LEFT JOIN exam_questions eq ON e.id = eq.exam_id
      LEFT JOIN submissions sub ON e.id = sub.exam_id
      GROUP BY e.id
      ORDER BY e.id ASC
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

function getExamById(examId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        e.id,
        e.title,
        e.class_id,
        e.teacher_id,
        e.subject_id,
        e.publish_at,
        e.deadline_at,
        e.status,
        e.duration_minutes,
        e.total_score,
        e.created_at,
        e.updated_at,
        c.name AS class_name,
        t.name AS teacher_name,
        s.name AS subject_name,
        COUNT(DISTINCT eq.question_id) AS question_count,
        COUNT(DISTINCT sub.id) AS submission_count
      FROM exams e
      LEFT JOIN classes c ON e.class_id = c.id
      LEFT JOIN teachers t ON e.teacher_id = t.id
      LEFT JOIN subjects s ON e.subject_id = s.id
      LEFT JOIN exam_questions eq ON e.id = eq.exam_id
      LEFT JOIN submissions sub ON e.id = sub.exam_id
      WHERE e.id = ?
      GROUP BY e.id
      LIMIT 1
    `;

    db.get(sql, [examId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

function getExamQuestions(examId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        eq.id AS exam_question_id,
        eq.exam_id,
        eq.question_id,
        eq.score,
        eq.sort_order,
        q.title,
        q.owner_type,
        q.teacher_id,
        q.subject_id,
        q.chapter_id,
        q.difficulty,
        q.source,
        q.is_real,
        q.analysis,
        q.correct_answer,
        s.name AS subject_name,
        c.name AS chapter_name
      FROM exam_questions eq
      INNER JOIN questions q ON eq.question_id = q.id
      LEFT JOIN subjects s ON q.subject_id = s.id
      LEFT JOIN chapters c ON q.chapter_id = c.id
      WHERE eq.exam_id = ?
      ORDER BY eq.sort_order ASC, eq.id ASC
    `;

    db.all(sql, [examId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

function createExam(data) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO exams (
        id,
        title,
        class_id,
        teacher_id,
        subject_id,
        publish_at,
        deadline_at,
        status,
        duration_minutes,
        total_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [
        data.id,
        data.title,
        data.class_id,
        data.teacher_id,
        data.subject_id,
        data.publish_at,
        data.deadline_at,
        data.status,
        data.duration_minutes,
        data.total_score,
      ],
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          id: data.id,
          changes: this.changes,
        });
      },
    );
  });
}

function createExamQuestions(examId, questionIds = []) {
  return new Promise((resolve, reject) => {
    if (!questionIds.length) {
      resolve();
      return;
    }

    const sql = `
      INSERT INTO exam_questions (
        exam_id,
        question_id,
        score,
        sort_order
      ) VALUES (?, ?, ?, ?)
    `;

    const stmt = db.prepare(sql);

    for (let i = 0; i < questionIds.length; i++) {
      stmt.run([examId, questionIds[i], 1, i + 1]);
    }

    stmt.finalize((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

async function createExamWithQuestions(data) {
  await createExam(data);
  await createExamQuestions(data.id, data.questionIds || []);
  return getExamById(data.id);
}

function updateExamBase(examId, data) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE exams
      SET
        title = ?,
        class_id = ?,
        teacher_id = ?,
        subject_id = ?,
        publish_at = ?,
        deadline_at = ?,
        status = ?,
        duration_minutes = ?,
        total_score = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(
      sql,
      [
        data.title,
        data.class_id,
        data.teacher_id,
        data.subject_id,
        data.publish_at,
        data.deadline_at,
        data.status,
        data.duration_minutes,
        data.total_score,
        examId,
      ],
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes);
      },
    );
  });
}

function deleteExamQuestions(examId) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM exam_questions WHERE exam_id = ?`,
      [examId],
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      },
    );
  });
}

async function updateExamWithQuestions(examId, data) {
  const changes = await updateExamBase(examId, data);
  if (!changes) return null;

  await deleteExamQuestions(examId);
  await createExamQuestions(examId, data.questionIds || []);

  return getExamById(examId);
}

function deleteExam(examId) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM exams WHERE id = ?`, [examId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes);
    });
  });
}

async function deleteExamWithQuestions(examId) {
  await deleteExamQuestions(examId);
  return deleteExam(examId);
}

module.exports = {
  getAllExams,
  getExamById,
  getExamQuestions,
  createExamWithQuestions,
  updateExamWithQuestions,
  deleteExamWithQuestions,
};
