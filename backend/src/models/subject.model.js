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

function getSubjectByName(name) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        id,
        name,
        created_at
      FROM subjects
      WHERE name = ?
      LIMIT 1
    `;

    db.get(sql, [name], (err, row) => {
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

function getChapterById(chapterId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        id,
        subject_id,
        name,
        sort_order,
        created_at
      FROM chapters
      WHERE id = ?
      LIMIT 1
    `;

    db.get(sql, [chapterId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

function getChapterBySubjectIdAndName(subjectId, name) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        id,
        subject_id,
        name,
        sort_order,
        created_at
      FROM chapters
      WHERE subject_id = ? AND name = ?
      LIMIT 1
    `;

    db.get(sql, [subjectId, name], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
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

function getKnowledgePointByChapterIdAndName(chapterId, name) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        id,
        chapter_id,
        name,
        sort_order
      FROM knowledge_points
      WHERE chapter_id = ? AND name = ?
      LIMIT 1
    `;

    db.get(sql, [chapterId, name], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

function getNextChapterSortOrder(subjectId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort_order
      FROM chapters
      WHERE subject_id = ?
    `;

    db.get(sql, [subjectId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row?.next_sort_order || 1);
    });
  });
}

function getNextKnowledgePointSortOrder(chapterId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort_order
      FROM knowledge_points
      WHERE chapter_id = ?
    `;

    db.get(sql, [chapterId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row?.next_sort_order || 1);
    });
  });
}

function createSubjectModel({ name }) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO subjects (name)
      VALUES (?)
    `;

    db.run(sql, [name], function (err) {
      if (err) {
        reject(err);
        return;
      }

      db.get(
        `
        SELECT
          id,
          name,
          created_at
        FROM subjects
        WHERE id = ?
        `,
        [this.lastID],
        (queryErr, row) => {
          if (queryErr) {
            reject(queryErr);
            return;
          }
          resolve(row || null);
        },
      );
    });
  });
}

async function createChapterModel({ subject_id, name, sort_order }) {
  const finalSortOrder =
    sort_order !== undefined && sort_order !== null && sort_order !== ""
      ? Number(sort_order)
      : await getNextChapterSortOrder(subject_id);

  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO chapters (subject_id, name, sort_order)
      VALUES (?, ?, ?)
    `;

    db.run(sql, [subject_id, name, finalSortOrder], function (err) {
      if (err) {
        reject(err);
        return;
      }

      db.get(
        `
        SELECT
          id,
          subject_id,
          name,
          sort_order,
          created_at
        FROM chapters
        WHERE id = ?
        `,
        [this.lastID],
        (queryErr, row) => {
          if (queryErr) {
            reject(queryErr);
            return;
          }
          resolve(row || null);
        },
      );
    });
  });
}

async function createKnowledgePointModel({ chapter_id, name, sort_order }) {
  const finalSortOrder =
    sort_order !== undefined && sort_order !== null && sort_order !== ""
      ? Number(sort_order)
      : await getNextKnowledgePointSortOrder(chapter_id);

  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO knowledge_points (chapter_id, name, sort_order)
      VALUES (?, ?, ?)
    `;

    db.run(sql, [chapter_id, name, finalSortOrder], function (err) {
      if (err) {
        reject(err);
        return;
      }

      db.get(
        `
        SELECT
          id,
          chapter_id,
          name,
          sort_order
        FROM knowledge_points
        WHERE id = ?
        `,
        [this.lastID],
        (queryErr, row) => {
          if (queryErr) {
            reject(queryErr);
            return;
          }
          resolve(row || null);
        },
      );
    });
  });
}

module.exports = {
  getAllSubjects,
  getSubjectById,
  getSubjectByName,
  getChaptersBySubjectId,
  getChapterById,
  getChapterBySubjectIdAndName,
  getKnowledgePointsBySubjectId,
  getKnowledgePointByChapterIdAndName,
  createSubjectModel,
  createChapterModel,
  createKnowledgePointModel,
};
