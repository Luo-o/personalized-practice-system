import React, { useEffect } from "react";
import { Modal, Tag, Empty } from "antd";
import "./question-preview-modal.css";

export default function QuestionPreviewModal({ open, question, onClose }) {
  useEffect(() => {
    if (open && question) {
      console.log("预览弹窗收到的 question:", question);
      console.log("预览弹窗收到的 options:", question.options);
      console.log("第一个 option:", question.options?.[0]);
    }
  }, [open, question]);
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="题目预览"
      width={760}
    >
      {!question ? (
        <Empty description="暂无题目数据" />
      ) : (
        <div className="qpm-body">
          <div className="qpm-head">
            <div className="qpm-title">
              {question.id} {question.title || question.stem}
            </div>
            <div className="qpm-tags">
              <Tag>{question.subject}</Tag>
              <Tag>{question.difficulty}</Tag>
              {question.source ? <Tag>{question.source}</Tag> : null}
              {question.chapter ? <Tag>{question.chapter}</Tag> : null}
              {question.kps.map((k) => (
                <Tag key={k}>{k}</Tag>
              ))}
            </div>
          </div>

          {question.images?.length ? (
            <div className="qpm-block">
              <div className="qpm-label">题目图片</div>
              <div className="qpm-images">
                {question.images.map((img, i) => (
                  <img key={i} src={img} alt="" className="qpm-image" />
                ))}
              </div>
            </div>
          ) : null}

          {question.options?.length ? (
            <div className="qpm-block">
              <div className="qpm-label">选项</div>
              <div className="qpm-options">
                {question.options.map((o) => (
                  <div
                    key={o.key}
                    className={`qpm-option ${
                      question.correct === o.key ? "is-correct" : ""
                    }`}
                  >
                    <b>{o.key}.</b> {o.text}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </Modal>
  );
}
