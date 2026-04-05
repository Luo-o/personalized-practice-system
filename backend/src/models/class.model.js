const db = require("../config/db");

const CLASS_COVER_LIST = [
  "/images/class-cover-1.png",
  "/images/class-cover-2.png",
  "/images/class-cover-3.png",
  "/images/class-cover-4.png",
];

function pickRandomCover() {
  const index = Math.floor(Math.random() * CLASS_COVER_LIST.length);
  return CLASS_COVER_LIST[index];
}

function generateClassCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CLS${Date.now().toString().slice(-6)}${random}`;
}

function getAllClasses() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        c.id,
        c.name,
        c.teacher_id,
        c.subject_id,
        c.description,
        c.class_code,
        c.cover,
        c.created_at,
        c.updated_at,
        t.name AS teacher_name,
        t.avatar AS teacher_avatar,
        s.name AS subject_name,
        COUNT(cs.student_id) AS student_count
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN class_students cs ON c.id = cs.class_id
      GROUP BY c.id
      ORDER BY c.id ASC
    `;

    db.all(sql, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function getClassById(classId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        c.id,
        c.name,
        c.teacher_id,
        c.subject_id,
        c.description,
        c.class_code,
        c.cover,
        c.created_at,
        c.updated_at,
        t.name AS teacher_name,
        t.avatar AS teacher_avatar,
        s.name AS subject_name,
        COUNT(cs.student_id) AS student_count
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN class_students cs ON c.id = cs.class_id
      WHERE c.id = ?
      GROUP BY c.id
      LIMIT 1
    `;

    db.get(sql, [classId], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function getStudentById(studentId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT id, student_no, name, major, grade, avatar
      FROM students
      WHERE id = ?
      LIMIT 1
      `,
      [studentId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      },
    );
  });
}

function getStudentsByClassId(classId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        s.id,
        s.student_no,
        s.name,
        s.gender,
        s.phone,
        s.email,
        s.major,
        s.grade,
        s.class_name,
        s.avatar,
        cs.joined_at,
        COUNT(DISTINCT e.id) AS total_exam_count,
        COUNT(DISTINCT CASE WHEN sub.id IS NOT NULL THEN e.id END) AS finished_exam_count
      FROM class_students cs
      INNER JOIN students s ON cs.student_id = s.id
      LEFT JOIN exams e
        ON e.class_id = cs.class_id
      LEFT JOIN submissions sub
        ON sub.exam_id = e.id
       AND sub.student_id = s.id
       AND (sub.type = 'exam' OR sub.type IS NULL)
      WHERE cs.class_id = ?
      GROUP BY s.id
      ORDER BY s.id ASC
    `;

    db.all(sql, [classId], (err, rows) => {
      if (err) return reject(err);

      const list = (rows || []).map((row) => {
        const totalExamCount = Number(row.total_exam_count || 0);
        const finishedExamCount = Number(row.finished_exam_count || 0);
        const completionRate =
          totalExamCount > 0
            ? Math.round((finishedExamCount / totalExamCount) * 100)
            : 0;

        return {
          ...row,
          total_exam_count: totalExamCount,
          finished_exam_count: finishedExamCount,
          completion_rate: completionRate,
        };
      });

      resolve(list);
    });
  });
}

function getClassesByStudentId(studentId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        c.id,
        c.name,
        c.teacher_id,
        c.subject_id,
        c.description,
        c.class_code,
        c.cover,
        c.created_at,
        c.updated_at,
        t.name AS teacher_name,
        t.avatar AS teacher_avatar,
        sub.name AS subject_name,
        COUNT(cs2.student_id) AS student_count
      FROM class_students cs
      INNER JOIN classes c ON cs.class_id = c.id
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN subjects sub ON c.subject_id = sub.id
      LEFT JOIN class_students cs2 ON c.id = cs2.class_id
      WHERE cs.student_id = ?
      GROUP BY c.id
      ORDER BY c.id ASC
    `;

    db.all(sql, [studentId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function getClassesByTeacherId(teacherId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        c.id,
        c.name,
        c.teacher_id,
        c.subject_id,
        c.description,
        c.class_code,
        c.cover,
        c.created_at,
        c.updated_at,
        t.name AS teacher_name,
        t.avatar AS teacher_avatar,
        s.name AS subject_name,
        COUNT(cs.student_id) AS student_count
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN class_students cs ON c.id = cs.class_id
      WHERE c.teacher_id = ?
      GROUP BY c.id
      ORDER BY c.id ASC
    `;

    db.all(sql, [teacherId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function getClassByCode(classCode) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT *
      FROM classes
      WHERE class_code = ?
      LIMIT 1
      `,
      [classCode],
      (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      },
    );
  });
}

