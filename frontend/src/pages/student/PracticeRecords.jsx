// import React, { useMemo, useState } from "react";
// import { DatePicker } from "antd";
// import { useNavigate } from "react-router-dom";
// import { BarChartOutlined, CalendarOutlined } from "@ant-design/icons";
// import PageHeader from "../../components/PageHeader";
// import { useSubmissionStore, useAuthStore } from "../../store";
// import "./practice-records.css";

// const { RangePicker } = DatePicker;

// function toDateOnlyStr(datetimeStr) {
//   return (datetimeStr || "").split(" ")[0];
// }

// export default function PracticeRecords() {
//   const navigate = useNavigate();
//   const submissions = useSubmissionStore((s) => s.submissions);
//   const currentUser = useAuthStore((s) => s.currentUser);

//   const currentStudentId =
//     currentUser?.role === "student" ? currentUser.id : null;

//   const records = useMemo(() => {
//     if (!currentStudentId) return [];
//     return submissions
//       .filter((r) => r.studentId === currentStudentId)
//       .sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt));
//   }, [submissions, currentStudentId]);

//   const overview = useMemo(() => {
//     const totalSolved = records.reduce((sum, r) => sum + (r.total || 0), 0);
//     const todayDelta = 0;
//     const streakDays = records.length ? 7 : 0;
//     const studyHoursWeek =
//       Math.round(
//         (records.reduce((sum, r) => sum + (r.durationMin || 0), 0) / 60) * 10,
//       ) / 10;

//     return {
//       totalSolved,
//       todayDelta,
//       streakDays,
//       studyHoursWeek,
//     };
//   }, [records]);

//   const [range, setRange] = useState(null);

//   const filteredRecords = useMemo(() => {
//     if (!range || range.length !== 2 || !range[0] || !range[1]) return records;
//     const start = range[0].format("YYYY-MM-DD");
//     const end = range[1].format("YYYY-MM-DD");
//     return records.filter((r) => {
//       const d = toDateOnlyStr(r.finishedAt);
//       return d >= start && d <= end;
//     });
//   }, [records, range]);

//   return (
//     <div className="pr-page">
//       <PageHeader
//         title="刷题记录"
//         subtitle="近30天学习数据分析"
//         icon={
//           <div className="pr-ph-icon">
//             <BarChartOutlined />
//           </div>
//         }
//       />

//       <div className="pr-wrap">
//         <div className="pr-stats">
//           <div className="pr-card tone-blue">
//             <div className="pr-card-label">累计刷题</div>
//             <div className="pr-card-value">{overview.totalSolved}</div>
//             <div className="pr-card-sub">+{overview.todayDelta} 今日</div>
//           </div>

//           <div className="pr-card tone-orange">
//             <div className="pr-card-label">连续打卡</div>
//             <div className="pr-card-value">{overview.streakDays}天</div>
//             <div className="pr-card-sub">继续保持！</div>
//           </div>

//           <div className="pr-card tone-purple">
//             <div className="pr-card-label">学习时长</div>
//             <div className="pr-card-value">{overview.studyHoursWeek}h</div>
//             <div className="pr-card-sub">累计</div>
//           </div>
//         </div>

//         <div className="pr-list-card">
//           <div className="pr-list-head">
//             <div className="pr-list-title">
//               <CalendarOutlined />
//               <span>做题记录</span>
//             </div>

//             <RangePicker
//               className="pr-range"
//               allowClear
//               onChange={(val) => setRange(val)}
//               placeholder={["开始日期", "结束日期"]}
//             />
//           </div>

//           <div className="pr-list">
//             {filteredRecords.map((r) => (
//               <div key={r.id} className="pr-item">
//                 <div className="pr-item-left">
//                   <div className="pr-item-title">{r.title}</div>
//                   <div className="pr-item-sub">
//                     <span>{r.total}题</span>
//                     <span className="dot">·</span>
//                     <span>{r.durationMin}分钟</span>
//                     <span className="dot">·</span>
//                     <span>完成：{r.finishedAt}</span>
//                   </div>
//                 </div>

//                 <div className="pr-item-right">
//                   <div className="pr-score">
//                     <div className="pr-score-label">得分</div>
//                     <div className="pr-score-value">{r.score}</div>
//                   </div>

//                   <button
//                     type="button"
//                     className="pr-detail-btn"
//                     onClick={() => navigate(`/student/records/${r.id}`)}
//                   >
//                     查看详情
//                   </button>
//                 </div>
//               </div>
//             ))}

