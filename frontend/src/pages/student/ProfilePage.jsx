// import React, { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   UserOutlined,
//   ReadOutlined,
//   BarChartOutlined,
//   SettingOutlined,
//   BookOutlined,
//   TeamOutlined,
//   LogoutOutlined,
// } from "@ant-design/icons";

// import PageHeader from "../../components/PageHeader";
// import KnowledgeBubbleMap from "../../components/student/knowledge-bubble-map/KnowledgeBubbleMap";
// import AccountSettingsModal from "../../components/student/account-settings/AccountSettingsModal";
// import {
//   useAuthStore,
//   useStudentStore,
//   useClassStore,
//   useSubmissionStore,
//   useAnswerRecordStore,
// } from "../../store";
// import "./profile-page.css";

// function EntryCard({ icon, title, desc, onClick, tone = "gray" }) {
//   return (
//     <button
//       type="button"
//       className={`pc-entry-card tone-${tone}`}
//       onClick={onClick}
//     >
//       <div className="pc-entry-icon">{icon}</div>
//       <div className="pc-entry-text">
//         <div className="pc-entry-title">{title}</div>
//         <div className="pc-entry-desc">{desc}</div>
//       </div>
//     </button>
//   );
// }

// export default function ProfilePage() {
//   const navigate = useNavigate();

//   const currentUser = useAuthStore((s) => s.currentUser);
//   const logout = useAuthStore((s) => s.logout);
//   const students = useStudentStore((s) => s.students);
//   const classes = useClassStore((s) => s.classes);
//   const submissions = useSubmissionStore((s) => s.submissions);
//   const answerRecords = useAnswerRecordStore((s) => s.answerRecords);

//   const student = useMemo(() => {
//     if (!currentUser) return null;
//     return students.find((s) => s.id === currentUser.id) || null;
//   }, [currentUser, students]);

//   const myClasses = useMemo(() => {
//     if (!currentUser) return [];
//     return classes.filter((c) => (c.studentIds || []).includes(currentUser.id));
//   }, [classes, currentUser]);

//   const mySubmissions = useMemo(() => {
//     if (!currentUser) return [];
//     return submissions.filter((s) => s.studentId === currentUser.id);
//   }, [submissions, currentUser]);

//   const myWrongCount = useMemo(() => {
//     if (!currentUser) return 0;
//     return answerRecords.filter(
//       (r) => r.studentId === currentUser.id && !r.isCorrect,
//     ).length;
//   }, [answerRecords, currentUser]);

//   const user = useMemo(() => {
//     return {
//       name: student?.name || "未登录",
//       studentId: student?.id || "",
//       className: myClasses.map((c) => c.name).join(" / ") || "暂无班级",
//       stats: [
//         {
//           label: "累计刷题",
//           value: String(
//             mySubmissions.reduce((sum, item) => sum + (item.total || 0), 0),
//           ),
//         },
//         {
//           label: "已完成测验",
//           value: String(mySubmissions.length),
//         },
//         {
//           label: "错题总数",
//           value: String(myWrongCount),
//         },
//       ],
//     };
//   }, [student, myClasses, mySubmissions, myWrongCount]);

//   const [open, setOpen] = useState(false);
//   const [accountOpen, setAccountOpen] = useState(false);

//   const subjects = useMemo(
//     () => [
//       { value: "net", label: "计算机网络" },
//       { value: "os", label: "操作系统" },
//       { value: "ds", label: "数据结构" },
//     ],
//     [],
//   );

//   const [subject, setSubject] = useState("net");

//   const dataBySubject = useMemo(
//     () => ({
//       net: [
//         { id: "n1", name: "TCP", accuracy: 0.82, size: 40 },
//         { id: "n2", name: "UDP", accuracy: 0.55, size: 25 },
//         { id: "n3", name: "拥塞控制", accuracy: 0.66, size: 30 },
//         { id: "n4", name: "HTTP", accuracy: 0.91, size: 18 },
//       ],
//       os: [
//         { id: "o1", name: "进程", accuracy: 0.72, size: 35 },
//         { id: "o2", name: "线程", accuracy: 0.63, size: 24 },
//         { id: "o3", name: "死锁", accuracy: 0.48, size: 32 },
//       ],
//       ds: [
//         { id: "d1", name: "二叉树", accuracy: 0.78, size: 28 },
//         { id: "d2", name: "图", accuracy: 0.58, size: 34 },
//         { id: "d3", name: "堆", accuracy: 0.86, size: 22 },
//       ],
//     }),
//     [],
//   );

