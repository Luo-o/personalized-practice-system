import React, { useEffect } from "react";
import { Modal, Tag, Empty } from "antd";
import "./question-preview-modal.css";

const BASE_FILE_URL = "http://localhost:3001";

export default function QuestionPreviewModal({ open, question, onClose }) {
  useEffect(() => {
    if (open && question) {
      console.log("预览弹窗收到的 question:", question);
      console.log("预览弹窗收到的 images:", question.images);
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
            <div className="qpm-title">Q：{question.title}</div>

            <div className="qpm-tags">
              {question.subjectName ? <Tag>{question.subjectName}</Tag> : null}
              {question.difficulty ? <Tag>{question.difficulty}</Tag> : null}
              {question.source ? <Tag>{question.source}</Tag> : null}
              {question.chapterName ? <Tag>{question.chapterName}</Tag> : null}
              {(question.knowledgePoints || []).map((kp) => (
                <Tag key={kp.id || kp.name}>{kp.name}</Tag>
              ))}
            </div>
          </div>

          {question.images?.length ? (
            <div className="qpm-block">
              <div className="qpm-images">
                {question.images.map((img, i) => (
                  <img
                    key={i}
                    src={
                      img.imageUrl?.startsWith("http")
                        ? img.imageUrl
                        : `${BASE_FILE_URL}/${img.imageUrl}`
                    }
                    alt={`题目图片-${i + 1}`}
                    className="qpm-image"
                  />
                ))}
              </div>
            </div>
          ) : null}

          {question.options?.length ? (
            <div className="qpm-block">
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
