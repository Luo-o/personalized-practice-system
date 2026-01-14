// src/pages/student/ProfilePage.jsx
import React from "react"
import { useNavigate } from "react-router-dom"
import {
  UserOutlined,
  ReadOutlined,
  BarChartOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  TeamOutlined,
  LogoutOutlined,
} from "@ant-design/icons"

import PageHeader from "../../components/PageHeader"
import "./profile-page.css"

function EntryCard({ icon, title, desc, onClick, tone = "gray" }) {
  return (
    <button
      type="button"
      className={`pc-entry-card tone-${tone}`}
      onClick={onClick}
    >
      <div className="pc-entry-icon">{icon}</div>
      <div className="pc-entry-text">
        <div className="pc-entry-title">{title}</div>
        <div className="pc-entry-desc">{desc}</div>
      </div>
    </button>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()

  // 你后续可以从接口拿
  const user = {
    name: "张同学",
    studentId: "202401001",
    className: "计算机2024-1班",
    stats: [
      { label: "累计刷题", value: "156" },
      { label: "连续打卡", value: "7" },
      { label: "学习时长", value: "18h" },
    ],
  }

  return (
    <div className="pc-page">
      <PageHeader
        title="个人中心"
        icon={
          <div className="pc-ph-icon">
            <UserOutlined />
          </div>
        }
      />

      <div className="pc-wrap">
        {/* 顶部个人信息大卡 */}
        <div className="pc-hero">
          <div className="pc-hero-head">
            <div className="pc-avatar">
              <UserOutlined />
            </div>

            <div className="pc-user">
              <div className="pc-user-name">{user.name}</div>
              <div className="pc-user-meta">学号: {user.studentId}</div>
              <div className="pc-user-meta">班级: {user.className}</div>
            </div>
          </div>

          <div className="pc-hero-stats">
            {user.stats.map((s, idx) => (
              <div key={s.label} className="pc-stat">
                <div className="pc-stat-value">{s.value}</div>
                <div className="pc-stat-label">{s.label}</div>
                {idx !== user.stats.length - 1 ? (
                  <div className="pc-stat-split" />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* 功能入口（不含“我的成就”“通知提醒”） */}
        <div className="pc-grid">
          <EntryCard
            tone="blue"
            icon={<TeamOutlined />}
            title="我的班级"
            desc="查看班级与测验"
            onClick={() => navigate("/student/class-list")}
          />
          <EntryCard
            tone="purple"
            icon={<BookOutlined />}
            title="知识地图"
            desc="查看掌握情况"
            onClick={() => navigate("/student/knowledge-map")}
          />
          <EntryCard
            tone="red"
            icon={<ReadOutlined />}
            title="我的错题本"
            desc="23道题待复习"
            onClick={() => navigate("/student/wrong-book")}
          />
          <EntryCard
            tone="sky"
            icon={<BarChartOutlined />}
            title="刷题记录"
            desc="查看学习数据"
            onClick={() => navigate("/student/practice-records")}
          />
          <EntryCard
            tone="gray"
            icon={<SettingOutlined />}
            title="账号设置"
            desc="修改个人信息"
            onClick={() => navigate("/student/account")}
          />
          <EntryCard
            tone="green"
            icon={<QuestionCircleOutlined />}
            title="帮助中心"
            desc="使用指南与反馈"
            onClick={() => navigate("/student/help")}
          />
        </div>

        {/* 退出登录 */}
        <button
          type="button"
          className="pc-logout"
          onClick={() => navigate("/login")}
        >
          <LogoutOutlined />
          <span>退出登录</span>
        </button>

        <div className="pc-footer">智慧刷题系统 v1.0.0</div>
      </div>
    </div>
  )
}
