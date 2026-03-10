import React, { useMemo, useState } from "react";
import "./class-manage.css";

import ClassOverview from "./ClassOverview";
import ClassDetail from "./ClassDetail";
import CreateClassModal from "./CreateClassModal";
import { useClassStore, useExamStore, useAuthStore } from "../../../store";

function getLatestExam(exams) {
  if (!exams.length) return null;

  const sorted = [...exams].sort(
    (a, b) => new Date(b.publishDate) - new Date(a.publishDate),
  );

  return {
    title: sorted[0].title,
    date: sorted[0].publishDate,
  };
}

export default function TeacherClassManage() {
  const [activeClassId, setActiveClassId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const allClasses = useClassStore((s) => s.classes);
  const addClass = useClassStore((s) => s.addClass);
  const exams = useExamStore((s) => s.exams);
  const currentUser = useAuthStore((s) => s.currentUser);

  const currentTeacherId =
    currentUser?.role === "teacher" ? currentUser.id : null;

  const classes = useMemo(() => {
    if (!currentTeacherId) return [];

    return allClasses
      .filter((c) => c.teacherId === currentTeacherId)
      .map((c) => {
        const classExams = exams.filter((e) => e.classId === c.id);

        return {
          ...c,
          studentsCount: c.studentIds?.length || 0,
          examsCount: classExams.length,
          latestExam: getLatestExam(classExams),
        };
      });
  }, [allClasses, exams, currentTeacherId]);

  const activeClass = useMemo(
    () => classes.find((c) => c.id === activeClassId) || null,
    [classes, activeClassId],
  );

  const stats = useMemo(() => {
    const classCount = classes.length;
    const examCount = classes.reduce((sum, c) => sum + (c.examsCount || 0), 0);
    return { classCount, examCount };
  }, [classes]);

  const createClass = ({ name, subject, desc }) => {
    if (!currentTeacherId) return;

    addClass({
      id: Date.now(),
      name,
      subject,
      desc,
      teacherId: currentTeacherId,
      studentIds: [],
    });
  };

  return (
    <>
      {!activeClass ? (
        <ClassOverview
          stats={stats}
          classes={classes}
          onEnter={(id) => setActiveClassId(id)}
          onCreate={() => setCreateOpen(true)}
        />
      ) : (
        <ClassDetail
          klass={activeClass}
          onBack={() => setActiveClassId(null)}
        />
      )}

      <CreateClassModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={(payload) => {
          createClass(payload);
          setCreateOpen(false);
        }}
      />
    </>
  );
}
