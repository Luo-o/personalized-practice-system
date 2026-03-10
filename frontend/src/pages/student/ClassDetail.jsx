// import React, { useMemo } from "react";
// import { Row, Col, Button, Tag } from "antd";
// import {
//   TeamOutlined,
//   ClockCircleOutlined,
//   FileTextOutlined,
//   CheckCircleFilled,
// } from "@ant-design/icons";
// import PageHeader from "../../components/PageHeader";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   useClassStore,
//   useTeacherStore,
//   useExamStore,
//   useSubmissionStore,
//   useAuthStore,
// } from "../../store";
// import "./class-detail.css";

// export default function ClassDetail() {
//   const navigate = useNavigate();
//   const { classId, id } = useParams();

//   const classes = useClassStore((s) => s.classes);
//   const teachers = useTeacherStore((s) => s.teachers);
//   const exams = useExamStore((s) => s.exams);
//   const submissions = useSubmissionStore((s) => s.submissions);
//   const currentUser = useAuthStore((s) => s.currentUser);

//   const currentStudentId =
//     currentUser?.role === "student" ? currentUser.id : null;

//   const realClassId = classId ?? id;

//   const klass = useMemo(() => {
//     return classes.find((c) => String(c.id) === String(realClassId)) || null;
//   }, [classes, realClassId]);

//   const teacher = useMemo(() => {
//     if (!klass) return null;
//     return teachers.find((t) => t.id === klass.teacherId) || null;
//   }, [klass, teachers]);

//   const classExams = useMemo(() => {
//     if (!klass) return [];
//     return exams.filter((e) => e.classId === klass.id);
//   }, [klass, exams]);

//   const mySubmissions = useMemo(() => {
//     if (!currentStudentId) return [];
//     return submissions.filter((s) => s.studentId === currentStudentId);
//   }, [submissions, currentStudentId]);

//   const finishedExamIds = useMemo(() => {
//     return new Set(mySubmissions.map((s) => s.examId));
//   }, [mySubmissions]);

//   const pendingExams = useMemo(() => {
//     return classExams
//       .filter((e) => !finishedExamIds.has(e.id))
//       .map((e, idx) => ({
//         id: e.id,
//         no: idx + 1,
//         title: e.title,
//         deadline: e.deadline || "-",
//         questionCount: e.questionIds?.length || 0,
//         durationMin: 60,
//       }));
//   }, [classExams, finishedExamIds]);

//   const finishedExams = useMemo(() => {
//     return classExams
//       .filter((e) => finishedExamIds.has(e.id))
//       .map((e, idx) => {
//         const mySubmission = mySubmissions.find((s) => s.examId === e.id);
//         return {
//           id: e.id,
//           no: idx + 1,
//           title: e.title,
//           questionCount: e.questionIds?.length || 0,
//           durationMin: mySubmission?.durationMin || 0,
//           deadline: e.deadline || "-",
//           score: mySubmission?.score || 0,
//           scoreTone:
//             (mySubmission?.score || 0) >= 85
//               ? "green"
//               : (mySubmission?.score || 0) >= 60
//                 ? "blue"
//                 : "orange",
//           recordId: mySubmission?.id,
//         };
//       });
//   }, [classExams, finishedExamIds, mySubmissions]);

//   const classInfo = useMemo(() => {
//     if (!klass) return null;
//     return {
//       className: klass.name,
//       teacher: teacher?.name || "未知教师",
//       studentCount: klass.studentIds?.length || 0,
//       courseCode: klass.subject || "未设置",
//     };
//   }, [klass, teacher]);

//   const onStart = (examId) => {
//     navigate(`/student/exam/${examId}`);
//   };

//   const onDetail = (recordId) => {
//     navigate(`/student/records/${recordId}`);
//   };

//   if (!klass || !classInfo) {
//     return (
//       <div className="class-detail">
//         <PageHeader
//           title="我的班级"
//           subtitle="班级不存在"
//           icon={<TeamOutlined />}
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="class-detail">
//       <PageHeader
//         title="我的班级"
//         subtitle={classInfo.className}
//         icon={<TeamOutlined />}
//       />

//       <div className="class-detail-body">
//         <div className="class-info-card">
//           <Row gutter={[24, 16]}>
//             <Col xs={24} sm={12} md={6}>
//               <div className="info-item">
//                 <div className="info-label">班级名称</div>
//                 <div className="info-value">{classInfo.className}</div>
//               </div>
//             </Col>

//             <Col xs={24} sm={12} md={6}>
//               <div className="info-item">
//                 <div className="info-label">任课教师</div>
//                 <div className="info-value">{classInfo.teacher}</div>
//               </div>
//             </Col>

