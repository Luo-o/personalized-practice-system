import React, { useMemo, useState } from "react";
import { Select } from "antd";
import { useNavigate } from "react-router-dom";

const TAB_OPTIONS = [
  { key: "all", label: "全部" },
  { key: "exam", label: "班级测验" },
  { key: "practice", label: "自主练习" },
];

function formatDateTime(value) {
  if (!value) return "--";
  const d = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return String(value);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");

  return `${y}-${m}-${day} ${hh}:${mm}`;
}

function typeText(type) {
  return type === "practice" ? "自主练习" : "班级测验";
}

export default function RecordListSection({ records = [] }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState(undefined);

  const subjectOptions = useMemo(() => {
    const set = new Set(records.map((r) => r.subject_name || "未分类"));
    return [...set].map((name) => ({
      label: name,
      value: name,
    }));
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (activeTab !== "all" && r.normalizedType !== activeTab) {
        return false;
      }

      if (selectedSubject && r.subject_name !== selectedSubject) {
        return false;
      }

      return true;
    });
  }, [records, activeTab, selectedSubject]);

  return (
    <section className="pr-panel pr-record-panel">
      <div className="pr-record-head">
        <div className="pr-record-head-left">
          <h3 className="pr-panel-title">做题记录</h3>
          <p className="pr-panel-subtitle">查看近期完成的练习记录</p>
        </div>

        <div className="pr-record-head-right">
          <Select
            className="pr-subject-select"
            allowClear
            placeholder="筛选科目"
            value={selectedSubject}
            onChange={setSelectedSubject}
            options={subjectOptions}
          />
        </div>
      </div>

      <div className="pr-tabs">
        {TAB_OPTIONS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`pr-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pr-record-list">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <div key={record.id} className="pr-record-item">
              <div className="pr-record-main">
                <div className="pr-record-title-row">
                  <div className="pr-record-title">
                    {record.title || "未命名记录"}
                  </div>
                  <span
                    className={`pr-type-badge ${
                      record.normalizedType === "practice" ? "practice" : "exam"
                    }`}
                  >
                    {typeText(record.normalizedType)}
                  </span>
                </div>

                <div className="pr-record-meta">
                  <span className="pr-subject-badge">
                    {record.subject_name || "未分类"}
                  </span>
                  <span>{record.total_count || 0} 题</span>
                  <span className="dot">·</span>
                  <span>{record.duration_min || 0} 分钟</span>
                  <span className="dot">·</span>
                  <span>完成于 {formatDateTime(record.submitted_at)}</span>
                </div>
              </div>

              <div className="pr-record-side">
                <div className="pr-score-box">
                  <div className="pr-score-label">得分</div>
                  <div className="pr-score-value">{record.score_percent}</div>
                </div>

                <button
                  type="button"
                  className="pr-detail-btn"
                  onClick={() => navigate(`/student/records/${record.id}`)}
                >
                  查看详情
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="pr-empty">当前筛选条件下暂无做题记录</div>
        )}
      </div>
    </section>
  );
}
