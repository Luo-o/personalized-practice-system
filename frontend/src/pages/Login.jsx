import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  BookOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import "./login.css";
import { APP_NAME } from "../constants";
import { useAuthStore } from "../store";

const { Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [isStudent, setIsStudent] = useState(true);
  const navigate = useNavigate();

  const login = useAuthStore((s) => s.login);

  const currentRoleText = useMemo(
    () => (isStudent ? "学生端登录" : "教师端登录"),
    [isStudent],
  );

  const switchRoleText = useMemo(
    () => (isStudent ? "切换教师端" : "切换学生端"),
    [isStudent],
  );

  const usernamePlaceholder = useMemo(
    () => (isStudent ? "请输入学生用户名" : "请输入教师用户名"),
    [isStudent],
  );

  const onFinish = async (values) => {
    const { username, password } = values;
    setLoading(true);

    try {
      const user = await login(username, password);

      if (user.role === "student") {
        message.success("学生登录成功");
        navigate("/student/dashboard");
        return;
      }

      if (user.role === "teacher") {
        message.success("教师登录成功");
        navigate("/teacher");
        return;
      }

      message.warning("登录成功，但用户角色未知");
    } catch (error) {
      message.error(error.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-panel">
        <div className="login-brand">
          <div className="login-brand-title">{APP_NAME}</div>
          <div className="login-brand-subtitle">
            Personalized Practice System
          </div>
        </div>

        <div className="login-divider">
          <span>{currentRoleText}</span>
        </div>

        <Form
          layout="vertical"
          onFinish={onFinish}
          className="login-form"
          autoComplete="off"
        >
          <Form.Item
            label="账号"
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder={usernamePlaceholder}
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="请输入密码"
            />
          </Form.Item>

          <div className="login-forgot-row">
            <button
              type="button"
              className="login-text-button"
              onClick={() => message.info("暂未开放找回密码功能")}
            >
              忘记密码？
            </button>
          </div>

          <Form.Item className="login-submit-item">
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              className="login-submit-btn"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className="login-switch-row">
          <Text className="login-switch-tip">当前为{currentRoleText}</Text>
          <button
            type="button"
            className="login-switch-link"
            onClick={() => setIsStudent((prev) => !prev)}
          >
            {switchRoleText}
          </button>
        </div>
      </div>
    </div>
  );
}
