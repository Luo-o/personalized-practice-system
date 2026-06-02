import React, { useMemo } from "react";
import { Avatar, Button, Empty, Input, Tabs } from "antd";
import {
  PlusOutlined,
  TeamOutlined,
  BookOutlined,
  UserOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import "./class-overview.css";

export default function ClassOverview({
  stats,
  classes,
  loading,
  keyword,
  onKeywordChange,
  onEnter,
  onCreate,
  teacherName,
  teacherTitle,
  teacherAvatar,
  onStudentManage,
}) {
  const avatarText = useMemo(() => {
    return teacherName?.trim()?.charAt(0) || "师";
  }, [teacherName]);

  return (
    <div className="tcl-page">
      <div className="tcl-container">
        <div className="tcl-profile-card">
          <div className="tcl-profile-left">
            <Avatar
              className="tcl-profile-avatar"
              size={96}
              src={teacherAvatar}
              icon={<UserOutlined />}
            >
              {avatarText}
            </Avatar>

            <div className="tcl-profile-user">
              <div className="tcl-profile-name">{teacherName}</div>
              <div className="tcl-profile-title">{teacherTitle}</div>
            </div>
          </div>

          <div className="tcl-profile-right">
            <div className="tcl-profile-metric">
              <div className="tcl-profile-metric-icon is-blue">
                <TeamOutlined />
              </div>
              <div className="tcl-profile-metric-text">
                <div className="tcl-profile-metric-label">班级总数</div>
                <div className="tcl-profile-metric-value">
                  {stats?.classCount ?? 0}
                </div>
              </div>
            </div>

            <div className="tcl-profile-metric">
              <div className="tcl-profile-metric-icon is-purple">
                <BookOutlined />
              </div>
              <div className="tcl-profile-metric-text">
                <div className="tcl-profile-metric-label">测验总数</div>
                <div className="tcl-profile-metric-value">
                  {stats?.examCount ?? 0}
                </div>
              </div>
            </div>

            <div className="tcl-profile-metric">
              <div className="tcl-profile-metric-icon is-cyan">
                <UserOutlined />
              </div>
              <div className="tcl-profile-metric-text">
                <div className="tcl-profile-metric-label">学生总数</div>
                <div className="tcl-profile-metric-value">
                  {stats?.studentCount ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="tcl-main-panel">
          <div className="tcl-toolbar">
            <Tabs
              activeKey="class-list"
              className="tcl-tabs"
              items={[
                {
                  key: "class-list",
                  label: "班级列表",
                },
              ]}
            />

            <div className="tcl-toolbar-actions">
              <Input
                allowClear
                value={keyword}
                onChange={(e) => onKeywordChange?.(e.target.value)}
                prefix={<SearchOutlined />}
                placeholder="请搜索班级"
                className="tcl-search-input"
              />

              <Button
                type="default"
                icon={<PlusOutlined />}
                className="tcl-create-btn"
                onClick={onCreate}
              >
                创建班级
              </Button>

              <Button
                type="default"
                icon={<PlusOutlined />}
                className="tcl-create-btn"
                onClick={onStudentManage}
              >
                学生管理
              </Button>
            </div>
          </div>

          <div className="tcl-card-grid">
            {!loading && classes?.length > 0 ? (
              classes.map((c) => (
                <div
                  key={c.id}
                  className="course-card"
                  onClick={() => onEnter(c.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onEnter(c.id);
                  }}
                >
                  <div className="course-card-cover-wrap">
                    <img
                      className="course-card-cover"
                      src={c.cover}
                      alt={c.name}
                    />
                    <div className="course-card-subject-bar">
                      {c.desc || "暂无班级简介"}
                    </div>
                  </div>

                  <div className="course-card-body">
                    <div className="course-card-title-row">
                      <div className="course-card-title" title={c.name}>
                        {c.name}
                      </div>
                    </div>

                    <div className="course-card-teacher">
                      最新测验：
                      {c.latestExam?.title || "暂无"}
                    </div>

                    <div className="course-card-subject">
                      科目：{c.subject || "未设置科目"}
                    </div>

                    <div className="course-card-footer">
                      <div className="course-card-students">
                        <TeamOutlined />
                        <span>{c.studentsCount || 0}人</span>
                      </div>

                      {(c.examsCount || 0) > 0 && (
                        <div className="course-card-badge">
                          已发布 {c.examsCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="tcl-empty-wrap">
                <Empty
                  description={
                    keyword?.trim() ? "没有搜索到相关班级" : "当前还没有班级"
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
