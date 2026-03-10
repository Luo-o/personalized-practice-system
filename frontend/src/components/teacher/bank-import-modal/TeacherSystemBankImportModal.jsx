import React from "react";
import { Modal, Tag, Button } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import "./teacher-system-bank-import-modal.css";

const BANKS = [
  {
    id: "Python基础题库",
    subject: "Python",
    desc: "涵盖Python基础语法、数据类型、控制流程、函数等核心知识点",
    count: 280,
    diff: "简单-中等",
    chapters: "第1-5章",
    imported: false,
  },
  {
    id: "Python高级题库",
    subject: "Python",
    desc: "包含面向对象、异常处理、文件操作、模块等高级特性",
    count: 180,
    diff: "中等-困难",
    chapters: "第6-10章",
    imported: true,
  },
  {
    id: "数据库原理题库",
    subject: "数据库",
    desc: "数据库设计、SQL语句、事务处理、索引优化等全面内容",
    count: 320,
    diff: "简单-困难",
    chapters: "第1-8章",
    imported: true,
  },
];

export default function TeacherSystemBankImportModal({
  open,
  onClose,
  onImport,
}) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={980}
      centered
      title="系统题库导入"
      className="td-modal"
    >
      <div className="td-bank-grid">
        {BANKS.map((b) => (
          <div
            key={b.id}
            className={`td-bank-card ${b.imported ? "is-imported" : ""}`}
          >
            <div className="td-bank-head">
              <div className="td-bank-name">{b.id}</div>
              <Tag className="td-tag-subject">{b.subject}</Tag>
              {b.imported ? <CheckCircleFilled className="td-bank-ok" /> : null}
            </div>

            <div className="td-bank-desc">{b.desc}</div>

            <div className="td-bank-meta">
              <div>📚 {b.count} 道题目</div>
              <div>🎯 {b.diff}</div>
              <div>📖 {b.chapters}</div>
            </div>

            <div className="td-bank-actions">
              {b.imported ? (
                <Button disabled block className="td-muted-btn">
                  已导入
                </Button>
              ) : (
                <Button
                  type="primary"
                  block
                  className="td-primary"
                  onClick={() => onImport?.(b.id)}
                >
                  导入题库
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
