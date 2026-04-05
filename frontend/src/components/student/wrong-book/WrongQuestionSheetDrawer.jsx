import React, { useEffect, useMemo, useState } from "react";
import { Drawer, message } from "antd";
import QuestionItem from "../question-sheet/QuestionItem";
import AiHelpFloat from "../ai-help/AiHelpFloat";
import { useQuestionStore } from "../../../store";
import "../question-sheet/qs-sheet.css";
import "../../../pages/student/wrong-book.css";

function normalizeQuestionFull(raw) {
  if (!raw) return null;

  return {
    ...raw,
    id: raw.id,
    difficulty: raw.difficulty || "未设置",
    stem: raw.stem || raw.title || "",
    title: raw.title || raw.stem || "",
    subjectName: raw.subjectName || raw.subject_name || raw.subject || "",
    chapterName: raw.chapterName || raw.chapter_name || raw.chapter || "",
    tag:
      raw.tag ||
      [
        raw.subjectName || raw.subject_name || raw.subject,
        raw.chapterName || raw.chapter_name || raw.chapter,
      ]
        .filter(Boolean)
        .join(" · "),

    options: (raw.options || []).map((item, index) => ({
      key:
        item.key ||
        item.option_key ||
        item.label ||
        String.fromCharCode(65 + index),
      text: item.text || item.option_text || item.content || "",
    })),

    correct: raw.correct || raw.correct_answer || raw.answer || "",
    explanation: raw.explanation || raw.analysis || "",

    images: (raw.images || []).map((img, index) => ({
      id: img.id || index,
      imageUrl: img.imageUrl || img.image_url || img.url || "",
      sortOrder: img.sortOrder || img.sort_order || index + 1,
    })),
  };
}

function buildFallbackQuestion(wrong) {
  if (!wrong) return null;

  return {
    id: wrong.questionId || wrong.id,
    difficulty: wrong.difficulty || "未设置",
    stem: wrong.title || "",
    title: wrong.title || "",
    subjectName: wrong.subject || wrong.subjectName || "",
    chapterName: wrong.chapterText || wrong.chapterName || "",
    tag: [
      wrong.subject || wrong.subjectName,
      wrong.chapterText || wrong.chapterName,
    ]
      .filter(Boolean)
      .join(" · "),
    options: [],
    correct: wrong.correctAnswer || "",
    explanation: wrong.analysis || "",
    images: [],
  };
}

export default function WrongQuestionSheetDrawer({
  open,
  onClose,
  wrong,
  defaultView = "practice",
  onMarkMastered,
  onAskAI,
}) {
  const fetchQuestionById = useQuestionStore((s) => s.fetchQuestionById);

  const [fullQuestion, setFullQuestion] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const lastAnswer =
    wrong?.lastAttempt?.answer || wrong?.lastAttempt?.selected_answer || "";

  const [view, setView] = useState(defaultView);
  const [answer, setAnswer] = useState(
    defaultView === "analysis" ? lastAnswer : "",
  );

  const [aiOpen, setAiOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);

  useEffect(() => {
    setView(defaultView);
    setAnswer(defaultView === "analysis" ? lastAnswer : "");
  }, [defaultView, lastAnswer, wrong?.id, open]);

  useEffect(() => {
    if (!open) {
      setAiOpen(false);
      setActiveQuestion(null);
      setFullQuestion(null);
      setDetailLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !wrong?.questionId) return;

    let cancelled = false;

    const loadDetail = async () => {
      setDetailLoading(true);

      try {
        const res = await fetchQuestionById(wrong.questionId);
        if (cancelled) return;
        setFullQuestion(normalizeQuestionFull(res));
      } catch (error) {
        if (cancelled) return;
        console.error("加载错题详情失败:", error);
        setFullQuestion(buildFallbackQuestion(wrong));
        message.error(error?.message || "题目详情加载失败");
      } finally {
        if (!cancelled) {
          setDetailLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [open, wrong?.questionId, fetchQuestionById, wrong]);

  const question = useMemo(() => {
    return fullQuestion || buildFallbackQuestion(wrong);
  }, [fullQuestion, wrong]);

  const drawerKey = useMemo(() => {
    return `${wrong?.id || "empty"}-${defaultView}`;
  }, [wrong?.id, defaultView]);

  const title = useMemo(() => {
    if (!wrong) return "错题详情";
    return wrong.knowledgePoint ? `错题 · ${wrong.knowledgePoint}` : "错题详情";
  }, [wrong]);

  const mode = view === "analysis" ? "review" : "answer";

  const handleSubmit = () => {
    if (!answer) {
      message.warning("请选择一个选项");
      return;
    }
    setView("analysis");
  };

  const switchToPractice = () => {
    setView("practice");
    setAnswer("");
  };

  const switchToAnalysis = () => {
    setView("analysis");
    setAnswer(lastAnswer);
  };

  const handleMarkMastered = () => {
    if (!wrong?.id) return;
    onMarkMastered?.(wrong.id);
    onClose();
  };

  const openAiForQuestion = (q) => {
    setActiveQuestion(q || question || null);
    setAiOpen(true);
  };

  const closeAi = () => {
    setAiOpen(false);
  };

  return (
    <>
      <Drawer
        key={drawerKey}
        open={open}
        onClose={onClose}
        placement="bottom"
        height="92vh"
        className="wb-sheet"
        title={null}
        closeIcon={null}
      >
        <div className="wb-sheet-head">
          <div className="wb-sheet-title">{title}</div>
          <button className="wb-sheet-close" type="button" onClick={onClose}>
            关闭
          </button>
        </div>

        <div className="wb-sheet-tabs">
          <button
            type="button"
            className={`wb-sheet-tab ${view === "practice" ? "is-active" : ""}`}
            onClick={switchToPractice}
          >
            重新练习
          </button>
          <button
            type="button"
            className={`wb-sheet-tab ${view === "analysis" ? "is-active" : ""}`}
            onClick={switchToAnalysis}
          >
            查看解析
          </button>
        </div>

        <div className="wb-sheet-body">
          {detailLoading && !fullQuestion ? (
            <div className="wb-empty">加载中...</div>
          ) : question ? (
            <QuestionItem
              index={1}
              question={question}
              value={answer}
              mode={mode}
              onChange={setAnswer}
              hideNav
              onOpenAI={openAiForQuestion}
            />
          ) : (
            <div className="wb-empty">暂无题目数据</div>
          )}
        </div>

        {view === "practice" && (
          <div className="wb-sheet-footer">
            <button
              className="wb-sheet-submit"
              type="button"
              onClick={handleSubmit}
            >
              提交并查看解析
            </button>
          </div>
        )}

        {view === "analysis" && (
          <div className="wb-sheet-footer wb-sheet-footer-analysis">
            <button
              className="wb-sheet-mastered"
              type="button"
              onClick={handleMarkMastered}
            >
              标记为已掌握
            </button>
          </div>
        )}
      </Drawer>

      <AiHelpFloat
        open={aiOpen}
        onClose={closeAi}
        question={activeQuestion || question}
        onAskAI={onAskAI}
      />
    </>
  );
}
