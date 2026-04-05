import { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { http } from "../../../api/http";

function clamp(value, min, max) {
  if (max < min) return min;
  return Math.max(min, Math.min(max, value));
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

  const capEasy = Number(caps?.easy) || 0;
  const capMid = Number(caps?.mid) || 0;
  const capHard = Number(caps?.hard) || 0;
  const maxAvailable = capEasy + capMid + capHard;
  const safeTotal = Math.min(total, maxAvailable);

  const rawSplit =
    Array.isArray(requestedSplit) && requestedSplit.length === 2
      ? requestedSplit
      : pickDefaultSplit(safeTotal);

  const desiredEasy = clamp(Number(rawSplit[0]) || 0, 0, safeTotal);
  const desiredMid = clamp(
    (Number(rawSplit[1]) || 0) - desiredEasy,
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

function sameIdArray(a = [], b = []) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i += 1) {
    if (String(a[i]) !== String(b[i])) return false;
  }
  return true;
}

function getResponseData(res) {
  if (res?.data?.data !== undefined) return res.data.data;
  if (res?.data !== undefined) return res.data;
  return res;
}

function normalizeSubjects(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.subjects)) return raw.subjects;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

function normalizeStats(raw) {
  const data = raw && typeof raw === "object" ? raw : {};

  return {
    total: Number(data.total) || 0,
    difficulty: {
      easy: Number(data?.difficulty?.easy) || 0,
      mid: Number(data?.difficulty?.mid) || 0,
      hard: Number(data?.difficulty?.hard) || 0,
    },
    chapters: Array.isArray(data.chapters) ? data.chapters : [],
    knowledgePoints: Array.isArray(data.knowledgePoints)
      ? data.knowledgePoints
      : [],
  };
}

function normalizeIdArray(values = []) {
  if (!Array.isArray(values)) return [];

  return values
    .map((item) => {
      if (typeof item === "object" && item !== null) {
        return item.id ?? item.value ?? null;
      }
      return item;
    })
    .filter(
      (item) => item !== null && item !== undefined && String(item) !== "",
    );
}

