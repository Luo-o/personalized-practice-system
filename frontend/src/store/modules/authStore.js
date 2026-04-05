import { create } from "zustand";
import { http } from "../../api/http";

export const useAuthStore = create((set, get) => ({
  currentUser: null,
  loading: false,

  login: async (username, password) => {
    set({ loading: true });

    try {
      const loginRes = await http.post("/auth/login", {
        username,
        password,
      });

      const meRes = await http.get(
        `/auth/me?username=${encodeURIComponent(loginRes.username)}`,
      );

      const currentUser = {
        id: loginRes.id, // users 表 id
        username: loginRes.username,
        role: loginRes.role,
        profileId: loginRes.profileId, // students/teachers 表 id
        status: meRes.status,
        profile: meRes.profile || null,
      };

      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      set({
        currentUser,
        loading: false,
      });

      return currentUser;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("currentUser");
    set({ currentUser: null });
  },

  restore: () => {
    const raw = localStorage.getItem("currentUser");
    if (!raw) return;

    try {
      const currentUser = JSON.parse(raw);
      set({ currentUser });
    } catch {
      localStorage.removeItem("currentUser");
      set({ currentUser: null });
    }
  },

  refreshMe: async () => {
    const currentUser = get().currentUser;
    if (!currentUser?.username) return null;

    const meRes = await http.get(
      `/auth/me?username=${encodeURIComponent(currentUser.username)}`,
    );

    const nextUser = {
      ...currentUser,
      status: meRes.status,
      profile: meRes.profile || null,
    };

    localStorage.setItem("currentUser", JSON.stringify(nextUser));
    set({ currentUser: nextUser });

    return nextUser;
  },

  updateCurrentUser: (patch) =>
    set((state) => {
      const nextUser = state.currentUser
        ? { ...state.currentUser, ...patch }
        : null;

      if (nextUser) {
        localStorage.setItem("currentUser", JSON.stringify(nextUser));
      }

      return { currentUser: nextUser };
    }),

  isLoggedIn: () => !!get().currentUser,
  getRole: () => get().currentUser?.role || null,
  getUserId: () => get().currentUser?.id || null,
  getProfileId: () => get().currentUser?.profileId || null,
  updateProfile: async (data) => {
    const currentUser = get().currentUser;
    if (!currentUser?.username) {
      throw new Error("当前未登录");
    }

    const res = await http.put("/auth/update-profile", {
      username: currentUser.username,
      ...data,
    });

    await get().refreshMe();
    return res;
  },

  changePassword: async ({ oldPassword, newPassword }) => {
    const currentUser = get().currentUser;
    if (!currentUser?.username) {
      throw new Error("当前未登录");
    }

    return await http.put("/auth/change-password", {
      username: currentUser.username,
      oldPassword,
      newPassword,
    });
  },
}));
