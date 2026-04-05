import React, { useMemo, useState } from "react";
import { Button, Modal, Input, Progress, message } from "antd";
import { UserAddOutlined, DeleteOutlined } from "@ant-design/icons";
import { useClassStore } from "../../../../store";
import "./students-panel.css";

export default function StudentsPanel({ klass }) {
  const [addOpen, setAddOpen] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState("");

  const addStudentToClass = useClassStore((s) => s.addStudentToClass);
  const removeStudentFromClass = useClassStore((s) => s.removeStudentFromClass);
  const loading = useClassStore((s) => s.loading);

  const students = useMemo(() => {
    return Array.isArray(klass?.students) ? klass.students : [];
  }, [klass]);

  const removeStudent = (record) => {
    Modal.confirm({
      title: "确认移除该学生？",
      content: `${record.id} ${record.name}`,
      okText: "移除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: async () => {
        try {
          await removeStudentFromClass(klass.id, record.id);
          message.success("已移除学生");
        } catch (error) {
          console.error("移除学生失败：", error);
          message.error(error?.message || "移除学生失败");
        }
      },
    });
  };

  const handleAddStudent = async () => {
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

    try {
      await addStudentToClass(klass.id, studentId);
      message.success("添加学生成功");
      setStudentIdInput("");
      setAddOpen(false);
    } catch (error) {
      console.error("添加学生失败：", error);
      message.error(error?.message || "添加学生失败");
    }
  };

  return (
    <div className="class-panel class-panel--fill">
      <div className="class-panel-header sp-panel-header">
        <Button
          type="primary"
          className="sp-primary"
          icon={<UserAddOutlined />}
          onClick={() => setAddOpen(true)}
        >
          添加学生
        </Button>
      </div>

      <div className="class-line-tabs">
        <button type="button" className="class-line-tab active">
          学生列表
        </button>
      </div>

      <div className="class-table-panel class-table-panel--fill">
        <div className="class-table-wrap">
          <table className="class-table sp-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>ID</th>
                <th style={{ width: 100 }}>学号</th>
                <th style={{ width: 80 }}>姓名</th>
                <th style={{ width: 130 }}>专业</th>
                <th style={{ width: 80 }}>完成情况</th>
                <th style={{ width: 200 }}>测验完成率</th>
                <th style={{ width: 100 }}>操作</th>
              </tr>
            </thead>

            <tbody>
              {students.length > 0 ? (
                students.map((record) => {
                  const percent = Number(record.completion_rate || 0);

                  return (
                    <tr key={record.id}>
                      <td>{record.id}</td>
                      <td>{record.student_no || "—"}</td>
                      <td className="class-table-cell-title">
                        {record.name || "—"}
                      </td>
                      <td>{record.major || "—"}</td>
                      <td>
                        {record.finished_exam_count || 0}/
                        {record.total_exam_count || 0}
                      </td>
                      <td>
                        <div className="sp-progress-cell">
                          <Progress
                            percent={percent}
                            showInfo={false}
                            strokeColor="#1677ff"
                          />
                          <div className="sp-progress-text">{percent}%</div>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="sp-action-btn sp-action-btn-danger"
                          onClick={() => removeStudent(record)}
                          title="移除学生"
                        >
                          <DeleteOutlined />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="class-table-empty">当前暂无学生数据</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="class-table-footer">
          <span>共 {students.length} 条</span>
          <div className="class-table-pagination">
            <button type="button" className="page-btn" disabled>
              ‹
            </button>
            <button type="button" className="page-btn active">
              1
            </button>
            <button type="button" className="page-btn" disabled>
              ›
            </button>
          </div>
        </div>
      </div>

      <Modal
        title="添加学生"
        open={addOpen}
        confirmLoading={loading}
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
