// import React, { useMemo } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import PageHeader from "../../components/PageHeader";
// import { FileTextOutlined } from "@ant-design/icons";
// import QuestionSheet from "../../components/student/question-sheet/QuestionSheet";
// import {
//   useExamStore,
//   useQuestionStore,
//   useSubmissionStore,
//   useAnswerRecordStore,
//   useAuthStore,
// } from "../../store";

// export default function ExamDo() {
//   const { examId } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const exams = useExamStore((s) => s.exams);
//   const questions = useQuestionStore((s) => s.questions);
//   const addSubmission = useSubmissionStore((s) => s.addSubmission);
//   const addAnswerRecords = useAnswerRecordStore((s) => s.addAnswerRecords);
//   const currentUser = useAuthStore((s) => s.currentUser);

//   const currentStudentId =
//     currentUser?.role === "student" ? currentUser.id : null;

//   const practiceState = location.state || {};
//   const practiceMode = practiceState?.mode === "practice";
//   const practiceQuestionsFromState = practiceState?.questions || [];
//   const practiceQuestionIdsFromState = practiceState?.questionIds || [];
//   const practiceCfg = practiceState?.cfg || null;

//   const exam = useMemo(() => {
//     return exams.find((e) => String(e.id) === String(examId)) || null;
//   }, [exams, examId]);

//   const rawQuestionList = useMemo(() => {
//     // 1. 刷题模式：优先使用路由 state 里直接传来的 questions
//     if (practiceMode && practiceQuestionsFromState.length > 0) {
//       return practiceQuestionsFromState;
//     }

//     // 2. 刷题模式：如果只传了 questionIds，就从 questionStore 中反查
//     if (practiceMode && practiceQuestionIdsFromState.length > 0) {
//       return questions.filter((q) =>
//         practiceQuestionIdsFromState.includes(q.id),
//       );
//     }

//     // 3. 正式考试：从 examStore 中取 exam.questionIds
//     if (exam) {
//       return questions.filter((q) => exam.questionIds?.includes(q.id));
//     }

//     return [];
//   }, [
//     practiceMode,
//     practiceQuestionsFromState,
//     practiceQuestionIdsFromState,
//     questions,
//     exam,
//   ]);

//   const examQuestions = useMemo(() => {
//     return rawQuestionList.map((q) => ({
//       id: q.id,
//       difficulty: q.difficulty,
//       tag: `${q.subject} · ${q.chapter}`,
//       stem: q.title,
//       options: q.options,
//       correct: q.correct,
//       explanation: q.analysis,
//     }));
//   }, [rawQuestionList]);

//   const pageTitle = useMemo(() => {
//     if (practiceMode) {
//       return `${practiceCfg?.subjectName || "刷题"}练习`;
//     }
//     return exam?.title || "答题进行中";
//   }, [practiceMode, practiceCfg, exam]);

//   const pageSubtitle = useMemo(() => {
//     return `测验ID：${examId} · 共${examQuestions.length}题`;
//   }, [examId, examQuestions.length]);

//   const handleBackHome = () => {
//     navigate("/student/dashboard");
//   };

//   const handleBackWrong = () => {
//     navigate("/student/wrong-book");
//   };

//   return (
//     <div>
//       <PageHeader
//         title={pageTitle}
//         subtitle={pageSubtitle}
//         icon={<FileTextOutlined />}
//       />

//       <QuestionSheet
//         questions={examQuestions}
//         showTimer={true}
//         timerText="0:00"
//         onSubmit={async ({ answers }) => {
//           if (!currentStudentId) {
//             navigate("/login");
//             return {};
//           }

//           const total = examQuestions.length;
//           let correctCount = 0;

//           examQuestions.forEach((q) => {
//             if (answers[String(q.id)] === q.correct) {
//               correctCount += 1;
//             }
//           });

//           const score = total ? Math.round((correctCount / total) * 100) : 0;
//           const submissionId = Date.now();
//           const now = new Date().toISOString().slice(0, 16).replace("T", " ");

//           addSubmission({
//             id: submissionId,
//             examId: practiceMode ? submissionId : Number(examId),
//             studentId: currentStudentId,
//             title: practiceMode
//               ? `${practiceCfg?.subjectName || "刷题"}练习`
//               : exam?.title || "未命名测验",
//             subject: practiceMode
//               ? practiceCfg?.subjectName || ""
//               : exam?.subject || "",
//             total,
//             score,
//             correctCount,
//             durationMin: 20,
//             finishedAt: now,
//             classId: practiceMode ? null : exam?.classId,
//           });

//           const records = examQuestions.map((q, index) => ({
//             id: submissionId * 100 + index,
//             submissionId,
//             examId: practiceMode ? submissionId : Number(examId),
//             studentId: currentStudentId,
//             questionId: q.id,
//             selectedAnswer: answers[String(q.id)] || "",
//             correctAnswer: q.correct,
//             isCorrect: (answers[String(q.id)] || "") === q.correct,
//             answeredAt: now,
//           }));

//           addAnswerRecords(records);

//           navigate(`/student/records/${submissionId}`);
//           return {};
//         }}
//         onBackHome={handleBackHome}
//         onViewWrong={handleBackWrong}
//       />
//     </div>
//   );
// }

