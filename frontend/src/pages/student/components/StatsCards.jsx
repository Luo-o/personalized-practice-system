import React, { useEffect, useMemo } from "react";
import { Row, Col } from "antd";
import { BookOutlined, AimOutlined, BarChartOutlined } from "@ant-design/icons";
import "./stats-card.css";

import {
  useAnswerRecordStore,
  useSubmissionStore,
  useStudentStore,
} from "../../../store";

function toDateSafe(value) {
  if (!value) return null;
  const d = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}

function calcStreakDays(submissions = []) {
  if (!submissions.length) return 0;

  const days = [
    ...new Set(
      submissions
        .map((s) => {
          const d = toDateSafe(s.submitted_at || s.submittedAt);
          if (!d) return null;
          return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        })
        .filter(Boolean),
    ),
  ].sort((a, b) => new Date(b) - new Date(a));

  if (!days.length) return 0;

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const day of days) {
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);

    const diff = Math.round((cursor - d) / (1000 * 60 * 60 * 24));

    if (diff === 0 || diff === 1) {
      streak += 1;
      cursor = d;
    } else if (streak === 0) {
      cursor = d;
      streak = 1;
    } else {
      break;
    }
  }

  return streak;
}

export default function StatsCards() {
  const studentId = useStudentStore((state) => state.getCurrentStudentId());

  const studentStats = useAnswerRecordStore((state) => state.studentStats);
  const fetchStudentStats = useAnswerRecordStore(
    (state) => state.fetchStudentStats,
  );

  const submissions = useSubmissionStore((state) => state.submissions);
  const fetchSubmissions = useSubmissionStore(
    (state) => state.fetchSubmissions,
  );

  useEffect(() => {
    if (!studentId) return;

    fetchStudentStats();
    fetchSubmissions();
  }, [studentId, fetchStudentStats, fetchSubmissions]);

  const data = useMemo(() => {
    if (!studentId) {
      return {
        todayDone: 0,
        accuracy: 0,
        streakDays: 0,
      };
    }

    const mySubmissions = (submissions || []).filter(
      (s) => Number(s.student_id) === Number(studentId),
    );

    const today = new Date();

    const todayDone = mySubmissions
      .filter((s) => {
        const d = toDateSafe(s.submitted_at || s.submittedAt);
        if (!d) return false;

        return (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        );
      })
      .reduce((sum, s) => sum + Number(s.total_count || s.totalCount || 0), 0);

    const accuracy = Math.round(Number(studentStats?.accuracy || 0) * 100);

    const streakDays = calcStreakDays(mySubmissions);

    return {
      todayDone,
      accuracy,
      streakDays,
    };
  }, [studentId, submissions, studentStats]);

  const cards = [
    {
      title: "今日已刷题",
      value: String(data.todayDone),
      valueClass: "value-default",
      icon: <BookOutlined />,
      tone: "blue",
    },
    {
      title: "正确率",
      value: `${data.accuracy}%`,
      valueClass: "value-green",
      icon: <AimOutlined />,
      tone: "green",
    },
    {
      title: "连续打卡",
      value: `${data.streakDays}天`,
      valueClass: "value-orange",
      icon: <BarChartOutlined />,
      tone: "orange",
    },
  ];

  return (
    <div className="stats-cards-wrap">
      <Row gutter={[18, 18]}>
        {cards.map((c) => (
          <Col key={c.title} xs={24} sm={12} lg={8}>
            <div className="stats-card-ui">
              <div className="stats-left">
                <div className="stats-title">{c.title}</div>
                <div className={`stats-value ${c.valueClass}`}>{c.value}</div>
              </div>

              <div className={`stats-icon-box tone-${c.tone}`}>
                <span className="stats-icon">{c.icon}</span>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}
