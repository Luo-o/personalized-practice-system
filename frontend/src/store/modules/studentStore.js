import { create } from "zustand";
import { useAuthStore } from "./authStore";

export const useStudentStore = create(() => ({
  students: [],

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
      avatar: profile.avatar || "/avatars/default-student-avatar.svg",
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
