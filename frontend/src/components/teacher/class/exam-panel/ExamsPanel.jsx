import React, { useMemo, useState } from "react";
import { Button, Modal, Tag, Progress, message } from "antd";
import { PlusOutlined, BarChartOutlined } from "@ant-design/icons";
import PublishExamModal from "./PublishExamModal";
import ExamAnalysisModal from "../../exam-analysis/ExamAnalysisModal";
import "./exams-panel.css";
import { useExamStore } from "../../../../store";

const MOCK_QUESTION_STATS = [
  {
    id: "Q1",
    no: 1,
    stem: "以下关于 TCP 协议的说法正确的是？",
    subject: "计算机网络",
    difficulty: "简单",
    chapter: "第5章 传输层",
    source: "系统题库",
    kps: ["TCP", "传输层"],
    options: [
      { key: "A", text: "TCP是不可靠传输协议" },
      { key: "B", text: "TCP提供面向连接服务" },
      { key: "C", text: "TCP属于应用层" },
      { key: "D", text: "TCP不做流量控制" },
    ],
    correct: "B",
    accuracy: 78,
    easiestWrongOption: "A",
    easiestWrongText: "TCP是不可靠传输协议",
  },
];

const MOCK_ANALYSIS_MAP = {};

export default function ExamsPanel({ klass }) {
  const allExams = useExamStore((s) => s.exams);
  const addExam = useExamStore((s) => s.addExam);
  const deleteExam = useExamStore((s) => s.deleteExam);

  const [publishOpen, setPublishOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);

  const exams = useMemo(() => {
    const list = allExams.filter((e) => e.classId === klass.id);

    return list.map((e) => ({
      ...e,
      status: e.status === "published" ? "进行中" : "已结束",
      start: e.publishDate,
      end: e.deadline || "-",
      count: e.questionIds?.length || 0,
      done: e.doneCount || 0,
      total: klass?.studentsCount || 0,
    }));
  }, [allExams, klass]);

  const currentAnalysis = currentExam
    ? MOCK_ANALYSIS_MAP[currentExam.id] || {
        examStats: {
          submitRate: currentExam.total
            ? Math.round(((currentExam.done || 0) / currentExam.total) * 100)
            : 0,
          avgAccuracy: 72,
          minAccuracy: 35,
        },
        questionStats: MOCK_QUESTION_STATS,
        knowledgePointStats: [
          { name: "TCP", accuracy: 48 },
          { name: "IP", accuracy: 82 },
          { name: "HTTP", accuracy: 61 },
        ],
      }
    : null;

  const removeExam = (exam) => {
    Modal.confirm({
      title: "确认删除测验？",
      content: exam.title,
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => {
        deleteExam(exam.id);
        message.success("已删除测验");
      },
    });
  };

  const totalStudents = klass?.studentsCount ?? 0;

  const StatusTag = ({ v }) => {
    if (v === "进行中") return <Tag color="success">进行中</Tag>;
    return <Tag>已结束</Tag>;
  };

  return (
    <div className="ep-wrap">
      <div className="ep-head">
        <div className="ep-title">班级测验</div>
        <Button
          type="primary"
          className="ep-primary"
          icon={<PlusOutlined />}
          onClick={() => setPublishOpen(true)}
        >
          发布测验
        </Button>
      </div>

      <div className="ep-list">
        {exams.map((e) => {
          const percent = e.total ? Math.round((e.done / e.total) * 100) : 0;

          return (
            <div key={e.id} className="ep-card">
              <div className="ep-top">
                <div className="ep-name">{e.title}</div>
                <div className="ep-tags">
                  <StatusTag v={e.status} />
                </div>
              </div>

              <div className="ep-meta">
                <span>发布：{e.start}</span>
                <span>截止：{e.end}</span>
                <span>{e.count}题</span>
              </div>

              <div className="ep-progress">
                <div className="ep-progress-label">完成情况</div>
                <div className="ep-progress-row">
                  <Progress
                    className="ep-bar"
                    percent={percent}
                    showInfo={false}
                  />
                  <div className="ep-progress-num">
                    {e.done}/{e.total} ({percent}%)
                  </div>
                </div>
              </div>

              <div className="ep-actions">
                <Button
                  className="ep-ghost"
                  icon={<BarChartOutlined />}
                  onClick={() => {
                    setCurrentExam(e);
                    setAnalysisOpen(true);
                  }}
                >
                  查看分析
                </Button>

                <Button
                  danger
                  className="ep-danger"
                  onClick={() => removeExam(e)}
                >
                  删除测验
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <PublishExamModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        defaultSubject={klass?.subject || "计算机网络"}
        totalStudents={totalStudents}
        classId={klass.id}
        onPublish={(payload) => {
          addExam({
            id: Date.now(),
            title: payload.title,
            subject: payload.subject,
            teacherId: 101,
            classId: klass.id,
            publishDate: new Date().toISOString().slice(0, 10),
            deadline: payload.deadline,
            status: "published",
            questionIds: payload.questions.map((q) => q.id),
            doneCount: 0,
          });

          setPublishOpen(false);
          message.success("已发布测验");
        }}
      />

      <ExamAnalysisModal
        open={analysisOpen}
        onClose={() => {
          setAnalysisOpen(false);
          setCurrentExam(null);
        }}
        exam={currentExam}
        examStats={currentAnalysis?.examStats}
        questionStats={currentAnalysis?.questionStats || []}
        knowledgePointStats={currentAnalysis?.knowledgePointStats || []}
      />
    </div>
  );
}
