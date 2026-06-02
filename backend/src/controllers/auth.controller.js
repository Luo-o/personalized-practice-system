const {
  findStudentByStudentNo,
  findTeacherByTeacherNo,
  findUserByRoleAndProfileId,
  findUserProfile,
  registerStudentAccount,
  updateStudentProfile,
  updateTeacherProfile,
  updateUserPassword,
} = require("../models/auth.model");

function withDefaultAvatar(user, profile) {
  if (!profile) return profile;

  if (user.role === "student") {
    return {
      ...profile,
      avatar: profile.avatar || "/avatars/default-student-avatar.png",
    };
  }

  if (user.role === "teacher") {
    return {
      ...profile,
      avatar: profile.avatar || "/avatars/default-teacher-avatar.png",
    };
  }

  return profile;
}

async function registerStudent(req, res) {
  try {
    const { studentNo, name, password, confirmPassword } = req.body || {};

    if (!studentNo || !name || !password || !confirmPassword) {
      return res.status(400).json({
        message: "请完整填写注册信息",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "两次输入的密码不一致",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "密码长度不能少于 6 位",
      });
    }

    const existedStudent = await findStudentByStudentNo(
      String(studentNo).trim(),
    );
    if (existedStudent) {
      return res.status(400).json({
        message: "学号已存在",
      });
    }

    const result = await registerStudentAccount({
      studentNo: String(studentNo).trim(),
      name: String(name).trim(),
      password: String(password),
    });

    return res.status(201).json({
      message: "学生注册成功",
      data: result,
    });
  } catch (error) {
    console.error("学生注册失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function login(req, res) {
  try {
    const { account, password, role } = req.body || {};

    if (!account || !password || !role) {
      return res.status(400).json({
        message: "账号、密码和角色不能为空",
      });
    }

    let profile = null;
    let user = null;
    const normalizedAccount = String(account).trim();

    if (role === "student") {
      profile = await findStudentByStudentNo(normalizedAccount);
      if (!profile) {
        return res.status(401).json({
          message: "用户不存在或密码错误",
        });
      }

      user = await findUserByRoleAndProfileId("student", profile.id);
    } else if (role === "teacher") {
      profile = await findTeacherByTeacherNo(normalizedAccount);
      if (!profile) {
        return res.status(401).json({
          message: "用户不存在或密码错误",
        });
      }

      user = await findUserByRoleAndProfileId("teacher", profile.id);
    } else {
      return res.status(400).json({
        message: "非法角色类型",
      });
    }

    if (!user) {
      return res.status(401).json({
        message: "用户不存在或密码错误",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "当前账号已被禁用",
      });
    }

    if (user.password_hash !== password) {
      return res.status(401).json({
        message: "用户不存在或密码错误",
      });
    }

    return res.json({
      message: "登录成功",
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        profileId: user.profile_id,
      },
    });
  } catch (error) {
    console.error("登录失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function me(req, res) {
  try {
    const { role, profileId } = req.query;

    if (!role || !profileId) {
      return res.status(400).json({
        message: "缺少 role 或 profileId 参数",
      });
    }

    const user = await findUserByRoleAndProfileId(role, Number(profileId));

    if (!user) {
      return res.status(404).json({
        message: "用户不存在",
      });
    }

    const profile = await findUserProfile(user.role, user.profile_id);
    const normalizedProfile = withDefaultAvatar(user, profile);

    return res.json({
      message: "获取当前用户成功",
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        profileId: user.profile_id,
        status: user.status,
        profile: normalizedProfile,
      },
    });
  } catch (error) {
    console.error("获取当前用户失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function updateMyProfile(req, res) {
  try {
    const { role, profileId } = req.body || {};

    if (!role || !profileId) {
      return res.status(400).json({
        message: "缺少 role 或 profileId",
      });
    }

    const user = await findUserByRoleAndProfileId(role, Number(profileId));

    if (!user) {
      return res.status(404).json({
        message: "用户不存在",
      });
    }

    if (user.role === "student") {
      const result = await updateStudentProfile(user.profile_id, req.body);
      return res.json({
        message: "学生信息更新成功",
        data: result,
      });
    }

    if (user.role === "teacher") {
      const result = await updateTeacherProfile(user.profile_id, req.body);
      return res.json({
        message: "教师信息更新成功",
        data: result,
      });
    }

    return res.status(400).json({
      message: "当前角色不支持修改资料",
    });
  } catch (error) {
    console.error("更新个人信息失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function changePassword(req, res) {
  try {
    const { role, profileId, oldPassword, newPassword } = req.body || {};

    if (!role || !profileId || !oldPassword || !newPassword) {
      return res.status(400).json({
        message: "参数不完整",
      });
    }

    const user = await findUserByRoleAndProfileId(role, Number(profileId));

    if (!user) {
      return res.status(404).json({
        message: "用户不存在",
      });
    }

    if (user.password_hash !== oldPassword) {
      return res.status(400).json({
        message: "当前密码错误",
      });
    }

    await updateUserPassword(user.id, newPassword);

    return res.json({
      message: "密码修改成功",
    });
  } catch (error) {
    console.error("修改密码失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

module.exports = {
  registerStudent,
  login,
  me,
  updateMyProfile,
  changePassword,
};
