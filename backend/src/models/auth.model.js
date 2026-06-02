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

function findTeacherByTeacherNo(teacherNo) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, teacher_no, name
      FROM teachers
      WHERE teacher_no = ?
      LIMIT 1
    `;

    db.get(sql, [teacherNo], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

function findUserByRoleAndProfileId(role, profileId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, username, password_hash, role, profile_id, status
      FROM users
      WHERE role = ? AND profile_id = ?
      LIMIT 1
    `;

    db.get(sql, [role, profileId], (err, row) => {
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
        SELECT id, student_no, name, gender, phone, email, major, grade, class_name, avatar
        FROM students
        WHERE id = ?
        LIMIT 1
      `;
    } else if (role === "teacher") {
      sql = `
        SELECT id, teacher_no, name, gender, phone, email, title, department, avatar
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

function registerStudentAccount({ studentNo, name, password }) {
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
          studentNo,
          name,
          "",
          "",
          "",
          "",
          "",
          "",
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
            [studentNo, password, "student", studentId, "active"],
            function (userErr) {
              if (userErr) {
                db.run("ROLLBACK");
                reject(userErr);
                return;
              }

              const userId = this.lastID;

              db.run("COMMIT", (commitErr) => {
                if (commitErr) {
                  db.run("ROLLBACK");
                  reject(commitErr);
                  return;
                }

                resolve({
                  userId,
                  username: studentNo,
                  role: "student",
                  profileId: studentId,
                });
              });
            },
          );
        },
      );
    });
  });
}

function updateStudentProfile(profileId, data) {
  return new Promise((resolve, reject) => {
    const selectSql = `
      SELECT id, name, gender, phone, email, major, grade, class_name, avatar
      FROM students
      WHERE id = ?
      LIMIT 1
    `;

    db.get(selectSql, [profileId], (selectErr, currentRow) => {
      if (selectErr) {
        reject(selectErr);
        return;
      }

      if (!currentRow) {
        reject(new Error("学生资料不存在"));
        return;
      }

      const nextName = data.name ?? currentRow.name;
      const nextGender = data.gender ?? currentRow.gender;
      const nextPhone = data.phone ?? currentRow.phone;
      const nextEmail = data.email ?? currentRow.email;
      const nextMajor = data.major ?? currentRow.major;
      const nextGrade = data.grade ?? currentRow.grade;
      const nextClassName = data.class_name ?? currentRow.class_name;
      const nextAvatar = data.avatar ?? currentRow.avatar;

      const updateSql = `
        UPDATE students
        SET
          name = ?,
          gender = ?,
          phone = ?,
          email = ?,
          major = ?,
          grade = ?,
          class_name = ?,
          avatar = ?
        WHERE id = ?
      `;

      db.run(
        updateSql,
        [
          nextName,
          nextGender,
          nextPhone,
          nextEmail,
          nextMajor,
          nextGrade,
          nextClassName,
          nextAvatar,
          profileId,
        ],
        function (updateErr) {
          if (updateErr) {
            reject(updateErr);
            return;
          }

          resolve({
            changes: this.changes,
          });
        },
      );
    });
  });
}

function updateTeacherProfile(profileId, data) {
  return new Promise((resolve, reject) => {
    const selectSql = `
      SELECT id, name, gender, phone, email, title, department, avatar
      FROM teachers
      WHERE id = ?
      LIMIT 1
    `;

    db.get(selectSql, [profileId], (selectErr, currentRow) => {
      if (selectErr) {
        reject(selectErr);
        return;
      }

      if (!currentRow) {
        reject(new Error("教师资料不存在"));
        return;
      }

      const nextName = data.name ?? currentRow.name;
      const nextGender = data.gender ?? currentRow.gender;
      const nextPhone = data.phone ?? currentRow.phone;
      const nextEmail = data.email ?? currentRow.email;
      const nextTitle = data.title ?? currentRow.title;
      const nextDepartment = data.department ?? currentRow.department;
      const nextAvatar = data.avatar ?? currentRow.avatar;

      const updateSql = `
        UPDATE teachers
        SET
          name = ?,
          gender = ?,
          phone = ?,
          email = ?,
          title = ?,
          department = ?,
          avatar = ?
        WHERE id = ?
      `;

      db.run(
        updateSql,
        [
          nextName,
          nextGender,
          nextPhone,
          nextEmail,
          nextTitle,
          nextDepartment,
          nextAvatar,
          profileId,
        ],
        function (updateErr) {
          if (updateErr) {
            reject(updateErr);
            return;
          }

          resolve({
            changes: this.changes,
          });
        },
      );
    });
  });
}

function updateUserPassword(userId, newPassword) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE users
      SET password_hash = ?
      WHERE id = ?
    `;

    db.run(sql, [newPassword, userId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({
        changes: this.changes,
      });
    });
  });
}

module.exports = {
  findUserByUsername,
  findStudentByStudentNo,
  findTeacherByTeacherNo,
  findUserByRoleAndProfileId,
  findUserProfile,
  registerStudentAccount,
  updateStudentProfile,
  updateTeacherProfile,
  updateUserPassword,
};
