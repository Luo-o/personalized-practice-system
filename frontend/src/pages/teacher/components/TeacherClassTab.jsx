import React from "react";
import TeacherClassManage from "../../../components/teacher/class/TeacherClassManage";

export default function TeacherClassTab({ onBackToBank }) {
  return (
    <div className="tc-page">
      <TeacherClassManage onBackToBank={onBackToBank} />
    </div>
  );
}
