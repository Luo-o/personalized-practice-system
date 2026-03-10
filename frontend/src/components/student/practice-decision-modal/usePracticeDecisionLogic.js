import { useMemo, useState } from "react";
import { message } from "antd";
import { useQuestionStore, useSubjectStore } from "../../../store";

function clamp(value, min, max) {
  if (max < min) return min;
  return Math.max(min, Math.min(max, value));
}

function normalizeSubjects(rawSubjects = []) {
  if (!Array.isArray(rawSubjects)) return [];

  return rawSubjects.map((s) => ({
    id: s.id,
    name: s.subject,
    subject: s.subject,
    chapters: (s.chapters || []).map((ch) => ({
      id: ch.id,
      name: ch.name,
      knowledgePoints: (ch.knowledgePoints || []).map((kp, index) => ({
        id: `${ch.id}-kp-${index + 1}`,
        name: typeof kp === "string" ? kp : kp?.name || "",
      })),
    })),
  }));
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/[:：]/g, "")
    .trim();
}

function includesNormalized(list = [], target = "") {
  const normalizedTarget = normalizeText(target);
  return list.some((item) => normalizeText(item) === normalizedTarget);
}

function normalizeSelectedNames(selectedValues = [], options = []) {
  if (!Array.isArray(selectedValues)) return [];

  return [
    ...new Set(
      selectedValues
        .map((item) => {
          // 先统一提取“候选值”
          let rawValue = item;

          if (typeof item === "object" && item !== null) {
            rawValue = item.id ?? item.name ?? item.label ?? "";
          }

          // 优先尝试在 options 中按 id / name 找到对应项
          const matched = options.find(
            (opt) =>
              String(opt.id) === String(rawValue) ||
              String(opt.name) === String(rawValue),
          );

          // 找到了就返回 name
          if (matched) return matched.name;

          // 找不到再兜底
          if (typeof item === "object" && item !== null) {
            return item.name || item.label || "";
          }

          return String(rawValue || "");
        })
        .filter(Boolean),
    ),
  ];
}

function pickDefaultSplit(total) {
  if (total <= 0) return [0, 0];
  const easy = Math.floor(total * 0.3);
  const midEnd = Math.floor(total * 0.7);
  return [easy, Math.max(easy, midEnd)];
}

function buildDifficultyPlan(total, requestedSplit, caps) {
  if (total <= 0) {
    return {
      total: 0,
      easy: 0,
      mid: 0,
      hard: 0,
      safeSplit: [0, 0],
    };
  }

  const capEasy = caps.easy ?? 0;
  const capMid = caps.mid ?? 0;
  const capHard = caps.hard ?? 0;
  const maxAvailable = capEasy + capMid + capHard;
  const safeTotal = Math.min(total, maxAvailable);

  const rawSplit =
    Array.isArray(requestedSplit) && requestedSplit.length === 2
      ? requestedSplit
      : pickDefaultSplit(safeTotal);

  const desiredEasy = clamp(rawSplit[0], 0, safeTotal);
  const desiredMid = clamp(
    rawSplit[1] - rawSplit[0],
    0,
    safeTotal - desiredEasy,
  );
  const desiredHard = safeTotal - desiredEasy - desiredMid;

  const counts = {
    easy: Math.min(desiredEasy, capEasy),
    mid: Math.min(desiredMid, capMid),
    hard: Math.min(desiredHard, capHard),
  };

  let remaining = safeTotal - (counts.easy + counts.mid + counts.hard);

  const desiredMap = {
    easy: desiredEasy,
    mid: desiredMid,
    hard: desiredHard,
  };

  const capMap = {
    easy: capEasy,
    mid: capMid,
    hard: capHard,
  };

  while (remaining > 0) {
    const candidates = ["easy", "mid", "hard"]
      .filter((key) => counts[key] < capMap[key])
      .sort((a, b) => {
        const deficitA = desiredMap[a] - counts[a];
        const deficitB = desiredMap[b] - counts[b];
        return deficitB - deficitA;
      });

    if (!candidates.length) break;

    const target = candidates[0];
    counts[target] += 1;
    remaining -= 1;
  }

  return {
    total: safeTotal,
    easy: counts.easy,
    mid: counts.mid,
    hard: counts.hard,
    safeSplit: [counts.easy, counts.easy + counts.mid],
  };
}

