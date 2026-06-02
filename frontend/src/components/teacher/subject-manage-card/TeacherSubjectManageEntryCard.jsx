import React, { useState } from "react";
import { AppstoreAddOutlined } from "@ant-design/icons";
import TeacherSubjectManageModal from "./TeacherSubjectManageModal";
import "./TeacherSubjectManageEntryCard.css";

export default function TeacherSubjectManageEntryCard({ onSuccess }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="teacher-subject-manage-entry-card"
        onClick={() => setOpen(true)}
      >
        <div className="teacher-subject-manage-entry-card__icon">
          <AppstoreAddOutlined />
        </div>

        <div className="teacher-subject-manage-entry-card__content">
          <div className="teacher-subject-manage-entry-card__title">
            管理科目
          </div>
          <div className="teacher-subject-manage-entry-card__desc">
            维护科目、章节与知识点
          </div>
        </div>
      </button>

      <TeacherSubjectManageModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={onSuccess}
      />
    </>
  );
}
