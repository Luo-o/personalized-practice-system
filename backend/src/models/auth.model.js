const db = require("../config/db");

function findUserByUsername(username) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, username, password_hash, role, profile_id, status
      FROM users
      WHERE username = ?
      LIMIT 1
    `;

    db.get(sql, [username], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

function findUserProfile(role, profileId) {
  return new Promise((resolve, reject) => {
    let sql = "";

    if (role === "student") {
      sql = `
        SELECT id, student_no, name, gender, phone, email, major, grade, class_name
        FROM students
        WHERE id = ?
        LIMIT 1
      `;
    } else if (role === "teacher") {
      sql = `
        SELECT id, teacher_no, name, gender, phone, email, title, department
        FROM teachers
        WHERE id = ?
        LIMIT 1
      `;
    } else {
      resolve(null);
      return;
    }

    db.get(sql, [profileId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

module.exports = {
  findUserByUsername,
  findUserProfile,
};
