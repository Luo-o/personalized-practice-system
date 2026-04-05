import React, { useEffect, useMemo, useState } from "react";
import { Select } from "antd";
import { useExamStore, useSubmissionStore } from "../../../store";

const DIFFICULTY_ORDER = ["简单", "中等", "困难"];

const DIFFICULTY_COLOR_MAP = {
  简单: "#5B8DEF",
  中等: "#8B5CF6",
  困难: "#F59E0B",
};

function normalizeDifficultyName(value) {
  const raw = String(value || "")
    .trim()
    .toLowerCase();

  if (!raw) return "未标注";
  if (raw === "easy" || raw.includes("简")) return "简单";
  if (raw === "medium" || raw.includes("中")) return "中等";
  if (raw === "hard" || raw.includes("难")) return "困难";

  return "未标注";
}

function buildConicGradient(segments) {
  const validSegments = segments.filter((item) => item.value > 0);

  if (!validSegments.length) {
    return "conic-gradient(#e9eef5 0deg 360deg)";
  }

  let currentDeg = 0;
  const parts = validSegments.map((item) => {
    const deg = (item.percent / 100) * 360;
    const start = currentDeg;
    const end = currentDeg + deg;
    currentDeg = end;
    return `${item.color} ${start}deg ${end}deg`;
  });

  if (currentDeg < 360) {
    parts.push(`#e9eef5 ${currentDeg}deg 360deg`);
  }

  return `conic-gradient(${parts.join(", ")})`;
}

export default function SubjectCircleStats({ records = [] }) {
  const fetchStudentExams = useExamStore((s) => s.fetchStudentExams);
  const fetchExamQuestions = useExamStore((s) => s.fetchExamQuestions);
  const fetchSubmissionById = useSubmissionStore((s) => s.fetchSubmissionById);

  const [loading, setLoading] = useState(false);
  const [distributionMap, setDistributionMap] = useState({});
  const [selectedSubject, setSelectedSubject] = useState();

  useEffect(() => {
    let alive = true;

    async function buildDistribution() {
      if (!records.length) {
        if (alive) {
          setDistributionMap({});
          setSelectedSubject(undefined);
        }
        return;
      }

      setLoading(true);

      try {
        // 1) 获取学生考试列表，建立 examId -> subjectName
        const studentExams = await fetchStudentExams();
        const examSubjectMap = new Map();

        (studentExams || []).forEach((exam) => {
          examSubjectMap.set(
            Number(exam.id),
            exam.subjectName || exam.subject_name || "未分类",
          );
        });

        // 2) 收集当前记录中出现过的 examId
        const examIds = [
          ...new Set(
            records
              .map((r) => Number(r.exam_id || r.examId || 0))
              .filter((id) => Number.isFinite(id) && id > 0),
          ),
        ];

        // 3) 拉取每场考试的题目，建立 examId -> questionMap(questionId -> difficulty)
        const examQuestionMap = new Map();

        await Promise.all(
          examIds.map(async (examId) => {
            try {
              const res = await fetchExamQuestions(examId);
              const questionMap = new Map();

              (res?.questions || []).forEach((q) => {
                questionMap.set(Number(q.id), {
                  difficulty: normalizeDifficultyName(q.difficulty),
                });
              });

              examQuestionMap.set(examId, questionMap);
            } catch {
              examQuestionMap.set(examId, new Map());
            }
          }),
        );

        // 4) 遍历每条提交记录，拉取 submission detail，拿 answerRecords
        const nextDistribution = {};

        await Promise.all(
          records.map(async (record) => {
            const submissionId = Number(record.id);
            const examId = Number(record.exam_id || record.examId || 0);
            const subjectName =
              examSubjectMap.get(examId) ||
              record.subject_name ||
              record.subjectName ||
              "未分类";

            if (!submissionId || !examId) return;

            try {
              const detail = await fetchSubmissionById(submissionId);
              const answerRecords = detail?.answerRecords || [];
              const questionMap = examQuestionMap.get(examId) || new Map();

              if (!nextDistribution[subjectName]) {
                nextDistribution[subjectName] = {
                  简单: 0,
                  中等: 0,
                  困难: 0,
                };
              }

              answerRecords.forEach((ans) => {
                const questionId = Number(
                  ans.question_id || ans.questionId || 0,
                );
                const questionMeta = questionMap.get(questionId);
                const difficulty = questionMeta?.difficulty;

                if (
                  difficulty &&
                  nextDistribution[subjectName][difficulty] !== undefined
                ) {
                  nextDistribution[subjectName][difficulty] += 1;
                }
              });
            } catch {
              // 某条提交详情失败时跳过，不阻断整体
            }
          }),
        );

        if (!alive) return;

        setDistributionMap(nextDistribution);

        const subjectNames = Object.keys(nextDistribution);
        setSelectedSubject((prev) =>
          prev && subjectNames.includes(prev) ? prev : subjectNames[0],
        );
      } finally {
        if (alive) setLoading(false);
      }
    }

    buildDistribution();

    return () => {
      alive = false;
    };
  }, [records, fetchStudentExams, fetchExamQuestions, fetchSubmissionById]);

  const subjectOptions = useMemo(() => {
    return Object.keys(distributionMap).map((name) => ({
      label: name,
      value: name,
    }));
  }, [distributionMap]);

  const stats = useMemo(() => {
    const current = distributionMap[selectedSubject] || {
      简单: 0,
      中等: 0,
      困难: 0,
    };

    const total = Object.values(current).reduce((sum, n) => sum + n, 0);

    const segments = DIFFICULTY_ORDER.map((key) => ({
      key,
      label: key,
      value: current[key] || 0,
      percent: total > 0 ? Math.round(((current[key] || 0) / total) * 100) : 0,
      color: DIFFICULTY_COLOR_MAP[key],
    }));

    return { total, segments };
  }, [distributionMap, selectedSubject]);

  const ringBackground = useMemo(
    () => buildConicGradient(stats.segments),
    [stats.segments],
  );

  return (
    <section className="pr-panel pr-subject-panel">
      <div className="pr-panel-head pr-panel-head--between pr-panel-head--top">
        <div>
          <h3 className="pr-panel-title">练习难度分布</h3>
          <p className="pr-panel-subtitle">查看已完成题量难度占比</p>
        </div>

        <Select
          className="pr-subject-filter"
          value={selectedSubject}
          options={subjectOptions}
          placeholder="选择科目"
          onChange={setSelectedSubject}
          loading={loading}
          disabled={!subjectOptions.length}
        />
      </div>

      <div className="pr-difficulty-card">
        <div className="pr-difficulty-ring-wrap">
          <div
            className="pr-difficulty-ring"
            style={{ background: ringBackground }}
          >
            <div className="pr-difficulty-ring-inner">
              <div className="pr-difficulty-total">{stats.total}</div>
              <div className="pr-difficulty-total-unit">题</div>
            </div>
          </div>
        </div>

        <div className="pr-difficulty-main">
          <div className="pr-difficulty-legend">
            {stats.segments.map((item) => (
              <div key={item.key} className="pr-difficulty-legend-item">
                <span
                  className="pr-difficulty-dot"
                  style={{ background: item.color }}
                />
                <span className="pr-difficulty-label">{item.label}</span>
                <span className="pr-difficulty-value">{item.value}题</span>
                <span className="pr-difficulty-percent">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
