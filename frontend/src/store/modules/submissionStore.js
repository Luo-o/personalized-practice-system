// import { create } from "zustand";

// const initialSubmissions = [
//   {
//     id: 5001,
//     examId: 1001,
//     studentId: 1,
//     title: "期中考试",
//     subject: "计算机网络",
//     total: 2,
//     score: 50,
//     correctCount: 1,
//     durationMin: 35,
//     finishedAt: "2024-05-01 10:12",
//     classId: 1,
//   },
//   {
//     id: 5002,
//     examId: 1002,
//     studentId: 1,
//     title: "第3章 章节测验",
//     subject: "计算机网络",
//     total: 1,
//     score: 100,
//     correctCount: 1,
//     durationMin: 8,
//     finishedAt: "2024-04-20 14:25",
//     classId: 1,
//   },
// ];

// export const useSubmissionStore = create((set, get) => ({
//   submissions: initialSubmissions,

//   addSubmission: (submission) =>
//     set((state) => ({
//       submissions: [...state.submissions, submission],
//     })),

//   updateSubmission: (id, data) =>
//     set((state) => ({
//       submissions: state.submissions.map((s) =>
//         s.id === id ? { ...s, ...data } : s,
//       ),
//     })),

//   deleteSubmission: (id) =>
//     set((state) => ({
//       submissions: state.submissions.filter((s) => s.id !== id),
//     })),

//   getSubmissionById: (id) => get().submissions.find((s) => s.id === id) || null,

//   getSubmissionsByStudentId: (studentId) =>
//     get().submissions.filter((s) => s.studentId === studentId),

//   getSubmissionsByExamId: (examId) =>
//     get().submissions.filter((s) => s.examId === examId),

//   getSubmissionByExamAndStudent: (examId, studentId) =>
//     get().submissions.find(
//       (s) => s.examId === examId && s.studentId === studentId,
//     ) || null,

//   getFinishedCountByExamId: (examId) =>
//     get().submissions.filter((s) => s.examId === examId).length,
// }));
import { create } from "zustand";
import { http } from "../../api/http";
import { useStudentStore } from "./studentStore";

export const useSubmissionStore = create((set, get) => ({
  submissions: [],
  currentSubmission: null,
  loading: false,

  // 获取全部提交记录（教师端）
  fetchSubmissions: async () => {
    set({ loading: true });

    try {
      const res = await http.get("/submissions");

      set({
        submissions: res || [],
        loading: false,
      });

      return res;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 获取提交详情
  fetchSubmissionById: async (id) => {
    set({ loading: true });

    try {
      const res = await http.get(`/submissions/${id}`);

      set({
        currentSubmission: res,
        loading: false,
      });

      return res;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 获取某考试提交情况（教师端）
  fetchExamSubmissions: async (examId) => {
    set({ loading: true });

    try {
      const res = await http.get(`/exams/${examId}/submissions`);

      set({
        submissions: res?.submissions || [],
        loading: false,
      });

      return res;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 学生提交答卷
  submitExam: async ({ examId, answers, duration }) => {
    const studentId = useStudentStore.getState().getCurrentStudentId();

    if (!studentId) {
      throw new Error("学生未登录");
    }

    const submissionId = Date.now();

    const payload = {
      id: submissionId,
      exam_id: examId,
      student_id: studentId,
      duration_min: duration,
      submitted_at: new Date().toISOString(),
      answers,
    };

    try {
      const res = await http.post("/submissions", payload);

      set((state) => ({
        submissions: [...state.submissions, res.submission],
      }));

      return res;
    } catch (error) {
      throw error;
    }
  },

  // 根据学生查询提交记录
  getSubmissionsByStudentId: (studentId) =>
    get().submissions.filter((s) => Number(s.student_id) === Number(studentId)),

  // 根据考试查询提交记录
  getSubmissionsByExamId: (examId) =>
    get().submissions.filter((s) => Number(s.exam_id) === Number(examId)),

  clearCurrentSubmission: () =>
    set({
      currentSubmission: null,
    }),
}));
