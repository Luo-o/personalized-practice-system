import React from "react";
import { Input, Modal } from "antd";

export default function JoinCourseModal({
  open,
  value,
  loading,
  onChange,
  onCancel,
  onOk,
}) {
  return (
    <Modal
      title="加入课程"
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      okText="加入"
      cancelText="取消"
      confirmLoading={loading}
      centered
    >
      <div className="join-course-modal">
        <div className="join-course-label">请输入课程号</div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="例如：CLS2026001"
          maxLength={32}
          onPressEnter={onOk}
        />
      </div>
    </Modal>
  );
}
