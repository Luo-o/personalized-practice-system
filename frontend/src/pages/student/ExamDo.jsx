import React, { useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";
import QuestionSheet from "../../components/student/question-sheet/QuestionSheet";
import {
  useExamStore,
  useQuestionStore,
  useSubmissionStore,
  useStudentStore,
} from "../../store";

export default function ExamDo() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const studentId = useStudentStore((s) => s.getCurrentStudentId());

  const currentExam = useExamStore((s) => s.currentExam);
  const examQuestionsFromStore = useExamStore((s) => s.examQuestions);

  const submitExam = useSubmissionStore((s) => s.submitExam);

  const practiceState = location.state || {};
  const practiceMode = practiceState?.mode === "practice";
  const practiceQuestionsFromState = Array.isArray(practiceState?.questions)
    ? practiceState.questions
    : [];
  const practiceCfg = practiceState?.cfg || null;

  const initFetchedRef = useRef(false);

  useEffect(() => {
    initFetchedRef.current = false;
  }, [examId, practiceMode]);

  useEffect(() => {
    if (initFetchedRef.current) return;
    initFetchedRef.current = true;

    const run = async () => {
      try {
        if (practiceMode) {
          if (!practiceQuestionsFromState.length) {
            await useQuestionStore.getState().fetchQuestions();
          }
          return;
        }

        await Promise.all([
          useExamStore.getState().fetchExamById(examId),
          useExamStore.getState().fetchExamQuestions(examId),
        ]);
      } catch (error) {
        message.error(error?.message || "加载失败");
      }
    };

    run();
  }, [examId, practiceMode]);

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
      subjectId: q.subjectId || q.subject_id,
      subjectName: q.subjectName || q.subject_name || q.subject,
      chapterName: q.chapterName || q.chapter_name || q.chapter,

      // 关键：把图片传下去
      images: (q.images || []).map((img, index) => ({
        id: img.id || index,
        imageUrl: img.imageUrl || img.image_url || img.url || "",
        sortOrder: img.sortOrder || img.sort_order || index + 1,
      })),
    }));
  }, [rawQuestionList]);

  const examTitle = useMemo(() => {
    if (practiceMode) {
      return `${practiceCfg?.subjectName || "刷题"}练习`;
    }
    return currentExam?.title || "Quiz Title";
  }, [practiceMode, practiceCfg, currentExam]);

  const handleBackHome = () => {
    navigate("/student/dashboard");
  };

  const handleBackWrong = () => {
    navigate("/student/wrong-book");
  };

  const handleBackList = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/student/records");
  };

  return (
    <div>
      <QuestionSheet
        title={examTitle}
        questions={examQuestions}
        showTimer={true}
        timerText="0:00"
        onBackList={handleBackList}
        onSubmit={async ({ answers }) => {
          try {
            const answerList = examQuestions.map((q) => ({
              question_id: q.id,
              selected_answer: answers[String(q.id)] || answers[q.id] || "",
            }));

            if (practiceMode) {
              const firstQuestion = examQuestions[0] || {};
              const subjectId =
                practiceCfg?.subjectId || firstQuestion.subjectId || null;

              const res = await submitExam({
                type: "practice",
                student_id: Number(studentId),
                title: `${practiceCfg?.subjectName || firstQuestion.subjectName || "自主刷题"}练习`,
                subject_id: subjectId,
                duration_min: 20,
                answers: answerList,
              });

              const recordId = res?.submission?.id || res?.data?.submission?.id;
              message.success("提交成功");

              if (recordId) {
                navigate(`/student/records/${recordId}`);
              } else {
                navigate("/student/records");
              }

              return {};
            }

            const res = await submitExam({
              type: "exam",
              examId: Number(examId),
              exam_id: Number(examId),
              student_id: Number(studentId),
              duration_min: 20,
              answers: answerList,
            });

            const recordId = res?.submission?.id || res?.data?.submission?.id;
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
