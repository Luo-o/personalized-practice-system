import React, { useEffect, useMemo } from "react";
import { useSubmissionStore, useStudentStore } from "../../store";
import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import SubjectCircleStats from "../../components/student/practice-record/SubjectCircleStats";
import HeatmapCalendar from "../../components/student/practice-record/HeatmapCalendar";
import RecordListSection from "../../components/student/practice-record/RecordListSection";
import "./practice-records.css";

// function toDateSafe(v) {
//   if (!v) return null;
//   const d = new Date(String(v).replace(" ", "T"));
//   return Number.isNaN(d.getTime()) ? null : d;
// }

function normalizeSubjectName(record) {
  return (
    record.subject_name ||
    record.subjectName ||
    record.subject ||
    record.subjectTitle ||
    "未分类"
  );
}

function normalizeRecordType(record) {
  const raw =
    record.type ||
    record.record_type ||
    record.submission_type ||
    record.source_type ||
    record.mode ||
    record.category ||
    "";

  const normalized = String(raw).toLowerCase();

  if (
    [
      "exam",
      "class_exam",
      "quiz",
      "test",
      "assignment",
      "class",
      "class-test",
    ].includes(normalized)
  ) {
    return "exam";
  }

  if (
    ["practice", "self_practice", "self", "free", "自主练习", "练习"].includes(
      normalized,
    )
  ) {
    return "practice";
  }

  if (record.exam_id || record.examId || record.class_id || record.classId) {
    return "exam";
  }

  if (record.practice_id || record.practiceId) {
    return "practice";
  }

  const title = String(record.title || "").toLowerCase();
  if (
    title.includes("练习") ||
    title.includes("自主") ||
    title.includes("刷题")
  ) {
    return "practice";
  }

  return "exam";
}

function normalizeRecord(record) {
  const totalCount = Number(record.total_count || record.totalCount || 0);
  const scoreRaw = Number(record.score || 0);
  const scorePercent =
    totalCount > 0 ? Math.round((scoreRaw / totalCount) * 100) : 0;

  return {
    ...record,
    subject_name: normalizeSubjectName(record),
    normalizedType: normalizeRecordType(record),
    total_count: totalCount,
    duration_min: Number(record.duration_min || record.durationMin || 0),
    score_percent: scorePercent,
  };
}

export default function PracticeRecords() {
  const studentId = useStudentStore((s) => s.getCurrentStudentId());

  const submissions = useSubmissionStore((s) => s.submissions);
  const fetchSubmissions = useSubmissionStore((s) => s.fetchSubmissions);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const records = useMemo(() => {
    if (!studentId) return [];

    return (submissions || [])
      .filter((r) => Number(r.student_id) === Number(studentId))
      .map(normalizeRecord)
      .sort(
        (a, b) =>
          new Date(String(b.submitted_at).replace(" ", "T")) -
          new Date(String(a.submitted_at).replace(" ", "T")),
      );
  }, [submissions, studentId]);

  return (
    <div className="pr-page">
      <div className="pr-wrap pr-wrap--wide">
        <div className="pr-content-top">
          <Breadcrumb
            items={[
              {
                title: (
                  <Link to="/student/dashboard" className="pr-breadcrumb-link">
                    <HomeOutlined />
                  </Link>
                ),
              },
              {
                title: (
                  <Link
                    to="/student/wrong-book"
                    className="pr-breadcrumb-current"
                  >
                    做题记录
                  </Link>
                ),
              },
            ]}
          />
        </div>
        <div className="pr-top-grid">
          <SubjectCircleStats records={records} />
          <HeatmapCalendar records={records} />
        </div>

        <RecordListSection records={records} />
      </div>
    </div>
  );
}
