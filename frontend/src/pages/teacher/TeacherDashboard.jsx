import React, { useState } from "react";
import { BookOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import "./teacher-dashboard.css";

import TeacherBankTab from "./components/TeacherBankTab";
import TeacherClassTab from "./components/TeacherClassTab";
import TeacherProfileTab from "./components/TeacherProfileTab";

export default function TeacherDashboard() {
  const [topTab, setTopTab] = useState("bank"); // bank | class | profile

  return (
    <div className="td-page">
      <div className="td-header">
        <div className="td-header-inner">
          <div className="td-brand">
            <div className="td-logo">
              <BookOutlined />
            </div>
            <div>
              <div className="td-title">题库管理</div>
              <div className="td-subtitle">王老师</div>
            </div>
          </div>

          <div className="td-top-tabs">
            <button
              type="button"
              className={`td-top-tab ${topTab === "bank" ? "is-active" : ""}`}
              onClick={() => setTopTab("bank")}
            >
              <BookOutlined />
              题库
            </button>

            <button
              type="button"
              className={`td-top-tab ${topTab === "class" ? "is-active" : ""}`}
              onClick={() => setTopTab("class")}
            >
              <TeamOutlined />
              班级管理
            </button>

            <button
              type="button"
              className={`td-top-tab ${topTab === "profile" ? "is-active" : ""}`}
              onClick={() => setTopTab("profile")}
            >
              <UserOutlined />
              个人信息
            </button>
          </div>
        </div>
      </div>

      <div className="td-body">
        {topTab === "bank" ? <TeacherBankTab /> : null}
        {topTab === "class" ? <TeacherClassTab /> : null}
        {topTab === "profile" ? <TeacherProfileTab /> : null}
      </div>
    </div>
  );
}
