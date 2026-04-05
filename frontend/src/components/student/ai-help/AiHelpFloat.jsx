import React, { useEffect, useRef, useState } from "react";
import { Input, Button, Empty, Spin } from "antd";
import {
  CloseOutlined,
  SendOutlined,
  PictureOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "./ai-help-float.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const { TextArea } = Input;
const DRAWER_ANIMATION_MS = 280;

function fileToPreview(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        url: reader.result,
      });
    };
    reader.readAsDataURL(file);
  });
}

function buildInitialMessages(question) {
  const stem = question?.stem ? `当前题目：${question.stem}` : "";
  const subject = question?.subject_name || question?.subjectName || "";
  const difficulty = question?.difficulty || "";
  const chapter = question?.chapter_name || question?.chapterName || "";
  const contextLine = [subject, chapter, difficulty]
    .filter(Boolean)
    .join(" · ");

  return [
    ...(contextLine
      ? [
          {
            id: "a1",
            role: "assistant",
            text: `已关联当前上下文：${contextLine}`,
          },
        ]
      : []),
    ...(stem
      ? [
          {
            id: "a2",
            role: "assistant",
            text: stem,
          },
        ]
      : []),
  ];
}

function serializeMessages(messages) {
  return messages.map((m) => ({
    id: m.id,
    role: m.role,
    text: m.text,
    images: Array.isArray(m.images)
      ? m.images.map((img) => ({
          id: img.id,
          name: img.name,
          size: img.size,
          type: img.type,
          url: img.url,
        }))
      : [],
  }));
}

