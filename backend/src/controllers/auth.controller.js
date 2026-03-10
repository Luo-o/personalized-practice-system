const { findUserByUsername, findUserProfile } = require("../models/auth.model");

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

    return res.json({
      message: "获取当前用户成功",
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        profileId: user.profile_id,
        status: user.status,
        profile,
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

module.exports = {
  login,
  me,
};