//   const bubbleData = dataBySubject[subject] || [];

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   return (
//     <div className="pc-page">
//       <PageHeader
//         title="个人中心"
//         icon={
//           <div className="pc-ph-icon">
//             <UserOutlined />
//           </div>
//         }
//       />

//       <div className="pc-wrap">
//         <div className="pc-hero">
//           <div className="pc-hero-head">
//             <div className="pc-avatar">
//               <UserOutlined />
//             </div>

//             <div className="pc-user">
//               <div className="pc-user-name">{user.name}</div>
//               <div className="pc-user-meta">学号: {user.studentId}</div>
//             </div>
//           </div>

//           <div className="pc-hero-stats">
//             {user.stats.map((s, idx) => (
//               <div key={s.label} className="pc-stat">
//                 <div className="pc-stat-value">{s.value}</div>
//                 <div className="pc-stat-label">{s.label}</div>
//                 {idx !== user.stats.length - 1 ? (
//                   <div className="pc-stat-split" />
//                 ) : null}
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="pc-grid">
//           <EntryCard
//             tone="blue"
//             icon={<TeamOutlined />}
//             title="我的班级"
//             desc="查看班级与测验"
//             onClick={() => navigate("/student/class-list")}
//           />
//           <EntryCard
//             tone="purple"
//             icon={<BookOutlined />}
//             title="知识图谱"
//             desc="查看掌握情况"
//             onClick={() => setOpen(true)}
//           />
//           <EntryCard
//             tone="red"
//             icon={<ReadOutlined />}
//             title="我的错题本"
//             desc={`${myWrongCount}道题待复习`}
//             onClick={() => navigate("/student/wrong-book")}
//           />
//           <EntryCard
//             tone="sky"
//             icon={<BarChartOutlined />}
//             title="刷题记录"
//             desc="查看学习数据"
//             onClick={() => navigate("/student/records")}
//           />
//           <EntryCard
//             tone="gray"
//             icon={<SettingOutlined />}
//             title="账号设置"
//             desc="修改个人信息"
//             onClick={() => setAccountOpen(true)}
//           />
//         </div>

//         <button type="button" className="pc-logout" onClick={handleLogout}>
//           <LogoutOutlined />
//           <span>退出登录</span>
//         </button>

//         <div className="pc-footer">智慧刷题系统 v1.0.0</div>

//         <KnowledgeBubbleMap
//           overlay
//           open={open}
//           onClose={() => setOpen(false)}
//           title="全部知识点"
//           subjects={subjects}
//           subject={subject}
//           onChangeSubject={setSubject}
//           data={bubbleData}
//         />

//         <AccountSettingsModal
//           open={accountOpen}
//           onClose={() => setAccountOpen(false)}
//           user={{ name: user.name, studentId: user.studentId }}
//           onSubmit={async () => {}}
//         />
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserOutlined,
  ReadOutlined,
  BarChartOutlined,
  SettingOutlined,
  BookOutlined,
  TeamOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import PageHeader from "../../components/PageHeader";
import KnowledgeBubbleMap from "../../components/student/knowledge-bubble-map/KnowledgeBubbleMap";
import AccountSettingsModal from "../../components/student/account-settings/AccountSettingsModal";
import {
  useAuthStore,
  useStudentStore,
  useClassStore,
  useSubmissionStore,
  useAnswerRecordStore,
} from "../../store";
import "./profile-page.css";

function EntryCard({ icon, title, desc, onClick, tone = "gray" }) {
  return (
    <button
      type="button"
      className={`pc-entry-card tone-${tone}`}
      onClick={onClick}
    >
      <div className="pc-entry-icon">{icon}</div>
      <div className="pc-entry-text">
        <div className="pc-entry-title">{title}</div>
        <div className="pc-entry-desc">{desc}</div>
      </div>
    </button>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();

  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const currentStudent = useStudentStore((s) => s.getCurrentStudent());
  const refreshCurrentStudent = useStudentStore((s) => s.refreshCurrentStudent);

  const classes = useClassStore((s) => s.classes);
  const fetchStudentClasses = useClassStore((s) => s.fetchStudentClasses);

  const submissions = useSubmissionStore((s) => s.submissions);
  const fetchSubmissions = useSubmissionStore((s) => s.fetchSubmissions);

  const wrongQuestions = useAnswerRecordStore((s) => s.wrongQuestions);
  const refreshStudentAnalytics = useAnswerRecordStore(
    (s) => s.refreshStudentAnalytics,
  );

  useEffect(() => {
    refreshCurrentStudent();
    fetchStudentClasses();
    fetchSubmissions();
    refreshStudentAnalytics();
  }, [
    refreshCurrentStudent,
    fetchStudentClasses,
    fetchSubmissions,
    refreshStudentAnalytics,
  ]);

  const myClasses = useMemo(() => classes || [], [classes]);

  const mySubmissions = useMemo(() => {
    const studentId = currentUser?.profileId;
    if (!studentId) return [];

    return (submissions || []).filter(
      (s) => Number(s.student_id) === Number(studentId),
    );
  }, [submissions, currentUser]);

  const myWrongCount = wrongQuestions.length;

  const user = useMemo(() => {
    return {
      name: currentStudent?.name || "未登录",
      studentId: currentStudent?.studentNo || "",
      className: myClasses.map((c) => c.name).join(" / ") || "暂无班级",
      stats: [
        {
          label: "累计刷题",
          value: String(
            mySubmissions.reduce(
              (sum, item) => sum + Number(item.total_count || 0),
              0,
            ),
          ),
        },
        {
          label: "已完成测验",
          value: String(mySubmissions.length),
        },
        {
          label: "错题总数",
          value: String(myWrongCount),
        },
      ],
    };
  }, [currentStudent, myClasses, mySubmissions, myWrongCount]);

  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const subjects = useMemo(
    () => [
      { value: "net", label: "计算机网络" },
      { value: "os", label: "操作系统" },
      { value: "ds", label: "数据结构" },
    ],
    [],
  );

  const [subject, setSubject] = useState("net");

  const dataBySubject = useMemo(
    () => ({
      net: [
        { id: "n1", name: "TCP", accuracy: 0.82, size: 40 },
        { id: "n2", name: "UDP", accuracy: 0.55, size: 25 },
        { id: "n3", name: "拥塞控制", accuracy: 0.66, size: 30 },
        { id: "n4", name: "HTTP", accuracy: 0.91, size: 18 },
      ],
      os: [
        { id: "o1", name: "进程", accuracy: 0.72, size: 35 },
        { id: "o2", name: "线程", accuracy: 0.63, size: 24 },
        { id: "o3", name: "死锁", accuracy: 0.48, size: 32 },
      ],
      ds: [
        { id: "d1", name: "二叉树", accuracy: 0.78, size: 28 },
        { id: "d2", name: "图", accuracy: 0.58, size: 34 },
        { id: "d3", name: "堆", accuracy: 0.86, size: 22 },
      ],
    }),
    [],
  );

  const bubbleData = dataBySubject[subject] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="pc-page">
      <PageHeader
        title="个人中心"
        icon={
          <div className="pc-ph-icon">
            <UserOutlined />
          </div>
        }
      />

      <div className="pc-wrap">
        <div className="pc-hero">
          <div className="pc-hero-head">
            <div className="pc-avatar">
              <UserOutlined />
            </div>

            <div className="pc-user">
              <div className="pc-user-name">{user.name}</div>
              <div className="pc-user-meta">学号: {user.studentId}</div>
            </div>
          </div>

          <div className="pc-hero-stats">
            {user.stats.map((s, idx) => (
              <div key={s.label} className="pc-stat">
                <div className="pc-stat-value">{s.value}</div>
                <div className="pc-stat-label">{s.label}</div>
                {idx !== user.stats.length - 1 ? (
                  <div className="pc-stat-split" />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="pc-grid">
          <EntryCard
            tone="blue"
            icon={<TeamOutlined />}
            title="我的班级"
            desc="查看班级与测验"
            onClick={() => navigate("/student/class-list")}
          />
          <EntryCard
            tone="purple"
            icon={<BookOutlined />}
            title="知识图谱"
            desc="查看掌握情况"
            onClick={() => setOpen(true)}
          />
          <EntryCard
            tone="red"
            icon={<ReadOutlined />}
            title="我的错题本"
            desc={`${myWrongCount}道题待复习`}
            onClick={() => navigate("/student/wrong-book")}
          />
          <EntryCard
            tone="sky"
            icon={<BarChartOutlined />}
            title="刷题记录"
            desc="查看学习数据"
            onClick={() => navigate("/student/records")}
          />
          <EntryCard
            tone="gray"
            icon={<SettingOutlined />}
            title="账号设置"
            desc="修改个人信息"
            onClick={() => setAccountOpen(true)}
          />
        </div>

        <button type="button" className="pc-logout" onClick={handleLogout}>
          <LogoutOutlined />
          <span>退出登录</span>
        </button>

        <div className="pc-footer">智慧刷题系统 v1.0.0</div>

        <KnowledgeBubbleMap
          overlay
          open={open}
          onClose={() => setOpen(false)}
          title="全部知识点"
          subjects={subjects}
          subject={subject}
          onChangeSubject={setSubject}
          data={bubbleData}
        />

        <AccountSettingsModal
          open={accountOpen}
          onClose={() => setAccountOpen(false)}
          user={{ name: user.name, studentId: user.studentId }}
          onSubmit={async () => {}}
        />
      </div>
    </div>
  );
}
