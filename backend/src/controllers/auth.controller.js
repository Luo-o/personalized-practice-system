const {
  findUserByUsername,
  findUserProfile,
  updateStudentProfile,
  updateTeacherProfile,
  updateUserPassword,
} = require("../models/auth.model");

function withDefaultAvatar(user, profile) {
  if (!profile) return profile;

  if (user.role === "student") {
    return {
      ...profile,
      avatar: profile.avatar || "/avatars/default-student-avatar.svg",
    };
  }

  if (user.role === "teacher") {
    return {
      ...profile,
      avatar: profile.avatar || "/avatars/default-teacher-avatar.svg",
    };
  }

  return profile;
}

async function login(req, res) {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        message: "用户名和密码不能为空",
      });
    }

    const user = await findUserByUsername(username);

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
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        message: "缺少 username 参数",
      });
    }

    const user = await findUserByUsername(username);

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
    const { username } = req.body || {};

    if (!username) {
      return res.status(400).json({
        message: "缺少 username",
      });
    }

    const user = await findUserByUsername(username);

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
    const { username, oldPassword, newPassword } = req.body || {};

    if (!username || !oldPassword || !newPassword) {
      return res.status(400).json({
        message: "参数不完整",
      });
    }

    const user = await findUserByUsername(username);

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
  login,
  me,
  updateMyProfile,
  changePassword,
};
