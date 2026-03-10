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
        t.name AS teacher_name,
        s.name AS subject_name,
        c.name AS chapter_name
      FROM questions q
      LEFT JOIN teachers t ON q.teacher_id = t.id
      LEFT JOIN subjects s ON q.subject_id = s.id
      LEFT JOIN chapters c ON q.chapter_id = c.id
      ORDER BY q.id ASC
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
        t.name AS teacher_name,
        s.name AS subject_name,
        c.name AS chapter_name
      FROM questions q
      LEFT JOIN teachers t ON q.teacher_id = t.id
      LEFT JOIN subjects s ON q.subject_id = s.id
      LEFT JOIN chapters c ON q.chapter_id = c.id
      WHERE q.id = ?
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
        correct_answer
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      WHERE id = ?
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

function deleteQuestion(questionId) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM questions WHERE id = ?`, [questionId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes);
    });
  });
}

async function deleteQuestionWithRelations(questionId) {
  await deleteQuestionOptions(questionId);
  await deleteQuestionKnowledgePoints(questionId);
  await deleteQuestionImages(questionId);
  return deleteQuestion(questionId);
}

module.exports = {
  getAllQuestions,
  getQuestionById,
  createQuestionWithRelations,
  updateQuestionWithRelations,
  deleteQuestionWithRelations,
};
