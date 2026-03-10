import React from "react";
import { Button } from "antd";
import { PlusOutlined, TeamOutlined, BookOutlined } from "@ant-design/icons";
import "./class-overview.css";

export default function ClassOverview({ stats, classes, onEnter, onCreate }) {
  return (
    <div className="cm-wrap">
      <div className="cm-stat-grid">
        <div className="cm-stat-card">
          <div>
            <div className="cm-stat-label">班级总数</div>
            <div className="cm-stat-value">{stats.classCount}</div>
          </div>
          <div className="cm-stat-icon">
            <TeamOutlined />
          </div>
        </div>

        <div className="cm-stat-card">
          <div>
            <div className="cm-stat-label">测验发布总数</div>
            <div className="cm-stat-value">{stats.examCount}</div>
          </div>
          <div className="cm-stat-icon is-purple">
            <BookOutlined />
          </div>
        </div>
      </div>

      <div className="cm-head">
        <div className="cm-title">我的班级</div>
        <Button
          type="primary"
          className="cm-primary"
          icon={<PlusOutlined />}
          onClick={onCreate}
        >
          创建班级
        </Button>
      </div>

      <div className="cm-grid">
        {classes.map((c) => (
          <div key={c.id} className="cm-card">
            <div className="cm-card-top">
              <div className="cm-card-head-row">
                <div className="cm-card-name">{c.name}</div>
                <div className="cm-card-subject-tag">
                  {c.subject || "未设置"}
                </div>
              </div>

              <div className="cm-card-meta">
                <TeamOutlined />
                <span>{c.studentsCount || 0} 名学生</span>
              </div>
            </div>

            <div className="cm-card-body">
              <div className="cm-row">
                <span className="cm-muted">已发布测验</span>
                <span className="cm-big">{c.examsCount || 0}</span>
              </div>

              <div className="cm-latest">
                <div className="cm-muted">最新测验</div>
                <div className="cm-latest-box">
                  {c.latestExam ? (
                    <>
                      <div className="cm-latest-title">
                        {c.latestExam.title}
                      </div>
                      <div className="cm-latest-date">{c.latestExam.date}</div>
                    </>
                  ) : (
                    <div className="cm-muted">暂无</div>
                  )}
                </div>
              </div>
            </div>

            <button
              className="cm-enter"
              type="button"
              onClick={() => onEnter(c.id)}
            >
              进入班级 →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
