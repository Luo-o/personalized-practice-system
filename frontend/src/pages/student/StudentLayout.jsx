import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import StudentHeader from "./components/StudentHeader";
import "./student-layout.css";

const { Content } = Layout;

export default function StudentLayout() {
  return (
    <Layout className="student-shell">
      <StudentHeader />
      <Layout className="student-shell-main">
        <Content className="student-shell-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
