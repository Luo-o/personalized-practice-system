import { create } from "zustand";
import { http } from "../../api/http";
import { useStudentStore } from "./studentStore";

function normalizePracticeQuestion(item) {
  return {
    id: item.id,
    questionId: item.questionId ?? item.question_id ?? item.id,
    ownerType: item.owner_type,
    teacherId: item.teacher_id,
    title: item.title,
    subjectId: item.subject_id,
    chapterId: item.chapter_id,
    difficulty: item.difficulty,
    source: item.source,
    isReal: Boolean(item.is_real),
    analysis: item.analysis || "",
    correct: item.correct_answer,
    subjectName: item.subject_name || "",
    chapterName: item.chapter_name || "",
    score: item.score ?? item.score_snapshot ?? 0,
    sortOrder: item.sortOrder ?? item.sort_order ?? 0,
    knowledgePoints: item.knowledgePoints || [],
    options: item.options || [],
    images: item.images || [],
  };
}

export const usePracticeStore = create((set, get) => ({
  meta: [],
  currentPractice: null,
  practiceQuestions: [],
  loading: false,

  fetchPracticeMeta: async () => {
    set({ loading: true });

    try {
      const res = await http.get("/practice/meta");
      const meta = res || [];

      set({
        meta,
        loading: false,
      });

      return meta;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  generatePractice: async (config = {}) => {
    const studentId = useStudentStore.getState().getCurrentStudentId();

    if (!studentId) {
      throw new Error("学生未登录");
    }

    set({ loading: true });

    try {
      const payload = {
        studentId,
        strategy: config.strategy,
        subjectId: config.subjectId,
        total: config.total,
        split: config.split,
        chapterIds: config.chapterIds || [],
        knowledgeIds: config.knowledgeIds || [],
        onlyTrue: config.onlyTrue ?? false,
        shuffle: config.shuffle ?? true,
        epsilon: config.epsilon ?? 0.1,
      };

      const res = await http.post("/practice/generate", payload);
      const data = res || {};

      set({
        currentPractice: {
          id: data.practiceId,
          total: data.total,
          subjectId: data.subjectId,
        },
        practiceQuestions: (data.questions || []).map(
          normalizePracticeQuestion,
        ),
        loading: false,
      });

      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchPracticeById: async (practiceId) => {
    set({ loading: true });

    try {
      const res = await http.get(`/practice/${practiceId}`);
      const practice = res?.practice || null;
      const questions = (res?.questions || []).map(normalizePracticeQuestion);

      set({
        currentPractice: practice,
        practiceQuestions: questions,
        loading: false,
      });

      return {
        practice,
        questions,
      };
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  clearCurrentPractice: () =>
    set({
      currentPractice: null,
      practiceQuestions: [],
    }),

  getPracticeQuestionById: (id) =>
    get().practiceQuestions.find((q) => Number(q.id) === Number(id)) || null,
}));