export function usePracticeDecisionLogic(strategy) {
  const rawSubjects = useSubjectStore((state) => state.subjects);
  const questions = useQuestionStore((state) => state.questions);

  const subjects = useMemo(() => normalizeSubjects(rawSubjects), [rawSubjects]);

  const [requestedTotal, setRequestedTotal] = useState(20);
  const [requestedSplit, setRequestedSplit] = useState([6, 14]);
  const [includeTrue, setIncludeTrue] = useState(true);
  const [shuffle, setShuffle] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [selectedKnowledge, setSelectedKnowledge] = useState([]);
  const [mixScope, setMixScope] = useState("chapter");
  const [subjectId, setSubjectId] = useState(() =>
    subjects.length ? subjects[0].id : null,
  );

  const safeSubjectId = useMemo(() => {
    if (!subjects.length) return null;
    const exists = subjects.some((s) => s.id === subjectId);
    return exists ? subjectId : subjects[0].id;
  }, [subjects, subjectId]);

  const currentSubject = useMemo(() => {
    return subjects.find((s) => s.id === safeSubjectId) || null;
  }, [subjects, safeSubjectId]);

  const chapters = useMemo(() => {
    return currentSubject?.chapters || [];
  }, [currentSubject]);

  const allKnowledgePoints = useMemo(() => {
    const result = [];
    for (const chapter of chapters) {
      for (const kp of chapter.knowledgePoints || []) {
        result.push({
          ...kp,
          chapterId: chapter.id,
          chapterName: chapter.name,
        });
      }
    }
    return result;
  }, [chapters]);

  const isChapterMode =
    strategy === "chapter" || (strategy === "mix" && mixScope === "chapter");

  const isKnowledgeMode =
    strategy === "knowledge" ||
    (strategy === "mix" && mixScope === "knowledge");

  // 基础题池：只按科目 + 真题开关过滤
  const basePool = useMemo(() => {
    if (!currentSubject) return [];

    let pool = questions.filter((q) => q.subject === currentSubject.name);

    if (!includeTrue) {
      pool = pool.filter((q) => !q.isReal);
    }

    return pool;
  }, [questions, currentSubject, includeTrue]);

  // 只允许选择“当前有题”的章节
  const availableChapterNames = useMemo(() => {
    return [...new Set(basePool.map((q) => q.chapter).filter(Boolean))];
  }, [basePool]);

  const availableChapters = useMemo(() => {
    return chapters.filter((ch) =>
      includesNormalized(availableChapterNames, ch.name),
    );
  }, [chapters, availableChapterNames]);

  // 只允许选择“当前有题”的知识点
  const availableKnowledgeNames = useMemo(() => {
    return [...new Set(basePool.flatMap((q) => q.kps || []).filter(Boolean))];
  }, [basePool]);

  const availableKnowledgePoints = useMemo(() => {
    return allKnowledgePoints.filter((kp) =>
      includesNormalized(availableKnowledgeNames, kp.name),
    );
  }, [allKnowledgePoints, availableKnowledgeNames]);

  const selectedChapterNames = useMemo(() => {
    return normalizeSelectedNames(selectedChapters, availableChapters);
  }, [selectedChapters, availableChapters]);

  const selectedKnowledgeNames = useMemo(() => {
    return normalizeSelectedNames(selectedKnowledge, availableKnowledgePoints);
  }, [selectedKnowledge, availableKnowledgePoints]);

  // 当前真正筛完的题池
  const filteredPool = useMemo(() => {
    console.log("selectedChapterNames =", selectedChapterNames);
    console.log("selectedKnowledgeNames =", selectedKnowledgeNames);
    console.log(
      "question chapters =",
      basePool.map((q) => q.chapter),
    );
    console.log("question kps =", [
      ...new Set(basePool.flatMap((q) => q.kps || [])),
    ]);
    let pool = [...basePool];

    if (isChapterMode && selectedChapterNames.length > 0) {
      pool = pool.filter((q) =>
        includesNormalized(selectedChapterNames, q.chapter),
      );
    }

    if (isKnowledgeMode && selectedKnowledgeNames.length > 0) {
      pool = pool.filter((q) =>
        (q.kps || []).some((kp) =>
          includesNormalized(selectedKnowledgeNames, kp),
        ),
      );
    }

    return pool;
  }, [
    basePool,
    isChapterMode,
    isKnowledgeMode,
    selectedChapterNames,
    selectedKnowledgeNames,
  ]);

  const difficultyCaps = useMemo(() => {
    return {
      easy: filteredPool.filter((q) => q.difficulty === "简单").length,
      mid: filteredPool.filter((q) => q.difficulty === "中等").length,
      hard: filteredPool.filter((q) => q.difficulty === "困难").length,
    };
  }, [filteredPool]);

  const maxQuestionCount = filteredPool.length;
  const minQuestionCount = maxQuestionCount > 0 ? 1 : 0;

  const safeTotal = useMemo(() => {
    if (maxQuestionCount <= 0) return 0;
    return clamp(requestedTotal, minQuestionCount, maxQuestionCount);
  }, [requestedTotal, minQuestionCount, maxQuestionCount]);

  const difficultyPlan = useMemo(() => {
    return buildDifficultyPlan(safeTotal, requestedSplit, difficultyCaps);
  }, [safeTotal, requestedSplit, difficultyCaps]);

  const safeSplit = difficultyPlan.safeSplit;
  const easy = difficultyPlan.easy;
  const mid = difficultyPlan.mid;
  const hard = difficultyPlan.hard;

  const handleSubjectChange = (id) => {
    setSubjectId(id);
    setSelectedChapters([]);
    setSelectedKnowledge([]);
    setMixScope("chapter");
    setRequestedTotal(20);
    setRequestedSplit([6, 14]);
  };

  const handleIncludeTrueChange = (checked) => {
    setIncludeTrue(checked);
    setSelectedChapters([]);
    setSelectedKnowledge([]);
    setRequestedTotal(20);
    setRequestedSplit([6, 14]);
  };

  const handleSwitchToChapter = () => {
    setMixScope("chapter");
    setSelectedKnowledge([]);
    setRequestedSplit([6, 14]);
  };

  const handleSwitchToKnowledge = () => {
    setMixScope("knowledge");
    setSelectedChapters([]);
    setRequestedSplit([6, 14]);
  };

  const validateBeforeStart = () => {
    if (!currentSubject) {
      message.warning("请先选择科目");
      return false;
    }

    if (maxQuestionCount <= 0) {
      message.warning("当前条件下没有可用题目");
      return false;
    }

    if (isChapterMode && selectedChapterNames.length === 0) {
      message.warning("请至少选择一个章节");
      return false;
    }

    if (
      isKnowledgeMode &&
      availableKnowledgePoints.length > 0 &&
      selectedKnowledgeNames.length === 0
    ) {
      message.warning("请至少选择一个知识点");
      return false;
    }

    if (safeTotal <= 0) {
      message.warning("题目数量必须大于 0");
      return false;
    }

    return true;
  };

  const buildConfig = () => {
    if (!validateBeforeStart()) return null;

    const cfg = {
      strategy,
      total: difficultyPlan.total,
      includeTrue,
      shuffle,
      subjectId: safeSubjectId,
      subjectName: currentSubject?.name || "",
      availableCount: maxQuestionCount,
    };

    if (strategy === "chapter") {
      cfg.chapters = selectedChapterNames;
    }

    if (strategy === "knowledge") {
      cfg.knowledgePoints = selectedKnowledgeNames;
    }

    if (strategy === "mix") {
      cfg.mixScope = mixScope;
      cfg.split = safeSplit;

      if (mixScope === "chapter") {
        cfg.chapters = selectedChapterNames;
      } else {
        cfg.knowledgePoints = selectedKnowledgeNames;
      }
    }

    if (strategy === "difficulty") {
      cfg.split = safeSplit;
    }

    return cfg;
  };

  return {
    subjects,
    currentSubject,
    safeSubjectId,

    isChapterMode,
    isKnowledgeMode,

    availableChapters,
    availableKnowledgePoints,

    requestedTotal,
    setRequestedTotal,
    requestedSplit,
    setRequestedSplit,

    includeTrue,
    shuffle,
    setShuffle,

    selectedChapters,
    setSelectedChapters,
    selectedKnowledge,
    setSelectedKnowledge,

    mixScope,

    safeTotal,
    safeSplit,
    easy,
    mid,
    hard,

    difficultyCaps,
    maxQuestionCount,
    minQuestionCount,

    handleSubjectChange,
    handleIncludeTrueChange,
    handleSwitchToChapter,
    handleSwitchToKnowledge,
    buildConfig,
  };
}
