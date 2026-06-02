import React, { useEffect, useMemo, useState } from "react";
import { Modal, message, Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useClassStore, useExamStore, useStudentStore } from "../../../store";
import ClassProfileCard from "./ClassProfileCard";
import ClassToolbar from "./ClassToolbar";
import ClassGrid from "./ClassGrid";
import JoinCourseModal from "./JoinCourseModal";
import "./class-list.css";

const COURSE_COVER_LIST = [
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80",
];

function getCoverByIndex(index) {
  return COURSE_COVER_LIST[index % COURSE_COVER_LIST.length];
}

export default function ClassListPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("class-list");
  const [keyword, setKeyword] = useState("");
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [quitLoadingId, setQuitLoadingId] = useState(null);

  const classes = useClassStore((s) => s.classes || []);
  const fetchStudentClasses = useClassStore((s) => s.fetchStudentClasses);
  const joinClassByCode = useClassStore((s) => s.joinClassByCode);
  const quitClass = useClassStore((s) => s.quitClass);

  const exams = useExamStore((s) => s.exams || []);
  const fetchStudentExams = useExamStore((s) => s.fetchStudentExams);

  const getCurrentStudent = useStudentStore((s) => s.getCurrentStudent);
  const refreshCurrentStudent = useStudentStore((s) => s.refreshCurrentStudent);

  const currentStudent = getCurrentStudent?.();

  useEffect(() => {
    refreshCurrentStudent?.();
    fetchStudentClasses?.();
    fetchStudentExams?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const myClasses = useMemo(() => {
    return (classes || []).map((c, index) => {
      const classExams = (exams || []).filter((e) => {
        const examClassId = e.classId ?? e.class_id;
        return Number(examClassId) === Number(c.id);
      });

      const pendingTaskCount = classExams.filter(
        (e) => Number(e.hasSubmitted ?? e.has_submitted) !== 1,
      ).length;

      return {
        id: c.id,
        name: c.name || c.className || "未命名班级",
        subjectName: c.subjectName || c.subject_name || "未设置科目",
        teacherName: c.teacherName || c.teacher_name || "未知教师",
        studentCount: Number(c.studentCount || c.student_count || 0),
        description: c.description || "",
        pendingTaskCount,
        cover: c.cover || getCoverByIndex(index),
      };
    });
  }, [classes, exams]);

  const filteredClasses = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    if (!text) return myClasses;

    return myClasses.filter((item) => {
      return (
        String(item.name).toLowerCase().includes(text) ||
        String(item.subjectName).toLowerCase().includes(text) ||
        String(item.teacherName).toLowerCase().includes(text)
      );
    });
  }, [keyword, myClasses]);

  const summary = useMemo(() => {
    return {
      courseCount: myClasses.length,
      pendingTaskCount: myClasses.reduce(
        (sum, item) => sum + (item.pendingTaskCount || 0),
        0,
      ),
    };
  }, [myClasses]);

  const studentName =
    currentStudent?.name ||
    currentStudent?.studentName ||
    currentStudent?.realName ||
    "同学";

  const studentAvatar =
    currentStudent?.avatar ||
    currentStudent?.avatarUrl ||
    currentStudent?.profile?.avatar ||
    "/avatars/default-student-avatar.png";

  const studentGrade =
    currentStudent?.grade ||
    currentStudent?.gradeName ||
    currentStudent?.year ||
    "暂无年级信息";

  const studentMajor =
    currentStudent?.major || currentStudent?.majorName || "暂无专业信息";

  const avatarText = studentName?.slice?.(0, 1) || "学";

  const handleGoDetail = (classId) => {
    navigate(`/student/class/${classId}`);
  };

  const handleJoinCourse = async () => {
    const code = joinCode.trim();
    if (!code) {
      message.warning("请输入课程号");
      return;
    }

    if (!joinClassByCode) {
      message.error("当前 classStore 中未实现 joinClassByCode 方法");
      return;
    }

    try {
      setJoining(true);
      await joinClassByCode(code);
      message.success("加入课程成功");
      setJoinOpen(false);
      setJoinCode("");
      fetchStudentClasses?.();
      fetchStudentExams?.();
    } catch (error) {
      message.error(error?.message || "加入课程失败");
    } finally {
      setJoining(false);
    }
  };

  const handleQuitClass = async (classItem) => {
    if (!quitClass) {
      message.error("当前 classStore 中未实现 quitClass 方法");
      return;
    }

    Modal.confirm({
      title: "确认退出班级？",
      content: `退出后将无法继续在“${classItem.name}”中查看内容。`,
      okText: "确认退出",
      cancelText: "取消",
      okButtonProps: {
        danger: true,
        loading: quitLoadingId === classItem.id,
      },
      onOk: async () => {
        try {
          setQuitLoadingId(classItem.id);
          await quitClass(classItem.id);
          message.success("已退出班级");
          fetchStudentClasses?.();
          fetchStudentExams?.();
        } catch (error) {
          message.error(error?.message || "退出班级失败");
        } finally {
          setQuitLoadingId(null);
        }
      },
    });
  };

  return (
    <div className="class-list-page">
      <div className="class-list-container">
        <div className="class-list-content-top">
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
                    className="class-breadcrumb-current"
                  >
                    班级列表
                  </Link>
                ),
              },
            ]}
          />
        </div>
        <ClassProfileCard
          avatar={studentAvatar}
          avatarText={avatarText}
          studentName={studentName}
          studentGrade={studentGrade}
          studentMajor={studentMajor}
          courseCount={summary.courseCount}
          pendingTaskCount={summary.pendingTaskCount}
        />

        <div className="class-main-panel">
          <ClassToolbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            keyword={keyword}
            onKeywordChange={setKeyword}
            onJoinClick={() => setJoinOpen(true)}
          />

          <ClassGrid
            classes={filteredClasses}
            keyword={keyword}
            onGoDetail={handleGoDetail}
            onQuitClass={handleQuitClass}
          />
        </div>
      </div>

      <JoinCourseModal
        open={joinOpen}
        value={joinCode}
        loading={joining}
        onChange={setJoinCode}
        onCancel={() => !joining && setJoinOpen(false)}
        onOk={handleJoinCourse}
      />
    </div>
  );
}
