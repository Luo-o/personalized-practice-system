import React, { useMemo, useState } from "react";
import QuestionProgress from "./QuestionProgress";
import QuestionItem from "./QuestionItem";
import QuestionSubmitBar from "./QuestionSubmitBar";
import QuestionResultSummary from "./QuestionResultSummary";
import AiHelpFloat from "../ai-help/AiHelpFloat"; // ✅新增
import "./qs-sheet.css";

export default function QuestionSheet({
  questions = [],
  initialAnswers,
  onSubmit,
  showTimer = true,
  timerText = "0:00",
  mode: controlledMode,
  onModeChange,
  onViewWrong,
  onBackHome,

  // ✅可选：如果你在更外层已经有 ai 接口回调，也可以透传进来
  onAskAI,
}) {
  const [answers, setAnswers] = useState(initialAnswers || {});
  const [submitting, setSubmitting] = useState(false);
  const [innerMode, setInnerMode] = useState("answer");
  const [solutions, setSolutions] = useState({});

  const mode = controlledMode || innerMode;

  const total = questions.length;
  const answeredCount = useMemo(() => {
    let c = 0;
    for (const q of questions) {
      if (answers[q.id]) c++;
    }
    return c;
  }, [questions, answers]);

  const progressPercent = total ? Math.round((answeredCount / total) * 100) : 0;

  const updateAnswer = (qid, val) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
  };

  // ✅全局唯一浮窗：open + 当前题目
  const [aiOpen, setAiOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);

  const openAiForQuestion = (q) => {
    setActiveQuestion(q);
    setAiOpen(true);
  };

  const closeAi = () => setAiOpen(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = (await onSubmit?.({ answers, questions })) || null;

      const sol = res?.solutions || null;
      let finalSolutions = {};

      if (sol && typeof sol === "object") {
        finalSolutions = sol;
      } else {
        const fallback = {};
        for (const q of questions) {
          if (q.correct || q.explanation) {
            fallback[q.id] = {
              correct: q.correct,
              explanation: q.explanation,
            };
          }
        }
        finalSolutions = fallback;
      }

      setSolutions(finalSolutions);
      setInnerMode("review");

      if (onModeChange) {
        let ok = 0;
        let bad = 0;
        for (const q of questions) {
          const chosen = answers[q.id];
          if (!chosen) continue;
          const corr = (finalSolutions[q.id]?.correct || q.correct || "")
            .toString()
            .trim();
          if (corr && chosen === corr) ok++;
          else bad++;
        }
        const percent = total ? Math.round((ok / total) * 100) : 0;
        onModeChange({
          mode: "review",
          total,
          answeredCount,
          correctCount: ok,
          wrongCount: bad,
          percent,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const { correctCount, wrongCount, percent } = useMemo(() => {
    let ok = 0;
    let bad = 0;
    for (const q of questions) {
      const chosen = answers[q.id];
      if (!chosen) continue;
      const corr = (solutions[q.id]?.correct || q.correct || "")
        .toString()
        .trim();
      if (corr && chosen === corr) ok++;
      else bad++;
    }
    const p = total ? Math.round((ok / total) * 100) : 0;
    return { correctCount: ok, wrongCount: bad, percent: p };
  }, [questions, answers, solutions, total]);

  return (
    <div className="qs-page">
      <div className="qs-wrap">
        {mode !== "review" ? (
          <QuestionProgress
            answered={answeredCount}
            total={total}
            percent={progressPercent}
            showTimer={showTimer}
            timerText={timerText}
          />
        ) : (
          <QuestionResultSummary
            total={total}
            correctCount={correctCount}
            wrongCount={wrongCount}
            percent={percent}
          />
        )}

        <div className="qs-list">
          {questions.map((q, idx) => (
            <QuestionItem
              key={q.id}
              index={idx + 1}
              question={q}
              value={answers[q.id] || ""}
              mode={mode}
              solution={solutions[q.id]}
              onChange={(val) => updateAnswer(q.id, val)}
              onOpenAI={(payload) => openAiForQuestion(payload)} // ✅新增
            />
          ))}
        </div>

        <div className="qs-footerbar">
          {mode === "review" ? (
            <div className="qs-result-actions">
              <button
                className="qs-resultbtn danger"
                type="button"
                onClick={onViewWrong}
              >
                查看错题
              </button>
              <button
                className="qs-resultbtn primary"
                type="button"
                onClick={onBackHome}
              >
                返回首页
              </button>
            </div>
          ) : (
            <QuestionSubmitBar
              disabled={submitting || total === 0}
              loading={submitting}
              text="提交答卷"
              onClick={handleSubmit}
            />
          )}
        </div>
      </div>

      {/* ✅全局唯一 AI 浮窗：只渲染一次，避免叠加 */}
      <AiHelpFloat
        open={aiOpen}
        onClose={closeAi}
        question={activeQuestion}
        onAskAI={onAskAI}
      />
    </div>
  );
}
