import React, { useMemo, useState } from "react";
import { Button, Table, Modal, Input, message } from "antd";
import { UserAddOutlined, DeleteOutlined } from "@ant-design/icons";
import "./students-panel.css";
import { useStudentStore, useClassStore } from "../../../../store";

export default function StudentsPanel({ klass }) {
  const allStudents = useStudentStore((s) => s.students);
  const addStudentToClass = useClassStore((s) => s.addStudentToClass);
  const removeStudentFromClass = useClassStore((s) => s.removeStudentFromClass);

  const [addOpen, setAddOpen] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState("");

  const students = useMemo(() => {
    return allStudents.filter((s) => (klass.studentIds || []).includes(s.id));
  }, [allStudents, klass.studentIds]);

  const totalDone = useMemo(() => {
    return students.length > 0 ? "100%" : "0%";
  }, [students]);

  const removeStudent = (record) => {
    Modal.confirm({
      title: "确认移除该学生？",
      content: `${record.id} ${record.name}`,
      okText: "移除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => {
        removeStudentFromClass(klass.id, record.id);
        message.success("已移除");
      },
    });
  };

  const handleAddStudent = () => {
    const raw = studentIdInput.trim();
    if (!raw) {
      message.warning("请输入学生ID");
      return;
    }

    const studentId = Number(raw);
    if (Number.isNaN(studentId)) {
      message.warning("学生ID必须是数字");
      return;
    }

    const targetStudent = allStudents.find((s) => s.id === studentId);
    if (!targetStudent) {
      message.warning("未找到该学生");
      return;
    }

    const existed = (klass.studentIds || []).includes(studentId);
    if (existed) {
      message.warning("该学生已在班级中");
      return;
    }

    addStudentToClass(klass.id, studentId);
    message.success("添加成功");
    setStudentIdInput("");
    setAddOpen(false);
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 100 },
    { title: "姓名", dataIndex: "name", width: 160 },
    {
      title: "测验完成率",
      dataIndex: "done",
      width: 140,
      render: () => "—",
    },
    {
      title: "操作",
      width: 90,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeStudent(record)}
        />
      ),
    },
  ];

  return (
    <div className="sp-wrap">
      <div className="sp-stat-grid">
        <div className="sp-stat-card">
          <div className="sp-stat-label">班级总人数</div>
          <div className="sp-stat-value">{students.length}</div>
        </div>

        <div className="sp-stat-card">
          <div className="sp-stat-label">测验总数</div>
          <div className="sp-stat-value">{klass?.examsCount ?? 0}</div>
        </div>

        <div className="sp-stat-card">
          <div className="sp-stat-label">测验完成率</div>
          <div className="sp-stat-value">{totalDone}</div>
        </div>
      </div>

      <Button
        type="primary"
        className="sp-primary"
        icon={<UserAddOutlined />}
        onClick={() => setAddOpen(true)}
      >
        添加学生
      </Button>

      <div className="sp-card">
        <div className="sp-card-title">学生列表</div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={students}
          pagination={false}
        />
      </div>

      <Modal
        title="添加学生"
        open={addOpen}
        onCancel={() => {
          setAddOpen(false);
          setStudentIdInput("");
        }}
        onOk={handleAddStudent}
        okText="添加"
        cancelText="取消"
      >
        <div style={{ marginTop: 8 }}>
          <div style={{ marginBottom: 8 }}>请输入学生ID</div>
          <Input
            placeholder="例如：1"
            value={studentIdInput}
            onChange={(e) => setStudentIdInput(e.target.value)}
            onPressEnter={handleAddStudent}
          />
        </div>
      </Modal>
    </div>
  );
}
