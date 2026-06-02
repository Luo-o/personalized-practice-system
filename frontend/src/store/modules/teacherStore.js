import { create } from "zustand";
import { useAuthStore } from "./authStore";

export const useTeacherStore = create(() => ({
  teachers: [],

  getCurrentTeacher: () => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser || currentUser.role !== "teacher") return null;

    const profile = currentUser.profile || null;
    if (!profile) return null;

    return {
      id: profile.id,
      teacherNo: profile.teacher_no,
      name: profile.name,
      gender: profile.gender,
      phone: profile.phone,
      email: profile.email,
      title: profile.title,
      department: profile.department,
      avatar: profile.avatar || "/avatars/default-teacher-avatar.png",
    };
  },

  getCurrentTeacherId: () => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser || currentUser.role !== "teacher") return null;
    return currentUser.profileId ?? null;
  },

  refreshCurrentTeacher: async () => {
    const authStore = useAuthStore.getState();
    if (authStore.getRole() !== "teacher") return null;

    const nextUser = await authStore.refreshMe();
    return nextUser?.profile || null;
  },

  addTeacher: () => {
    throw new Error("当前后端未提供教师新增接口");
  },

  deleteTeacher: () => {
    throw new Error("当前后端未提供教师删除接口");
  },

  updateTeacher: () => {
    throw new Error("当前后端未提供教师修改接口");
  },
}));
