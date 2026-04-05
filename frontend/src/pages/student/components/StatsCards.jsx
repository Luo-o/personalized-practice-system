import React, { useEffect, useMemo } from "react";
import { Row, Col } from "antd";
import {
  EditFilled,
  CheckCircleFilled,
  FireFilled,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
} from "@ant-design/icons";
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

function isSameDay(date, target) {
  return (
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth() &&
    date.getDate() === target.getDate()
  );
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
        yesterdayDone: 0,
        todayMastered: 0,
        accuracy: 0,
        streakDays: 0,
      };
    }

    const mySubmissions = (submissions || []).filter(
      (s) => Number(s.student_id) === Number(studentId),
    );

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayList = mySubmissions.filter((s) => {
      const d = toDateSafe(s.submitted_at || s.submittedAt);
      return d && isSameDay(d, today);
    });

    const yesterdayList = mySubmissions.filter((s) => {
      const d = toDateSafe(s.submitted_at || s.submittedAt);
      return d && isSameDay(d, yesterday);
    });

    const todayDone = todayList.reduce(
      (sum, s) => sum + Number(s.total_count || s.totalCount || 0),
      0,
    );

    const yesterdayDone = yesterdayList.reduce(
      (sum, s) => sum + Number(s.total_count || s.totalCount || 0),
      0,
    );

    const todayMastered = todayList.reduce(
      (sum, s) => sum + Number(s.correct_count || s.correctCount || 0),
      0,
    );

    const accuracy = Math.round(Number(studentStats?.accuracy || 0) * 100);
    const streakDays = calcStreakDays(mySubmissions);

    return {
      todayDone,
      yesterdayDone,
      todayMastered,
      accuracy,
      streakDays,
    };
  }, [studentId, submissions, studentStats]);

  const todayDelta = data.todayDone - data.yesterdayDone;

  const todayTrend = useMemo(() => {
    if (todayDelta > 0) {
      return {
        icon: <RiseOutlined />,
        className: "stats-subtext-up",
        text: `${Math.abs(todayDelta)} 题`,
        note: "较昨日上升",
      };
    }
    if (todayDelta < 0) {
      return {
        icon: <FallOutlined />,
        className: "stats-subtext-down",
        text: `${Math.abs(todayDelta)} 题`,
        note: "较昨日下降",
      };
    }
    return {
      icon: <MinusOutlined />,
      className: "stats-subtext-neutral",
      text: "0 题",
      note: "与昨日持平",
    };
  }, [todayDelta]);

  const cards = [
    {
      key: "today",
      title: "今日已刷题",
      value: String(data.todayDone),
      valueClass: "value-default",
      icon: <EditFilled />,
      tone: "blue",
      renderFooter: () => (
        <div className={`stats-subtext ${todayTrend.className}`}>
          <span className="stats-trend-icon">{todayTrend.icon}</span>
          <span>{todayTrend.text}</span>
          <span className="stats-subtext-note">{todayTrend.note}</span>
        </div>
      ),
    },
    {
      key: "accuracy",
      title: "掌握率",
      value: `${data.accuracy}%`,
      valueClass: "value-green",
      icon: <CheckCircleFilled />,
      tone: "green",
      badge: "稳步提升",
      badgeClass: "stats-badge stats-badge-blue",
      renderFooter: () => (
        <div className="stats-subtext stats-subtext-neutral">
          今日已掌握 {data.todayMastered} 题
        </div>
      ),
    },
    {
      key: "streak",
      title: "连续打卡",
      value: `${data.streakDays}`,
      valueSuffix: "天",
      valueClass: "value-orange",
      icon: <FireFilled />,
      tone: "orange",
      badge: data.streakDays >= 3 ? "保持节奏" : "继续加油",
      badgeClass: "stats-badge stats-badge-orange",
      renderFooter: () => (
        <div className="stats-subtext stats-subtext-neutral">
          持续练习 , 形成习惯！
        </div>
      ),
    },
  ];

  return (
    <div className="stats-cards-wrap">
      <Row gutter={[18, 18]}>
        {cards.map((c) => (
          <Col key={c.key} xs={24} sm={12} lg={8} className="stats-card-col">
            <div className="stats-card-ui">
              <div className="stats-card-head">
                <div className="stats-title">{c.title}</div>

                <div className={`stats-icon-box tone-${c.tone}`}>
                  <span className="stats-icon">{c.icon}</span>
                </div>
              </div>

              <div className="stats-main">
                <div className="stats-value-row">
                  <div className={`stats-value ${c.valueClass}`}>
                    {c.value}
                    {c.valueSuffix && (
                      <span className="stats-value-suffix">
                        {c.valueSuffix}
                      </span>
                    )}
                  </div>

                  {c.badge && <span className={c.badgeClass}>{c.badge}</span>}
                </div>

                {c.renderFooter()}
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}
