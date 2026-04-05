const practiceModel = require("../models/practice.model");

function normalizeDifficulty(value) {
  if (value === "简单") return 0.2;
  if (value === "中等") return 0.5;
  if (value === "困难") return 0.8;
  return 0.5;
}

function calcMastery(correctCount, totalCount) {
  if (!totalCount) return 0.5;
  return Number(correctCount) / Number(totalCount);
}

function average(list = []) {
  if (!list.length) return 0.5;
  return list.reduce((sum, n) => sum + n, 0) / list.length;
}

function buildKnowledgeMasteryMap(rows = []) {
  const map = {};
  for (const row of rows) {
    map[row.knowledge_point_id] = calcMastery(
      row.correct_count || 0,
      row.total_count || 0,
    );
  }
  return map;
}

function calcQuestionWeakness(knowledgePoints = [], masteryMap = {}) {
  if (!knowledgePoints.length) return 0.5;

  const masteryList = knowledgePoints.map((kp) =>
    masteryMap[kp.id] == null ? 0.5 : masteryMap[kp.id],
  );

  const mastery = average(masteryList);
  return 1 - mastery;
}

function calcStudentAbility(masteryMap = {}) {
  const values = Object.values(masteryMap);
  if (!values.length) return 0.5;
  return average(values);
}

function calcDifficultyMatch(questionDifficulty, studentAbility) {
  const qd = normalizeDifficulty(questionDifficulty);
  return 1 - Math.abs(qd - studentAbility);
}

function bucketByDifficulty(questions = []) {
  const easy = [];
  const mid = [];
  const hard = [];

  for (const q of questions) {
    if (q.difficulty === "简单") easy.push(q);
    else if (q.difficulty === "中等") mid.push(q);
    else hard.push(q);
  }

  return { easy, mid, hard };
}

