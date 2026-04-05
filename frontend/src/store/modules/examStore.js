import { create } from "zustand";
import { http } from "../../api/http";
import { normalizeExam, normalizeQuestion } from "../../api/normalizer";
import { useStudentStore } from "./studentStore";
import { useTeacherStore } from "./teacherStore";

function normalizeStudentExam(e) {
  return {
    id: e.id,
    title: e.title,
    classId: e.class_id,
    teacherId: e.teacher_id,
    subjectId: e.subject_id,
    publishAt: e.publish_at,
    deadlineAt: e.deadline_at,
    status: e.status,
    duration: e.duration_minutes,
    totalScore: e.total_score,
    className: e.class_name,
    teacherName: e.teacher_name,
    subjectName: e.subject_name,
    questionCount: e.question_count || 0,
    hasSubmitted: Number(e.has_submitted || 0),
    submissionId: e.submission_id ?? null,
    submissionScore: e.submission_score ?? null,
    correctCount: e.correct_count ?? 0,
    submittedAt: e.submitted_at ?? null,
  };
}

export const useExamStore = create((set, get) => ({
  exams: [],
  currentExam: null,
  examQuestions: [],
  loading: false,

  // 获取全部考试（教师端/总表）
  fetchExams: async () => {
    set({ loading: true });

    try {
      const res = await http.get("/exams");
      const exams = (res || []).map(normalizeExam);

      set({
        exams,
        loading: false,
      });

      return exams;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 获取当前学生可见考试
  fetchStudentExams: async () => {
    const studentId = useStudentStore.getState().getCurrentStudentId();
    if (!studentId) {
      set({ exams: [] });
      return [];
    }

    set({ loading: true });

    try {
      const res = await http.get(`/students/${studentId}/exams`);
      const exams = (res || []).map(normalizeStudentExam);

      set({
        exams,
        loading: false,
      });

      return exams;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 获取当前教师考试
  fetchTeacherExams: async () => {
    const teacherId = useTeacherStore.getState().getCurrentTeacherId();
    if (!teacherId) {
      set({ exams: [] });
      return [];
    }

    set({ loading: true });

    try {
      const res = await http.get("/exams");
      const allExams = (res || []).map(normalizeExam);
      const exams = allExams.filter(
        (e) => Number(e.teacherId) === Number(teacherId),
      );

      set({
        exams,
        loading: false,
      });

      return exams;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 获取考试详情
  fetchExamById: async (examId) => {
    set({ loading: true });

    try {
      const res = await http.get(`/exams/${examId}`);
      const currentExam = normalizeExam(res);

      set({
        currentExam,
        loading: false,
      });

      return currentExam;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 获取考试题目
  fetchExamQuestions: async (examId) => {
    set({ loading: true });

    try {
      const res = await http.get(`/exams/${examId}/questions`);
      const exam = res?.exam ? normalizeExam(res.exam) : null;
      const questions = (res?.questions || []).map(normalizeQuestion);

      set({
        currentExam: exam || get().currentExam,
        examQuestions: questions,
        loading: false,
      });

      return {
        exam,
        questions,
      };
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 新增考试
  addExam: async (examData) => {
    set({ loading: true });

    try {
      const payload = {
        id: examData.id,
        title: examData.title,
        class_id: examData.classId,
        teacher_id: examData.teacherId,
        subject_id: examData.subjectId,
        publish_at: examData.publishAt ?? null,
        deadline_at: examData.deadlineAt ?? null,
        status: examData.status,
        duration_minutes: examData.duration ?? null,
        total_score: examData.totalScore ?? null,
        questionIds: examData.questionIds || [],
      };

      const res = await http.post("/exams", payload);
      const created = normalizeExam(res);

      set((state) => ({
        exams: [...state.exams, created],
        loading: false,
      }));

      return created;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 更新考试
  updateExam: async (id, examData) => {
    set({ loading: true });

    try {
      const payload = {
        title: examData.title,
        class_id: examData.classId,
        teacher_id: examData.teacherId,
        subject_id: examData.subjectId,
        publish_at: examData.publishAt ?? null,
        deadline_at: examData.deadlineAt ?? null,
        status: examData.status,
        duration_minutes: examData.duration ?? null,
        total_score: examData.totalScore ?? null,
        questionIds: examData.questionIds || [],
      };

      const res = await http.patch(`/exams/${id}`, payload);
      const updated = normalizeExam(res);

      set((state) => ({
        exams: state.exams.map((e) =>
          Number(e.id) === Number(id) ? updated : e,
        ),
        currentExam:
          state.currentExam && Number(state.currentExam.id) === Number(id)
            ? updated
            : state.currentExam,
        loading: false,
      }));

      return updated;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 删除考试
  deleteExam: async (id) => {
    set({ loading: true });

    try {
      await http.delete(`/exams/${id}`);

      set((state) => ({
        exams: state.exams.filter((e) => Number(e.id) !== Number(id)),
        currentExam:
          state.currentExam && Number(state.currentExam.id) === Number(id)
            ? null
            : state.currentExam,
        examQuestions:
          state.currentExam && Number(state.currentExam.id) === Number(id)
            ? []
            : state.examQuestions,
        loading: false,
      }));

      return true;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 兼容旧页面的本地查询方法
  getExamById: (id) =>
    get().exams.find((e) => Number(e.id) === Number(id)) || null,

  getExamsByClassId: (classId) =>
    get().exams.filter((e) => Number(e.classId) === Number(classId)),

  getExamsByTeacherId: (teacherId) =>
    get().exams.filter((e) => Number(e.teacherId) === Number(teacherId)),

  getPublishedExams: () => get().exams.filter((e) => e.status === "published"),

  clearCurrentExam: () =>
    set({
      currentExam: null,
      examQuestions: [],
    }),
}));
