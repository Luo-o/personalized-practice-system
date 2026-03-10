import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, message } from "antd";
import StudentHeader from "./components/StudentHeader";
import ClassCard from "./components/ClassCard";
import StatsCards from "./components/StatsCards";
import StrategyCards from "./components/StrategyCards";
import QuickEntry from "./components/QuickEntry";
import PracticeDecisionModal from "../../components/student/practice-decision-modal/PracticeDecisionModal";
import { useQuestionStore } from "../../store";
import "./student-dashboard.css";

const { Content } = Layout;

function shuffleArray(arr) {
  const list = [...arr];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function pickRandom(arr, count) {
  if (count <= 0) return [];
  return shuffleArray(arr).slice(0, count);
}

export default function StudentDashboard() {
  const [open, setOpen] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const navigate = useNavigate();
  const questions = useQuestionStore((state) => state.questions);

  const handleQuickEntryNavigate = (key) => {
    switch (key) {
      case "wrongbook":
        navigate("/student/wrong-book");
        break;
      case "records":
        navigate("/student/records");
        break;
      case "profile":
        navigate("/student/profile");
        break;
      default:
        break;
    }
  };

  const generatePracticeQuestions = (cfg) => {
    let pool = questions.filter((q) => q.subject === cfg.subjectName);

    if (!cfg.includeTrue) {
      pool = pool.filter((q) => !q.isReal);
    }

    if (cfg.strategy === "chapter") {
      pool = pool.filter((q) => cfg.chapters.includes(q.chapter));
    }

    if (cfg.strategy === "knowledge") {
      pool = pool.filter((q) =>
        (q.kps || []).some((kp) => cfg.knowledgePoints.includes(kp)),
      );
    }

    if (cfg.strategy === "mix") {
      if (cfg.mixScope === "chapter") {
        pool = pool.filter((q) => cfg.chapters.includes(q.chapter));
      } else {
        pool = pool.filter((q) =>
          (q.kps || []).some((kp) => cfg.knowledgePoints.includes(kp)),
        );
      }
    }

    if (!pool.length) return [];

    let result = [];

    if (cfg.strategy === "mix" || cfg.strategy === "difficulty") {
      const [easyEnd, midEnd] = cfg.split || [0, 0];
      const easyCount = easyEnd;
      const midCount = midEnd - easyEnd;
      const hardCount = cfg.total - midEnd;

      const easyPool = pool.filter((q) => q.difficulty === "简单");
      const midPool = pool.filter((q) => q.difficulty === "中等");
      const hardPool = pool.filter((q) => q.difficulty === "困难");

      result = [
        ...pickRandom(easyPool, easyCount),
        ...pickRandom(midPool, midCount),
        ...pickRandom(hardPool, hardCount),
      ];

      if (result.length < cfg.total) {
        const pickedIds = new Set(result.map((q) => q.id));
        const remain = pool.filter((q) => !pickedIds.has(q.id));
        result = [...result, ...pickRandom(remain, cfg.total - result.length)];
      }
    } else {
      result = pickRandom(pool, cfg.total);
    }

    if (cfg.shuffle) {
      result = shuffleArray(result);
    }

    return result.slice(0, cfg.total);
  };

  const handleStartPractice = (cfg) => {
    const questionList = generatePracticeQuestions(cfg);

    if (!questionList.length) {
      message.warning("当前条件下没有可用题目");
      return;
    }

    const practiceId = `practice_${Date.now()}`;

    navigate(`/student/exam/${practiceId}`, {
      state: {
        mode: "practice",
        cfg,
        questionIds: questionList.map((q) => q.id),
        questions: questionList,
      },
    });
  };

  return (
    <Layout className="student-layout">
      <StudentHeader />
      <Content className="student-content">
        <div className="student-dashboard-grid">
          <div className="student-dashboard-left">
            <ClassCard />
            <StatsCards />
            <StrategyCards
              onSelectStrategy={(key) => {
                setStrategy(key);
                setOpen(true);
              }}
            />
            <QuickEntry onNavigate={handleQuickEntryNavigate} />
          </div>
        </div>
      </Content>

      <PracticeDecisionModal
        open={open}
        strategy={strategy}
        onClose={() => setOpen(false)}
        onStart={handleStartPractice}
      />
    </Layout>
  );
}
