import { create } from "zustand";
import { http } from "../../api/http";
import { normalizeQuestion } from "../../api/normalizer";
import { useTeacherStore } from "./teacherStore";

function toPositiveNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function resolvePayload(res) {
  return res || {};
}

function resolveEntity(res) {
  return res || null;
}

function resolveHasMore(
  payload,
  currentPage,
  currentPageSize,
  currentTotal,
  listLength,
) {
  if (typeof payload?.hasMore === "boolean") {
    return payload.hasMore;
  }

  const total = toPositiveNumber(payload?.total, currentTotal);
  if (total > 0) {
    return currentPage * currentPageSize < total;
  }

  return listLength >= currentPageSize;
}

function dedupeQuestions(list = []) {
  const result = [];
  const seen = new Set();

  for (const item of list) {
    const key = Number(item.id);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

export const useQuestionStore = create((set, get) => ({
  questions: [],
  currentQuestion: null,
  loading: false,
  loadingMore: false,

  page: 1,
  pageSize: 20,
  total: 0,
  hasMore: true,

  lastFilters: {},

  subjectStats: [],
  subjectTotal: 0,

  // 获取第一页
  fetchQuestions: async (filters = {}) => {
    const mergedFilters = { ...filters };
    const firstPage = 1;
    const pageSize = toPositiveNumber(filters.pageSize, 20);

    set({
      loading: true,
      loadingMore: false,
      page: firstPage,
      pageSize,
      total: 0,
      hasMore: true,
      lastFilters: mergedFilters,
    });

    try {
      const res = await http.get("/questions", {
        params: {
          ...mergedFilters,
          page: firstPage,
          pageSize,
        },
      });

      const payload = resolvePayload(res);
      const questions = (payload.list || []).map(normalizeQuestion);

      const nextPage = toPositiveNumber(payload.page, firstPage);
      const nextPageSize = toPositiveNumber(payload.pageSize, pageSize);
      const nextTotal = Number(payload.total) || 0;
      const nextHasMore = resolveHasMore(
        payload,
        nextPage,
        nextPageSize,
        nextTotal,
        questions.length,
      );

      set({
        questions,
        page: nextPage,
        pageSize: nextPageSize,
        total: nextTotal,
        hasMore: nextHasMore,
        loading: false,
      });

      return questions;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 加载更多
  fetchMoreQuestions: async (filters = {}) => {
    const { loadingMore, hasMore, page, pageSize, total, lastFilters } = get();

    if (loadingMore || !hasMore) return [];

    const mergedFilters = {
      ...lastFilters,
      ...filters,
    };

    const currentPage = toPositiveNumber(page, 1);
    const currentPageSize = toPositiveNumber(pageSize, 20);
    const nextPage = currentPage + 1;

    set({ loadingMore: true });

    try {
      const res = await http.get("/questions", {
        params: {
          ...mergedFilters,
          page: nextPage,
          pageSize: currentPageSize,
        },
      });

      const payload = resolvePayload(res);
      const moreQuestions = (payload.list || []).map(normalizeQuestion);

      set((state) => {
        const serverPage = toPositiveNumber(payload.page, nextPage);
        const serverPageSize = toPositiveNumber(
          payload.pageSize,
          state.pageSize || currentPageSize,
        );
        const serverTotal = Number(payload.total) || state.total || total || 0;

        const merged = dedupeQuestions([...state.questions, ...moreQuestions]);

        return {
          questions: merged,
          page: serverPage,
          pageSize: serverPageSize,
          total: serverTotal,
          hasMore: resolveHasMore(
            payload,
            serverPage,
            serverPageSize,
            serverTotal,
            moreQuestions.length,
          ),
          loadingMore: false,
          lastFilters: mergedFilters,
        };
      });

      return moreQuestions;
    } catch (error) {
      set({ loadingMore: false });
      throw error;
    }
  },

  // 获取题目详情
  fetchQuestionById: async (id) => {
    set({ loading: true });

    try {
      const res = await http.get(`/questions/${id}`);
      const currentQuestion = normalizeQuestion(resolveEntity(res));

      set({
        currentQuestion,
        loading: false,
      });

      return currentQuestion;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchTeacherQuestionSubjectSummary: async () => {
    const teacherId = useTeacherStore.getState().getCurrentTeacherId();
    if (!teacherId) {
      set({
        subjectStats: [],
        subjectTotal: 0,
      });
      return { total: 0, subjects: [] };
    }

    const res = await http.get("/questions/summary/by-subject", {
      params: { teacherId },
    });

    const payload = resolvePayload(res);
    const subjects = payload.subjects || [];
    const total = Number(payload.total) || 0;

    set({
      subjectStats: subjects,
      subjectTotal: total,
    });

    return payload;
  },

  // 新增题目
  addQuestion: async (questionData) => {
    set({ loading: true });

    try {
      const teacherId =
        questionData.teacherId ??
        useTeacherStore.getState().getCurrentTeacherId() ??
        null;

      const payload = {
        id: questionData.id,
        owner_type: questionData.ownerType || "teacher",
        teacher_id: teacherId,
        title: questionData.title,
        subject_id: questionData.subjectId,
        chapter_id: questionData.chapterId ?? null,
        difficulty: questionData.difficulty,
        source: questionData.source ?? "教师录入",
        is_real: questionData.isReal ? 1 : 0,
        analysis: questionData.analysis ?? "",
        correct_answer: questionData.correct,

        options: (questionData.options || []).map((item, index) => ({
          option_key: item.key,
          option_text: item.text,
          sort_order: item.sortOrder ?? index + 1,
        })),

        knowledgePointIds:
          questionData.knowledgePointIds ||
          (questionData.knowledgePoints || []).map((kp) =>
            typeof kp === "object" ? kp.id : kp,
          ),

        images: (questionData.images || []).map((img, index) => ({
          image_url: img.imageUrl || img.url || img,
          sort_order: img.sortOrder ?? index + 1,
        })),
      };

      const res = await http.post("/questions", payload);
      const created = normalizeQuestion(resolveEntity(res));

      set((state) => ({
        questions: dedupeQuestions([created, ...state.questions]),
        total: state.total + 1,
        loading: false,
      }));

      return created;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 更新题目
  updateQuestion: async (id, questionData) => {
    set({ loading: true });

    try {
      const teacherId =
        questionData.teacherId ??
        useTeacherStore.getState().getCurrentTeacherId() ??
        null;

      const payload = {
        owner_type: questionData.ownerType || "teacher",
        teacher_id: teacherId,
        title: questionData.title,
        subject_id: questionData.subjectId,
        chapter_id: questionData.chapterId ?? null,
        difficulty: questionData.difficulty,
        source: questionData.source ?? "教师录入",
        is_real: questionData.isReal ? 1 : 0,
        analysis: questionData.analysis ?? "",
        correct_answer: questionData.correct,

        options: (questionData.options || []).map((item, index) => ({
          option_key: item.key,
          option_text: item.text,
          sort_order: item.sortOrder ?? index + 1,
        })),

        knowledgePointIds:
          questionData.knowledgePointIds ||
          (questionData.knowledgePoints || []).map((kp) =>
            typeof kp === "object" ? kp.id : kp,
          ),

        images: (questionData.images || []).map((img, index) => ({
          image_url: img.imageUrl || img.url || img,
          sort_order: img.sortOrder ?? index + 1,
        })),
      };

      const res = await http.patch(`/questions/${id}`, payload);
      const updated = normalizeQuestion(resolveEntity(res));

      set((state) => ({
        questions: state.questions.map((q) =>
          Number(q.id) === Number(id) ? updated : q,
        ),
        currentQuestion:
          state.currentQuestion &&
          Number(state.currentQuestion.id) === Number(id)
            ? updated
            : state.currentQuestion,
        loading: false,
      }));

      return updated;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 删除题目
  deleteQuestion: async (id) => {
    set({ loading: true });

    try {
      await http.delete(`/questions/${id}`);

      set((state) => ({
        questions: state.questions.filter((q) => Number(q.id) !== Number(id)),
        currentQuestion:
          state.currentQuestion &&
          Number(state.currentQuestion.id) === Number(id)
            ? null
            : state.currentQuestion,
        total: Math.max(0, state.total - 1),
        loading: false,
      }));

      return true;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 当前教师题目
  fetchTeacherQuestions: async () => {
    const teacherId = useTeacherStore.getState().getCurrentTeacherId();
    if (!teacherId) {
      set({
        questions: [],
        total: 0,
        hasMore: false,
        page: 1,
        pageSize: 20,
        lastFilters: {},
      });
      return [];
    }

    return get().fetchQuestions({ teacherId });
  },

  // 当前教师题目加载更多
  fetchMoreTeacherQuestions: async () => {
    const teacherId = useTeacherStore.getState().getCurrentTeacherId();
    if (!teacherId) return [];
    return get().fetchMoreQuestions({ teacherId });
  },

  searchQuestionPage: async (params = {}) => {
    const page = toPositiveNumber(params.page, 1);
    const pageSize = toPositiveNumber(params.pageSize, 20);

    const res = await http.get("/questions", {
      params: {
        page,
        pageSize,
        teacherId: params.teacherId ?? undefined,
        subjectId: params.subjectId ?? undefined,
        chapterId: params.chapterId ?? undefined,
        difficulty: params.difficulty || undefined,
        keyword: params.keyword || undefined,
      },
    });

    const payload = resolvePayload(res);
    const list = (payload.list || []).map(normalizeQuestion);
    const nextPage = toPositiveNumber(payload.page, page);
    const nextPageSize = toPositiveNumber(payload.pageSize, pageSize);
    const total = Number(payload.total) || 0;

    return {
      list,
      page: nextPage,
      pageSize: nextPageSize,
      total,
      hasMore: resolveHasMore(
        payload,
        nextPage,
        nextPageSize,
        total,
        list.length,
      ),
    };
  },

  getQuestionById: (id) =>
    get().questions.find((q) => Number(q.id) === Number(id)) || null,

  getQuestionsBySubjectId: (subjectId) =>
    get().questions.filter((q) => Number(q.subjectId) === Number(subjectId)),

  getQuestionsByChapterId: (chapterId) =>
    get().questions.filter((q) => String(q.chapterId) === String(chapterId)),

  getQuestionsByTeacherId: (teacherId) =>
    get().questions.filter((q) => Number(q.teacherId) === Number(teacherId)),

  clearCurrentQuestion: () =>
    set({
      currentQuestion: null,
    }),
}));
