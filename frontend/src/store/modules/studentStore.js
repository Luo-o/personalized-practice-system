import { create } from "zustand";
import { http } from "../../api/http";
import { useAuthStore } from "./authStore";

export const useStudentStore = create((set) => ({
  students: [],
  loading: false,

  getCurrentStudent: () => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser || currentUser.role !== "student") return null;

    const profile = currentUser.profile || null;
    if (!profile) return null;

    return {
      id: profile.id,
      studentNo: profile.student_no,
      name: profile.name,
      gender: profile.gender,
      phone: profile.phone,
      email: profile.email,
      major: profile.major,
      grade: profile.grade,
      className: profile.class_name,
      avatar: profile.avatar || "/avatars/default-student-avatar.png",
    };
  },

  getCurrentStudentId: () => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser || currentUser.role !== "student") return null;
    return currentUser.profileId ?? null;
  },

  refreshCurrentStudent: async () => {
    const authStore = useAuthStore.getState();
    if (authStore.getRole() !== "student") return null;

    const nextUser = await authStore.refreshMe();
    return nextUser?.profile || null;
  },

  searchStudents: async (keyword) => {
    const text = String(keyword || "").trim();

    if (!text) {
      set({ students: [] });
      return [];
    }

    set({ loading: true });

    try {
      const res = await http.get("/students/search", {
        params: {
          keyword: text,
        },
      });

      const list = Array.isArray(res) ? res : res?.data || [];

      const normalizedList = list.map((item) => ({
        id: item.id,
        studentNo: item.studentNo || item.student_no || "",
        name: item.name || "",
        gender: item.gender || "",
        phone: item.phone || "",
        email: item.email || "",
        major: item.major || "",
        grade: item.grade || "",
        className: item.className || item.class_name || "",
        avatar: item.avatar || "/avatars/default-student-avatar.png",
      }));

      set({
        students: normalizedList,
        loading: false,
      });

      return normalizedList;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  batchCreateStudents: async (students) => {
    const list = Array.isArray(students) ? students : [];

    if (!list.length) {
      throw new Error("学生数据不能为空");
    }

    set({ loading: true });

    try {
      const payload = list.map((item) => ({
        studentNo: item.studentNo,
        name: item.name,
        gender: item.gender || "",
        major: item.major || "",
        grade: item.grade || "",
        className: item.className || "",
        phone: item.phone || "",
        email: item.email || "",
      }));

      const res = await http.post("/students/batch-create", {
        students: payload,
      });

      set({ loading: false });
      return res;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  batchAddStudentsToClass: async ({ classId, studentIds }) => {
    if (!classId) {
      throw new Error("请选择班级");
    }

    if (!Array.isArray(studentIds) || !studentIds.length) {
      throw new Error("请选择学生");
    }

    set({ loading: true });

    try {
      const res = await http.post(`/students/classes/${classId}/batch-add`, {
        studentIds,
      });

      set({ loading: false });
      return res;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  addStudent: () => {
    throw new Error("当前后端未提供学生新增接口");
  },

  deleteStudent: () => {
    throw new Error("当前后端未提供学生删除接口");
  },

  updateStudent: () => {
    throw new Error("当前后端未提供学生修改接口");
  },
}));
