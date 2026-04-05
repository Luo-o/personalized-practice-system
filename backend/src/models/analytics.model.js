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
        q.correct_answer,
        COUNT(ar.id) AS answered_count,
        SUM(CASE WHEN ar.is_correct = 1 THEN 1 ELSE 0 END) AS correct_count,
        (
          SELECT ar2.selected_answer
          FROM answer_records ar2
          WHERE ar2.exam_id = eq.exam_id
            AND ar2.question_id = eq.question_id
            AND ar2.is_correct = 0
            AND ar2.selected_answer IS NOT NULL
            AND TRIM(ar2.selected_answer) <> ''
          GROUP BY ar2.selected_answer
          ORDER BY COUNT(*) DESC, ar2.selected_answer ASC
          LIMIT 1
        ) AS wrong_option,
        (
          SELECT qo.option_text
          FROM question_options qo
          WHERE qo.question_id = eq.question_id
            AND qo.option_key = (
              SELECT ar3.selected_answer
              FROM answer_records ar3
              WHERE ar3.exam_id = eq.exam_id
                AND ar3.question_id = eq.question_id
                AND ar3.is_correct = 0
                AND ar3.selected_answer IS NOT NULL
                AND TRIM(ar3.selected_answer) <> ''
              GROUP BY ar3.selected_answer
              ORDER BY COUNT(*) DESC, ar3.selected_answer ASC
              LIMIT 1
            )
          LIMIT 1
        ) AS wrong_option_text
      FROM exam_questions eq
      INNER JOIN questions q ON eq.question_id = q.id
      LEFT JOIN answer_records ar
        ON ar.question_id = eq.question_id
        AND ar.exam_id = eq.exam_id
      WHERE eq.exam_id = ?
      GROUP BY eq.question_id, q.title, q.correct_answer, eq.sort_order
      ORDER BY eq.sort_order ASC, eq.id ASC
    `;

    db.all(sql, [examId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function getClassKnowledgeStats(classId, subjectId = null) {
  return new Promise((resolve, reject) => {
    const params = [classId];
    let subjectSql = "";

    if (subjectId != null) {
      subjectSql = " AND q.subject_id = ? ";
      params.push(subjectId);
    }

    const sql = `
      SELECT
        ch.id AS chapter_id,
        ch.name AS chapter_name,
        kp.id AS knowledge_point_id,
        kp.name AS knowledge_point_name,
        COUNT(ar.id) AS total_count,
        SUM(CASE WHEN ar.is_correct = 1 THEN 1 ELSE 0 END) AS correct_count
      FROM class_students cs
      INNER JOIN answer_records ar
        ON ar.student_id = cs.student_id
      INNER JOIN questions q
        ON q.id = ar.question_id
      LEFT JOIN chapters ch
        ON ch.id = q.chapter_id
      INNER JOIN question_knowledge_points qkp
        ON qkp.question_id = q.id
      INNER JOIN knowledge_points kp
        ON kp.id = qkp.knowledge_point_id
      WHERE cs.class_id = ?
      ${subjectSql}
      GROUP BY ch.id, ch.name, kp.id, kp.name
      ORDER BY ch.id ASC, total_count DESC, kp.id ASC
    `;

    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      const chapterMap = new Map();
      const knowledgeMap = new Map();

      for (const row of rows || []) {
        const rawChapterId = row.chapter_id ?? "unknown";
        const chapterNodeId = `chapter_${rawChapterId}`;
        const chapterName = row.chapter_name || `章节 ${rawChapterId}`;

        const total = Number(row.total_count || 0);
        const correct = Number(row.correct_count || 0);

        if (!chapterMap.has(chapterNodeId)) {
          chapterMap.set(chapterNodeId, {
            id: chapterNodeId,
            name: chapterName,
            type: "chapter",
            total: 0,
            correct: 0,
          });
        }

        const chapterItem = chapterMap.get(chapterNodeId);
        chapterItem.total += total;
        chapterItem.correct += correct;

        const rawKpId = row.knowledge_point_id;
        const kpNodeId = `kp_${rawKpId}`;

        if (!knowledgeMap.has(kpNodeId)) {
          knowledgeMap.set(kpNodeId, {
            id: kpNodeId,
            name: row.knowledge_point_name || "未命名知识点",
            type: "knowledge",
            chapterId: chapterNodeId,
            total: 0,
            correct: 0,
          });
        }

        const kpItem = knowledgeMap.get(kpNodeId);
        kpItem.total += total;
        kpItem.correct += correct;
      }

      const chapters = Array.from(chapterMap.values()).map((item) => ({
        id: item.id,
        name: item.name,
        type: "chapter",
        accuracy: item.total ? item.correct / item.total : 0,
      }));

      const knowledge = Array.from(knowledgeMap.values()).map((item) => ({
        id: item.id,
        name: item.name,
        type: "knowledge",
        chapterId: item.chapterId,
        accuracy: item.total ? item.correct / item.total : 0,
      }));

      resolve([...chapters, ...knowledge]);
    });
  });
}

module.exports = {
  getWrongQuestionsByStudent,
  getStudentStats,
  getExamAnalytics,
  getClassKnowledgeStats,
};
