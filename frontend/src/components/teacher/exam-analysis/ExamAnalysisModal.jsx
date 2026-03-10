import React, { useMemo, useState } from "react";
import { Modal, Empty, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { Column } from "@ant-design/charts";
import QuestionPreviewModal from "../question-modal/QuestionPreviewModal";
import "./exam-analysis-modal.css";

function StatCard({ label, value, type }) {
  return (
    <div className={`eam-stat-card ${type ? `is-${type}` : ""}`}>
      <div className="eam-stat-label">{label}</div>
      <div className="eam-stat-value">{value}</div>
    </div>
  );
}

export default function ExamAnalysisModal({
  open,
  onClose,
  exam,
  examStats,
  questionStats = [],
  knowledgePointStats = [],
}) {
  const submitRate = useMemo(() => {
    if (examStats?.submitRate != null) return examStats.submitRate;
    if (exam?.done != null && exam?.total) {
      return Math.round((exam.done / exam.total) * 100);
    }
    return 0;
  }, [examStats, exam]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);

  const avgAccuracy = useMemo(() => {
    if (examStats?.avgAccuracy != null) return examStats.avgAccuracy;
    if (!questionStats.length) return 0;
    return Math.round(
      questionStats.reduce((sum, q) => sum + (q.accuracy || 0), 0) /
        questionStats.length,
    );
  }, [examStats, questionStats]);

  const minAccuracy = useMemo(() => {
    if (examStats?.minAccuracy != null) return examStats.minAccuracy;
    if (!questionStats.length) return 0;
    return Math.min(...questionStats.map((q) => q.accuracy || 0));
  }, [examStats, questionStats]);

  const chartData = useMemo(() => {
    return questionStats.map((q) => ({
      question: `Q${q.no}`,
      accuracy: q.accuracy || 0,
      isLowest: (q.accuracy || 0) === minAccuracy,
    }));
  }, [questionStats, minAccuracy]);

  const columnConfig = useMemo(() => {
    return {
      data: chartData,
      xField: "question",
      yField: "accuracy",
      height: 320,
      padding: [20, 20, 40, 40],
      meta: {
        accuracy: {
          alias: "正确率",
          min: 0,
          max: 100,
          formatter: (v) => `${v}%`,
        },
      },
      color: ({ isLowest }) => (isLowest ? "#ef4444" : "#2c87ff"),
      columnStyle: {
        radius: [8, 8, 0, 0],
      },
      label: {
        position: "top",
        style: {
          fill: "#fff",
          fontWeight: 700,
        },
        formatter: (_, data) => `${data.accuracy}%`,
      },
      xAxis: {
        label: {
          style: {
            fill: "#64748b",
            fontWeight: 700,
          },
        },
        line: null,
        tickLine: null,
      },
      yAxis: {
        max: 100,
        min: 0,
        label: {
          formatter: (v) => `${v}%`,
          style: {
            fill: "#64748b",
          },
        },
        grid: {
          line: {
            style: {
              stroke: "#e5e7eb",
              lineDash: [4, 4],
            },
          },
        },
      },
      tooltip: {
        formatter: (datum) => ({
          name: "正确率",
          value: `${datum.accuracy}%`,
        }),
      },
      legend: false,
      interactions: [{ type: "active-region" }],
    };
  }, [chartData]);

  const hasData =
    !!exam ||
    !!examStats ||
    questionStats.length > 0 ||
    knowledgePointStats.length > 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1120}
      title={exam?.title ? `${exam.title} · 测验分析` : "测验分析"}
      className="eam-modal"
      destroyOnHidden
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
        },
      }}
    >
      {!hasData ? (
        <Empty description="暂无分析数据" />
      ) : (
        <div className="eam-body">
          <div className="eam-stat-grid">
            <StatCard label="提交率" value={`${submitRate}%`} type="primary" />
            <StatCard
              label="平均正确率"
              value={`${avgAccuracy}%`}
              type="success"
            />
            <StatCard
              label="最低正确率"
              value={`${minAccuracy}%`}
              type="danger"
            />
          </div>

          <div className="eam-card">
            <div className="eam-card-title">每题正确率分布</div>
            <Column {...columnConfig} />
          </div>

          <div className="eam-bottom-grid">
            <div className="eam-card">
              <div className="eam-card-title">题目最易错选项</div>
              <div className="eam-question-list">
                {questionStats.length ? (
                  questionStats.map((item, index) => (
                    <div
                      className="eam-question-item"
                      key={item.id ?? item.no ?? index}
                    >
                      <div className="eam-question-no">
                        Q{item.no ?? index + 1}
                      </div>

                      <div className="eam-question-main">
                        <div className="eam-question-head">
                          <div className="eam-question-stem">
                            {item.stem || item.title || "暂无题干"}
                          </div>

                          <Button
                            type="text"
                            className="eam-preview-btn"
                            icon={<EyeOutlined />}
                            onClick={() => {
                              setPreviewQuestion({
                                id: item.id ?? `#${item.no ?? index + 1}`,
                                title: item.title || item.stem,
                                stem: item.stem || item.title,
                                subject:
                                  item.subject || exam?.subject || "未分类",
                                difficulty: item.difficulty || "中等",
                                source: item.source || "测验题目",
                                chapter: item.chapter || "",
                                kps: item.kps || [],
                                options: item.options || [],
                                correct: item.correct || "",
                                images: item.images || [],
                              });
                              setPreviewOpen(true);
                            }}
                          />
                        </div>

                        <div className="eam-question-wrong">
                          最易错选项：
                          <span className="eam-wrong-option">
                            {item.easiestWrongOption || "-"}
                          </span>
                          {item.easiestWrongText ? (
                            <span className="eam-wrong-text">
                              {item.easiestWrongText}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="eam-empty-text">暂无题目分析数据</div>
                )}
              </div>
            </div>

            <div className="eam-card">
              <div className="eam-card-title">知识点正确率分布</div>
              <div className="eam-kp-list">
                {knowledgePointStats.length ? (
                  knowledgePointStats.map((item, index) => (
                    <div
                      className="eam-kp-item"
                      key={item.id ?? item.name ?? index}
                    >
                      <div className="eam-kp-name">{item.name}</div>

                      <div className="eam-kp-bar-wrap">
                        <div
                          className="eam-kp-bar"
                          style={{ width: `${item.accuracy ?? 0}%` }}
                        />
                      </div>

                      <div className="eam-kp-value">{item.accuracy ?? 0}%</div>
                    </div>
                  ))
                ) : (
                  <div className="eam-empty-text">暂无知识点分析数据</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <QuestionPreviewModal
        open={previewOpen}
        question={previewQuestion}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewQuestion(null);
        }}
      />
    </Modal>
  );
}
