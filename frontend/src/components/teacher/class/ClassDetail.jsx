import React, { useState } from "react";
import { ArrowLeftOutlined, DotChartOutlined } from "@ant-design/icons";
import StudentsPanel from "./student-panel/StudentsPanel";
import ExamsPanel from "./exam-panel/ExamsPanel";
import KnowledgeBubbleMap from "../../student/knowledge-bubble-map/KnowledgeBubbleMap";
import "./class-detail.css";

const MOCK_KNOWLEDGE_DATA = {
  计算机网络: [
    { id: "k1", name: "OSI模型", accuracy: 0.82, size: 26 },
    { id: "k2", name: "物理层", accuracy: 0.63, size: 34 },
    { id: "k3", name: "数据链路层", accuracy: 0.58, size: 30 },
    { id: "k4", name: "网络层", accuracy: 0.76, size: 22 },
    { id: "k5", name: "传输层", accuracy: 0.47, size: 40 },
    { id: "k6", name: "应用层", accuracy: 0.72, size: 24 },
  ],
  数据结构: [
    { id: "d1", name: "线性表", accuracy: 0.74, size: 24 },
    { id: "d2", name: "栈", accuracy: 0.68, size: 28 },
    { id: "d3", name: "队列", accuracy: 0.61, size: 22 },
    { id: "d4", name: "树", accuracy: 0.56, size: 36 },
    { id: "d5", name: "图", accuracy: 0.49, size: 40 },
  ],
};

export default function ClassDetail({ klass, onBack }) {
  const [tab, setTab] = useState("students");
  const [bubbleOpen, setBubbleOpen] = useState(false);

  const subject = klass.subject || "计算机网络";

  return (
    <div className="cd-page">
      <div className="cd-head">
        <button type="button" className="cd-back" onClick={onBack}>
          <ArrowLeftOutlined />
        </button>

        <div className="cd-titlebox">
          <div className="cd-title">{klass.name}</div>
          <div className="cd-sub">{klass.studentsCount || 0}名学生</div>
        </div>
      </div>

      <div className="cd-tabs">
        <button
          className={`cd-tab ${tab === "students" ? "is-active" : ""}`}
          onClick={() => setTab("students")}
        >
          学生管理
        </button>

        <button
          className={`cd-tab ${tab === "exams" ? "is-active" : ""}`}
          onClick={() => setTab("exams")}
        >
          测验管理
        </button>

        <button
          type="button"
          className="cd-analysis-btn"
          onClick={() => setBubbleOpen(true)}
        >
          <DotChartOutlined />
          掌握情况分析
        </button>
      </div>

      {tab === "students" ? <StudentsPanel klass={klass} /> : null}
      {tab === "exams" ? <ExamsPanel klass={klass} /> : null}

      <KnowledgeBubbleMap
        open={bubbleOpen}
        onClose={() => setBubbleOpen(false)}
        data={MOCK_KNOWLEDGE_DATA[subject] || []}
        width={1200}
        height={760}
        title={`${subject} 知识点掌握情况`}
        subjects={[{ value: subject, label: subject }]}
        subject={subject}
        onChangeSubject={() => {}}
        overlay
      />
    </div>
  );
}
