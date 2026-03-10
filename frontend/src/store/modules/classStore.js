import { create } from "zustand";
import { http } from "../../api/http";
import { normalizeClass } from "../../api/normalizer";
import { useStudentStore } from "./studentStore";
import { useTeacherStore } from "./teacherStore";

export const useClassStore = create((set, get) => ({
  classes: [],
  currentClass: null,
  classStudents: [],
  loading: false,

  // 获取全部班级
  fetchClasses: async () => {
    set({ loading: true });

    try {
      const res = await http.get("/classes");

      const classes = (res || []).map(normalizeClass);

      set({
        classes,
        loading: false,
      });

      return classes;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 获取班级详情
  fetchClassById: async (classId) => {
    set({ loading: true });

    try {
      const res = await http.get(`/classes/${classId}`);

      const currentClass = normalizeClass(res);

      set({
        currentClass,
        loading: false,
      });

      return currentClass;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 获取班级学生
  fetchClassStudents: async (classId) => {
    set({ loading: true });

    try {
      const res = await http.get(`/classes/${classId}/students`);

      set({
        classStudents: res || [],
        loading: false,
      });

      return res;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 获取当前学生班级
  fetchStudentClasses: async () => {
    const studentId = useStudentStore.getState().getCurrentStudentId();

    if (!studentId) return [];

    set({ loading: true });

    try {
      const res = await http.get(`/students/${studentId}/classes`);

      const classes = (res || []).map(normalizeClass);

      set({
        classes,
        loading: false,
      });

      return classes;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 获取当前教师班级
  fetchTeacherClasses: async () => {
    const teacherId = useTeacherStore.getState().getCurrentTeacherId();

    if (!teacherId) return [];

    set({ loading: true });

    try {
      const res = await http.get(`/teachers/${teacherId}/classes`);

      const classes = (res || []).map(normalizeClass);

      set({
        classes,
        loading: false,
      });

      return classes;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 清空当前班级
  clearCurrentClass: () => {
    set({
      currentClass: null,
      classStudents: [],
    });
  },
}));