import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";
import PageHeader from "../../components/PageHeader";
import { FileTextOutlined } from "@ant-design/icons";
import QuestionSheet from "../../components/student/question-sheet/QuestionSheet";
import {
  useExamStore,
  useQuestionStore,
  useSubmissionStore,
} from "../../store";

export default function ExamDo() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const currentExam = useExamStore((s) => s.currentExam);
  const examQuestionsFromStore = useExamStore((s) => s.examQuestions);
  const fetchExamById = useExamStore((s) => s.fetchExamById);
  const fetchExamQuestions = useExamStore((s) => s.fetchExamQuestions);

  const questions = useQuestionStore((s) => s.questions);
  const fetchQuestions = useQuestionStore((s) => s.fetchQuestions);

  const submitExam = useSubmissionStore((s) => s.submitExam);

  const practiceState = location.state || {};
  const practiceMode = practiceState?.mode === "practice";
  const practiceQuestionsFromState = practiceState?.questions || [];
  const practiceCfg = practiceState?.cfg || null;

  useEffect(() => {
    if (practiceMode) {
      if (!practiceQuestionsFromState.length) {
        fetchQuestions();
      }
      return;
    }

    fetchExamById(examId);
    fetchExamQuestions(examId);
  }, [
    practiceMode,
    practiceQuestionsFromState,
    examId,
    fetchExamById,
    fetchExamQuestions,
    fetchQuestions,
  ]);

  const rawQuestionList = useMemo(() => {
    if (practiceMode) return practiceQuestionsFromState;
    return examQuestionsFromStore || [];
  }, [practiceMode, practiceQuestionsFromState, examQuestionsFromStore]);

  const examQuestions = useMemo(() => {
    return rawQuestionList.map((q) => ({
      id: q.id,
      difficulty: q.difficulty,
      tag: `${q.subjectName || q.subject || ""} · ${q.chapterName || q.chapter || ""}`,
      stem: q.title,
      options: (q.options || []).map((item) => ({
        key: item.key || item.option_key,
        text: item.text || item.option_text,
      })),
      correct: q.correct || q.correct_answer,
      explanation: q.analysis,
    }));
  }, [rawQuestionList]);

  const pageTitle = useMemo(() => {
    if (practiceMode) {
      return `${practiceCfg?.subjectName || "刷题"}练习`;
    }
    return currentExam?.title || "答题进行中";
  }, [practiceMode, practiceCfg, currentExam]);

  const pageSubtitle = useMemo(() => {
    return `测验ID：${examId} · 共${examQuestions.length}题`;
  }, [examId, examQuestions.length]);

  const handleBackHome = () => {
    navigate("/student/dashboard");
  };

  const handleBackWrong = () => {
    navigate("/student/wrong-book");
  };

  return (
    <div>
      <PageHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        icon={<FileTextOutlined />}
      />

      <QuestionSheet
        questions={examQuestions}
        showTimer={true}
        timerText="0:00"
        onSubmit={async ({ answers }) => {
          if (practiceMode) {
            const now = new Date().toISOString().slice(0, 19).replace("T", " ");
            const practiceRecordId = `practice_${Date.now()}`;

            const reviewQuestions = examQuestions.map((q) => ({
              id: q.id,
              tag: q.tag,
              difficulty: q.difficulty,
              stem: q.stem,
              options: q.options,
              correct: q.correct,
              explanation: q.explanation,
            }));

            const reviewAnswers = reviewQuestions.map((q, index) => ({
              id: index + 1,
              question_id: q.id,
              selected_answer: answers[String(q.id)] || "",
              correct_answer: q.correct,
              is_correct: (answers[String(q.id)] || "") === q.correct ? 1 : 0,
              answered_at: now,
            }));

            const correctCount = reviewAnswers.filter(
              (x) => x.is_correct === 1,
            ).length;
            const score = reviewQuestions.length
              ? Math.round((correctCount / reviewQuestions.length) * 100)
              : 0;

            navigate(`/student/records/${practiceRecordId}`, {
              state: {
                practiceReview: {
                  record: {
                    id: practiceRecordId,
                    title: `${practiceCfg?.subjectName || "刷题"}练习`,
                    score,
                    total_count: reviewQuestions.length,
                    correct_count: correctCount,
                    duration_min: 20,
                    submitted_at: now,
                  },
                  answerRecords: reviewAnswers,
                  questions: reviewQuestions,
                },
              },
            });

            return {};
          }

          try {
            const answerList = examQuestions.map((q) => ({
              question_id: q.id,
              selected_answer: answers[String(q.id)] || "",
            }));

            const res = await submitExam({
              examId: Number(examId),
              duration: 20,
              answers: answerList,
            });

            const recordId = res?.submission?.id;
            message.success("提交成功");

            if (recordId) {
              navigate(`/student/records/${recordId}`);
            } else {
              navigate("/student/records");
            }
          } catch (error) {
            message.error(error.message || "提交失败");
          }

          return {};
        }}
        onBackHome={handleBackHome}
        onViewWrong={handleBackWrong}
      />
    </div>
  );
}