function getClassStudentRelation(classId, studentId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT *
      FROM class_students
      WHERE class_id = ? AND student_id = ?
      LIMIT 1
      `,
      [classId, studentId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      },
    );
  });
}

function createClass({ id, name, teacher_id, subject_id, description }) {
  return new Promise(async (resolve, reject) => {
    try {
      const finalId = Number(id || Date.now());
      const class_code = generateClassCode();
      const cover = pickRandomCover();
      const created_at = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const updated_at = created_at;

      const sql = `
        INSERT INTO classes (
          id,
          name,
          teacher_id,
          subject_id,
          description,
          class_code,
          cover,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(
        sql,
        [
          finalId,
          name,
          teacher_id,
          subject_id,
          description || "",
          class_code,
          cover,
          created_at,
          updated_at,
        ],
        function (err) {
          if (err) return reject(err);
          resolve({
            id: finalId,
            class_code,
            cover,
          });
        },
      );
    } catch (error) {
      reject(error);
    }
  });
}

function addStudentToClass({ classId, studentId }) {
  return new Promise(async (resolve, reject) => {
    try {
      const classInfo = await getClassById(classId);
      if (!classInfo) {
        return reject(new Error("班级不存在"));
      }

      const studentInfo = await getStudentById(studentId);
      if (!studentInfo) {
        return reject(new Error("学生不存在"));
      }

      const existed = await getClassStudentRelation(classId, studentId);
      if (existed) {
        return reject(new Error("该学生已在班级中"));
      }

      const joined_at = new Date().toISOString().slice(0, 19).replace("T", " ");

      db.run(
        `
        INSERT INTO class_students (class_id, student_id, joined_at)
        VALUES (?, ?, ?)
        `,
        [classId, studentId, joined_at],
        function (err) {
          if (err) return reject(err);
          resolve({
            success: true,
            class_id: classId,
            student_id: studentId,
            joined_at,
          });
        },
      );
    } catch (error) {
      reject(error);
    }
  });
}

function removeStudentFromClass({ classId, studentId }) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      DELETE FROM class_students
      WHERE class_id = ? AND student_id = ?
      `,
      [classId, studentId],
      function (err) {
        if (err) return reject(err);
        if (this.changes === 0) {
          return reject(new Error("该学生不在当前班级中"));
        }
        resolve({ success: true });
      },
    );
  });
}

function joinClassByCode({ classCode, studentId }) {
  return new Promise(async (resolve, reject) => {
    try {
      const classInfo = await getClassByCode(classCode);
      if (!classInfo) {
        return reject(new Error("班级不存在，请检查课程号"));
      }

      const existed = await getClassStudentRelation(classInfo.id, studentId);
      if (existed) {
        return reject(new Error("你已加入该班级"));
      }

      const joined_at = new Date().toISOString().slice(0, 19).replace("T", " ");

      db.run(
        `
        INSERT INTO class_students (class_id, student_id, joined_at)
        VALUES (?, ?, ?)
        `,
        [classInfo.id, studentId, joined_at],
        function (err) {
          if (err) return reject(err);
          resolve(classInfo);
        },
      );
    } catch (error) {
      reject(error);
    }
  });
}

function quitClass({ classId, studentId }) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      DELETE FROM class_students
      WHERE class_id = ? AND student_id = ?
      `,
      [classId, studentId],
      function (err) {
        if (err) return reject(err);
        if (this.changes === 0) {
          return reject(new Error("你当前不在该班级中"));
        }
        resolve({ success: true });
      },
    );
  });
}

module.exports = {
  getAllClasses,
  getClassById,
  getStudentById,
  getStudentsByClassId,
  getClassesByStudentId,
  getClassesByTeacherId,
  getClassByCode,
  getClassStudentRelation,
  createClass,
  addStudentToClass,
  removeStudentFromClass,
  joinClassByCode,
  quitClass,
};
