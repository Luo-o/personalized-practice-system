import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { message } from "antd";
import QuestionSheet from "../../components/student/question-sheet/QuestionSheet";
import { useSubmissionStore, useQuestionStore } from "../../store";
import "./practice-records.css";

function normalizeQuestionFull(raw) {
  if (!raw) return null;

  return {
    ...raw,
    id: raw.id,
    tag:
      raw.tag ||
      [
        raw.subjectName || raw.subject_name || raw.subject || "",
        raw.chapterName || raw.chapter_name || raw.chapter || "",
      ]
        .filter(Boolean)
        .join(" · "),
    difficulty: raw.difficulty || "未设置",
    stem: raw.stem || raw.title || "",
    title: raw.title || raw.stem || "",
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
    subjectId: raw.subjectId || raw.subject_id,
    subjectName: raw.subjectName || raw.subject_name || raw.subject || "",
    chapterName: raw.chapterName || raw.chapter_name || raw.chapter || "",
  };
}

export default function PracticeRecordDetail() {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const location = useLocation();

  const currentSubmission = useSubmissionStore((s) => s.currentSubmission);
  const fetchSubmissionById = useSubmissionStore((s) => s.fetchSubmissionById);

  const fetchQuestionById = useQuestionStore((s) => s.fetchQuestionById);

  const practiceReview = location.state?.practiceReview || null;
  const isPracticeReview = !!practiceReview;

  const [detailQuestions, setDetailQuestions] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (isPracticeReview) return;
    fetchSubmissionById(recordId).catch((error) => {
      message.error(error?.message || "加载记录失败");
    });
  }, [recordId, isPracticeReview, fetchSubmissionById]);

  const recordAnswers = useMemo(() => {
    if (isPracticeReview) return practiceReview.answerRecords || [];
    return currentSubmission?.answerRecords || [];
  }, [isPracticeReview, practiceReview, currentSubmission]);

  const practiceTitle = useMemo(() => {
    if (isPracticeReview) return practiceReview.title || "练习回顾";
    return currentSubmission?.submission.title || "作业回顾";
  }, [isPracticeReview, practiceReview, currentSubmission]);

  useEffect(() => {
    if (isPracticeReview) {
      const normalized = (practiceReview?.questions || []).map(
        normalizeQuestionFull,
      );
      setDetailQuestions(normalized);
      return;
    }

    if (!recordAnswers.length) {
      setDetailQuestions([]);
      return;
    }

    let cancelled = false;

    const loadQuestions = async () => {
      setLoadingDetail(true);

      try {
        const questionIds = recordAnswers.map(
          (ans) => ans.question_id || ans.questionId,
        );

        const results = await Promise.all(
          questionIds.map((id) => fetchQuestionById(id)),
        );

        if (cancelled) return;

        const normalizedList = results
          .map(normalizeQuestionFull)
          .filter(Boolean);

        setDetailQuestions(normalizedList);
      } catch (error) {
        if (cancelled) return;
        console.error("加载题目详情失败:", error);
        message.error(error?.message || "题目详情加载失败");
        setDetailQuestions([]);
      } finally {
        if (!cancelled) {
          setLoadingDetail(false);
        }
      }
    };

    loadQuestions();

    return () => {
      cancelled = true;
    };
  }, [isPracticeReview, practiceReview, recordAnswers, fetchQuestionById]);

  const initialAnswers = useMemo(() => {
    const map = {};
    recordAnswers.forEach((ans) => {
      map[String(ans.question_id || ans.questionId)] =
        ans.selected_answer || ans.selectedAnswer || "";
    });
    return map;
  }, [recordAnswers]);

  return (
    <div className="pr-detail-page">
      <QuestionSheet
        title={loadingDetail ? `${practiceTitle}（加载中...）` : practiceTitle}
        questions={detailQuestions}
        initialAnswers={initialAnswers}
        mode="review"
        showTimer={false}
        onSubmit={async () => ({})}
        onViewWrong={() => navigate("/student/wrong-book")}
        onBackHome={() => navigate("/student/dashboard")}
      />
    </div>
  );
}
