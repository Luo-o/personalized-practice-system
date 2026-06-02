import { create } from "zustand";
import { http } from "../../api/http";

export const useAuthStore = create((set, get) => ({
  currentUser: null,
  loading: false,

  registerStudent: async ({ studentNo, name, password, confirmPassword }) => {
    return await http.post("/auth/register-student", {
      studentNo,
      name,
      password,
      confirmPassword,
    });
  },

  login: async ({ account, password, role }) => {
    set({ loading: true });

    try {
      const loginRes = await http.post("/auth/login", {
        account,
        password,
        role,
      });

      const meRes = await http.get("/auth/me", {
        params: {
          role: loginRes.role,
          profileId: loginRes.profileId,
        },
      });

      const currentUser = {
        id: loginRes.id,
        username: loginRes.username,
        role: loginRes.role,
        profileId: loginRes.profileId,
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
    if (!currentUser?.role || !currentUser?.profileId) return null;

    const meRes = await http.get("/auth/me", {
      params: {
        role: currentUser.role,
        profileId: currentUser.profileId,
      },
    });

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
    if (!currentUser?.role || !currentUser?.profileId) {
      throw new Error("当前未登录");
    }

    const res = await http.put("/auth/update-profile", {
      role: currentUser.role,
      profileId: currentUser.profileId,
      ...data,
    });

    await get().refreshMe();
    return res;
  },

  changePassword: async ({ oldPassword, newPassword }) => {
    const currentUser = get().currentUser;
    if (!currentUser?.role || !currentUser?.profileId) {
      throw new Error("当前未登录");
    }

    return await http.put("/auth/change-password", {
      role: currentUser.role,
      profileId: currentUser.profileId,
      oldPassword,
      newPassword,
    });
  },
}));
