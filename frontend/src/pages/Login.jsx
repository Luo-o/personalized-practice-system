import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Checkbox, Typography, message } from "antd";
import { UserOutlined, LockOutlined, BookOutlined } from "@ant-design/icons";
import "./login.css";
import { APP_NAME } from "../constants";
import { useAuthStore } from "../store";

const { Text, Link } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [isStudent, setIsStudent] = useState(true);
  const navigate = useNavigate();

  const login = useAuthStore((s) => s.login);

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
        navigate("/teacher/dashboard");
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
      <div
        style={{
          fontSize: 40,
          width: 64,
          height: 64,
          lineHeight: "64px",
          textAlign: "center",
          borderRadius: 8,
          color: "#fff",
          marginBottom: 8,
          background: "#2c87ff",
        }}
      >
        <BookOutlined />
      </div>

      <div className="login-title">{APP_NAME}</div>
      <div className="login-subtitle">
        {isStudent ? "学生登录" : "教师登录"}
      </div>

      <div className="login-box">
        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={isStudent ? "请输入学生用户名" : "请输入教师用户名"}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Checkbox defaultChecked>记住我</Checkbox>
              <Link>忘记密码？</Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Text type="secondary">
              {isStudent ? "教师登录？" : "学生登录？"}
              <Link
                onClick={() => setIsStudent(!isStudent)}
                style={{ marginLeft: 4 }}
              >
                点击切换
              </Link>
            </Text>
          </Form.Item>

          <Form.Item style={{ marginTop: 12, marginBottom: 0 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              当前后端登录请使用用户名，例如：student1 / teacher1
            </Text>
          </Form.Item>
        </Form>
      </div>

      <Text type="secondary" style={{ marginTop: 48, fontSize: 12 }}>
        © 2026 {APP_NAME}
      </Text>
    </div>
  );
}
