import { create } from "zustand";
import { http } from "../../api/http";
import { useStudentStore } from "./studentStore";

function normalizeWrongQuestion(item) {
  return {
    wrongBookId: item.id ?? null,
    questionId: Number(item.question_id),
    title: item.title || "",
    analysis: item.analysis || "",
    difficulty: item.difficulty || "未设置",
    correctAnswer: item.correct_answer || "",
    selectedAnswer: item.selected_answer || "",
    examId: item.exam_id ?? null,
    examTitle: item.exam_title || "",
    answeredAt: item.answered_at || "",
    status: item.status || "pending",
    wrongCount: Number(item.wrong_count || 1),
    lastPracticeAt: item.last_practice_at || item.answered_at || "",
    lastWrongAt: item.last_wrong_at || item.answered_at || "",
    subjectName: item.subject_name || "",
    chapterName: item.chapter_name || "",
  };
}

function normalizeAnswerRecord(item) {
  return {
    id: Number(item.id),
    submissionId: item.submission_id ?? null,
    examId: item.exam_id ?? null,
    studentId: item.student_id ?? null,
    questionId: Number(item.question_id),
    selectedAnswer: item.selected_answer || "",
    correctAnswer: item.correct_answer || "",
    isCorrect: Number(item.is_correct || 0),
    answeredAt: item.answered_at || "",
    title: item.title || "",
    difficulty: item.difficulty || "未设置",
    subjectName: item.subject_name || "",
    chapterName: item.chapter_name || "",
  };
}

export const useAnswerRecordStore = create((set, get) => ({
  wrongQuestions: [],
  answerRecords: [],
  studentStats: null,
  examAnalytics: [],
  loading: false,

  fetchWrongQuestions: async () => {
    const studentId = useStudentStore.getState().getCurrentStudentId();

    if (!studentId) {
      set({ wrongQuestions: [] });
      return [];
    }

    set({ loading: true });

    try {
      const res = await http.get(`/students/${studentId}/wrong-questions`);
      const wrongQuestions = (res || []).map(normalizeWrongQuestion);

      set({
        wrongQuestions,
        loading: false,
      });

      return wrongQuestions;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchStudentAnswerRecords: async () => {
    const studentId = useStudentStore.getState().getCurrentStudentId();

    if (!studentId) {
      set({ answerRecords: [] });
      return [];
    }

    set({ loading: true });

    try {
      const res = await http.get(`/students/${studentId}/answer-records`);
      const answerRecords = (res || []).map(normalizeAnswerRecord);

      set({
        answerRecords,
        loading: false,
      });

      return answerRecords;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  markWrongQuestionMastered: async (questionId) => {
    const studentId = useStudentStore.getState().getCurrentStudentId();

    if (!studentId || questionId == null) {
      return false;
    }

    await http.patch(
      `/students/${studentId}/wrong-questions/${questionId}/status`,
      {
        status: "mastered",
      },
    );

    set((state) => ({
      wrongQuestions: state.wrongQuestions.map((item) =>
        Number(item.questionId) === Number(questionId)
          ? {
              ...item,
              status: "mastered",
            }
          : item,
      ),
    }));

    return true;
  },

  markWrongQuestionPending: async (questionId) => {
    const studentId = useStudentStore.getState().getCurrentStudentId();

    if (!studentId || questionId == null) {
      return false;
    }

    await http.patch(
      `/students/${studentId}/wrong-questions/${questionId}/status`,
      {
        status: "pending",
      },
    );

    set((state) => ({
      wrongQuestions: state.wrongQuestions.map((item) =>
        Number(item.questionId) === Number(questionId)
          ? {
              ...item,
              status: "pending",
            }
          : item,
      ),
    }));

    return true;
  },

  fetchStudentStats: async () => {
    const studentId = useStudentStore.getState().getCurrentStudentId();

    if (!studentId) {
      set({
        studentStats: {
          examCount: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          accuracy: 0,
          avgScore: 0,
        },
      });
      return null;
    }

    set({ loading: true });

    try {
      const res = await http.get(`/students/${studentId}/stats`);

      const studentStats = {
        examCount: Number(res?.examCount || 0),
        totalQuestions: Number(res?.totalQuestions || 0),
        totalCorrect: Number(res?.totalCorrect || 0),
        accuracy: Number(res?.accuracy || 0),
        avgScore: Number(res?.avgScore || 0),
      };

      set({
        studentStats,
        loading: false,
      });

      return studentStats;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchExamAnalytics: async (examId) => {
    set({ loading: true });

    try {
      const res = await http.get(`/analytics/exams/${examId}`);

      const examAnalytics = (res || []).map((item, index) => ({
        id: index + 1,
        questionId: item.questionId,
        title: item.title,
        answered: Number(item.answered || 0),
        correct: Number(item.correct || 0),
        accuracy: Number(item.accuracy || 0),
        wrongOption: item.wrongOption || "",
        wrongText: item.wrongText || "",
      }));

      set({
        examAnalytics,
        loading: false,
      });

      return examAnalytics;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  refreshStudentAnalytics: async () => {
    const studentId = useStudentStore.getState().getCurrentStudentId();

    if (!studentId) {
      set({
        wrongQuestions: [],
        answerRecords: [],
        studentStats: {
          examCount: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          accuracy: 0,
          avgScore: 0,
        },
      });

      return {
        wrongQuestions: [],
        answerRecords: [],
        studentStats: {
          examCount: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          accuracy: 0,
          avgScore: 0,
        },
      };
    }

    set({ loading: true });

    try {
      const [wrongRes, answerRes, statsRes] = await Promise.all([
        http.get(`/students/${studentId}/wrong-questions`),
        http.get(`/students/${studentId}/answer-records`),
        http.get(`/students/${studentId}/stats`),
      ]);

      const wrongQuestions = (wrongRes || []).map(normalizeWrongQuestion);
      const answerRecords = (answerRes || []).map(normalizeAnswerRecord);

      const studentStats = {
        examCount: Number(statsRes?.examCount || 0),
        totalQuestions: Number(statsRes?.totalQuestions || 0),
        totalCorrect: Number(statsRes?.totalCorrect || 0),
        accuracy: Number(statsRes?.accuracy || 0),
        avgScore: Number(statsRes?.avgScore || 0),
      };

      set({
        wrongQuestions,
        answerRecords,
        studentStats,
        loading: false,
      });

      return {
        wrongQuestions,
        answerRecords,
        studentStats,
      };
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  getWrongQuestions: () => get().wrongQuestions,
  getAnswerRecords: () => get().answerRecords,
  getWrongQuestionsCount: () => get().wrongQuestions.length,
  getStudentAccuracy: () => Number(get().studentStats?.accuracy || 0),
  getStudentAvgScore: () => Number(get().studentStats?.avgScore || 0),
  getStudentExamCount: () => Number(get().studentStats?.examCount || 0),
  getStudentTotalQuestions: () =>
    Number(get().studentStats?.totalQuestions || 0),
  getStudentTotalCorrect: () => Number(get().studentStats?.totalCorrect || 0),

  getQuestionAccuracyByExamId: (questionId) =>
    get().examAnalytics.find(
      (item) => Number(item.questionId) === Number(questionId),
    ) || null,

  clearStudentAnalytics: () =>
    set({
      wrongQuestions: [],
      answerRecords: [],
      studentStats: null,
    }),

  clearExamAnalytics: () =>
    set({
      examAnalytics: [],
    }),

  clearAll: () =>
    set({
      wrongQuestions: [],
      answerRecords: [],
      studentStats: null,
      examAnalytics: [],
    }),
}));
