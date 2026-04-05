import { create } from "zustand";
import { http } from "../../api/http";
import { useStudentStore } from "./studentStore";
import { message } from "antd";

export const useSubmissionStore = create((set, get) => ({
  submissions: [],
  currentSubmission: null,
  loading: false,

  // 获取全部提交记录（教师端 / 学生端记录页共用）
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

  // 学生提交答卷 / 自主刷题
  submitExam: async (payload = {}) => {
    const studentId = useStudentStore.getState().getCurrentStudentId();

    if (!studentId) {
      throw new Error("学生未登录");
    }

    const now = new Date();
    const submittedAt = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(
      now.getHours(),
    ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(
      now.getSeconds(),
    ).padStart(2, "0")}`;

    const submissionId = Date.now();

    const requestBody = {
      id: submissionId,
      type: payload.type || "exam",
      exam_id: payload.exam_id ?? payload.examId ?? null,
      student_id: payload.student_id ?? studentId,
      class_id: payload.class_id ?? null,
      title: payload.title ?? null,
      subject_id: payload.subject_id ?? null,
      duration_min: payload.duration_min ?? payload.duration ?? null,
      submitted_at: payload.submitted_at || submittedAt,
      answers: Array.isArray(payload.answers) ? payload.answers : [],
    };

    console.log("submitExam requestBody =", requestBody);

    try {
      const res = await http.post("/submissions", requestBody);
      return res;
    } catch (error) {
      message.error("提交失败");
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
