import React, { useEffect, useMemo, useState } from "react";
import QuestionItem from "./QuestionItem";
import AiHelpFloat from "../ai-help/AiHelpFloat";
import "./qs-sheet.css";
import { askAI } from "../../../api/ai";

export default function QuestionSheet({
  title = "Quiz Title",
  questions = [],
  initialAnswers,
  onSubmit,
  mode: controlledMode,
  onModeChange,
  onViewWrong,
  onBackHome,
  onBackList,
}) {
  const [answers, setAnswers] = useState(initialAnswers || {});
  const [submitting, setSubmitting] = useState(false);
  const [innerMode, setInnerMode] = useState("answer");
  const [solutions, setSolutions] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const [aiOpen, setAiOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);

  const mode = controlledMode || innerMode;
  const total = questions.length;
  const currentQuestion = questions[currentIndex] || null;

  useEffect(() => {
    setAnswers(initialAnswers || {});
  }, [initialAnswers]);

  useEffect(() => {
    if (currentIndex > total - 1) {
      setCurrentIndex(Math.max(total - 1, 0));
    }
  }, [currentIndex, total]);

  useEffect(() => {
    if (!currentQuestion) return;
    if (!activeQuestion && aiOpen) {
      setActiveQuestion(currentQuestion);
    }
  }, [currentQuestion, activeQuestion, aiOpen]);

  const answeredCount = useMemo(() => {
    let count = 0;
    for (const q of questions) {
      if ((answers[q.id] || "").toString().trim()) {
        count += 1;
      }
    }
    return count;
  }, [questions, answers]);

  const updateAnswer = (qid, val) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: val,
    }));
  };

  const openAiForQuestion = (question) => {
    setActiveQuestion(question || currentQuestion || null);
    setAiOpen(true);
  };

  const closeAi = () => {
    setAiOpen(false);
  };

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

      let ok = 0;
      let bad = 0;

      for (const q of questions) {
        const chosen = (answers[q.id] || "").toString().trim();
        if (!chosen) continue;

        const corr = (finalSolutions[q.id]?.correct || q.correct || "")
          .toString()
          .trim();

        if (corr && chosen === corr) ok += 1;
        else bad += 1;
      }

      const percent = total ? Math.round((ok / total) * 100) : 0;

      onModeChange?.({
        mode: "review",
        total,
        answeredCount,
        correctCount: ok,
        wrongCount: bad,
        percent,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const goPrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const goNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, total - 1));
  };

  const goToQuestion = (index) => {
    if (index < 0 || index >= total) return;
    setCurrentIndex(index);
  };

  return (
    <div className="qs-page">
      <div className="qs-shell">
        <div className="qs-title">{title}</div>
        <div className="qs-layout">
          <section className="qs-main">
            <div className="qs-main-card">
              {currentQuestion ? (
                <QuestionItem
                  index={currentIndex + 1}
                  question={currentQuestion}
                  value={answers[currentQuestion.id] || ""}
                  mode={mode}
                  solution={solutions[currentQuestion.id]}
                  onChange={(val) => updateAnswer(currentQuestion.id, val)}
                  onPrev={goPrev}
                  onNext={goNext}
                  onSubmit={handleSubmit}
                  onOpenAI={openAiForQuestion}
                  isFirst={currentIndex === 0}
                  isLast={currentIndex === total - 1}
                  submitting={submitting}
                />
              ) : (
                <div className="qs-empty">暂无题目</div>
              )}
            </div>
          </section>

          <aside className="qs-side">
            <div className="qs-side-card">
              <div className="qs-side-head">
                <span className="qs-side-head-title">
                  问题 {total ? currentIndex + 1 : 0}/{total}
                </span>
              </div>

              <div className="qs-side-grid">
                {questions.map((q, idx) => {
                  const selected = (answers[q.id] || "").toString().trim();
                  const answered = !!selected;
                  const active = idx === currentIndex;

                  const correctAnswer = (
                    solutions[q.id]?.correct ||
                    q.correct ||
                    ""
                  )
                    .toString()
                    .trim();

                  const isCorrect =
                    mode === "review" &&
                    answered &&
                    correctAnswer &&
                    selected === correctAnswer;

                  const isWrong =
                    mode === "review" &&
                    answered &&
                    correctAnswer &&
                    selected !== correctAnswer;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      className={[
                        "qs-side-no",
                        active ? "is-current" : "",
                        answered && mode !== "review" ? "is-answered" : "",
                        isCorrect ? "is-correct" : "",
                        isWrong ? "is-wrong" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => goToQuestion(idx)}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {mode === "review" ? (
                <div className="qs-side-actions">
                  <button
                    type="button"
                    className="qs-side-btn danger"
                    onClick={onViewWrong}
                  >
                    查看错题
                  </button>
                  <button
                    type="button"
                    className="qs-side-btn primary"
                    onClick={onBackHome}
                  >
                    返回首页
                  </button>
                </div>
              ) : (
                <div className="qs-side-actions">
                  <button
                    type="button"
                    className="qs-side-btn ghost"
                    onClick={onBackList}
                  >
                    返回列表
                  </button>
                  <button
                    type="button"
                    className="qs-side-btn primary"
                    disabled={submitting || total === 0}
                    onClick={handleSubmit}
                  >
                    {submitting ? "提交中..." : "提交"}
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <AiHelpFloat
        open={aiOpen}
        onClose={closeAi}
        question={activeQuestion || currentQuestion}
        onAskAI={askAI}
      />
    </div>
  );
}