export function usePracticeDecisionLogic(strategy) {
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [hasLoadedStats, setHasLoadedStats] = useState(false);

  const [meta, setMeta] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    difficulty: { easy: 0, mid: 0, hard: 0 },
    chapters: [],
    knowledgePoints: [],
  });

  const [requestedTotal, setRequestedTotal] = useState(20);
  const [requestedSplit, setRequestedSplit] = useState([6, 14]);
  const [includeTrue, setIncludeTrue] = useState(true);
  const [shuffle, setShuffle] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [selectedKnowledge, setSelectedKnowledge] = useState([]);
  const [mixScope, setMixScope] = useState("chapter");
  const [subjectId, setSubjectId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      setLoadingMeta(true);
      try {
        const res = await http.get("/practice/meta");
        const data = getResponseData(res);
        const subjects = normalizeSubjects(data);

        if (!cancelled) {
          setMeta(subjects);
        }
      } catch (error) {
        console.error("获取刷题元数据失败：", error);
        message.error(error?.message || "获取刷题元数据失败");
      } finally {
        if (!cancelled) {
          setLoadingMeta(false);
        }
      }
    }

    loadMeta();

    return () => {
      cancelled = true;
    };
  }, []);

  const subjects = useMemo(() => normalizeSubjects(meta), [meta]);

  useEffect(() => {
    if (subjectId == null && subjects.length > 0) {
      setSubjectId(subjects[0].id);
    }
  }, [subjectId, subjects]);

  const safeSubjectId = useMemo(() => {
    if (!Array.isArray(subjects) || subjects.length === 0) return null;
    const exists = subjects.some((s) => String(s.id) === String(subjectId));
    return exists ? subjectId : subjects[0].id;
  }, [subjects, subjectId]);

  const currentSubject = useMemo(() => {
    if (!Array.isArray(subjects)) return null;
    return subjects.find((s) => String(s.id) === String(safeSubjectId)) || null;
  }, [subjects, safeSubjectId]);

  const isChapterMode =
    strategy === "chapter" || (strategy === "mix" && mixScope === "chapter");

  const isKnowledgeMode =
    strategy === "knowledge" ||
    (strategy === "mix" && mixScope === "knowledge");

  const selectedChapterIds = useMemo(
    () => normalizeIdArray(selectedChapters),
    [selectedChapters],
  );

  const selectedKnowledgeIds = useMemo(
    () => normalizeIdArray(selectedKnowledge),
    [selectedKnowledge],
  );

  const chapterIdsKey = useMemo(
    () => selectedChapterIds.map(String).join(","),
    [selectedChapterIds],
  );

  const knowledgeIdsKey = useMemo(
    () => selectedKnowledgeIds.map(String).join(","),
    [selectedKnowledgeIds],
  );

  useEffect(() => {
    let cancelled = false;
    let timer = null;

    async function loadStats() {
      if (!safeSubjectId) {
        setStats({
          total: 0,
          difficulty: { easy: 0, mid: 0, hard: 0 },
          chapters: [],
          knowledgePoints: [],
        });
        return;
      }

      setLoadingStats(true);

      try {
        const res = await http.get("/practice/stats", {
          params: {
            subjectId: safeSubjectId,
            includeTrue,
            chapterIds:
              isChapterMode && chapterIdsKey ? chapterIdsKey : undefined,
            knowledgeIds:
              isKnowledgeMode && knowledgeIdsKey ? knowledgeIdsKey : undefined,
          },
        });

        const data = normalizeStats(getResponseData(res));

        if (!cancelled) {
          setStats((prev) => {
            const same =
              Number(prev.total) === Number(data.total) &&
              Number(prev?.difficulty?.easy) ===
                Number(data?.difficulty?.easy) &&
              Number(prev?.difficulty?.mid) === Number(data?.difficulty?.mid) &&
              Number(prev?.difficulty?.hard) ===
                Number(data?.difficulty?.hard) &&
              JSON.stringify(prev.chapters) === JSON.stringify(data.chapters) &&
              JSON.stringify(prev.knowledgePoints) ===
                JSON.stringify(data.knowledgePoints);

            return same ? prev : data;
          });
          setHasLoadedStats(true);
        }
      } catch (error) {
        console.error("获取刷题统计失败：", error);
        message.error(error?.message || "获取刷题统计失败");
      } finally {
        if (!cancelled) {
          setLoadingStats(false);
        }
      }
    }

    timer = setTimeout(loadStats, 60);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [
    safeSubjectId,
    includeTrue,
    isChapterMode,
    isKnowledgeMode,
    chapterIdsKey,
    knowledgeIdsKey,
  ]);

  const availableChapters = useMemo(() => {
    return (stats.chapters || []).filter(
      (item) => (Number(item.question_count) || 0) > 0,
    );
  }, [stats.chapters]);

  const availableKnowledgePoints = useMemo(() => {
    return (stats.knowledgePoints || []).filter(
      (item) => (Number(item.question_count) || 0) > 0,
    );
  }, [stats.knowledgePoints]);

  useEffect(() => {
    setSelectedChapters((prev) => {
      const prevIds = normalizeIdArray(prev);
      const validIds = new Set(
        availableChapters.map((item) => String(item.id)),
      );
      const next = prevIds.filter((id) => validIds.has(String(id)));
      return sameIdArray(prevIds, next) ? prev : next;
    });
  }, [availableChapters]);

  useEffect(() => {
    setSelectedKnowledge((prev) => {
      const prevIds = normalizeIdArray(prev);
      const validIds = new Set(
        availableKnowledgePoints.map((item) => String(item.id)),
      );
      const next = prevIds.filter((id) => validIds.has(String(id)));
      return sameIdArray(prevIds, next) ? prev : next;
    });
  }, [availableKnowledgePoints]);

  const difficultyCaps = useMemo(() => {
    return {
      easy: Number(stats?.difficulty?.easy) || 0,
      mid: Number(stats?.difficulty?.mid) || 0,
      hard: Number(stats?.difficulty?.hard) || 0,
    };
  }, [stats]);

  const maxQuestionCount = Number(stats.total) || 0;
  const minQuestionCount = maxQuestionCount > 0 ? 1 : 0;

  const safeTotal = useMemo(() => {
    if (maxQuestionCount <= 0) return 0;
    return clamp(requestedTotal, minQuestionCount, maxQuestionCount);
  }, [requestedTotal, minQuestionCount, maxQuestionCount]);

  useEffect(() => {
    if (maxQuestionCount <= 0) {
      setRequestedTotal(0);
      setRequestedSplit([0, 0]);
      return;
    }

    setRequestedTotal((prev) => {
      const next = clamp(prev || 20, 1, maxQuestionCount);
      return prev === next ? prev : next;
    });

    setRequestedSplit((prev) => {
      if (Array.isArray(prev) && prev.length === 2) {
        const next = [
          clamp(prev[0], 0, maxQuestionCount),
          clamp(prev[1], 0, maxQuestionCount),
        ];
        return sameIdArray(prev, next) ? prev : next;
      }

      return pickDefaultSplit(Math.min(20, maxQuestionCount));
    });
  }, [maxQuestionCount]);

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

    if (
      isChapterMode &&
      availableChapters.length > 0 &&
      selectedChapterIds.length === 0
    ) {
      message.warning("请至少选择一个章节");
      return false;
    }

    if (
      isKnowledgeMode &&
      availableKnowledgePoints.length > 0 &&
      selectedKnowledgeIds.length === 0
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
      cfg.chapterIds = selectedChapterIds;
    }

    if (strategy === "knowledge") {
      cfg.knowledgeIds = selectedKnowledgeIds;
    }

    if (strategy === "mix") {
      cfg.mixScope = mixScope;
      cfg.split = safeSplit;

      if (mixScope === "chapter") {
        cfg.chapterIds = selectedChapterIds;
      } else {
        cfg.knowledgeIds = selectedKnowledgeIds;
      }
    }

    if (strategy === "difficulty") {
      cfg.split = safeSplit;
    }

    return cfg;
  };

  const initialLoading = loadingMeta || (!hasLoadedStats && loadingStats);
  const refreshingStats = hasLoadedStats && loadingStats;

  return {
    loading: initialLoading,
    initialLoading,
    refreshingStats,

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