//             {filteredRecords.length === 0 && (
//               <div className="pr-empty">该时间范围内暂无记录</div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import { DatePicker } from "antd";
import { useNavigate } from "react-router-dom";
import { BarChartOutlined, CalendarOutlined } from "@ant-design/icons";
import PageHeader from "../../components/PageHeader";
import { useSubmissionStore, useStudentStore } from "../../store";
import "./practice-records.css";

const { RangePicker } = DatePicker;

function toDateOnlyStr(datetimeStr) {
  return (datetimeStr || "").split(" ")[0];
}

function toDateSafe(v) {
  if (!v) return null;
  const d = new Date(String(v).replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}

function calcStreakDays(records = []) {
  if (!records.length) return 0;

  const days = [
    ...new Set(
      records
        .map((r) => {
          const d = toDateSafe(r.submitted_at);
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
      streak = 1;
      cursor = d;
    } else {
      break;
    }
  }

  return streak;
}

export default function PracticeRecords() {
  const navigate = useNavigate();

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
      .sort(
        (a, b) =>
          new Date(String(b.submitted_at).replace(" ", "T")) -
          new Date(String(a.submitted_at).replace(" ", "T")),
      );
  }, [submissions, studentId]);

  const overview = useMemo(() => {
    const totalSolved = records.reduce(
      (sum, r) => sum + Number(r.total_count || 0),
      0,
    );

    const today = new Date();
    const todayDelta = records
      .filter((r) => {
        const d = toDateSafe(r.submitted_at);
        if (!d) return false;
        return (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        );
      })
      .reduce((sum, r) => sum + Number(r.total_count || 0), 0);

    const streakDays = calcStreakDays(records);

    const studyHoursWeek =
      Math.round(
        (records.reduce((sum, r) => sum + Number(r.duration_min || 0), 0) /
          60) *
          10,
      ) / 10;

    return {
      totalSolved,
      todayDelta,
      streakDays,
      studyHoursWeek,
    };
  }, [records]);

  const [range, setRange] = useState(null);

  const filteredRecords = useMemo(() => {
    if (!range || range.length !== 2 || !range[0] || !range[1]) return records;

    const start = range[0].format("YYYY-MM-DD");
    const end = range[1].format("YYYY-MM-DD");

    return records.filter((r) => {
      const d = toDateOnlyStr(r.submitted_at);
      return d >= start && d <= end;
    });
  }, [records, range]);

  return (
    <div className="pr-page">
      <PageHeader
        title="刷题记录"
        subtitle="近30天学习数据分析"
        icon={
          <div className="pr-ph-icon">
            <BarChartOutlined />
          </div>
        }
      />

      <div className="pr-wrap">
        <div className="pr-stats">
          <div className="pr-card tone-blue">
            <div className="pr-card-label">累计刷题</div>
            <div className="pr-card-value">{overview.totalSolved}</div>
            <div className="pr-card-sub">+{overview.todayDelta} 今日</div>
          </div>

          <div className="pr-card tone-orange">
            <div className="pr-card-label">连续打卡</div>
            <div className="pr-card-value">{overview.streakDays}天</div>
            <div className="pr-card-sub">继续保持！</div>
          </div>

          <div className="pr-card tone-purple">
            <div className="pr-card-label">学习时长</div>
            <div className="pr-card-value">{overview.studyHoursWeek}h</div>
            <div className="pr-card-sub">累计</div>
          </div>
        </div>

        <div className="pr-list-card">
          <div className="pr-list-head">
            <div className="pr-list-title">
              <CalendarOutlined />
              <span>做题记录</span>
            </div>

            <RangePicker
              className="pr-range"
              allowClear
              onChange={(val) => setRange(val)}
              placeholder={["开始日期", "结束日期"]}
            />
          </div>

          <div className="pr-list">
            {filteredRecords.map((r) => (
              <div key={r.id} className="pr-item">
                <div className="pr-item-left">
                  <div className="pr-item-title">{r.title}</div>
                  <div className="pr-item-sub">
                    <span>{r.total_count}题</span>
                    <span className="dot">·</span>
                    <span>{r.duration_min}分钟</span>
                    <span className="dot">·</span>
                    <span>完成：{r.submitted_at}</span>
                  </div>
                </div>

                <div className="pr-item-right">
                  <div className="pr-score">
                    <div className="pr-score-label">得分</div>
                    <div className="pr-score-value">{r.score}</div>
                  </div>

                  <button
                    type="button"
                    className="pr-detail-btn"
                    onClick={() => navigate(`/student/records/${r.id}`)}
                  >
                    查看详情
                  </button>
                </div>
              </div>
            ))}

            {filteredRecords.length === 0 && (
              <div className="pr-empty">该时间范围内暂无记录</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
