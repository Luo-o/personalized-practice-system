import React, { useMemo, useEffect } from "react";
import "./pending--card.css";
import { useExamStore, useStudentStore } from "../../../store";
import { BookOutlined, ContainerFilled } from "@ant-design/icons";

function getFiveDays() {
  const weekMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  return Array.from({ length: 5 }, (_, index) => {
    const current = new Date(today);
    current.setDate(today.getDate() + index - 1);

    return {
      key: `${current.getFullYear()}-${current.getMonth() + 1}-${current.getDate()}`,
      week: weekMap[current.getDay()],
      date: current.getDate(),
      active: index === 1,
    };
  });
}

function formatDeadlineText(deadline) {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();

  if (Number.isNaN(end.getTime())) return "截止时间待定";
  if (diff <= 0) return "已截止";

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  const days = Math.floor(diff / day);
  const hours = Math.floor((diff % day) / hour);
  const minutes = Math.floor((diff % hour) / minute);

  if (days > 0) return `还有 ${days} 天 ${hours} 小时截止`;
  if (hours > 0) return `还有 ${hours} 小时 ${minutes} 分钟截止`;
  return `还有 ${minutes} 分钟截止`;
}

export default function PendingCard() {
  const dates = useMemo(() => getFiveDays(), []);

  const studentId = useStudentStore((s) => s.getCurrentStudentId());

  const exams = useExamStore((s) => s.exams);
  const fetchStudentExams = useExamStore((s) => s.fetchStudentExams);

  useEffect(() => {
    if (studentId) {
      fetchStudentExams(studentId);
    }
  }, [studentId, fetchStudentExams]);

  const pendingExams = useMemo(() => {
    const now = new Date();

    return (exams || [])
      .filter((e) => {
        const hasSubmitted = Number(e.hasSubmitted) === 1;
        const isExpired = new Date(e.deadlineAt) <= now;

        return !hasSubmitted && !isExpired;
      })
      .sort((a, b) => new Date(a.deadlineAt) - new Date(b.deadlineAt));
  }, [exams]);

  return (
    <aside className="pending-exam-card">
      <div className="pending-exam-card__header">
        <div>
          <div className="pending-exam-card__title">待办</div>
        </div>

        <div className="pending-exam-card__badge">{pendingExams.length}</div>
      </div>

      <div className="pending-exam-card__dates">
        {dates.map((item) => (
          <div
            key={item.key}
            className={`pending-exam-card__date-item ${
              item.active ? "is-active" : ""
            }`}
          >
            <span className="pending-exam-card__date-week">{item.week}</span>
            <span className="pending-exam-card__date-day">{item.date}</span>
          </div>
        ))}
      </div>

      <div className="pending-exam-card__list">
        {pendingExams.map((item) => (
          <div key={item.id} className="pending-exam-card__item">
            <div className="pending-exam-card__icon"></div>
            <div className="pending-exam-card__content">
              <div className="pending-exam-card__name">{item.title}</div>
              <div className="pending-exam-card__deadline">
                {formatDeadlineText(item.deadlineAt)}
              </div>
            </div>
          </div>
        ))}

        {pendingExams.length === 0 && (
          <div className="pending-exam-card__empty">
            <div className="pending-exam-card__empty-icon">
              <ContainerFilled />
            </div>
            <div className="pending-exam-card__empty-title">
              当前没有待完成测验
            </div>
            <div className="pending-exam-card__empty-desc">
              去刷题或者加入班级获取任务吧～
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
