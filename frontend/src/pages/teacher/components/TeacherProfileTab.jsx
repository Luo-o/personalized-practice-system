import React, { useState } from "react";
import { Input, Button, message, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import "./teacher-profile.css";

export default function TeacherProfileTab() {
  const navigate = useNavigate();

  // mock 用户信息
  const teacher = {
    name: "王老师",
    id: "T2025001",
  };

  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const handleChangePassword = () => {
    if (!oldPwd || !newPwd || !confirmPwd) {
      message.warning("请填写完整密码信息");
      return;
    }

    if (newPwd !== confirmPwd) {
      message.error("两次输入的新密码不一致");
      return;
    }

    if (newPwd.length < 6) {
      message.error("新密码至少6位");
      return;
    }

    // 这里未来应该调用 API
    message.success("密码修改成功");

    setOldPwd("");
    setNewPwd("");
    setConfirmPwd("");
  };

  const handleLogout = () => {
    // 清除登录信息
    localStorage.removeItem("token");

    message.success("已退出登录");

    navigate("/login");
  };

  return (
    <div className="tp-container">
      <div className="tp-card">
        <h2 className="tp-title">个人信息</h2>

        <div className="tp-row">
          <label>姓名</label>
          <Input value={teacher.name} disabled />
        </div>

        <div className="tp-row">
          <label>工号</label>
          <Input value={teacher.id} disabled />
        </div>

        <Divider />

        <h3 className="tp-subtitle">修改密码</h3>

        <div className="tp-row">
          <label>原密码</label>
          <Input.Password
            value={oldPwd}
            onChange={(e) => setOldPwd(e.target.value)}
          />
        </div>

        <div className="tp-row">
          <label>新密码</label>
          <Input.Password
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
          />
        </div>

        <div className="tp-row">
          <label>确认新密码</label>
          <Input.Password
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
          />
        </div>

        <Button
          type="primary"
          className="tp-btn"
          onClick={handleChangePassword}
        >
          修改密码
        </Button>

        <Divider />

        <div className="tp-logout">
          <Button danger onClick={handleLogout}>
            退出登录
          </Button>
        </div>
      </div>
    </div>
  );
}
