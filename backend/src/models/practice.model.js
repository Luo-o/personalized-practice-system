const db = require("../config/db");

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

async function getPracticeMeta() {
  const subjects = await all(`
    SELECT
      s.id,
      s.name,
      COUNT(DISTINCT q.id) AS question_count
    FROM subjects s
    LEFT JOIN questions q ON q.subject_id = s.id
    GROUP BY s.id, s.name
    ORDER BY s.id ASC
  `);

  for (const subject of subjects) {
    const chapters = await all(
      `
      SELECT
        c.id,
        c.subject_id,
        c.name,
        c.sort_order,
        COUNT(DISTINCT q.id) AS question_count
      FROM chapters c
      LEFT JOIN questions q ON q.chapter_id = c.id
      WHERE c.subject_id = ?
      GROUP BY c.id, c.subject_id, c.name, c.sort_order
      ORDER BY c.sort_order ASC, c.id ASC
      `,
      [subject.id],
    );

    const knowledgePoints = await all(
      `
      SELECT
        kp.id,
        kp.chapter_id,
        kp.name,
        kp.sort_order,
        c.name AS chapter_name,
        c.subject_id,
        COUNT(DISTINCT qkp.question_id) AS question_count
      FROM knowledge_points kp
      INNER JOIN chapters c ON kp.chapter_id = c.id
      LEFT JOIN question_knowledge_points qkp
        ON qkp.knowledge_point_id = kp.id
      WHERE c.subject_id = ?
      GROUP BY kp.id, kp.chapter_id, kp.name, kp.sort_order, c.name, c.subject_id
      ORDER BY c.sort_order ASC, kp.sort_order ASC, kp.id ASC
      `,
      [subject.id],
    );

    subject.chapters = chapters;
    subject.knowledgePoints = knowledgePoints;
  }

  return subjects;
}

async function getCandidateQuestions({
  subjectId,
  chapterIds = [],
  knowledgePointIds = [],
  includeTrue = true,
}) {
  const params = [subjectId];
  const where = [`q.subject_id = ?`];

  if (!includeTrue) {
    where.push(`q.is_real = 0`);
  }

  if (chapterIds.length) {
    const placeholders = chapterIds.map(() => "?").join(",");
    where.push(`q.chapter_id IN (${placeholders})`);
    params.push(...chapterIds);
  }

  if (knowledgePointIds.length) {
    const placeholders = knowledgePointIds.map(() => "?").join(",");
    where.push(`
      EXISTS (
        SELECT 1
        FROM question_knowledge_points qkp
        WHERE qkp.question_id = q.id
          AND qkp.knowledge_point_id IN (${placeholders})
      )
    `);
    params.push(...knowledgePointIds);
  }

  const rows = await all(
    `
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
      s.name AS subject_name,
      c.name AS chapter_name
    FROM questions q
    LEFT JOIN subjects s ON s.id = q.subject_id
    LEFT JOIN chapters c ON c.id = q.chapter_id
    WHERE ${where.join(" AND ")}
    ORDER BY q.id ASC
    `,
    params,
  );

  return rows;
}

async function getQuestionKnowledgeMap(questionIds = []) {
  if (!questionIds.length) return {};

  const placeholders = questionIds.map(() => "?").join(",");
  const rows = await all(
    `
    SELECT
      qkp.question_id,
      kp.id,
      kp.name,
      kp.chapter_id
    FROM question_knowledge_points qkp
    INNER JOIN knowledge_points kp ON kp.id = qkp.knowledge_point_id
    WHERE qkp.question_id IN (${placeholders})
    ORDER BY kp.id ASC
    `,
    questionIds,
  );

  const map = {};
  for (const row of rows) {
    if (!map[row.question_id]) map[row.question_id] = [];
    map[row.question_id].push({
      id: row.id,
      name: row.name,
      chapter_id: row.chapter_id,
    });
  }

  return map;
}

async function getQuestionOptionsMap(questionIds = []) {
  if (!questionIds.length) return {};

  const placeholders = questionIds.map(() => "?").join(",");
  const rows = await all(
    `
    SELECT
      question_id,
      option_key,
      option_text,
      sort_order
    FROM question_options
    WHERE question_id IN (${placeholders})
    ORDER BY question_id ASC, sort_order ASC, id ASC
    `,
    questionIds,
  );

  const map = {};
  for (const row of rows) {
    if (!map[row.question_id]) map[row.question_id] = [];
    map[row.question_id].push({
      key: row.option_key,
      text: row.option_text,
      sortOrder: row.sort_order,
    });
  }

  return map;
}

