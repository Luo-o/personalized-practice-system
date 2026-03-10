import React from "react";
import { Layout, Typography, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined, BookOutlined } from "@ant-design/icons";
import "./student-header.css";
import { APP_NAME } from "../../../constants";

const { Header } = Layout;
const { Title, Text } = Typography;

export default function StudentHeader() {
  const navigate = useNavigate();
  return (
    <Header className="student-header">
      <div className="header-content">
        <div className="header-left">
          <div
            style={{
              fontSize: 28,
              width: 44,
              height: 44,
              lineHeight: "44px",
              textAlign: "center",
              borderRadius: 8,
              color: "#fff",
              marginTop: 8,
              marginBottom: 6,
              background: "#2c87ff",
            }}
          >
            <BookOutlined style={{ fontSize: 24 }} />
          </div>
          <div className="header-info">
            <Title level={5} className="system-name">
              {APP_NAME}
            </Title>
            <Text className="welcome-text">你好，张同学</Text>
          </div>
        </div>
        <Button
          type="link"
          icon={<LogoutOutlined />}
          onClick={() => {
            localStorage.removeItem("token");

            message.success("已退出登录");

            navigate("/login");
          }}
        >
          退出登录
        </Button>
      </div>
    </Header>
  );
}
