import { create } from "zustand";
import { http } from "../../api/http";
import { normalizeClass } from "../../api/normalizer";
import { useStudentStore } from "./studentStore";
import { useTeacherStore } from "./teacherStore";

function pickArrayPayload(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.students)) return res.students;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.students)) return res.data.students;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}

export const useClassStore = create((set, get) => ({
  classes: [],
  currentClass: null,
  classStudents: [],
  loading: false,

  fetchClasses: async () => {
    set({ loading: true });
    try {
      const res = await http.get("/classes");
      const rawList = pickArrayPayload(res);
      const classes = rawList.map(normalizeClass);

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

  fetchClassById: async (classId) => {
    set({ loading: true });
    try {
      const res = await http.get(`/classes/${classId}`);
      const data = res?.data ?? res;
      const currentClass = normalizeClass(data);

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

  fetchClassStudents: async (classId) => {
    set({ loading: true });
    try {
      const res = await http.get(`/classes/${classId}/students`);
      const classStudents =
        res?.data?.students || res?.students || pickArrayPayload(res);

      const classInfo = res?.data?.classInfo || null;

      set((state) => ({
        classStudents,
        currentClass: classInfo
          ? normalizeClass(classInfo)
          : state.currentClass,
        loading: false,
      }));

      return classStudents;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchStudentClasses: async () => {
    const studentId = useStudentStore.getState().getCurrentStudentId();
    if (!studentId) return [];

    set({ loading: true });
    try {
      const res = await http.get(`/students/${studentId}/classes`);
      const rawList = pickArrayPayload(res);
      const classes = rawList.map(normalizeClass);

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

  fetchTeacherClasses: async () => {
    const teacherId = useTeacherStore.getState().getCurrentTeacherId();
    if (!teacherId) return [];

    set({ loading: true });
    try {
      const res = await http.get(`/teachers/${teacherId}/classes`);
      const rawList = pickArrayPayload(res);
      const classes = rawList.map(normalizeClass);

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

  joinClassByCode: async (classCode) => {
    const studentId = useStudentStore.getState().getCurrentStudentId();

    if (!studentId) {
      throw new Error("学生未登录");
    }

    const code = String(classCode || "").trim();
    if (!code) {
      throw new Error("课程号不能为空");
    }

    set({ loading: true });

    try {
      const res = await http.post("/classes/join", {
        class_code: code,
        student_id: Number(studentId),
      });

      await get().fetchStudentClasses();

      set({ loading: false });
      return res?.data ?? res;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  quitClass: async (classId) => {
    const studentId = useStudentStore.getState().getCurrentStudentId();

    if (!studentId) {
      throw new Error("学生未登录");
    }

    if (!classId) {
      throw new Error("班级ID不能为空");
    }

    set({ loading: true });

    try {
      const res = await http.post(`/classes/${classId}/quit`, {
        student_id: Number(studentId),
      });

      set((state) => ({
        classes: state.classes.filter(
          (item) => Number(item.id) !== Number(classId),
        ),
        currentClass:
          Number(state.currentClass?.id) === Number(classId)
            ? null
            : state.currentClass,
        classStudents:
          Number(state.currentClass?.id) === Number(classId)
            ? []
            : state.classStudents,
        loading: false,
      }));

      return res?.data ?? res;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  createClass: async ({
    name,
    subjectId,
    subject_id,
    desc = "",
    description = "",
  }) => {
    const teacherId = useTeacherStore.getState().getCurrentTeacherId();

    if (!teacherId) {
      throw new Error("教师未登录");
    }

    const className = String(name || "").trim();
    const finalSubjectId = subjectId ?? subject_id;
    const finalDesc = description || desc || "";

    if (!className) {
      throw new Error("班级名称不能为空");
    }

    if (!finalSubjectId) {
      throw new Error("请选择科目");
    }

    set({ loading: true });

    try {
      const payload = {
        name: className,
        teacher_id: Number(teacherId),
        subject_id: Number(finalSubjectId),
        description: String(finalDesc).trim(),
      };

      const res = await http.post("/classes", payload);

      await get().fetchTeacherClasses();

      set({ loading: false });
      return res?.data ?? res;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  addStudentToClass: async (classId, studentId) => {
    if (!classId) throw new Error("班级ID不能为空");
    if (!studentId) throw new Error("学生ID不能为空");

    set({ loading: true });

    try {
      const res = await http.post(`/classes/${classId}/students`, {
        student_id: Number(studentId),
      });

      const classStudents =
        res?.data?.students || res?.students || pickArrayPayload(res);

      set({
        classStudents,
        loading: false,
      });

      await get().fetchTeacherClasses();

      return res?.data ?? res;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  removeStudentFromClass: async (classId, studentId) => {
    if (!classId) throw new Error("班级ID不能为空");
    if (!studentId) throw new Error("学生ID不能为空");

    set({ loading: true });

    try {
      const res = await http.delete(
        `/classes/${classId}/students/${studentId}`,
      );

      const classStudents =
        res?.data?.students || res?.students || pickArrayPayload(res);

      set({
        classStudents,
        loading: false,
      });

      await get().fetchTeacherClasses();

      return res?.data ?? res;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  clearCurrentClass: () => {
    set({
      currentClass: null,
      classStudents: [],
    });
  },
}));