async function getQuestionImagesMap(questionIds = []) {
  if (!questionIds.length) return {};

  const placeholders = questionIds.map(() => "?").join(",");
  const rows = await all(
    `
    SELECT
      question_id,
      image_url,
      sort_order
    FROM question_images
    WHERE question_id IN (${placeholders})
    ORDER BY question_id ASC, sort_order ASC, id ASC
    `,
    questionIds,
  );

  const map = {};
  for (const row of rows) {
    if (!map[row.question_id]) map[row.question_id] = [];
    map[row.question_id].push({
      imageUrl: row.image_url,
      sortOrder: row.sort_order,
    });
  }

  return map;
}

async function getStudentAnswerStatsByKnowledge(studentId, subjectId) {
  return all(
    `
    SELECT
      qkp.knowledge_point_id,
      SUM(CASE WHEN ar.is_correct = 1 THEN 1 ELSE 0 END) AS correct_count,
      COUNT(*) AS total_count,
      MAX(ar.answered_at) AS last_answered_at
    FROM answer_records ar
    INNER JOIN questions q ON q.id = ar.question_id
    INNER JOIN question_knowledge_points qkp ON qkp.question_id = q.id
    WHERE ar.student_id = ?
      AND q.subject_id = ?
    GROUP BY qkp.knowledge_point_id
    `,
    [studentId, subjectId],
  );
}

async function getStudentWrongBookQuestionIds(studentId) {
  const rows = await all(
    `
    SELECT question_id
    FROM wrong_book
    WHERE student_id = ? AND status != 'mastered'
    `,
    [studentId],
  );

  return rows.map((item) => Number(item.question_id));
}

async function getRecentAnsweredQuestionIds(studentId, limit = 100) {
  const rows = await all(
    `
    SELECT question_id
    FROM answer_records
    WHERE student_id = ?
    ORDER BY answered_at DESC, id DESC
    LIMIT ?
    `,
    [studentId, limit],
  );

  return rows.map((item) => Number(item.question_id));
}