export default function AiHelpFloat({ open, onClose, question, onAskAI }) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [messages, setMessages] = useState(() =>
    buildInitialMessages(question),
  );

  const bodyRef = useRef(null);
  const fileInputRef = useRef(null);

  const quickActions = [
    "解释这道题的考点和正确思路",
    "只给我提示，不要直接告诉答案",
    "分析我为什么容易做错",
    "根据这道题总结相关知识点",
  ];

  useEffect(() => {
    let timer = null;

    if (open) {
      setMounted(true);
      timer = window.setTimeout(() => {
        setVisible(true);
      }, 16);
    } else if (mounted) {
      setVisible(false);
      timer = window.setTimeout(() => {
        setMounted(false);
      }, DRAWER_ANIMATION_MS);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;
    setMessages(buildInitialMessages(question));
    setInput("");
    setImages([]);
    setSending(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [mounted, question]);

  useEffect(() => {
    if (!visible) return;
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [visible, messages, images, sending]);

  const handleFiles = async (fileList) => {
    if (sending) return;

    const picked = Array.from(fileList || []).filter((file) =>
      file.type?.startsWith("image/"),
    );
    if (!picked.length) return;

    const previews = await Promise.all(picked.map(fileToPreview));
    setImages((prev) => [...prev, ...previews].slice(0, 6));
  };

  const removeImage = (id) => {
    if (sending) return;
    setImages((prev) => prev.filter((item) => item.id !== id));
  };

  const clearImages = () => {
    if (sending) return;
    setImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearConversation = () => {
    if (sending) return;
    setMessages(buildInitialMessages(question));
    setInput("");
    setImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const appendQuickPrompt = (text) => {
    if (sending) return;
    setInput((prev) => (prev ? `${prev}\n${text}` : text));
  };

  const send = async () => {
    const text = input.trim();
    if ((!text && images.length === 0) || sending) return;

    const currentImages = [...images];

    const userMsg = {
      id: `u_${Date.now()}`,
      role: "user",
      text: text || "请结合我上传的图片进行分析。",
      images: currentImages,
    };

    const nextMessages = [...messages, userMsg];

    setMessages(nextMessages);
    setInput("");
    setImages([]);
    setSending(true);

    try {
      let reply = "";

      if (typeof onAskAI === "function") {
        reply = await onAskAI(
          text || "请结合我上传的图片进行分析。",
          question,
          currentImages.map((item) => item.file).filter(Boolean),
          serializeMessages(nextMessages),
        );
      } else {
        reply = "我已经收到你的问题。";
      }

      const aiMsg = {
        id: `a_${Date.now()}`,
        role: "assistant",
        text: reply,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg = {
        id: `e_${Date.now()}`,
        role: "assistant",
        text: error?.message || "请求失败，请稍后重试。",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (!mounted) return null;

  return (
    <>
      <div
        className={`ai-help-overlay ${visible ? "is-show" : ""}`}
        onClick={sending ? undefined : onClose}
      />

      <aside className={`ai-help-drawer ${visible ? "is-open" : ""}`}>
        <div className="ai-help-drawer__shell">
          <div className="ai-help-drawer__header">
            <div className="ai-help-drawer__brand">
              <div className="ai-help-drawer__logo">✦</div>
              <div>
                <div className="ai-help-drawer__title">AI 学习助手</div>
              </div>
            </div>

            <div className="ai-help-drawer__actions">
              <button
                type="button"
                className="ai-help-drawer__iconbtn"
                onClick={clearConversation}
                title="清空当前对话"
                disabled={sending}
              >
                清空
              </button>
              <button
                type="button"
                className="ai-help-drawer__iconbtn"
                onClick={onClose}
                title="关闭"
                disabled={sending}
              >
                <CloseOutlined />
              </button>
            </div>
          </div>

          <div className="ai-help-drawer__quick">
            {quickActions.map((item) => (
              <button
                key={item}
                type="button"
                className="ai-help-drawer__quickbtn"
                onClick={() => appendQuickPrompt(item)}
                disabled={sending}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="ai-help-drawer__body" ref={bodyRef}>
            {messages.length ? (
              <>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`ai-help-msg ${
                      m.role === "user" ? "is-user" : "is-ai"
                    }`}
                  >
                    <div
                      className={`ai-help-msg__bubble ${
                        m.isError ? "is-error" : ""
                      }`}
                    >
                      <div className="ai-help-msg__text">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.text}
                        </ReactMarkdown>
                      </div>

                      {Array.isArray(m.images) && m.images.length > 0 ? (
                        <div className="ai-help-msg__images">
                          {m.images.map((img) => (
                            <div
                              key={img.id}
                              className="ai-help-msg__image-item"
                            >
                              <img src={img.url} alt={img.name || "uploaded"} />
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}

                {sending ? (
                  <div className="ai-help-msg is-ai">
                    <div className="ai-help-msg__bubble ai-help-msg__bubble--loading">
                      <div className="ai-help-msg__loading">
                        <Spin size="small" />
                        <span>AI 正在思考...</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="ai-help-drawer__empty">
                <Empty description="暂无消息" />
              </div>
            )}
          </div>

          <div className="ai-help-drawer__footer">
            {images.length > 0 ? (
              <div className="ai-help-upload__preview">
                <div className="ai-help-upload__preview-head">
                  <span>已选择图片</span>
                  <button
                    type="button"
                    className="ai-help-upload__clear"
                    onClick={clearImages}
                    disabled={sending}
                  >
                    清空
                  </button>
                </div>

                <div className="ai-help-upload__preview-list">
                  {images.map((img) => (
                    <div key={img.id} className="ai-help-upload__preview-item">
                      <img src={img.url} alt={img.name} />
                      <button
                        type="button"
                        className="ai-help-upload__remove"
                        onClick={() => removeImage(img.id)}
                        title="移除"
                        disabled={sending}
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div
              className={`ai-help-upload ai-help-upload--compact ${
                dragOver ? "is-dragover" : ""
              } ${sending ? "is-disabled" : ""}`}
              onDragOver={(e) => {
                if (sending) return;
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                if (sending) return;
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="ai-help-upload__input"
                onChange={(e) => handleFiles(e.target.files)}
                disabled={sending}
              />

              <button
                type="button"
                className="ai-help-upload__trigger"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
              >
                <PictureOutlined />
                <span>上传图片</span>
              </button>
            </div>

            <div className="ai-help-compose">
              <TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入你的问题..."
                autoSize={{ minRows: 3, maxRows: 6 }}
                disabled={sending}
                onPressEnter={(e) => {
                  if (e.shiftKey) return;
                  e.preventDefault();
                  send();
                }}
              />
            </div>

            <div className="ai-help-drawer__footer-actions">
              <Button onClick={() => setInput("")} disabled={sending}>
                清空文本
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={send}
                loading={sending}
                disabled={sending}
              >
                发送
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
