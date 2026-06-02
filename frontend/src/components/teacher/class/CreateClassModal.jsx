import React, { useEffect, useMemo, useState } from "react";
import { Modal, Input, Button, Select, message } from "antd";
import { useSubjectStore } from "../../../store";
import "./create-class-modal.css";

export default function CreateClassModal({ open, onClose, onSubmit }) {
  const subjects = useSubjectStore((s) => s.subjects);
  const fetchSubjects = useSubjectStore((s) => s.fetchSubjects);

  const [name, setName] = useState("");
  const [subjectId, setSubjectId] = useState(undefined);
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (open && !subjects.length) {
      fetchSubjects().catch((error) => {
        console.error("获取科目失败：", error);
      });
    }
  }, [open, subjects.length, fetchSubjects]);

  const subjectOptions = useMemo(() => {
    return subjects.map((item) => ({
      value: item.id,
      label: item.name,
    }));
  }, [subjects]);

  const resetForm = () => {
    setName("");
    setSubjectId(undefined);
    setDesc("");
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const submit = () => {
    const n = name.trim();
    if (!n) return message.warning("请填写班级名称");
    if (!subjectId) return message.warning("请选择班级科目");

    onSubmit?.({
      name: n,
      subjectId,
      desc: desc.trim(),
    });

    resetForm();
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      title="创建新班级"
      className="cm-modal"
      closeIcon={<span className="cm-x">×</span>}
    >
      <div className="cm-form">
        <div className="cm-field">
          <div className="cm-label">班级名称</div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：计算机网络A班"
          />
        </div>

        <div className="cm-field">
          <div className="cm-label">科目</div>
          <Select
            value={subjectId}
            onChange={setSubjectId}
            placeholder="请选择科目"
            options={subjectOptions}
            style={{ width: "100%" }}
          />
        </div>

        <div className="cm-field">
          <div className="cm-label">班级描述</div>
          <Input.TextArea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="选填：班级介绍、课程信息等"
            autoSize={{ minRows: 4, maxRows: 6 }}
          />
        </div>

        <div className="cm-actions">
          <Button onClick={handleClose}>取消</Button>
          <Button type="primary" className="cm-primary" onClick={submit}>
            确认创建
          </Button>
        </div>
      </div>
    </Modal>
  );
}
