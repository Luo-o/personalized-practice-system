import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input, Button } from "antd";
import "./ai-help-float.css";

export default function AiHelpFloat({ open, onClose, question, onAskAI }) {
  // ✅ 默认就是悬浮球（更一致）
  const [minimized, setMinimized] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // 悬浮球的垂直位置（px）
  const [ballY, setBallY] = useState(() => {
    const h = typeof window !== "undefined" ? window.innerHeight : 800;
    return Math.max(90, Math.min(h - 140, h * 0.65));
  });

  const dragRef = useRef({
    dragging: false,
    startClientY: 0,
    startBallY: 0,
  });

  const clampY = (y) => {
    const h = typeof window !== "undefined" ? window.innerHeight : 800;
    const minY = 80;
    const maxY = h - 80;
    return Math.max(minY, Math.min(maxY, y));
  };

  // ✅ useMemo 依赖改成稳定字段，避免每次 render 都重置
  const initialMessages = useMemo(() => {
    const stem = question?.stem ? `题干：${question.stem}` : "";
    return [
      {
        id: "a0",
        role: "assistant",
        text: "把你的疑问发给我。我会结合题目给你解释。",
      },
      ...(stem ? [{ id: "a1", role: "assistant", text: stem }] : []),
    ];
  }, [question?.id, question?.stem]);

  // ✅ lazy initializer：更稳
  const [messages, setMessages] = useState(() => initialMessages);

  const prevOpenRef = useRef(false);

  // ✅ 第一次打开：如果你希望第一次出现是悬浮球，就保持 minimized=true
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setMinimized(true);
    }
    prevOpenRef.current = open;
  }, [open]);

  // ✅ 切题/打开时重置内容，但不改变 minimized（展开就保持展开）
  useEffect(() => {
    if (!open) return;
    setMessages(initialMessages);
    setInput("");
  }, [initialMessages, open]);

  // 处理窗口尺寸变化，避免球跑出屏幕
  useEffect(() => {
    const onResize = () => setBallY((y) => clampY(y));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const listRef = useRef(null);
  useEffect(() => {
    if (!open || minimized) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, minimized, messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg = { id: `u_${Date.now()}`, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      let reply = "";
      if (typeof onAskAI === "function") {
        reply = await onAskAI(text, question);
      } else {
        reply =
          "示例回复：你可以问我为什么正确答案成立、其他选项错在哪，或让我要点总结相关知识点。";
      }
      const aiMsg = { id: `a_${Date.now()}`, role: "assistant", text: reply };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setSending(false);
    }
  };

  // 拖动逻辑（只允许垂直）
  const startDrag = (clientY) => {
    dragRef.current.dragging = true;
    dragRef.current.startClientY = clientY;
    dragRef.current.startBallY = ballY;

    const onMove = (e) => {
      if (!dragRef.current.dragging) return;
      const nowY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const dy = nowY - dragRef.current.startClientY;
      setBallY(clampY(dragRef.current.startBallY + dy));
    };

    const onUp = () => {
      dragRef.current.dragging = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  };

  if (!open) return null;

  // 最小化：右侧可拖动悬浮球（叉在右上角）
  if (minimized) {
    return (
      <div className="ai-float-ball-wrap" style={{ top: ballY }}>
        <div
          className="ai-float-ball"
          role="button"
          tabIndex={0}
          title="展开 AI 助手"
          onClick={() => setMinimized(false)}
          onMouseDown={(e) => {
            if (e.button !== 0) return;
            startDrag(e.clientY);
          }}
          onTouchStart={(e) => {
            const y = e.touches[0]?.clientY;
            if (typeof y === "number") startDrag(y);
          }}
        >
          <span className="ai-float-ball-text">AI</span>

          <button
            type="button"
            className="ai-float-ball-close"
            title="关闭"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  // 展开态：浮窗面板
  return (
    <div className="ai-float-panel">
      <div className="ai-float-head">
        <div className="ai-float-title">AI 助手</div>
        <div className="ai-float-actions">
          <button
            type="button"
            className="ai-float-iconbtn"
            onClick={() => setMinimized(true)}
            title="收起"
          >
            —
          </button>
          <button
            type="button"
            className="ai-float-iconbtn"
            onClick={onClose}
            title="关闭"
          >
            ×
          </button>
        </div>
      </div>

      <div className="ai-float-body" ref={listRef}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={[
              "ai-float-row",
              m.role === "user" ? "is-user" : "is-ai",
            ].join(" ")}
          >
            <div className="ai-float-bubble">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="ai-float-foot">
        <Input.TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题..."
          autoSize={{ minRows: 2, maxRows: 4 }}
          onPressEnter={(e) => {
            if (e.shiftKey) return;
            e.preventDefault();
            send();
          }}
        />
        <div className="ai-float-btns">
          <Button onClick={() => setInput("")} disabled={sending}>
            清空
          </Button>
          <Button type="primary" onClick={send} loading={sending}>
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}
