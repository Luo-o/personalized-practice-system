import React, { useEffect, useState, useMemo } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import StrategyCards from "../components/StrategyCards";
import PendingCard from "../../../components/student/pending-card/PendingCard";
import PracticeDecisionModal from "../../../components/student/practice-decision-modal/PracticeDecisionModal";
import QuickAccessGrid from "../components/quick-access/QuickAccessGrid";
import KnowledgeBubbleCard from "../components/knowledge-bubble-card/KnowledgeBubbleCard";
import KnowledgeBubbleMap from "../../../components/student/knowledge-bubble-map/KnowledgeBubbleMap";
import {
  useAnswerRecordStore,
  useQuestionStore,
  useExamStore,
  useSubmissionStore,
  usePracticeStore,
  useAuthStore,
  useStudentStore,
} from "../../../store";
import "./student-dashboard.css";
import StatsCards from "../components/StatsCards";

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/[:：]/g, "")
    .trim();
}

function readQuestionSubject(q) {
  return q.subjectName || q.subject || "";
}

function buildKnowledgeMapData(questions, answerRecords, subjectName) {
  const questionMap = new Map((questions || []).map((q) => [Number(q.id), q]));

  const chapterMap = new Map();
  const knowledgeMap = new Map();

  (answerRecords || []).forEach((record) => {
    const q = questionMap.get(Number(record.questionId));
    if (!q) return;

    const qSubject = readQuestionSubject(q);
    if (subjectName && normalizeText(qSubject) !== normalizeText(subjectName)) {
      return;
    }

    const chapterId = String(q.chapterId || "unknown");
    const chapterName = q.chapterName || `章节 ${chapterId}`;

    // ===== 1. 章节统计 =====
    if (!chapterMap.has(chapterId)) {
      chapterMap.set(chapterId, {
        id: chapterId,
        name: chapterName,
        type: "chapter",
        total: 0,
        correct: 0,
      });
    }

    const chapter = chapterMap.get(chapterId);
    chapter.total += 1;
    if (Number(record.isCorrect) === 1) {
      chapter.correct += 1;
    }

    // ===== 2. 知识点统计 =====
    const kpList = Array.isArray(q.knowledgePoints) ? q.knowledgePoints : [];

    kpList.forEach((kp) => {
      const kpId = String(kp.id ?? kp.name);

      if (!knowledgeMap.has(kpId)) {
        knowledgeMap.set(kpId, {
          id: kpId,
          name: kp.name || "未命名知识点",
          type: "knowledge",
          chapterId, // 🔥 关键
          total: 0,
          correct: 0,
        });
      }

      const item = knowledgeMap.get(kpId);
      item.total += 1;

      if (Number(record.isCorrect) === 1) {
        item.correct += 1;
      }
    });
  });

  // ===== 3. 转换成图数据 =====
  const chapters = Array.from(chapterMap.values()).map((c) => ({
    id: `chapter_${c.id}`,
    name: c.name,
    type: "chapter",
    accuracy: c.total ? c.correct / c.total : 0,
  }));

  const knowledge = Array.from(knowledgeMap.values()).map((k) => ({
    id: `kp_${k.id}`,
    name: k.name,
    type: "knowledge",
    chapterId: `chapter_${k.chapterId}`, // 🔥 对应章节
    accuracy: k.total ? k.correct / k.total : 0,
  }));

  return [...chapters, ...knowledge];
}
export default function StudentDashboard() {
  const [open, setOpen] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [masteryOpen, setMasteryOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");

  const navigate = useNavigate();

  const questions = useQuestionStore((state) => state.questions);
  const fetchQuestions = useQuestionStore((state) => state.fetchQuestions);

  const answerRecords = useAnswerRecordStore((state) => state.answerRecords);
  const wrongQuestions = useAnswerRecordStore((state) => state.wrongQuestions);
  const fetchStudentAnswerRecords = useAnswerRecordStore(
    (state) => state.fetchStudentAnswerRecords,
  );
  const fetchWrongQuestions = useAnswerRecordStore(
    (state) => state.fetchWrongQuestions,
  );

  const exams = useExamStore((state) => state.exams);
  const fetchStudentExams = useExamStore((state) => state.fetchStudentExams);

  const submissions = useSubmissionStore((state) => state.submissions);
  const fetchSubmissions = useSubmissionStore(
    (state) => state.fetchSubmissions,
  );

  useEffect(() => {
    fetchQuestions();
    fetchStudentAnswerRecords();
    fetchWrongQuestions();
    fetchStudentExams();
    fetchSubmissions();
  }, [
    fetchQuestions,
    fetchStudentAnswerRecords,
    fetchWrongQuestions,
    fetchStudentExams,
    fetchSubmissions,
  ]);

  const subjectOptions = useMemo(() => {
    const map = new Map();

    (questions || []).forEach((q) => {
      const subjectName = readQuestionSubject(q);
      if (!subjectName) return;

      const key = normalizeText(subjectName);
      if (!map.has(key)) {
        map.set(key, {
          label: subjectName,
          value: subjectName,
        });
      }
    });

    return Array.from(map.values());
  }, [questions]);

  useEffect(() => {
    if (!selectedSubject && subjectOptions.length > 0) {
      setSelectedSubject(subjectOptions[0].value);
    }
  }, [selectedSubject, subjectOptions]);

  const masteryData = useMemo(() => {
    if (!selectedSubject) return [];
    return buildKnowledgeMapData(questions, answerRecords, selectedSubject);
  }, [questions, answerRecords, selectedSubject]);

  const dashboardSummary = useMemo(() => {
    const pendingExamCount = (exams || []).filter(
      (e) => Number(e.hasSubmitted ?? e.has_submitted ?? 0) !== 1,
    ).length;

    const reviewCount = (wrongQuestions || []).filter(
      (q) => String(q.status || "pending") !== "mastered",
    ).length;

    const recordCount = (submissions || []).length;

    return {
      pendingExamCount,
      wrongCount: reviewCount,
      recordCount,
      reviewCount,
      notices: [
        pendingExamCount > 0
          ? `当前还有 ${pendingExamCount} 项测验未完成，请尽快进入班级查看。`
          : "当前暂无待完成测验，可以继续保持节奏。",
        reviewCount > 0
          ? `当前还有 ${reviewCount} 道错题待复习，建议优先巩固薄弱知识点。`
          : "当前暂无待复习错题，继续保持。",
      ],
    };
  }, [exams, wrongQuestions, submissions]);

  const generatePractice = usePracticeStore((state) => state.generatePractice);
  const handleStartPractice = async (cfg) => {
    console.log("currentUser =", useAuthStore.getState().currentUser);
    console.log(
      "studentId =",
      useStudentStore.getState().getCurrentStudentId(),
    );
    console.log("cfg =", cfg);
    try {
      const result = await generatePractice(cfg);

      if (!result?.practiceId) {
        message.error("生成练习失败");
        return;
      }

      navigate(`/student/exam/${result.practiceId}`, {
        state: {
          mode: "practice",
          cfg,
          questionIds: result.questions.map((q) => q.id),
          questions: result.questions,
        },
      });
    } catch (error) {
      console.error(error);
      message.error(error?.message || "生成练习失败");
    }
  };

  const quickAccessItems = useMemo(
    () => [
      {
        key: "exam",
        title: "班级测验",
        value: `${dashboardSummary.pendingExamCount} 项待完成`,
        type: "exam",
        onClick: () => navigate("/student/class-list"),
      },
      {
        key: "wrong",
        title: "错题本",
        value: `${dashboardSummary.reviewCount} 项待复习`,
        type: "wrong",
        onClick: () => navigate("/student/wrong-book"),
      },
      {
        key: "record",
        title: "做题记录",
        value: `${dashboardSummary.recordCount} 条记录`,
        type: "record",
        onClick: () => navigate("/student/records"),
      },
    ],
    [
      dashboardSummary.pendingExamCount,
      dashboardSummary.reviewCount,
      dashboardSummary.recordCount,
      navigate,
    ],
  );

  return (
    <div className="student-dashboard-shell">
      <div className="student-dashboard-main">
        <div className="student-dashboard-layout">
          <div className="student-dashboard-primary">
            <StatsCards />

            <StrategyCards
              onSelectStrategy={(key) => {
                setStrategy(key);
                setOpen(true);
              }}
            />

            <QuickAccessGrid items={quickAccessItems} />
          </div>

          <aside className="student-dashboard-aside">
            <PendingCard />
            <KnowledgeBubbleCard onOpen={() => setMasteryOpen(true)} />
          </aside>
        </div>
      </div>

      <PracticeDecisionModal
        open={open}
        strategy={strategy}
        onClose={() => setOpen(false)}
        onStart={handleStartPractice}
      />

      <KnowledgeBubbleMap
        overlay
        open={masteryOpen}
        onClose={() => setMasteryOpen(false)}
        data={masteryData}
        title="知识点掌握气泡图"
        subjects={subjectOptions}
        subject={selectedSubject}
        onChangeSubject={setSelectedSubject}
        overlayMaxWidth={1200}
        overlayHeightVh={86}
      />
    </div>
  );
}