//             <Col xs={24} sm={12} md={6}>
//               <div className="info-item">
//                 <div className="info-label">班级人数</div>
//                 <div className="info-value">{classInfo.studentCount}人</div>
//               </div>
//             </Col>

//             <Col xs={24} sm={12} md={6}>
//               <div className="info-item">
//                 <div className="info-label">课程科目</div>
//                 <div className="info-value">{classInfo.courseCode}</div>
//               </div>
//             </Col>
//           </Row>
//         </div>

//         <div className="section">
//           <div className="section-title">
//             待完成测验{" "}
//             <span className="count-red">({pendingExams.length})</span>
//           </div>

//           <Row gutter={[18, 18]}>
//             {pendingExams.map((e) => (
//               <Col key={e.id} xs={24} md={12} lg={8}>
//                 <div className="pending-card">
//                   <div className="pending-top">
//                     <div className="pending-status">
//                       <span className="pending-status-dot" />
//                       <span className="pending-status-text">待完成</span>
//                     </div>
//                     <Tag className="pending-no" color="orange">
//                       #{e.no}
//                     </Tag>
//                   </div>

//                   <div className="pending-title">{e.title}</div>

//                   <div className="pending-meta">
//                     <div className="meta-row">
//                       <ClockCircleOutlined className="meta-ico" />
//                       <span className="meta-text">截止时间：{e.deadline}</span>
//                     </div>
//                     <div className="meta-row">
//                       <FileTextOutlined className="meta-ico" />
//                       <span className="meta-text">
//                         {e.questionCount}题 · {e.durationMin}分钟
//                       </span>
//                     </div>
//                   </div>

//                   <Button
//                     className="pending-btn"
//                     type="primary"
//                     onClick={() => onStart(e.id)}
//                   >
//                     开始答题
//                   </Button>
//                 </div>
//               </Col>
//             ))}
//           </Row>

//           {pendingExams.length === 0 && (
//             <div className="class-empty">当前班级暂无待完成测验</div>
//           )}
//         </div>

//         <div className="section">
//           <div className="section-title">
//             已完成测验{" "}
//             <span className="count-green">({finishedExams.length})</span>
//           </div>

//           <div className="finished-list">
//             {finishedExams.map((e) => (
//               <div key={e.id} className="finished-item">
//                 <div className="finished-left">
//                   <div className="finished-badge">
//                     <CheckCircleFilled className="finished-check" />
//                     <span className="finished-badge-text">
//                       已完成 · #{e.no}
//                     </span>
//                   </div>

//                   <div className="finished-title">{e.title}</div>

//                   <div className="finished-meta">
//                     {e.questionCount}题 · {e.durationMin}分钟 · 截止：
//                     {e.deadline}
//                   </div>
//                 </div>

//                 <div className="finished-right">
//                   <div className="score-wrap">
//                     <div className="score-label">得分</div>
//                     <div className={`score-value score-${e.scoreTone}`}>
//                       {e.score}
//                     </div>
//                   </div>

