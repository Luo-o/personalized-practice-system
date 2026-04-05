const db = require("../config/db");

function getAllQuestions() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        q.id,
        q.owner_type,
        q.teacher_id,
        q.title,
        q.subject_id,
        q.chapter_id,
        q.difficulty,
        q.source,
        q.is_real,
        q.analysis,
        q.correct_answer,
        q.created_at,
        q.updated_at,
        q.is_deleted,
        q.deleted_at,
        t.name AS teacher_name,
        s.name AS subject_name,
        c.name AS chapter_name
      FROM questions q
      LEFT JOIN teachers t ON q.teacher_id = t.id
      LEFT JOIN subjects s ON q.subject_id = s.id
      LEFT JOIN chapters c ON q.chapter_id = c.id
      WHERE q.is_deleted = 0
      ORDER BY q.id ASC
    `;

    db.all(sql, [], async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      const questions = rows || [];

      try {
        for (const q of questions) {
          const [options, knowledgePoints, images] = await Promise.all([
            getQuestionOptions(q.id),
            getQuestionKnowledgePoints(q.id),
            getQuestionImages(q.id),
          ]);

          q.options = options;
          q.knowledgePoints = knowledgePoints;
          q.images = images;
        }

        resolve(questions);
      } catch (error) {
        reject(error);
      }
    });
  });
}

function countQuestions(filters = {}) {
  return new Promise((resolve, reject) => {
    const conditions = [];
    const params = [];

    conditions.push(`q.is_deleted = 0`);

    if (filters.teacherId != null && filters.teacherId !== "") {
      conditions.push(`(q.owner_type = 'system' OR q.teacher_id = ?)`);
      params.push(filters.teacherId);
    }

    if (filters.subjectId != null && filters.subjectId !== "") {
      conditions.push(`q.subject_id = ?`);
      params.push(filters.subjectId);
    }

    if (filters.chapterId != null && filters.chapterId !== "") {
      conditions.push(`q.chapter_id = ?`);
      params.push(filters.chapterId);
    }

    if (filters.difficulty) {
      conditions.push(`q.difficulty = ?`);
      params.push(filters.difficulty);
    }

    if (filters.source) {
      conditions.push(`q.source = ?`);
      params.push(filters.source);
    }

    if (filters.keyword) {
      conditions.push(`q.title LIKE ?`);
      params.push(`%${filters.keyword}%`);
    }

    if (filters.knowledgePointName) {
      conditions.push(`
          EXISTS (
            SELECT 1
            FROM question_knowledge_points qkp
            INNER JOIN knowledge_points kp ON qkp.knowledge_point_id = kp.id
            WHERE qkp.question_id = q.id
              AND kp.name = ?
          )
        `);
      params.push(filters.knowledgePointName);
    }

    if (filters.isReal != null && filters.isReal !== "") {
      conditions.push(`q.is_real = ?`);
      params.push(filters.isReal);
    }

    if (filters.ownerType) {
      conditions.push(`q.owner_type = ?`);
      params.push(filters.ownerType);
    }

    const whereSql = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const sql = `
      SELECT COUNT(*) AS total
      FROM questions q
      ${whereSql}
    `;

    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row?.total || 0);
    });
  });
}

function getQuestionPage({ page = 1, pageSize = 20, filters = {} }) {
  return new Promise((resolve, reject) => {
    const conditions = [];
    const params = [];

    conditions.push(`q.is_deleted = 0`);

    if (filters.teacherId != null && filters.teacherId !== "") {
      conditions.push(`(q.owner_type = 'system' OR q.teacher_id = ?)`);
      params.push(filters.teacherId);
    }

    if (filters.subjectId != null && filters.subjectId !== "") {
      conditions.push(`q.subject_id = ?`);
      params.push(filters.subjectId);
    }

    if (filters.chapterId != null && filters.chapterId !== "") {
      conditions.push(`q.chapter_id = ?`);
      params.push(filters.chapterId);
    }

    if (filters.difficulty) {
      conditions.push(`q.difficulty = ?`);
      params.push(filters.difficulty);
    }

    if (filters.source) {
      conditions.push(`q.source = ?`);
      params.push(filters.source);
    }

    if (filters.keyword) {
      conditions.push(`q.title LIKE ?`);
      params.push(`%${filters.keyword}%`);
    }

    if (filters.knowledgePointName) {
      conditions.push(`
        EXISTS (
          SELECT 1
          FROM question_knowledge_points qkp
          INNER JOIN knowledge_points kp ON qkp.knowledge_point_id = kp.id
          WHERE qkp.question_id = q.id
            AND kp.name = ?
        )
      `);
      params.push(filters.knowledgePointName);
    }

    if (filters.isReal != null && filters.isReal !== "") {
      conditions.push(`q.is_real = ?`);
      params.push(filters.isReal);
    }

    if (filters.ownerType) {
      conditions.push(`q.owner_type = ?`);
      params.push(filters.ownerType);
    }

    const whereSql = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const offset = (page - 1) * pageSize;

    const sql = `
      SELECT
        q.id,
        q.owner_type,
        q.teacher_id,
        q.title,
        q.subject_id,
        q.chapter_id,
        q.difficulty,
        q.source,
        q.is_real,
        q.analysis,
        q.correct_answer,
        q.created_at,
        q.updated_at,
        q.is_deleted,
        q.deleted_at,
        t.name AS teacher_name,
        s.name AS subject_name,
        c.name AS chapter_name
      FROM questions q
      LEFT JOIN teachers t ON q.teacher_id = t.id
      LEFT JOIN subjects s ON q.subject_id = s.id
      LEFT JOIN chapters c ON q.chapter_id = c.id
      ${whereSql}
      ORDER BY q.id ASC
      LIMIT ? OFFSET ?
    `;

    db.all(sql, [...params, pageSize, offset], async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      const questions = rows || [];

      try {
        for (const q of questions) {
          const [options, knowledgePoints, images] = await Promise.all([
            getQuestionOptions(q.id),
            getQuestionKnowledgePoints(q.id),
            getQuestionImages(q.id),
          ]);

          q.options = options;
          q.knowledgePoints = knowledgePoints;
          q.images = images;
        }

        resolve(questions);
      } catch (error) {
        reject(error);
      }
    });
  });
}

function getQuestionBaseById(questionId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        q.id,
        q.owner_type,
        q.teacher_id,
        q.title,
        q.subject_id,
        q.chapter_id,
        q.difficulty,
        q.source,
        q.is_real,
        q.analysis,
        q.correct_answer,
        q.created_at,
        q.updated_at,
        q.is_deleted,
        q.deleted_at,
        t.name AS teacher_name,
        s.name AS subject_name,
        c.name AS chapter_name
      FROM questions q
      LEFT JOIN teachers t ON q.teacher_id = t.id
      LEFT JOIN subjects s ON q.subject_id = s.id
      LEFT JOIN chapters c ON q.chapter_id = c.id
      WHERE q.id = ? AND q.is_deleted = 0
      LIMIT 1
    `;

    db.get(sql, [questionId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

function getQuestionOptions(questionId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        option_key,
        option_text,
        sort_order
      FROM question_options
      WHERE question_id = ?
      ORDER BY sort_order ASC, id ASC
    `;

    db.all(sql, [questionId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

function getQuestionKnowledgePoints(questionId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        kp.id,
        kp.name
      FROM question_knowledge_points qkp
      INNER JOIN knowledge_points kp ON qkp.knowledge_point_id = kp.id
      WHERE qkp.question_id = ?
      ORDER BY kp.id ASC
    `;

    db.all(sql, [questionId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

function getQuestionImages(questionId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        image_url,
        sort_order
      FROM question_images
      WHERE question_id = ?
      ORDER BY sort_order ASC, id ASC
    `;

    db.all(sql, [questionId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

async function getQuestionById(questionId) {
  const base = await getQuestionBaseById(questionId);
  if (!base) return null;

  const [options, knowledgePoints, images] = await Promise.all([
    getQuestionOptions(questionId),
    getQuestionKnowledgePoints(questionId),
    getQuestionImages(questionId),
  ]);

  return {
    ...base,
    options,
    knowledgePoints,
    images,
  };
}

function createQuestion(data) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO questions (
        id,
        owner_type,
        teacher_id,
        title,
        subject_id,
        chapter_id,
        difficulty,
        source,
        is_real,
        analysis,
        correct_answer,
        is_deleted,
        deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [
        data.id,
        data.owner_type,
        data.teacher_id,
        data.title,
        data.subject_id,
        data.chapter_id,
        data.difficulty,
        data.source,
        data.is_real,
        data.analysis,
        data.correct_answer,
        0,
        null,
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

function createQuestionOptions(questionId, options = []) {
  return new Promise((resolve, reject) => {
    if (!options.length) {
      resolve();
      return;
    }

    const sql = `
      INSERT INTO question_options (
        question_id,
        option_key,
        option_text,
        sort_order
      ) VALUES (?, ?, ?, ?)
    `;

    const stmt = db.prepare(sql);

    for (let i = 0; i < options.length; i++) {
      const item = options[i];
      stmt.run([
        questionId,
        item.option_key,
        item.option_text,
        item.sort_order ?? i + 1,
      ]);
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

function createQuestionKnowledgePoints(questionId, knowledgePointIds = []) {
  return new Promise((resolve, reject) => {
    if (!knowledgePointIds.length) {
      resolve();
      return;
    }

    const sql = `
      INSERT INTO question_knowledge_points (
        question_id,
        knowledge_point_id
      ) VALUES (?, ?)
    `;

    const stmt = db.prepare(sql);

    for (const kpId of knowledgePointIds) {
      stmt.run([questionId, kpId]);
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

function createQuestionImages(questionId, images = []) {
  return new Promise((resolve, reject) => {
    if (!images.length) {
      resolve();
      return;
    }

    const sql = `
      INSERT INTO question_images (
        question_id,
        image_url,
        sort_order
      ) VALUES (?, ?, ?)
    `;

    const stmt = db.prepare(sql);

    for (let i = 0; i < images.length; i++) {
      const item = images[i];
      stmt.run([questionId, item.image_url, item.sort_order ?? i + 1]);
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

function getQuestionSubjectStats(filters = {}) {
  return new Promise((resolve, reject) => {
    const conditions = [];
    const params = [];

    conditions.push(`q.is_deleted = 0`);

    if (filters.teacherId != null && filters.teacherId !== "") {
      conditions.push(`(q.owner_type = 'system' OR q.teacher_id = ?)`);
      params.push(filters.teacherId);
    }

    const whereSql = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const sql = `
      SELECT
        q.subject_id AS subjectId,
        s.name AS subjectName,
        COUNT(*) AS count
      FROM questions q
      LEFT JOIN subjects s ON q.subject_id = s.id
      ${whereSql}
      GROUP BY q.subject_id, s.name
      ORDER BY q.subject_id ASC
    `;

    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

async function createQuestionWithRelations(data) {
  await createQuestion(data);
  await createQuestionOptions(data.id, data.options || []);
  await createQuestionKnowledgePoints(data.id, data.knowledgePointIds || []);
  await createQuestionImages(data.id, data.images || []);
  return getQuestionById(data.id);
}

function updateQuestionBase(questionId, data) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE questions
      SET
        owner_type = ?,
        teacher_id = ?,
        title = ?,
        subject_id = ?,
        chapter_id = ?,
        difficulty = ?,
        source = ?,
        is_real = ?,
        analysis = ?,
        correct_answer = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_deleted = 0
    `;

    db.run(
      sql,
      [
        data.owner_type,
        data.teacher_id,
        data.title,
        data.subject_id,
        data.chapter_id,
        data.difficulty,
        data.source,
        data.is_real,
        data.analysis,
        data.correct_answer,
        questionId,
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

async function updateQuestionWithRelations(questionId, data) {
  const changes = await updateQuestionBase(questionId, data);
  if (!changes) return null;

  await deleteQuestionOptions(questionId);
  await deleteQuestionKnowledgePoints(questionId);
  await deleteQuestionImages(questionId);

  await createQuestionOptions(questionId, data.options || []);
  await createQuestionKnowledgePoints(questionId, data.knowledgePointIds || []);
  await createQuestionImages(questionId, data.images || []);

  return getQuestionById(questionId);
}

function deleteQuestionOptions(questionId) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM question_options WHERE question_id = ?`,
      [questionId],
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

function deleteQuestionKnowledgePoints(questionId) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM question_knowledge_points WHERE question_id = ?`,
      [questionId],
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

function deleteQuestionImages(questionId) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM question_images WHERE question_id = ?`,
      [questionId],
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

/**
 * 软删除：不删历史关联数据，不物理删除 questions
 * 这样错题本、作答记录、submission 回顾仍然能通过 questions 表查到题干
 */
function softDeleteQuestion(questionId) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE questions
      SET
        is_deleted = 1,
        deleted_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_deleted = 0
    `;

    db.run(sql, [questionId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes);
    });
  });
}

async function deleteQuestionWithRelations(questionId) {
  return softDeleteQuestion(questionId);
}

module.exports = {
  getAllQuestions,
  countQuestions,
  getQuestionPage,
  getQuestionById,
  createQuestionWithRelations,
  updateQuestionWithRelations,
  deleteQuestionWithRelations,
  getQuestionSubjectStats,
};