async function createPracticeSession({
  id,
  studentId,
  subjectId,
  strategy,
  total,
  configJson,
}) {
  await run(
    `
    INSERT INTO practice_sessions (
      id,
      student_id,
      subject_id,
      strategy,
      total_count,
      config_json,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
    [id, studentId, subjectId, strategy, total, configJson],
  );

  return getPracticeSessionById(id);
}

async function insertPracticeQuestions(practiceId, questions = []) {
  if (!questions.length) return;

  const sql = `
    INSERT INTO practice_session_questions (
      practice_id,
      question_id,
      sort_order,
      score_snapshot
    ) VALUES (?, ?, ?, ?)
  `;

  const stmt = db.prepare(sql);

  for (let i = 0; i < questions.length; i += 1) {
    const q = questions[i];
    stmt.run([practiceId, q.id, i + 1, q.score ?? null]);
  }

  return new Promise((resolve, reject) => {
    stmt.finalize((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function getPracticeSessionById(practiceId) {
  return get(
    `
    SELECT
      ps.id,
      ps.student_id,
      ps.subject_id,
      ps.strategy,
      ps.total_count,
      ps.config_json,
      ps.created_at,
      s.name AS subject_name
    FROM practice_sessions ps
    LEFT JOIN subjects s ON s.id = ps.subject_id
    WHERE ps.id = ?
    LIMIT 1
    `,
    [practiceId],
  );
}

async function getPracticeQuestionsByPracticeId(practiceId) {
  const rows = await all(
    `
    SELECT
      psq.sort_order,
      psq.score_snapshot,
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
      s.name AS subject_name,
      c.name AS chapter_name
    FROM practice_session_questions psq
    INNER JOIN questions q ON q.id = psq.question_id
    LEFT JOIN subjects s ON s.id = q.subject_id
    LEFT JOIN chapters c ON c.id = q.chapter_id
    WHERE psq.practice_id = ?
    ORDER BY psq.sort_order ASC
    `,
    [practiceId],
  );

  const questionIds = rows.map((item) => item.id);
  const [knowledgeMap, optionsMap, imagesMap] = await Promise.all([
    getQuestionKnowledgeMap(questionIds),
    getQuestionOptionsMap(questionIds),
    getQuestionImagesMap(questionIds),
  ]);

  return rows.map((item) => ({
    ...item,
    knowledgePoints: knowledgeMap[item.id] || [],
    options: optionsMap[item.id] || [],
    images: imagesMap[item.id] || [],
  }));
}

/**
 * 新增：动态统计接口
 * 用于刷题弹窗，不走分页 questions 列表
 */
async function getPracticeStats({
  subjectId,
  includeTrue = true,
  chapterIds = [],
  knowledgePointIds = [],
}) {
  if (!subjectId) {
    return {
      total: 0,
      difficulty: {
        easy: 0,
        mid: 0,
        hard: 0,
      },
      chapters: [],
      knowledgePoints: [],
    };
  }

  const params = [subjectId];
  const where = [`q.subject_id = ?`];

  if (!includeTrue) {
    where.push(`q.is_real = 0`);
  }

  if (chapterIds.length) {
    const placeholders = chapterIds.map(() => "?").join(",");
    where.push(`q.chapter_id IN (${placeholders})`);
    params.push(...chapterIds);
  }

  if (knowledgePointIds.length) {
    const placeholders = knowledgePointIds.map(() => "?").join(",");
    where.push(`
      EXISTS (
        SELECT 1
        FROM question_knowledge_points qkp
        WHERE qkp.question_id = q.id
          AND qkp.knowledge_point_id IN (${placeholders})
      )
    `);
    params.push(...knowledgePointIds);
  }

  const baseWhereSql = where.join(" AND ");

  const totalRow = await get(
    `
    SELECT COUNT(DISTINCT q.id) AS total
    FROM questions q
    WHERE ${baseWhereSql}
    `,
    params,
  );

  const difficultyRows = await all(
    `
    SELECT
      q.difficulty,
      COUNT(DISTINCT q.id) AS count
    FROM questions q
    WHERE ${baseWhereSql}
    GROUP BY q.difficulty
    `,
    params,
  );

  const chapterParams = [subjectId];
  const chapterWhere = [`q.subject_id = ?`];
  if (!includeTrue) {
    chapterWhere.push(`q.is_real = 0`);
  }
  if (knowledgePointIds.length) {
    const placeholders = knowledgePointIds.map(() => "?").join(",");
    chapterWhere.push(`
      EXISTS (
        SELECT 1
        FROM question_knowledge_points qkp
        WHERE qkp.question_id = q.id
          AND qkp.knowledge_point_id IN (${placeholders})
      )
    `);
    chapterParams.push(...knowledgePointIds);
  }

  const chapters = await all(
    `
    SELECT
      c.id,
      c.subject_id,
      c.name,
      c.sort_order,
      COUNT(DISTINCT q.id) AS question_count
    FROM chapters c
    LEFT JOIN questions q
      ON q.chapter_id = c.id
     AND ${chapterWhere.join(" AND ")}
    WHERE c.subject_id = ?
    GROUP BY c.id, c.subject_id, c.name, c.sort_order
    ORDER BY c.sort_order ASC, c.id ASC
    `,
    [...chapterParams, subjectId],
  );

  const knowledgeParams = [subjectId];
  const knowledgeWhere = [`q.subject_id = ?`];
  if (!includeTrue) {
    knowledgeWhere.push(`q.is_real = 0`);
  }
  if (chapterIds.length) {
    const placeholders = chapterIds.map(() => "?").join(",");
    knowledgeWhere.push(`q.chapter_id IN (${placeholders})`);
    knowledgeParams.push(...chapterIds);
  }

  const knowledgePoints = await all(
    `
    SELECT
      kp.id,
      kp.chapter_id,
      kp.name,
      kp.sort_order,
      c.name AS chapter_name,
      c.subject_id,
      COUNT(DISTINCT q.id) AS question_count
    FROM knowledge_points kp
    INNER JOIN chapters c ON kp.chapter_id = c.id
    LEFT JOIN question_knowledge_points qkp
      ON qkp.knowledge_point_id = kp.id
    LEFT JOIN questions q
      ON q.id = qkp.question_id
     AND ${knowledgeWhere.join(" AND ")}
    WHERE c.subject_id = ?
    GROUP BY kp.id, kp.chapter_id, kp.name, kp.sort_order, c.name, c.subject_id
    ORDER BY c.sort_order ASC, kp.sort_order ASC, kp.id ASC
    `,
    [...knowledgeParams, subjectId],
  );

  const difficulty = {
    easy: 0,
    mid: 0,
    hard: 0,
  };

  for (const row of difficultyRows) {
    const key = String(row.difficulty || "");
    const count = Number(row.count) || 0;
    if (key === "简单") difficulty.easy = count;
    else if (key === "中等") difficulty.mid = count;
    else if (key === "困难") difficulty.hard = count;
  }

  return {
    total: Number(totalRow?.total) || 0,
    difficulty,
    chapters,
    knowledgePoints,
  };
}

module.exports = {
  getPracticeMeta,
  getCandidateQuestions,
  getQuestionKnowledgeMap,
  getQuestionOptionsMap,
  getQuestionImagesMap,
  getStudentAnswerStatsByKnowledge,
  getStudentWrongBookQuestionIds,
  getRecentAnsweredQuestionIds,
  createPracticeSession,
  insertPracticeQuestions,
  getPracticeSessionById,
  getPracticeQuestionsByPracticeId,
  getPracticeStats,
};