//                   <Button
//                     className="detail-btn"
//                     onClick={() => onDetail(e.recordId)}
//                   >
//                     查看详情
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {finishedExams.length === 0 && (
//             <div className="class-empty">当前班级暂无已完成测验</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useMemo } from "react";
import { Row, Col, Button, Tag } from "antd";
import {
  TeamOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import PageHeader from "../../components/PageHeader";
import { useNavigate, useParams } from "react-router-dom";
import { useClassStore, useExamStore } from "../../store";
import "./class-detail.css";

export default function ClassDetail() {
  const navigate = useNavigate();
  const { classId, id } = useParams();

  const realClassId = classId ?? id;

  const currentClass = useClassStore((s) => s.currentClass);
  const classStudents = useClassStore((s) => s.classStudents);
  const fetchClassById = useClassStore((s) => s.fetchClassById);
  const fetchClassStudents = useClassStore((s) => s.fetchClassStudents);

  const exams = useExamStore((s) => s.exams);
  const fetchStudentExams = useExamStore((s) => s.fetchStudentExams);

  useEffect(() => {
    if (!realClassId) return;

    fetchClassById(realClassId);
    fetchClassStudents(realClassId);
    fetchStudentExams();
  }, [realClassId, fetchClassById, fetchClassStudents, fetchStudentExams]);

  const classExams = useMemo(() => {
    return (exams || []).filter(
      (e) => Number(e.classId) === Number(realClassId),
    );
  }, [exams, realClassId]);

  const pendingExams = useMemo(() => {
    return classExams
      .filter((e) => Number(e.hasSubmitted) !== 1)
      .map((e, idx) => ({
        id: e.id,
        no: idx + 1,
        title: e.title,
        deadline: e.deadlineAt || "-",
        questionCount: e.questionCount || 0,
        durationMin: e.duration || 0,
      }));
  }, [classExams]);

  const finishedExams = useMemo(() => {
    return classExams
      .filter((e) => Number(e.hasSubmitted) === 1)
      .map((e, idx) => ({
        id: e.id,
        no: idx + 1,
        title: e.title,
        questionCount: e.questionCount || 0,
        durationMin: e.duration || 0,
        deadline: e.deadlineAt || "-",
        score: e.submissionScore || 0,
        scoreTone:
          Number(e.submissionScore || 0) >= 85
            ? "green"
            : Number(e.submissionScore || 0) >= 60
              ? "blue"
              : "orange",
        recordId: e.submissionId,
      }));
  }, [classExams]);

  const classInfo = useMemo(() => {
    if (!currentClass) return null;

    return {
      className: currentClass.name,
      teacher: currentClass.teacherName || "未知教师",
      studentCount: classStudents?.length || currentClass.studentCount || 0,
      courseCode: currentClass.subjectName || "未设置",
    };
  }, [currentClass, classStudents]);

  const onStart = (examId) => {
    navigate(`/student/exam/${examId}`);
  };

  const onDetail = (recordId) => {
    navigate(`/student/records/${recordId}`);
  };

  if (!currentClass || !classInfo) {
    return (
      <div className="class-detail">
        <PageHeader
          title="我的班级"
          subtitle="班级不存在"
          icon={<TeamOutlined />}
        />
      </div>
    );
  }

  return (
    <div className="class-detail">
      <PageHeader
        title="我的班级"
        subtitle={classInfo.className}
        icon={<TeamOutlined />}
      />

      <div className="class-detail-body">
        <div className="class-info-card">
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={6}>
              <div className="info-item">
                <div className="info-label">班级名称</div>
                <div className="info-value">{classInfo.className}</div>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div className="info-item">
                <div className="info-label">任课教师</div>
                <div className="info-value">{classInfo.teacher}</div>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div className="info-item">
                <div className="info-label">班级人数</div>
                <div className="info-value">{classInfo.studentCount}人</div>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div className="info-item">
                <div className="info-label">课程科目</div>
                <div className="info-value">{classInfo.courseCode}</div>
              </div>
            </Col>
          </Row>
        </div>

        <div className="section">
          <div className="section-title">
            待完成测验{" "}
            <span className="count-red">({pendingExams.length})</span>
          </div>

          <Row gutter={[18, 18]}>
            {pendingExams.map((e) => (
              <Col key={e.id} xs={24} md={12} lg={8}>
                <div className="pending-card">
                  <div className="pending-top">
                    <div className="pending-status">
                      <span className="pending-status-dot" />
                      <span className="pending-status-text">待完成</span>
                    </div>
                    <Tag className="pending-no" color="orange">
                      #{e.no}
                    </Tag>
                  </div>

                  <div className="pending-title">{e.title}</div>

                  <div className="pending-meta">
                    <div className="meta-row">
                      <ClockCircleOutlined className="meta-ico" />
                      <span className="meta-text">截止时间：{e.deadline}</span>
                    </div>
                    <div className="meta-row">
                      <FileTextOutlined className="meta-ico" />
                      <span className="meta-text">
                        {e.questionCount}题 · {e.durationMin}分钟
                      </span>
                    </div>
                  </div>

                  <Button
                    className="pending-btn"
                    type="primary"
                    onClick={() => onStart(e.id)}
                  >
                    开始答题
                  </Button>
                </div>
              </Col>
            ))}
          </Row>

          {pendingExams.length === 0 && (
            <div className="class-empty">当前班级暂无待完成测验</div>
          )}
        </div>

        <div className="section">
          <div className="section-title">
            已完成测验{" "}
            <span className="count-green">({finishedExams.length})</span>
          </div>

          <div className="finished-list">
            {finishedExams.map((e) => (
              <div key={e.id} className="finished-item">
                <div className="finished-left">
                  <div className="finished-badge">
                    <CheckCircleFilled className="finished-check" />
                    <span className="finished-badge-text">
                      已完成 · #{e.no}
                    </span>
                  </div>

                  <div className="finished-title">{e.title}</div>

                  <div className="finished-meta">
                    {e.questionCount}题 · {e.durationMin}分钟 · 截止：
                    {e.deadline}
                  </div>
                </div>

                <div className="finished-right">
                  <div className="score-wrap">
                    <div className="score-label">得分</div>
                    <div className={`score-value score-${e.scoreTone}`}>
                      {e.score}
                    </div>
                  </div>

                  <Button
                    className="detail-btn"
                    onClick={() => onDetail(e.recordId)}
                    disabled={!e.recordId}
                  >
                    查看详情
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {finishedExams.length === 0 && (
            <div className="class-empty">当前班级暂无已完成测验</div>
          )}
        </div>
      </div>
    </div>
  );
}
