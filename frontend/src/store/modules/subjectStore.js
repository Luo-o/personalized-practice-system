import { create } from "zustand";
import { http } from "../../api/http";
import { normalizeSubject, normalizeChapter } from "../../api/normalizer";

function groupKnowledgePointsByChapter(knowledgePoints = []) {
  const map = new Map();

  for (const kp of knowledgePoints) {
    const chapterId = kp.chapter_id;
    const chapterName = kp.chapter_name;

    if (!map.has(chapterId)) {
      map.set(chapterId, {
        id: chapterId,
        name: chapterName,
        knowledgePoints: [],
      });
    }

    map.get(chapterId).knowledgePoints.push({
      id: kp.id,
      name: kp.name,
      sortOrder: kp.sort_order,
    });
  }

  return Array.from(map.values());
}

export const useSubjectStore = create((set, get) => ({
  subjects: [],
  chapters: [],
  knowledgePoints: [],
  chapterTree: [],
  loading: false,

  // 获取全部科目
  fetchSubjects: async () => {
    set({ loading: true });

    try {
      const res = await http.get("/subjects");
      const subjects = (res || []).map(normalizeSubject);

      set({
        subjects,
        loading: false,
      });

      return subjects;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 获取某科目章节
  fetchChaptersBySubjectId: async (subjectId) => {
    set({ loading: true });

    try {
      const res = await http.get(`/subjects/${subjectId}/chapters`);
      const chapters = (res?.chapters || []).map(normalizeChapter);

      set({
        chapters,
        loading: false,
      });

      return chapters;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 获取某科目知识点
  fetchKnowledgePointsBySubjectId: async (subjectId) => {
    set({ loading: true });

    try {
      const res = await http.get(`/subjects/${subjectId}/knowledge-points`);
      const knowledgePoints = res?.knowledgePoints || [];
      const chapterTree = groupKnowledgePointsByChapter(knowledgePoints);

      set({
        knowledgePoints,
        chapterTree,
        loading: false,
      });

      return knowledgePoints;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 一次性拉取某科目的章节 + 知识点
  fetchSubjectDetail: async (subjectId) => {
    set({ loading: true });

    try {
      const [chapterRes, kpRes] = await Promise.all([
        http.get(`/subjects/${subjectId}/chapters`),
        http.get(`/subjects/${subjectId}/knowledge-points`),
      ]);

      const chapters = (chapterRes?.chapters || []).map(normalizeChapter);
      const knowledgePoints = kpRes?.knowledgePoints || [];
      const chapterTree = groupKnowledgePointsByChapter(knowledgePoints);

      set({
        chapters,
        knowledgePoints,
        chapterTree,
        loading: false,
      });

      return {
        chapters,
        knowledgePoints,
        chapterTree,
      };
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 新增科目
  addSubject: async ({ name }) => {
    set({ loading: true });

    try {
      const createdSubject = await http.post("/subjects", { name });

      await get().fetchSubjects();

      return createdSubject ? normalizeSubject(createdSubject) : null;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 新增章节
  addChapter: async (subjectId, { name, sort_order }) => {
    set({ loading: true });

    try {
      const createdChapter = await http.post(
        `/subjects/${subjectId}/chapters`,
        {
          name,
          sort_order,
        },
      );

      await get().fetchChaptersBySubjectId(subjectId);

      return createdChapter ? normalizeChapter(createdChapter) : null;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 新增知识点
  addKnowledgePoint: async (chapterId, { subjectId, name, sort_order }) => {
    set({ loading: true });

    try {
      const createdKnowledgePoint = await http.post(
        `/chapters/${chapterId}/knowledge-points`,
        {
          name,
          sort_order,
        },
      );

      if (subjectId !== undefined && subjectId !== null && subjectId !== "") {
        await get().fetchKnowledgePointsBySubjectId(subjectId);
      } else {
        set({ loading: false });
      }

      return createdKnowledgePoint || null;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 根据 id 获取科目
  getSubjectById: (id) =>
    get().subjects.find((s) => Number(s.id) === Number(id)) || null,

  // 根据 id 获取章节
  getChapterById: (id) =>
    get().chapters.find((c) => String(c.id) === String(id)) || null,

  // 根据 subjectId 取章节
  getChaptersBySubjectId: (subjectId) =>
    get().chapters.filter((c) => Number(c.subjectId) === Number(subjectId)),

  // 根据 chapterId 取知识点
  getKnowledgePointsByChapterId: (chapterId) =>
    get().knowledgePoints.filter(
      (kp) => String(kp.chapter_id) === String(chapterId),
    ),

  // 获取某科目的树结构
  getChapterTree: () => get().chapterTree,

  clearSubjectDetail: () =>
    set({
      chapters: [],
      knowledgePoints: [],
      chapterTree: [],
    }),
}));
