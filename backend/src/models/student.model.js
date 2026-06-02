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
        q.subject_id,
        q.chapter_id,
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

      const records = rows || [];
      const questionIds = Array.from(
        new Set(
          records
            .map((row) => Number(row.question_id))
            .filter((id) => Number.isFinite(id)),
        ),
      );

      if (!questionIds.length) {
        resolve(records);
        return;
      }

      const placeholders = questionIds.map(() => "?").join(",");
      const kpSql = `
        SELECT
          qkp.question_id,
          kp.id,
          kp.name
        FROM question_knowledge_points qkp
        INNER JOIN knowledge_points kp ON qkp.knowledge_point_id = kp.id
        WHERE qkp.question_id IN (${placeholders})
        ORDER BY qkp.question_id ASC, kp.id ASC
      `;

      db.all(kpSql, questionIds, (kpErr, kpRows) => {
        if (kpErr) {
          reject(kpErr);
          return;
        }

        const kpMap = new Map();
        for (const kp of kpRows || []) {
          const key = Number(kp.question_id);
          if (!kpMap.has(key)) kpMap.set(key, []);
          kpMap.get(key).push({
            id: kp.id,
            name: kp.name,
          });
        }

        resolve(
          records.map((row) => ({
            ...row,
            knowledgePoints: kpMap.get(Number(row.question_id)) || [],
          })),
        );
      });
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
        q.subject_id,
        q.chapter_id,
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

      const records = rows || [];
      const questionIds = Array.from(
        new Set(
          records
            .map((row) => Number(row.question_id))
            .filter((id) => Number.isFinite(id)),
        ),
      );

      if (!questionIds.length) {
        resolve(records);
        return;
      }

      const placeholders = questionIds.map(() => "?").join(",");
      const kpSql = `
        SELECT
          qkp.question_id,
          kp.id,
          kp.name
        FROM question_knowledge_points qkp
        INNER JOIN knowledge_points kp ON qkp.knowledge_point_id = kp.id
        WHERE qkp.question_id IN (${placeholders})
        ORDER BY qkp.question_id ASC, kp.id ASC
      `;

      db.all(kpSql, questionIds, (kpErr, kpRows) => {
        if (kpErr) {
          reject(kpErr);
          return;
        }

        const kpMap = new Map();
        for (const kp of kpRows || []) {
          const key = Number(kp.question_id);
          if (!kpMap.has(key)) kpMap.set(key, []);
          kpMap.get(key).push({
            id: kp.id,
            name: kp.name,
          });
        }

        resolve(
          records.map((row) => ({
            ...row,
            knowledgePoints: kpMap.get(Number(row.question_id)) || [],
          })),
        );
      });
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

function searchStudentsByKeyword(keyword) {
  return new Promise((resolve, reject) => {
    const text = `%${keyword}%`;

    const sql = `
      SELECT
        id,
        student_no,
        name,
        gender,
        phone,
        email,
        major,
        grade,
        class_name,
        avatar
      FROM students
      WHERE student_no LIKE ? OR name LIKE ?
      ORDER BY id DESC
      LIMIT 50
    `;

    db.all(sql, [text, text], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(rows || []);
    });
  });
}

function findStudentByStudentNo(studentNo) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, student_no, name
      FROM students
      WHERE student_no = ?
      LIMIT 1
    `;

    db.get(sql, [studentNo], (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(row || null);
    });
  });
}

function createStudentWithAccount(student) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      const insertStudentSql = `
        INSERT INTO students (
          student_no,
          name,
          gender,
          phone,
          email,
          major,
          grade,
          class_name,
          avatar
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(
        insertStudentSql,
        [
          student.studentNo,
          student.name,
          student.gender || "",
          student.phone || "",
          student.email || "",
          student.major || "",
          student.grade || "",
          student.className || "",
          "/avatars/default-student-avatar.png",
        ],
        function (studentErr) {
          if (studentErr) {
            db.run("ROLLBACK");
            reject(studentErr);
            return;
          }

          const studentId = this.lastID;

          const insertUserSql = `
            INSERT INTO users (
              username,
              password_hash,
              role,
              profile_id,
              status
            )
            VALUES (?, ?, ?, ?, ?)
          `;

          db.run(
            insertUserSql,
            [
              student.studentNo,
              student.password || "123456",
              "student",
              studentId,
              "active",
            ],
            function (userErr) {
              if (userErr) {
                db.run("ROLLBACK");
                reject(userErr);
                return;
              }

              db.run("COMMIT", (commitErr) => {
                if (commitErr) {
                  db.run("ROLLBACK");
                  reject(commitErr);
                  return;
                }

                resolve({
                  id: studentId,
                  studentNo: student.studentNo,
                  name: student.name,
                });
              });
            },
          );
        },
      );
    });
  });
}

async function batchCreateStudents(students) {
  const created = [];
  const skipped = [];

  for (const item of students) {
    const studentNo = String(item.studentNo || "").trim();
    const name = String(item.name || "").trim();

    if (!studentNo || !name) {
      skipped.push({
        studentNo,
        name,
        reason: "缺少学号或姓名",
      });
      continue;
    }

    const existed = await findStudentByStudentNo(studentNo);

    if (existed) {
      skipped.push({
        studentNo,
        name,
        reason: "学号已存在",
      });
      continue;
    }

    const createdStudent = await createStudentWithAccount({
      ...item,
      studentNo,
      name,
    });

    created.push(createdStudent);
  }

  return {
    created,
    skipped,
    createdCount: created.length,
    skippedCount: skipped.length,
  };
}

function batchAddStudentsToClass(classId, studentIds) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(studentIds) || !studentIds.length) {
      resolve({
        addedCount: 0,
        skippedCount: 0,
      });
      return;
    }

    const uniqueStudentIds = Array.from(new Set(studentIds.map(Number))).filter(
      (id) => Number.isFinite(id),
    );

    let addedCount = 0;
    let skippedCount = 0;

    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      const checkSql = `
        SELECT id
        FROM class_students
        WHERE class_id = ? AND student_id = ?
        LIMIT 1
      `;

      const insertSql = `
        INSERT INTO class_students (
          class_id,
          student_id
        )
        VALUES (?, ?)
      `;

      let index = 0;

      const next = () => {
        if (index >= uniqueStudentIds.length) {
          db.run("COMMIT", (commitErr) => {
            if (commitErr) {
              db.run("ROLLBACK");
              reject(commitErr);
              return;
            }

            resolve({
              addedCount,
              skippedCount,
            });
          });
          return;
        }

        const studentId = uniqueStudentIds[index];
        index += 1;

        db.get(checkSql, [classId, studentId], (checkErr, row) => {
          if (checkErr) {
            db.run("ROLLBACK");
            reject(checkErr);
            return;
          }

          if (row) {
            skippedCount += 1;
            next();
            return;
          }

          db.run(insertSql, [classId, studentId], (insertErr) => {
            if (insertErr) {
              db.run("ROLLBACK");
              reject(insertErr);
              return;
            }

            addedCount += 1;
            next();
          });
        });
      };

      next();
    });
  });
}

module.exports = {
  getWrongQuestionsByStudentId,
  getAnswerRecordsByStudentId,
  updateWrongQuestionStatusById,

  searchStudentsByKeyword,
  batchCreateStudents,
  batchAddStudentsToClass,
};
