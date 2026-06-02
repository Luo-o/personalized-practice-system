import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined, IdcardOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/index";
import "./login.css";

export default function Login() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // login | register
  const [loginRole, setLoginRole] = useState("student"); // student | teacher

  const { login, registerStudent } = useAuthStore();

  const isRegister = mode === "register";
  const isStudentLogin = loginRole === "student";

  const handleLogin = async (values) => {
    try {
      const user = await login({
        account: values.account,
        password: values.password,
        role: loginRole,
      });

      message.success("登录成功");

      if (user.role === "student") {
        navigate("/student/dashboard");
      } else if (user.role === "teacher") {
        navigate("/teacher");
      } else {
        message.error("用户角色异常");
      }
    } catch (err) {
      message.error(err?.message || "登录失败");
    }
  };

  const handleRegister = async (values) => {
    try {
      if (values.password !== values.confirmPassword) {
        message.error("两次输入的密码不一致");
        return;
      }

      await registerStudent({
        studentNo: values.studentNo,
        name: values.name,
        username: values.username,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      message.success("注册成功，请登录");
      setMode("login");
      setLoginRole("student");
      form.resetFields();
    } catch (err) {
      message.error(err?.message || "注册失败");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-panel">
        <div className="login-brand">
          <div className="login-brand-title">
            {isRegister ? "注册" : "智慧练习系统"}
          </div>
          <div className="login-brand-subtitle">
            {isRegister ? "创建学生账号" : "欢迎使用系统"}
          </div>
        </div>

        {!isRegister && (
          <div className="login-role-switch">
            <button
              type="button"
              className={`login-role-btn ${isStudentLogin ? "active" : ""}`}
              onClick={() => setLoginRole("student")}
            >
              学生端
            </button>
            <span className="login-role-separator"></span>
            <button
              type="button"
              className={`login-role-btn ${!isStudentLogin ? "active" : ""}`}
              onClick={() => setLoginRole("teacher")}
            >
              教师端
            </button>
          </div>
        )}

        <Form
          form={form}
          className="login-form"
          layout="vertical"
          onFinish={isRegister ? handleRegister : handleLogin}
        >
          {isRegister && (
            <>
              <Form.Item
                label="学号"
                name="studentNo"
                rules={[{ required: true, message: "请输入学号" }]}
              >
                <Input prefix={<IdcardOutlined />} placeholder="请输入学号" />
              </Form.Item>

              <Form.Item
                label="姓名"
                name="name"
                rules={[{ required: true, message: "请输入姓名" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="请输入姓名" />
              </Form.Item>
            </>
          )}

          <Form.Item
            label={loginRole === "student" ? "学号" : "工号"}
            name="account"
            rules={[
              {
                required: true,
                message: loginRole === "student" ? "请输入学号" : "请输入工号",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={
                loginRole === "student" ? "请输入学号" : "请输入工号"
              }
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
            />
          </Form.Item>

          {isRegister && (
            <Form.Item
              label="再次确认密码"
              name="confirmPassword"
              rules={[{ required: true, message: "请再次输入密码" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请再次输入密码"
              />
            </Form.Item>
          )}

          <Form.Item className="login-submit-item">
            <Button
              type="primary"
              htmlType="submit"
              block
              className="login-submit-btn"
            >
              {isRegister
                ? "注册"
                : `进入${isStudentLogin ? "学生端" : "教师端"}`}
            </Button>
          </Form.Item>
        </Form>

        <div className="login-switch-row">
          {isRegister ? (
            <>
              <span className="login-switch-tip">已有账号？</span>
              <button
                type="button"
                className="login-switch-link"
                onClick={() => {
                  setMode("login");
                  form.resetFields();
                }}
              >
                去登录
              </button>
            </>
          ) : (
            <>
              <span className="login-switch-tip">没有账号？</span>
              <button
                type="button"
                className="login-switch-link"
                onClick={() => {
                  setMode("register");
                  setLoginRole("student");
                  form.resetFields();
                }}
              >
                注册
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
