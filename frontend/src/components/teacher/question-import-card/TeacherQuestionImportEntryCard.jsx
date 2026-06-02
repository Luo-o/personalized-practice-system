import React, { useState } from "react";
import { Modal } from "antd";
import { ImportOutlined } from "@ant-design/icons";
import TeacherQuestionImportCard from "./TeacherQuestionImportCard";
import "./teacher-question-import-entry-card.css";

export default function TeacherQuestionImportEntryCard({ onImportSuccess }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="tb-import-entry-card"
        onClick={() => setOpen(true)}
      >
        <div className="tb-import-entry-left">
          <div className="tb-import-entry-icon">
            <ImportOutlined />
          </div>

          <div className="tb-import-entry-main">
            <div className="tb-import-entry-title">批量导入题库</div>
            <div className="tb-import-entry-desc">
              支持上传 zip 资源包，批量导入题目与图片资源
            </div>
          </div>
        </div>
      </button>

      <Modal
        open={open}
        title={null}
        footer={null}
        onCancel={() => setOpen(false)}
        width={860}
        destroyOnClose
        className="tb-import-modal"
      >
        <TeacherQuestionImportCard
          onImportSuccess={onImportSuccess}
          onClose={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
