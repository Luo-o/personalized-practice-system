import React from "react";
import { Layout, Typography } from "antd";
import { BookOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import "./teacher-header.css";

const { Header } = Layout;
const { Title, Text } = Typography;

export default function TeacherHeader({ active = "bank", onChange }) {
  return (
    <Header className="teacher-header">
      <div className="teacher-header-content">
        <div className="teacher-header-left">
          <div className="teacher-header-logo">
            <BookOutlined />
          </div>

          <div className="teacher-header-info">
            <Title level={5} className="teacher-system-name">
              题库管理
            </Title>
            <Text className="teacher-welcome-text">王老师</Text>
          </div>
        </div>

        <div className="teacher-header-tabs">
          <button
            type="button"
            className={`teacher-tab ${active === "bank" ? "is-active" : ""}`}
            onClick={() => onChange?.("bank")}
          >
            <BookOutlined />
            题库
          </button>

          <button
            type="button"
            className={`teacher-tab ${active === "class" ? "is-active" : ""}`}
            onClick={() => onChange?.("class")}
          >
            <TeamOutlined />
            班级管理
          </button>

          <button
            type="button"
            className={`teacher-tab ${active === "profile" ? "is-active" : ""}`}
            onClick={() => onChange?.("profile")}
          >
            <UserOutlined />
            个人信息
          </button>
        </div>
      </div>
    </Header>
  );
}
