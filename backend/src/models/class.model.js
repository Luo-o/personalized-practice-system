const db = require("../config/db");

function getAllClasses() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        c.id,
        c.name,
        c.teacher_id,
        c.subject_id,
        c.description,
        c.created_at,
        c.updated_at,
        t.name AS teacher_name,
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
      if (err) {
        reject(err);
        return;
      }
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
        c.created_at,
        c.updated_at,
        t.name AS teacher_name,
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
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
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
        cs.joined_at
      FROM class_students cs
      INNER JOIN students s ON cs.student_id = s.id
      WHERE cs.class_id = ?
      ORDER BY s.id ASC
    `;

    db.all(sql, [classId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
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
        c.created_at,
        c.updated_at,
        t.name AS teacher_name,
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
      if (err) {
        reject(err);
        return;
      }
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
        c.created_at,
        c.updated_at,
        t.name AS teacher_name,
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
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

module.exports = {
  getAllClasses,
  getClassById,
  getStudentsByClassId,
  getClassesByStudentId,
  getClassesByTeacherId,
};
