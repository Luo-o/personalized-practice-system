import React, { useEffect, useMemo, useState } from "react";
import { Button, Dropdown, Tag, Breadcrumb, message } from "antd";
import {
  CheckOutlined,
  DownOutlined,
  FilterOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import WrongQuestionSheetDrawer from "../../components/student/wrong-book/WrongQuestionSheetDrawer";
import { useAnswerRecordStore, useQuestionStore } from "../../store";
import "./wrong-book.css";

const ALL_SUBJECT = "全部科目";
const ALL_CHAPTER = "全部章节";
const ALL_KP = "全部知识点";
const ALL_DIFFICULTY = "全部难度";
const STATUS_PENDING = "pending";
const STATUS_MASTERED = "mastered";

function formatDateTime(value) {
  if (!value) return "暂无记录";
  return String(value).replace("T", " ").slice(0, 19);
}

export default function WrongBook() {
  const wrongQuestions = useAnswerRecordStore((s) => s.wrongQuestions);
  const fetchWrongQuestions = useAnswerRecordStore(
    (s) => s.fetchWrongQuestions,
  );
  const markWrongQuestionMastered = useAnswerRecordStore(
    (s) => s.markWrongQuestionMastered,
  );

  const questions = useQuestionStore((s) => s.questions);
  const fetchQuestions = useQuestionStore((s) => s.fetchQuestions);

  useEffect(() => {
    fetchWrongQuestions();
    fetchQuestions();
  }, [fetchWrongQuestions, fetchQuestions]);

  const wrongs = useMemo(() => {
    const grouped = new Map();

    (wrongQuestions || []).forEach((r) => {
      const q = (questions || []).find(
        (item) => Number(item.id) === Number(r.questionId),
      );

      const questionId = r.questionId;
      const old = grouped.get(questionId);

      const subjectName = q?.subjectName || r.subjectName || "未设置科目";
      const chapterName = q?.chapterName || r.chapterName || "未分章节";
      const knowledgePoints = (q?.knowledgePoints || []).map((kp) => ({
        id: kp.id,
        name: kp.name,
      }));
      const firstKnowledgeName = knowledgePoints[0]?.name || "未归类";
      const difficulty = q?.difficulty || r.difficulty || "未设置";

      const questionData = q
        ? {
            id: q.id,
            difficulty: q.difficulty,
            subject_name: q.subjectName,
            chapter_name: q.chapterName,
            knowledge_points: knowledgePoints,
            stem: q.title,
            title: q.title,
            options: (q.options || []).map((item) => ({
              key: item.key || item.option_key,
              text: item.text || item.option_text,
            })),
            correct: q.correct,
            explanation: q.analysis,
          }
        : {
            id: questionId,
            difficulty,
            subject_name: subjectName,
            chapter_name: chapterName,
            knowledge_points: knowledgePoints,
            stem: r.title,
            title: r.title,
            options: [],
            correct: r.correctAnswer,
            explanation: r.analysis,
          };

      if (!old) {
        grouped.set(questionId, {
          id: `w_${questionId}`,
          wrongBookId: r.wrongBookId ?? null,
          questionId,
          title: q?.title || r.title || `题目 ${questionId}`,
          subject: subjectName,
          chapterText: chapterName,
          knowledgePoints,
          knowledgePoint: firstKnowledgeName,
          difficulty,
          wrongCount: Number(r.wrongCount || 1),
          lastPracticeAt: r.lastPracticeAt || r.answeredAt || "",
          lastWrongAt: r.lastWrongAt || r.answeredAt || "",
          lastAttempt: {
            answer: r.selectedAnswer,
            answeredAt: r.lastPracticeAt || r.answeredAt || "",
          },
          question: questionData,
          status: r.status || STATUS_PENDING,
          mastered: (r.status || STATUS_PENDING) === STATUS_MASTERED,
        });
      } else {
        old.wrongCount = Math.max(
          Number(old.wrongCount || 0),
          Number(r.wrongCount || 0),
        );
        old.status = r.status || old.status || STATUS_PENDING;
        old.mastered = (old.status || STATUS_PENDING) === STATUS_MASTERED;

        const oldTime = new Date(
          String(old.lastAttempt?.answeredAt || "").replace(" ", "T"),
        ).getTime();

        const newTime = new Date(
          String(r.lastPracticeAt || r.answeredAt || "").replace(" ", "T"),
        ).getTime();

        if (newTime >= oldTime) {
          old.lastPracticeAt = r.lastPracticeAt || r.answeredAt || "";
          old.lastWrongAt = r.lastWrongAt || old.lastWrongAt || "";
          old.lastAttempt = {
            answer: r.selectedAnswer,
            answeredAt: r.lastPracticeAt || r.answeredAt || "",
          };
        }
      }
    });

    return Array.from(grouped.values()).sort(
      (a, b) =>
        new Date(String(b.lastAttempt?.answeredAt || "").replace(" ", "T")) -
        new Date(String(a.lastAttempt?.answeredAt || "").replace(" ", "T")),
    );
  }, [wrongQuestions, questions]);

  const [statusTab, setStatusTab] = useState(STATUS_PENDING);

  const [selectedSubject, setSelectedSubject] = useState(ALL_SUBJECT);
  const [selectedChapter, setSelectedChapter] = useState(ALL_CHAPTER);
  const [selectedKnowledgePoint, setSelectedKnowledgePoint] = useState(ALL_KP);
  const [selectedDifficulty, setSelectedDifficulty] = useState(ALL_DIFFICULTY);

  const pendingCount = wrongs.filter((w) => !w.mastered).length;
  const masteredCount = wrongs.filter((w) => w.mastered).length;

  const subjectOptions = useMemo(() => {
    const set = new Set(wrongs.map((w) => w.subject || "未设置科目"));
    return [ALL_SUBJECT, ...Array.from(set)];
  }, [wrongs]);

  const chapterOptions = useMemo(() => {
    const base =
      selectedSubject === ALL_SUBJECT
        ? wrongs
        : wrongs.filter((w) => w.subject === selectedSubject);

    const set = new Set(base.map((w) => w.chapterText || "未分章节"));
    return [ALL_CHAPTER, ...Array.from(set)];
  }, [wrongs, selectedSubject]);

  const knowledgePointOptions = useMemo(() => {
    let base = wrongs;

    if (selectedSubject !== ALL_SUBJECT) {
      base = base.filter((w) => w.subject === selectedSubject);
    }

    if (selectedChapter !== ALL_CHAPTER) {
      base = base.filter((w) => w.chapterText === selectedChapter);
    }

    const kpSet = new Set();
    base.forEach((w) => {
      const kpList =
        w.knowledgePoints?.length > 0
          ? w.knowledgePoints.map((kp) => kp.name)
          : [w.knowledgePoint || "未归类"];

      kpList.forEach((name) => kpSet.add(name));
    });

    return [ALL_KP, ...Array.from(kpSet)];
  }, [wrongs, selectedSubject, selectedChapter]);

  const difficultyOptions = useMemo(() => {
    const set = new Set(wrongs.map((w) => w.difficulty || "未设置"));
    return [ALL_DIFFICULTY, ...Array.from(set)];
  }, [wrongs]);

  const displayWrongs = useMemo(() => {
    let list = wrongs;

    list =
      statusTab === STATUS_MASTERED
        ? list.filter((w) => w.mastered)
        : list.filter((w) => !w.mastered);

    if (selectedSubject !== ALL_SUBJECT) {
      list = list.filter((w) => w.subject === selectedSubject);
    }

    if (selectedChapter !== ALL_CHAPTER) {
      list = list.filter((w) => w.chapterText === selectedChapter);
    }

    if (selectedKnowledgePoint !== ALL_KP) {
      list = list.filter((w) => {
        const kpList =
          w.knowledgePoints?.length > 0
            ? w.knowledgePoints.map((kp) => kp.name)
            : [w.knowledgePoint || "未归类"];
        return kpList.includes(selectedKnowledgePoint);
      });
    }

    if (selectedDifficulty !== ALL_DIFFICULTY) {
      list = list.filter((w) => w.difficulty === selectedDifficulty);
    }

    return list;
  }, [
    wrongs,
    statusTab,
    selectedSubject,
    selectedChapter,
    selectedKnowledgePoint,
    selectedDifficulty,
  ]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDefaultView, setDrawerDefaultView] = useState("practice");
  const [currentWrong, setCurrentWrong] = useState(null);

  const openPractice = (wrong) => {
    setCurrentWrong(wrong);
    setDrawerDefaultView("practice");
    setDrawerOpen(true);
  };

  const openAnalysis = (wrong) => {
    setCurrentWrong(wrong);
    setDrawerDefaultView("analysis");
    setDrawerOpen(true);
  };

  const resetFilters = () => {
    setSelectedSubject(ALL_SUBJECT);
    setSelectedChapter(ALL_CHAPTER);
    setSelectedKnowledgePoint(ALL_KP);
    setSelectedDifficulty(ALL_DIFFICULTY);
  };

  const createSingleSelectMenu = (options, selectedValue, onSelect) => ({
    items: options.map((item) => ({
      key: item,
      label: (
        <div className="wb-dropdown-item">
          <span>{item}</span>
          {selectedValue === item ? <CheckOutlined /> : null}
        </div>
      ),
    })),
    onClick: ({ key }) => onSelect(key),
  });

  const handleMarkMastered = async (wrong) => {
    if (!wrong?.questionId) return;

    try {
      await markWrongQuestionMastered(wrong.questionId);
      await fetchWrongQuestions();

      setCurrentWrong((prev) =>
        prev && Number(prev.questionId) === Number(wrong.questionId)
          ? {
              ...prev,
              status: STATUS_MASTERED,
              mastered: true,
            }
          : prev,
      );

      message.success("已标记为掌握");
    } catch (error) {
      console.error("标记已掌握失败:", error);
      message.error("标记失败，请稍后重试");
    }
  };

  const handleAskAI = async (text, question, images = [], history = []) => {
    const formData = new FormData();
    formData.append("message", text);
    formData.append("questionId", question?.id || "");
    formData.append("questionStem", question?.stem || "");
    formData.append("history", JSON.stringify(history));

    images.forEach((file) => {
      formData.append("images", file);
    });

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data?.reply || "暂无回复";
  };

  return (
    <div className="wb-page">
      <div className="wb-wrap wb-wrap--wide">
        <div className="wb-content-top">
          <Breadcrumb
            items={[
              {
                title: (
                  <Link to="/student/dashboard" className="wr-breadcrumb-link">
                    <HomeOutlined />
                  </Link>
                ),
              },
              {
                title: (
                  <Link
                    to="/student/wrong-book"
                    className="wr-breadcrumb-current"
                  >
                    错题本
                  </Link>
                ),
              },
            ]}
          />
        </div>

        <div className="wb-board">
          <div className="wb-board-top">
            <div className="wb-count-tabs">
              <button
                type="button"
                className={`wb-count-tab ${statusTab === STATUS_PENDING ? "is-active" : ""}`}
                onClick={() => setStatusTab(STATUS_PENDING)}
              >
                <span className="wb-count-tab-dot pending" />
                <span className="wb-count-tab-number">{pendingCount}</span>
                <span className="wb-count-tab-text">待复习</span>
              </button>

              <button
                type="button"
                className={`wb-count-tab ${statusTab === STATUS_MASTERED ? "is-active" : ""}`}
                onClick={() => setStatusTab(STATUS_MASTERED)}
              >
                <span className="wb-count-tab-dot mastered" />
                <span className="wb-count-tab-number">{masteredCount}</span>
                <span className="wb-count-tab-text">已掌握</span>
              </button>
            </div>

            <div className="wb-toolbar">
              <Dropdown
                menu={createSingleSelectMenu(
                  subjectOptions,
                  selectedSubject,
                  (value) => {
                    setSelectedSubject(value);
                    setSelectedChapter(ALL_CHAPTER);
                    setSelectedKnowledgePoint(ALL_KP);
                  },
                )}
                trigger={["click"]}
              >
                <Button className="wb-filter-dropdown-btn">
                  科目：{selectedSubject} <DownOutlined />
                </Button>
              </Dropdown>

              <Dropdown
                menu={createSingleSelectMenu(
                  chapterOptions,
                  selectedChapter,
                  (value) => {
                    setSelectedChapter(value);
                    setSelectedKnowledgePoint(ALL_KP);
                  },
                )}
                trigger={["click"]}
              >
                <Button className="wb-filter-dropdown-btn">
                  章节：{selectedChapter} <DownOutlined />
                </Button>
              </Dropdown>

              <Dropdown
                menu={createSingleSelectMenu(
                  knowledgePointOptions,
                  selectedKnowledgePoint,
                  setSelectedKnowledgePoint,
                )}
                trigger={["click"]}
              >
                <Button className="wb-filter-dropdown-btn">
                  知识点：{selectedKnowledgePoint} <DownOutlined />
                </Button>
              </Dropdown>

              <Dropdown
                menu={createSingleSelectMenu(
                  difficultyOptions,
                  selectedDifficulty,
                  setSelectedDifficulty,
                )}
                trigger={["click"]}
              >
                <Button className="wb-filter-dropdown-btn">
                  难度：{selectedDifficulty} <DownOutlined />
                </Button>
              </Dropdown>

              <button
                type="button"
                className="wb-reset-btn"
                onClick={resetFilters}
              >
                <FilterOutlined />
                重置
              </button>
            </div>
          </div>

          <div className="wb-issue-list">
            {displayWrongs.map((w) => {
              const kpList =
                w.knowledgePoints?.length > 0
                  ? w.knowledgePoints
                  : [{ id: "fallback", name: w.knowledgePoint || "未归类" }];

              return (
                <div key={w.id} className="wb-issue-row">
                  <div className="wb-issue-main">
                    <div className="wb-issue-title-row">
                      <button
                        type="button"
                        className="wb-issue-title-btn"
                        onClick={() => openPractice(w)}
                      >
                        {w.title}
                      </button>
                    </div>

                    <div className="wb-issue-tags">
                      {w.mastered ? (
                        <span className="wb-mastered-icon">
                          <CheckOutlined />
                        </span>
                      ) : null}

                      <Tag className="wb-label-tag wb-label-tag-subject">
                        {w.subject || "未设置科目"}
                      </Tag>

                      <Tag className="wb-label-tag wb-label-tag-chapter">
                        {w.chapterText || "未分章节"}
                      </Tag>

                      {kpList.map((kp) => (
                        <Tag
                          key={kp.id || kp.name}
                          className="wb-label-tag wb-label-tag-kp"
                        >
                          {kp.name}
                        </Tag>
                      ))}

                      <Tag className="wb-label-tag wb-label-tag-difficulty">
                        {w.difficulty || "未设置"}
                      </Tag>

                      <Tag className="wb-label-tag wb-label-tag-times">
                        错误 {w.wrongCount} 次
                      </Tag>
                    </div>

                    <div className="wb-issue-meta">
                      最后提交时间：{formatDateTime(w.lastPracticeAt)}
                    </div>
                  </div>

                  <div className="wb-issue-actions">
                    <button
                      type="button"
                      className="wb-action-btn wb-action-btn-primary"
                      onClick={() => openPractice(w)}
                    >
                      重新练习
                    </button>
                    <button
                      type="button"
                      className="wb-action-btn"
                      onClick={() => openAnalysis(w)}
                    >
                      查看解析
                    </button>
                  </div>
                </div>
              );
            })}

            {displayWrongs.length === 0 && (
              <div className="wb-empty-panel">
                当前筛选下暂无
                {statusTab === STATUS_MASTERED ? "已掌握题目" : "待复习题目"}
              </div>
            )}
          </div>
        </div>
      </div>

      <WrongQuestionSheetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        wrong={currentWrong}
        defaultView={drawerDefaultView}
        onMarkMastered={() => handleMarkMastered(currentWrong)}
        onAskAI={handleAskAI}
      />
    </div>
  );
}