function pickWithExploration(sortedList, count, epsilon = 0.1) {
  if (!count || !sortedList.length) return [];

  const pool = [...sortedList];
  const result = [];

  while (result.length < count && pool.length) {
    const explore = Math.random() < epsilon;
    let idx = 0;

    if (explore) {
      const topK = Math.min(
        pool.length,
        Math.max(3, Math.ceil(pool.length * 0.2)),
      );
      idx = Math.floor(Math.random() * topK);
    }

    result.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return result;
}

function shuffleArray(arr = []) {
  const list = [...arr];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function makeId() {
  return Date.now();
}

/**
 * 兼容两种 split 格式：
 * 1. { easy, mid, hard }
 * 2. [easyEnd, midEnd]
 */
function normalizeSplit(split, total) {
  const safeTotal = Math.max(0, Number(total) || 0);

  if (Array.isArray(split) && split.length === 2) {
    const easy = Math.max(0, Math.min(safeTotal, Number(split[0]) || 0));
    const midEnd = Math.max(easy, Math.min(safeTotal, Number(split[1]) || 0));
    const mid = midEnd - easy;
    const hard = safeTotal - easy - mid;
    return { easy, mid, hard };
  }

  if (split && typeof split === "object") {
    const easy = Math.max(0, Number(split.easy) || 0);
    const mid = Math.max(0, Number(split.mid) || 0);
    const hard = Math.max(0, Number(split.hard) || 0);

    const sum = easy + mid + hard;
    if (sum <= safeTotal) {
      return { easy, mid, hard };
    }

    // 超出 total 时进行截断
    let remain = safeTotal;
    const safeEasy = Math.min(easy, remain);
    remain -= safeEasy;
    const safeMid = Math.min(mid, remain);
    remain -= safeMid;
    const safeHard = Math.min(hard, remain);

    return {
      easy: safeEasy,
      mid: safeMid,
      hard: safeHard,
    };
  }

  const easy = Math.floor(safeTotal * 0.3);
  const mid = Math.floor(safeTotal * 0.4);
  const hard = Math.max(0, safeTotal - easy - mid);

  return { easy, mid, hard };
}

async function getPracticeMeta() {
  return practiceModel.getPracticeMeta();
}

async function getPracticeStats({
  subjectId,
  includeTrue = true,
  chapterIds = [],
  knowledgePointIds = [],
}) {
  if (!subjectId) {
    throw new Error("缺少 subjectId");
  }

  return practiceModel.getPracticeStats({
    subjectId,
    includeTrue,
    chapterIds,
    knowledgePointIds,
  });
}

async function generatePractice(studentId, config = {}) {
  const {
    strategy = "mix",
    subjectId,
    total = 10,
    split = { easy: 3, mid: 4, hard: 3 },
    chapterIds = [],
    knowledgeIds = [],
    includeTrue = true,
    shuffle = false,
    epsilon = 0.1,
  } = config;

  if (!studentId) {
    throw new Error("缺少 studentId");
  }

  if (!subjectId) {
    throw new Error("缺少 subjectId");
  }

  const safeTotal = Math.max(1, Number(total) || 10);
  const normalizedSplit = normalizeSplit(split, safeTotal);

  const candidates = await practiceModel.getCandidateQuestions({
    subjectId,
    chapterIds,
    knowledgePointIds: knowledgeIds,
    includeTrue,
  });

  if (!candidates.length) {
    throw new Error("当前筛选条件下暂无可用题目");
  }

  const questionIds = candidates.map((q) => q.id);

  const [
    knowledgeMap,
    optionsMap,
    imagesMap,
    knowledgeStats,
    wrongIds,
    recentIds,
  ] = await Promise.all([
    practiceModel.getQuestionKnowledgeMap(questionIds),
    practiceModel.getQuestionOptionsMap(questionIds),
    practiceModel.getQuestionImagesMap(questionIds),
    practiceModel.getStudentAnswerStatsByKnowledge(studentId, subjectId),
    practiceModel.getStudentWrongBookQuestionIds(studentId),
    practiceModel.getRecentAnsweredQuestionIds(studentId),
  ]);

  const masteryMap = buildKnowledgeMasteryMap(knowledgeStats);
  const studentAbility = calcStudentAbility(masteryMap);
  const wrongSet = new Set(wrongIds);
  const recentSet = new Set(recentIds);

  const scored = candidates
    .map((q) => {
      const knowledgePoints = knowledgeMap[q.id] || [];

      const weakScore = calcQuestionWeakness(knowledgePoints, masteryMap);
      const wrongBoost = wrongSet.has(Number(q.id)) ? 1 : 0;
      const difficultyMatch = calcDifficultyMatch(q.difficulty, studentAbility);
      const novelty = recentSet.has(Number(q.id)) ? 0.2 : 1;

      const score =
        0.45 * weakScore +
        0.25 * wrongBoost +
        0.2 * difficultyMatch +
        0.1 * novelty;

      return {
        ...q,
        score: Number(score.toFixed(6)),
        knowledgePoints,
        options: optionsMap[q.id] || [],
        images: imagesMap[q.id] || [],
      };
    })
    .sort((a, b) => b.score - a.score);

  const { easy, mid, hard } = bucketByDifficulty(scored);

  const easyNeed = Number(normalizedSplit.easy || 0);
  const midNeed = Number(normalizedSplit.mid || 0);
  const hardNeed = Number(normalizedSplit.hard || 0);

  let selected = [
    ...pickWithExploration(easy, easyNeed, epsilon),
    ...pickWithExploration(mid, midNeed, epsilon),
    ...pickWithExploration(hard, hardNeed, epsilon),
  ];

  const selectedIdSet = new Set(selected.map((item) => Number(item.id)));

  if (selected.length < safeTotal) {
    const rest = scored.filter((item) => !selectedIdSet.has(Number(item.id)));
    selected = [
      ...selected,
      ...pickWithExploration(rest, safeTotal - selected.length, epsilon),
    ];
  }

  selected = selected.slice(0, safeTotal);

  if (!selected.length) {
    throw new Error("未能生成有效练习");
  }

  if (shuffle) {
    selected = shuffleArray(selected);
  }

  const practiceId = makeId();

  await practiceModel.createPracticeSession({
    id: practiceId,
    studentId,
    subjectId,
    strategy,
    total: selected.length,
    configJson: JSON.stringify({
      ...config,
      split: normalizedSplit,
      generatedAt: new Date().toISOString(),
    }),
  });

  await practiceModel.insertPracticeQuestions(practiceId, selected);

  return {
    practiceId,
    total: selected.length,
    subjectId,
    questions: selected.map((q, index) => ({
      ...q,
      sortOrder: index + 1,
    })),
  };
}

async function getPracticeDetail(practiceId) {
  const practice = await practiceModel.getPracticeSessionById(practiceId);
  if (!practice) {
    throw new Error("练习不存在");
  }

  const questions =
    await practiceModel.getPracticeQuestionsByPracticeId(practiceId);

  return {
    practice,
    questions,
  };
}

module.exports = {
  getPracticeMeta,
  getPracticeStats,
  generatePractice,
  getPracticeDetail,
};
