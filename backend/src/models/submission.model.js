const db = require("../config/db");

function getStudentExams(studentId) {
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
        CASE
          WHEN sub.id IS NOT NULL THEN 1
          ELSE 0
        END AS has_submitted,
        sub.id AS submission_id,
        sub.score AS submission_score,
        sub.correct_count,
        sub.submitted_at
      FROM class_students cs
      INNER JOIN exams e ON cs.class_id = e.class_id
      LEFT JOIN classes c ON e.class_id = c.id
      LEFT JOIN teachers t ON e.teacher_id = t.id
      LEFT JOIN subjects s ON e.subject_id = s.id
      LEFT JOIN exam_questions eq ON e.id = eq.exam_id
      LEFT JOIN submissions sub
        ON e.id = sub.exam_id AND sub.student_id = cs.student_id AND sub.type = 'exam'
      WHERE cs.student_id = ?
      GROUP BY e.id
      ORDER BY e.id ASC
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

function getAllSubmissions() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        sub.id,
        sub.type,
        sub.exam_id,
        sub.student_id,
        sub.class_id,
        sub.title,
        sub.subject_id,
        sub.total_count,
        sub.score,
        sub.correct_count,
        sub.duration_min,
        sub.submitted_at,
        e.title AS exam_title,
        stu.name AS student_name,
        c.name AS class_name,
        s.name AS subject_name
      FROM submissions sub
      LEFT JOIN exams e ON sub.exam_id = e.id
      LEFT JOIN students stu ON sub.student_id = stu.id
      LEFT JOIN classes c ON sub.class_id = c.id
      LEFT JOIN subjects s ON sub.subject_id = s.id
      ORDER BY sub.submitted_at DESC, sub.id DESC
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

function getSubmissionById(submissionId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        sub.id,
        sub.type,
        sub.exam_id,
        sub.student_id,
        sub.class_id,
        sub.title,
        sub.subject_id,
        sub.total_count,
        sub.score,
        sub.correct_count,
        sub.duration_min,
        sub.submitted_at,
        e.title AS exam_title,
        stu.name AS student_name,
        c.name AS class_name,
        s.name AS subject_name
      FROM submissions sub
      LEFT JOIN exams e ON sub.exam_id = e.id
      LEFT JOIN students stu ON sub.student_id = stu.id
      LEFT JOIN classes c ON sub.class_id = c.id
      LEFT JOIN subjects s ON sub.subject_id = s.id
      WHERE sub.id = ?
      LIMIT 1
    `;

    db.get(sql, [submissionId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

function getAnswerRecordsBySubmissionId(submissionId) {
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
        q.title AS question_title,
        q.analysis,
        q.difficulty
      FROM answer_records ar
      LEFT JOIN questions q ON ar.question_id = q.id
      WHERE ar.submission_id = ?
      ORDER BY ar.id ASC
    `;

    db.all(sql, [submissionId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

function getSubmissionsByExamId(examId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        sub.id,
        sub.type,
        sub.exam_id,
        sub.student_id,
        sub.class_id,
        sub.title,
        sub.subject_id,
        sub.total_count,
        sub.score,
        sub.correct_count,
        sub.duration_min,
        sub.submitted_at,
        stu.name AS student_name,
        c.name AS class_name,
        s.name AS subject_name
      FROM submissions sub
      LEFT JOIN students stu ON sub.student_id = stu.id
      LEFT JOIN classes c ON sub.class_id = c.id
      LEFT JOIN subjects s ON sub.subject_id = s.id
      WHERE sub.exam_id = ? AND sub.type = 'exam'
      ORDER BY sub.submitted_at ASC, sub.id ASC
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

function getExamById(examId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT *
      FROM exams
      WHERE id = ?
      LIMIT 1
      `,
      [examId],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      },
    );
  });
}

function getQuestionById(questionId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT
        q.id,
        q.subject_id,
        q.correct_answer,
        q.title,
        q.analysis,
        q.difficulty
      FROM questions q
      WHERE q.id = ?
      LIMIT 1
      `,
      [questionId],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      },
    );
  });
}

function getExamQuestionsWithAnswer(examId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        q.id,
        q.subject_id,
        q.correct_answer
      FROM exam_questions eq
      INNER JOIN questions q ON eq.question_id = q.id
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

function getSubjectNameById(subjectId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT id, name
      FROM subjects
      WHERE id = ?
      LIMIT 1
      `,
      [subjectId],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      },
    );
  });
}

function getStudentById(studentId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT id, name
      FROM students
      WHERE id = ?
      LIMIT 1
      `,
      [studentId],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      },
    );
  });
}

