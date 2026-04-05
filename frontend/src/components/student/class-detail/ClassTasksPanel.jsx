import React, { useMemo, useState } from "react";
import { Empty } from "antd";
import { useNavigate } from "react-router-dom";

const TAB_OPTIONS = [
  { key: "all", label: "全部测验" },
  { key: "pending", label: "待完成测验" },
  { key: "finished", label: "已完成测验" },
];

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
}

export default function ClassTasksPanel({ classInfo, classExams = [] }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const tableData = useMemo(() => {
    let list = classExams;

    if (activeTab === "pending") {
      list = classExams.filter(
        (item) => Number(item.hasSubmitted ?? item.isFinished ?? 0) !== 1,
      );
    } else if (activeTab === "finished") {
      list = classExams.filter(
        (item) => Number(item.hasSubmitted ?? item.isFinished ?? 0) === 1,
      );
    }

    return list.map((item, index) => ({
      key: item.id ?? index,
      id: item.id,
      submissionId: item.submissionId ?? null,
      title: item.title || `测验${index + 1}`,
      questionCount: item.questionCount || item.totalQuestions || 0,
      duration: item.duration || item.durationMin || 0,
      deadlineAt: item.deadlineAt,
      hasSubmitted: Number(item.hasSubmitted ?? item.isFinished ?? 0) === 1,
    }));
  }, [classExams, activeTab]);

  return (
    <div className="class-panel class-panel--fill">
      <div className="class-panel-header">
        <div className="class-panel-title">作业任务</div>
        <div className="class-panel-sub">
          {classInfo.className} 当前共有 {classExams.length} 项测验
        </div>
      </div>

      <div className="class-line-tabs">
        {TAB_OPTIONS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`class-line-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="class-table-panel class-table-panel--fill">
        <div className="class-table-wrap">
          <table className="class-table">
            <thead>
              <tr>
                <th>标题</th>
                <th>题目数</th>
                <th>限制时间</th>
                <th>截止时间</th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>
              {tableData.length > 0 ? (
                tableData.map((item) => (
                  <tr key={item.key}>
                    <td className="class-table-cell-title">{item.title}</td>
                    <td>{item.questionCount}题</td>
                    <td>{item.duration}分钟</td>
                    <td>{formatDateTime(item.deadlineAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="class-table-link"
                        onClick={() => {
                          if (item.hasSubmitted) {
                            navigate(`/student/records/${item.submissionId}`);
                          } else {
                            navigate(`/student/exam/${item.id}`);
                          }
                        }}
                      >
                        {item.hasSubmitted ? "查看测验" : "进入测验"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <div className="class-table-empty">
                      <Empty description="老师还没有发布任务，敬请期待吧！" />
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="class-table-footer">
          <span>共 {tableData.length} 条</span>
          <div className="class-table-pagination">
            <button type="button" className="page-btn" disabled>
              ‹
            </button>
            <button type="button" className="page-btn active">
              1
            </button>
            <button type="button" className="page-btn" disabled>
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
