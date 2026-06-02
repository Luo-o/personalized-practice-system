import React, { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import "./class-manage.css";

import ClassOverview from "./ClassOverview";
import ClassDetail from "./ClassDetail";
import CreateClassModal from "./CreateClassModal";
import StudentManageModal from "./StudentManageModal";
import { useClassStore, useExamStore, useAuthStore } from "../../../store";

function getLatestExam(exams) {
  if (!exams.length) return null;

  const sorted = [...exams].sort(
    (a, b) => new Date(b.publishAt || 0) - new Date(a.publishAt || 0),
  );

  return {
    title: sorted[0].title,
    date: sorted[0].publishAt,
  };
}

export default function TeacherClassManage() {
  const [activeClassId, setActiveClassId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [studentManageOpen, setStudentManageOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const allClasses = useClassStore((s) => s.classes);
  const loading = useClassStore((s) => s.loading);
  const fetchTeacherClasses = useClassStore((s) => s.fetchTeacherClasses);
  const fetchClassStudents = useClassStore((s) => s.fetchClassStudents);
  const createClass = useClassStore((s) => s.createClass);
  const classStudents = useClassStore((s) => s.classStudents);

  const exams = useExamStore((s) => s.exams);
  const fetchTeacherExams = useExamStore((s) => s.fetchTeacherExams);

  const currentUser = useAuthStore((s) => s.currentUser);

  const currentTeacherId =
    currentUser?.role === "teacher" ? currentUser.profileId : null;

  useEffect(() => {
    fetchTeacherClasses().catch((error) => {
      console.error("获取教师班级失败：", error);
      message.error(error?.message || "获取班级失败");
    });

    fetchTeacherExams().catch((error) => {
      console.error("获取教师考试失败：", error);
      message.error(error?.message || "获取考试失败");
    });
  }, [fetchTeacherClasses, fetchTeacherExams]);

  useEffect(() => {
    if (!activeClassId) return;

    fetchClassStudents(activeClassId).catch((error) => {
      console.error("获取班级学生失败：", error);
      message.error(error?.message || "获取班级学生失败");
    });
  }, [activeClassId, fetchClassStudents]);

  const classes = useMemo(() => {
    if (!currentTeacherId) return [];

    return allClasses
      .filter((c) => Number(c.teacherId) === Number(currentTeacherId))
      .map((c, index) => {
        const classExams = exams.filter(
          (e) => Number(e.classId) === Number(c.id),
        );

        return {
          ...c,
          cover:
            c.cover ||
            `https://images.unsplash.com/photo-${
              [
                "1503676260728-1c00da094a0b",
                "1516321318423-f06f85e504b3",
                "1522202176988-66273c2fd55f",
                "1513258496099-48168024aec0",
              ][index % 4]
            }?auto=format&fit=crop&w=900&q=80`,
          subject: c.subjectName || c.subject || "未设置科目",
          desc: c.description || "暂无班级简介",
          studentsCount: c.studentCount ?? 0,
          examsCount: classExams.length,
          latestExam: getLatestExam(classExams),
        };
      });
  }, [allClasses, exams, currentTeacherId]);

  const filteredClasses = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    if (!text) return classes;

    return classes.filter((c) => {
      return (
        String(c.name || "")
          .toLowerCase()
          .includes(text) ||
        String(c.subject || "")
          .toLowerCase()
          .includes(text) ||
        String(c.desc || "")
          .toLowerCase()
          .includes(text)
      );
    });
  }, [classes, keyword]);

  const activeClass = useMemo(
    () => classes.find((c) => Number(c.id) === Number(activeClassId)) || null,
    [classes, activeClassId],
  );

  const safeStudents = useMemo(() => {
    return Array.isArray(classStudents) ? classStudents : [];
  }, [classStudents]);

  const activeClassWithStudents = useMemo(() => {
    if (!activeClass) return null;

    return {
      ...activeClass,
      studentIds: safeStudents.map((s) => s.id),
      students: safeStudents,
    };
  }, [activeClass, safeStudents]);

  const stats = useMemo(() => {
    const classCount = classes.length;
    const examCount = classes.reduce((sum, c) => sum + (c.examsCount || 0), 0);
    const studentCount = classes.reduce(
      (sum, c) => sum + Number(c.studentsCount || 0),
      0,
    );

    return { classCount, examCount, studentCount };
  }, [classes]);

  const teacherName = currentUser?.profile?.name;

  const teacherAvatar =
    currentUser?.avatar ||
    currentUser?.avatarUrl ||
    currentUser?.profile?.avatar ||
    "";

  const handleCreateClass = async (payload) => {
    try {
      await createClass({
        name: payload.name,
        subjectId: payload.subjectId,
        desc: payload.desc,
      });

      message.success("创建班级成功");
      setCreateOpen(false);
    } catch (error) {
      console.error("创建班级失败：", error);
      message.error(error?.message || "创建班级失败");
    }
  };

  return (
    <>
      {!activeClassWithStudents ? (
        <ClassOverview
          stats={stats}
          classes={filteredClasses}
          loading={loading}
          keyword={keyword}
          onKeywordChange={setKeyword}
          onEnter={(id) => setActiveClassId(id)}
          onCreate={() => setCreateOpen(true)}
          onStudentManage={() => setStudentManageOpen(true)}
          teacherName={teacherName}
          teacherTitle={currentUser?.profile?.title}
          teacherAvatar={teacherAvatar}
        />
      ) : (
        <ClassDetail
          klass={activeClassWithStudents}
          onBack={() => setActiveClassId(null)}
        />
      )}

      <CreateClassModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateClass}
      />

      <StudentManageModal
        open={studentManageOpen}
        classes={classes}
        onClose={() => setStudentManageOpen(false)}
        onSuccess={fetchTeacherClasses}
      />
    </>
  );
}
