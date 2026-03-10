// import { create } from "zustand";

// const initialStudents = [
//   {
//     id: 1,
//     name: "张三",
//     password: "123456",
//   },
//   {
//     id: 2,
//     name: "李四",
//     password: "123456",
//   },
//   {
//     id: 3,
//     name: "王五",
//     password: "123456",
//   },
// ];

// export const useStudentStore = create((set) => ({
//   students: initialStudents,

//   addStudent: (student) =>
//     set((state) => ({
//       students: [...state.students, student],
//     })),

//   deleteStudent: (id) =>
//     set((state) => ({
//       students: state.students.filter((s) => s.id !== id),
//     })),

//   updateStudent: (id, data) =>
//     set((state) => ({
//       students: state.students.map((s) =>
//         s.id === id ? { ...s, ...data } : s,
//       ),
//     })),
// }));
import { create } from "zustand";
import { useAuthStore } from "./authStore";

export const useStudentStore = create((set, get) => ({
  students: [],

  // 当前登录学生资料
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

  // 下面这些先保留壳子，避免页面直接报错
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
