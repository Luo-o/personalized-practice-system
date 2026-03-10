// import React, { useMemo } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import PageHeader from "../../components/PageHeader";
// import QuestionSheet from "../../components/student/question-sheet/QuestionSheet";
// import {
//   useSubmissionStore,
//   useAnswerRecordStore,
//   useQuestionStore,
// } from "../../store";
// import "./practice-records.css";

// export default function PracticeRecordDetail() {
//   const navigate = useNavigate();
//   const { recordId } = useParams();

//   const submissions = useSubmissionStore((s) => s.submissions);
//   const answerRecords = useAnswerRecordStore((s) => s.answerRecords);
//   const questions = useQuestionStore((s) => s.questions);

//   const record = useMemo(() => {
//     return submissions.find((x) => String(x.id) === String(recordId)) || null;
//   }, [submissions, recordId]);

//   const recordAnswers = useMemo(() => {
//     if (!record) return [];
//     return answerRecords.filter((x) => x.submissionId === record.id);
//   }, [answerRecords, record]);

//   const detailQuestions = useMemo(() => {
//     return recordAnswers
//       .map((ans) => questions.find((q) => q.id === ans.questionId))
//       .filter(Boolean)
//       .map((q) => ({
//         id: q.id,
//         tag: `${q.subject} · ${q.chapter}`,
//         difficulty: q.difficulty,
//         stem: q.title,
//         options: q.options,
//         correct: q.correct,
//         explanation: q.analysis,
//       }));
//   }, [recordAnswers, questions]);

//   const initialAnswers = useMemo(() => {
//     const map = {};
//     recordAnswers.forEach((ans) => {
//       map[String(ans.questionId)] = ans.selectedAnswer;
//     });
//     return map;
//   }, [recordAnswers]);

//   return (
//     <div className="pr-detail-page">
//       <PageHeader
//         title={record ? record.title : "记录详情"}
//         subtitle={
//           record ? `完成时间：${record.finishedAt} · 得分 ${record.score}` : ""
//         }
//         onBack={() => navigate(-1)}
//       />

//       <QuestionSheet
//         questions={detailQuestions}
//         initialAnswers={initialAnswers}
//         mode="review"
//         showTimer={false}
//         onSubmit={async () => ({})}
//         onViewWrong={() => navigate("/student/wrong-book")}
//         onBackHome={() => navigate("/student/dashboard")}
//       />
//     </div>
//   );
// }

import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import QuestionSheet from "../../components/student/question-sheet/QuestionSheet";
import { useSubmissionStore, useQuestionStore } from "../../store";
import "./practice-records.css";

export default function PracticeRecordDetail() {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const location = useLocation();

  const currentSubmission = useSubmissionStore((s) => s.currentSubmission);
  const fetchSubmissionById = useSubmissionStore((s) => s.fetchSubmissionById);

  const questions = useQuestionStore((s) => s.questions);
  const fetchQuestions = useQuestionStore((s) => s.fetchQuestions);

  const practiceReview = location.state?.practiceReview || null;
  const isPracticeReview = !!practiceReview;

  useEffect(() => {
    if (isPracticeReview) return;

    fetchSubmissionById(recordId);
    fetchQuestions();
  }, [recordId, isPracticeReview, fetchSubmissionById, fetchQuestions]);

  const record = useMemo(() => {
    if (isPracticeReview) return practiceReview.record;
    return currentSubmission?.submission || null;
  }, [isPracticeReview, practiceReview, currentSubmission]);

  const recordAnswers = useMemo(() => {
    if (isPracticeReview) return practiceReview.answerRecords || [];
    return currentSubmission?.answerRecords || [];
  }, [isPracticeReview, practiceReview, currentSubmission]);

  const detailQuestions = useMemo(() => {
    if (isPracticeReview) {
      return practiceReview.questions || [];
    }

    return recordAnswers
      .map((ans) => {
        const q = (questions || []).find(
          (item) => Number(item.id) === Number(ans.question_id),
        );
        if (!q) return null;

        return {
          id: q.id,
          tag: `${q.subjectName || ""} · ${q.chapterName || ""}`,
          difficulty: q.difficulty,
          stem: q.title,
          options: q.options || [],
          correct: q.correct,
          explanation: q.analysis,
        };
      })
      .filter(Boolean);
  }, [isPracticeReview, practiceReview, recordAnswers, questions]);

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
      <PageHeader
        title={record ? record.title : "记录详情"}
        subtitle={
          record
            ? `完成时间：${record.submitted_at || record.finishedAt || ""} · 得分 ${record.score ?? 0}`
            : ""
        }
        onBack={() => navigate(-1)}
      />

      <QuestionSheet
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
