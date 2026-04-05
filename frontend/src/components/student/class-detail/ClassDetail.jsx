import React, { useEffect, useMemo, useState } from "react";
import { Breadcrumb, Spin } from "antd";
import {
  HomeOutlined,
  FileTextOutlined,
  TeamOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { Link, useParams } from "react-router-dom";
import { useClassStore, useExamStore } from "../../../store";
import ClassTasksPanel from "./ClassTasksPanel";
import ClassMembersPanel from "./ClassMembersPanel";
import ClassStudyProfilePanel from "./ClassStudyProfilePanel";
import "./class-detail.css";

const MENU_ITEMS = [
  {
    key: "tasks",
    label: "作业任务",
    icon: <FileTextOutlined />,
  },
  {
    key: "members",
    label: "班级成员",
    icon: <TeamOutlined />,
  },
  {
    key: "profile",
    label: "我的学情",
    icon: <BarChartOutlined />,
  },
];

export default function ClassDetail() {
  const { classId, id } = useParams();
  const realClassId = classId ?? id;

  const [activeMenu, setActiveMenu] = useState("tasks");

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
      (item) =>
        Number(item.classId ?? item.class_id ?? item.kclassId) ===
        Number(realClassId),
    );
  }, [exams, realClassId]);

  const classInfo = useMemo(() => {
    if (!currentClass) return null;

    return {
      id: currentClass.id,
      className:
        currentClass.name ||
        currentClass.className ||
        currentClass.class_name ||
        "未命名班级",
      teacherName: currentClass.teacherName || "未知教师",
      subjectName:
        currentClass.subjectName ||
        currentClass.subject ||
        currentClass.courseName ||
        "课程",
      studentCount: classStudents?.length || currentClass.studentCount || 0,
    };
  }, [currentClass, classStudents]);

  const myProfileStats = useMemo(() => {
    const totalCount = classExams.length;

    const finishedList = classExams.filter(
      (item) => Number(item.hasSubmitted ?? item.isFinished ?? 0) === 1,
    );

    const pendingList = classExams.filter(
      (item) => Number(item.hasSubmitted ?? item.isFinished ?? 0) !== 1,
    );

    const finishedCount = finishedList.length;
    const taskCompletionRate =
      totalCount > 0 ? Math.round((finishedCount / totalCount) * 100) : 0;

    const onTimeCount = finishedList.filter((item) => {
      if (!item.deadlineAt || !item.submittedAt) return false;
      return (
        new Date(item.submittedAt).getTime() <=
        new Date(item.deadlineAt).getTime()
      );
    }).length;

    const totalMinutes = finishedList.reduce((sum, item) => {
      return sum + Number(item.duration || item.durationMin || 0);
    }, 0);

    return {
      totalCount,
      finishedCount,
      pendingCount: pendingList.length,
      taskCompletionRate,
      onTimeCount,
      totalMinutes,
    };
  }, [classExams]);

  const renderContent = () => {
    if (!classInfo) return null;

    switch (activeMenu) {
      case "members":
        return (
          <ClassMembersPanel
            classInfo={classInfo}
            classStudents={classStudents || []}
          />
        );
      case "profile":
        return (
          <ClassStudyProfilePanel
            classInfo={classInfo}
            profileStats={myProfileStats}
          />
        );
      case "tasks":
      default:
        return (
          <ClassTasksPanel classInfo={classInfo} classExams={classExams} />
        );
    }
  };

  if (!currentClass || !classInfo) {
    return (
      <div className="class-detail-page">
        <div className="class-detail-loading">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="class-detail-page">
      <div className="class-detail-shell">
        <aside className="class-detail-sidebar">
          <div className="class-detail-sidebar-offset" />
          <div className="class-detail-sidebar-card">
            <div className="class-detail-course-cover">
              <div className="class-detail-course-cover-title">
                {classInfo.className}
              </div>
              <div className="class-detail-course-cover-sub">
                {classInfo.subjectName} · {classInfo.studentCount} 人
              </div>
            </div>

            <div className="class-detail-menu">
              {MENU_ITEMS.map((item) => {
                const active = activeMenu === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`class-detail-menu-item ${active ? "active" : ""}`}
                    onClick={() => setActiveMenu(item.key)}
                  >
                    <span className="class-detail-menu-icon">{item.icon}</span>
                    <span className="class-detail-menu-text">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="class-detail-content">
          <div className="class-detail-content-top">
            <Breadcrumb
              items={[
                {
                  title: (
                    <Link
                      to="/student/dashboard"
                      className="class-breadcrumb-link"
                    >
                      <HomeOutlined />
                    </Link>
                  ),
                },
                {
                  title: (
                    <Link
                      to="/student/class-list"
                      className="class-breadcrumb-link"
                    >
                      班级列表
                    </Link>
                  ),
                },
                {
                  title: (
                    <span className="class-breadcrumb-current">
                      {classInfo.className}
                    </span>
                  ),
                },
              ]}
            />
          </div>

          <div className="class-detail-content-body">{renderContent()}</div>
        </section>
      </div>
    </div>
  );
}
