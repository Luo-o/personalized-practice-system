// import { create } from "zustand";

// const initialAnswerRecords = [
//   {
//     id: 9001,
//     submissionId: 5001,
//     examId: 1001,
//     studentId: 1,
//     questionId: 101,
//     selectedAnswer: "A",
//     correctAnswer: "B",
//     isCorrect: false,
//     answeredAt: "2024-05-01 09:45",
//   },
//   {
//     id: 9002,
//     submissionId: 5001,
//     examId: 1001,
//     studentId: 1,
//     questionId: 102,
//     selectedAnswer: "B",
//     correctAnswer: "B",
//     isCorrect: true,
//     answeredAt: "2024-05-01 09:52",
//   },
//   {
//     id: 9003,
//     submissionId: 5002,
//     examId: 1002,
//     studentId: 1,
//     questionId: 101,
//     selectedAnswer: "B",
//     correctAnswer: "B",
//     isCorrect: true,
//     answeredAt: "2024-04-20 14:22",
//   },
// ];

// function isSameDay(dateStr, targetDate = new Date()) {
//   const d = new Date(dateStr.replace(" ", "T"));
//   return (
//     d.getFullYear() === targetDate.getFullYear() &&
//     d.getMonth() === targetDate.getMonth() &&
//     d.getDate() === targetDate.getDate()
//   );
// }

// export const useAnswerRecordStore = create((set, get) => ({
//   answerRecords: initialAnswerRecords,

//   addAnswerRecord: (record) =>
//     set((state) => ({
//       answerRecords: [...state.answerRecords, record],
//     })),

//   addAnswerRecords: (records) =>
//     set((state) => ({
//       answerRecords: [...state.answerRecords, ...records],
//     })),

//   updateAnswerRecord: (id, data) =>
//     set((state) => ({
//       answerRecords: state.answerRecords.map((r) =>
//         r.id === id ? { ...r, ...data } : r,
//       ),
//     })),

//   deleteAnswerRecord: (id) =>
//     set((state) => ({
//       answerRecords: state.answerRecords.filter((r) => r.id !== id),
//     })),

//   getRecordsBySubmissionId: (submissionId) =>
//     get().answerRecords.filter((r) => r.submissionId === submissionId),

//   getRecordsByStudentId: (studentId) =>
//     get().answerRecords.filter((r) => r.studentId === studentId),

//   getWrongRecordsByStudentId: (studentId) =>
//     get().answerRecords.filter(
//       (r) => r.studentId === studentId && !r.isCorrect,
//     ),

//   getWrongQuestionIdsByStudentId: (studentId) => [
//     ...new Set(
//       get()
//         .answerRecords.filter((r) => r.studentId === studentId && !r.isCorrect)
//         .map((r) => r.questionId),
//     ),
//   ],

//   getTodayAnswerCountByStudentId: (studentId) =>
//     get().answerRecords.filter(
//       (r) => r.studentId === studentId && isSameDay(r.answeredAt),
//     ).length,

//   getAccuracyByStudentId: (studentId) => {
//     const records = get().answerRecords.filter(
//       (r) => r.studentId === studentId,
//     );
//     if (!records.length) return 0;
//     const correct = records.filter((r) => r.isCorrect).length;
//     return Math.round((correct / records.length) * 100);
//   },
// }));

import { create } from "zustand";
import { http } from "../../api/http";
import { useStudentStore } from "./studentStore";

export const useAnswerRecordStore = create((set, get) => ({
  wrongQuestions: [],
  studentStats: null,
  examAnalytics: [],
  loading: false,

  // 获取当前学生错题本
  fetchWrongQuestions: async () => {
    const studentId = useStudentStore.getState().getCurrentStudentId();

    if (!studentId) {
      set({ wrongQuestions: [] });
      return [];
    }

    set({ loading: true });

    try {
      const res = await http.get(`/students/${studentId}/wrong-questions`);

      const wrongQuestions = (res || []).map((item) => ({
        questionId: item.question_id,
        title: item.title,
        analysis: item.analysis,
        difficulty: item.difficulty,
        correctAnswer: item.correct_answer,
        selectedAnswer: item.selected_answer,
        examId: item.exam_id,
        examTitle: item.exam_title,
        answeredAt: item.answered_at,
      }));

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

  // 获取当前学生统计
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

  // 获取某场考试分析（教师端）
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

  // 一次性刷新学生端统计数据
  refreshStudentAnalytics: async () => {
    const studentId = useStudentStore.getState().getCurrentStudentId();
    if (!studentId) {
      set({
        wrongQuestions: [],
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
      const [wrongRes, statsRes] = await Promise.all([
        http.get(`/students/${studentId}/wrong-questions`),
        http.get(`/students/${studentId}/stats`),
      ]);

      const wrongQuestions = (wrongRes || []).map((item) => ({
        questionId: item.question_id,
        title: item.title,
        analysis: item.analysis,
        difficulty: item.difficulty,
        correctAnswer: item.correct_answer,
        selectedAnswer: item.selected_answer,
        examId: item.exam_id,
        examTitle: item.exam_title,
        answeredAt: item.answered_at,
      }));

      const studentStats = {
        examCount: Number(statsRes?.examCount || 0),
        totalQuestions: Number(statsRes?.totalQuestions || 0),
        totalCorrect: Number(statsRes?.totalCorrect || 0),
        accuracy: Number(statsRes?.accuracy || 0),
        avgScore: Number(statsRes?.avgScore || 0),
      };

      set({
        wrongQuestions,
        studentStats,
        loading: false,
      });

      return {
        wrongQuestions,
        studentStats,
      };
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 兼容旧页面方法
  getWrongQuestions: () => get().wrongQuestions,

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
      studentStats: null,
    }),

  clearExamAnalytics: () =>
    set({
      examAnalytics: [],
    }),

  clearAll: () =>
    set({
      wrongQuestions: [],
      studentStats: null,
      examAnalytics: [],
    }),
}));