function getStudentClassRelation(studentId, classId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT *
      FROM class_students
      WHERE student_id = ? AND class_id = ?
      LIMIT 1
      `,
      [studentId, classId],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      },
    );
  });
}

function getExistingExamSubmission(examId, studentId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT *
      FROM submissions
      WHERE exam_id = ? AND student_id = ? AND type = 'exam'
      LIMIT 1
      `,
      [examId, studentId],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      },
    );
  });
}

function insertSubmission(data) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO submissions (
        id,
        type,
        exam_id,
        student_id,
        class_id,
        title,
        subject_id,
        total_count,
        score,
        correct_count,
        duration_min,
        submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [
        data.id,
        data.type,
        data.exam_id,
        data.student_id,
        data.class_id,
        data.title,
        data.subject_id,
        data.total_count,
        data.score,
        data.correct_count,
        data.duration_min,
        data.submitted_at,
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

function insertAnswerRecords(answerRecords = []) {
  return new Promise((resolve, reject) => {
    if (!answerRecords.length) {
      resolve();
      return;
    }

    const sql = `
      INSERT INTO answer_records (
        id,
        submission_id,
        exam_id,
        student_id,
        question_id,
        selected_answer,
        correct_answer,
        is_correct,
        answered_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const stmt = db.prepare(sql);

    for (const item of answerRecords) {
      stmt.run([
        item.id,
        item.submission_id,
        item.exam_id,
        item.student_id,
        item.question_id,
        item.selected_answer,
        item.correct_answer,
        item.is_correct,
        item.answered_at,
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

function normalizeAnswerValue(value) {
  if (value == null) return null;

  const text = String(value).trim();
  if (!text) return null;

  return text.toUpperCase();
}

function readAnswerQuestionId(item) {
  return Number(item?.question_id ?? item?.questionId ?? item?.id);
}

function readSelectedAnswer(item) {
  return normalizeAnswerValue(
    item?.selected_answer ??
      item?.selectedAnswer ??
      item?.answer ??
      item?.value ??
      null,
  );
}

async function buildPracticeQuestionSet(data) {
  const answerMap = new Map();

  for (const item of data.answers || []) {
    const questionId = readAnswerQuestionId(item);
    const selectedAnswer = readSelectedAnswer(item);

    if (!Number.isNaN(questionId)) {
      answerMap.set(questionId, selectedAnswer);
    }
  }

  const questionIds = Array.from(answerMap.keys());
  if (!questionIds.length) {
    throw new Error("自主刷题提交不能为空");
  }

  const questions = [];
  for (const questionId of questionIds) {
    const q = await getQuestionById(questionId);
    if (!q) {
      throw new Error(`题目不存在：${questionId}`);
    }
    questions.push(q);
  }

  const subjectIds = new Set(
    questions.map((q) => Number(q.subject_id)).filter((v) => !Number.isNaN(v)),
  );

  if (data.subject_id == null) {
    if (subjectIds.size !== 1) {
      throw new Error("自主刷题提交缺少 subject_id");
    }
    data.subject_id = Array.from(subjectIds)[0];
  }

  const totalCount = questions.length;
  let correctCount = 0;

  const answerRecords = questions.map((q, index) => {
    const selectedAnswer = answerMap.has(Number(q.id))
      ? answerMap.get(Number(q.id))
      : null;

    const correctAnswer = normalizeAnswerValue(q.correct_answer);
    const isCorrect =
      selectedAnswer && correctAnswer && selectedAnswer === correctAnswer
        ? 1
        : 0;

    if (isCorrect) correctCount += 1;

    return {
      id: data.id * 1000 + index + 1,
      submission_id: data.id,
      exam_id: null,
      student_id: data.student_id,
      question_id: q.id,
      selected_answer: selectedAnswer,
      correct_answer: correctAnswer,
      is_correct: isCorrect,
      answered_at: data.submitted_at,
    };
  });

  return {
    totalCount,
    correctCount,
    answerRecords,
    title: data.title || "自主练习",
    class_id: data.class_id ?? null,
    subject_id: data.subject_id,
  };
}

async function createSubmissionWithAnswers(data) {
  const type = data.type === "practice" ? "practice" : "exam";

  const student = await getStudentById(data.student_id);
  if (!student) {
    throw new Error("学生不存在");
  }

  if (type === "exam") {
    const exam = await getExamById(data.exam_id);
    if (!exam) {
      throw new Error("考试不存在");
    }

    const relation = await getStudentClassRelation(
      data.student_id,
      exam.class_id,
    );
    if (!relation) {
      throw new Error("该学生不属于此考试班级");
    }

    const existed = await getExistingExamSubmission(
      data.exam_id,
      data.student_id,
    );
    if (existed) {
      throw new Error("该学生已提交过本场考试");
    }

    const examQuestions = await getExamQuestionsWithAnswer(data.exam_id);
    const subject = await getSubjectNameById(exam.subject_id);

    const answerMap = new Map();
    for (const item of data.answers || []) {
      const questionId = readAnswerQuestionId(item);
      const selectedAnswer = readSelectedAnswer(item);

      if (!Number.isNaN(questionId)) {
        answerMap.set(questionId, selectedAnswer);
      }
    }

    const totalCount = examQuestions.length;
    let correctCount = 0;

    const answerRecords = examQuestions.map((q, index) => {
      const selectedAnswer = answerMap.has(Number(q.id))
        ? answerMap.get(Number(q.id))
        : null;

      const correctAnswer = normalizeAnswerValue(q.correct_answer);
      const isCorrect =
        selectedAnswer && correctAnswer && selectedAnswer === correctAnswer
          ? 1
          : 0;

      if (isCorrect) correctCount += 1;

      return {
        id: data.id * 1000 + index + 1,
        submission_id: data.id,
        exam_id: data.exam_id,
        student_id: data.student_id,
        question_id: q.id,
        selected_answer: selectedAnswer,
        correct_answer: correctAnswer,
        is_correct: isCorrect,
        answered_at: data.submitted_at,
      };
    });

    const totalScore =
      totalCount > 0
        ? Number(
            (
              (correctCount / totalCount) *
              (exam.total_score || totalCount)
            ).toFixed(2),
          )
        : 0;

    await insertSubmission({
      id: data.id,
      type: "exam",
      exam_id: data.exam_id,
      student_id: data.student_id,
      class_id: exam.class_id,
      title: exam.title,
      subject_id: exam.subject_id,
      total_count: totalCount,
      score: totalScore,
      correct_count: correctCount,
      duration_min: data.duration_min ?? null,
      submitted_at: data.submitted_at,
    });

    await insertAnswerRecords(answerRecords);
    await updateWrongBook(answerRecords);

    return {
      submission: await getSubmissionById(data.id),
      answerRecords: await getAnswerRecordsBySubmissionId(data.id),
      examTitle: exam.title,
      subjectName: subject ? subject.name : null,
    };
  }

  const practiceBuilt = await buildPracticeQuestionSet(data);
  const subject = await getSubjectNameById(practiceBuilt.subject_id);

  await insertSubmission({
    id: data.id,
    type: "practice",
    exam_id: null,
    student_id: data.student_id,
    class_id: practiceBuilt.class_id,
    title: practiceBuilt.title,
    subject_id: practiceBuilt.subject_id,
    total_count: practiceBuilt.totalCount,
    score: practiceBuilt.correctCount,
    correct_count: practiceBuilt.correctCount,
    duration_min: data.duration_min ?? null,
    submitted_at: data.submitted_at,
  });

  await insertAnswerRecords(practiceBuilt.answerRecords);
  await updateWrongBook(practiceBuilt.answerRecords);

  return {
    submission: await getSubmissionById(data.id),
    answerRecords: await getAnswerRecordsBySubmissionId(data.id),
    examTitle: null,
    subjectName: subject ? subject.name : null,
  };
}

function updateWrongBook(answerRecords = []) {
  return new Promise((resolve, reject) => {
    if (!answerRecords.length) {
      resolve();
      return;
    }

    const insertSql = `
      INSERT INTO wrong_book (
        student_id,
        question_id,
        status,
        wrong_count,
        last_wrong_at,
        last_practice_at
      )
      VALUES (?, ?, 'pending', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(student_id, question_id)
      DO UPDATE SET
        status = 'pending',
        wrong_count = wrong_count + 1,
        last_wrong_at = CURRENT_TIMESTAMP,
        last_practice_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    `;

    const updateSql = `
      UPDATE wrong_book
      SET last_practice_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE student_id = ? AND question_id = ?
    `;

    const stmtInsert = db.prepare(insertSql);
    const stmtUpdate = db.prepare(updateSql);

    for (const item of answerRecords) {
      if (item.is_correct === 0) {
        stmtInsert.run([item.student_id, item.question_id]);
      } else {
        stmtUpdate.run([item.student_id, item.question_id]);
      }
    }

    stmtInsert.finalize();
    stmtUpdate.finalize((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = {
  getStudentExams,
  getAllSubmissions,
  getSubmissionById,
  getAnswerRecordsBySubmissionId,
  getSubmissionsByExamId,
  createSubmissionWithAnswers,
  getExamById,
  updateWrongBook,
};
