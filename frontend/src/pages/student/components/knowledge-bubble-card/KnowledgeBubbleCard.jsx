import React from "react";
import "./knowledge-bubble-card.css";

export default function KnowledgeBubbleCard({
  title = "知识图谱",
  description = "点击查看你的知识点掌握情况",
  buttonText = "立即查看",
  onOpen,
}) {
  return (
    <section className="knowledge-guide-card student-dashboard-card">
      <div className="knowledge-guide-card__content">
        <h3 className="knowledge-guide-card__title">{title}</h3>
        <p className="knowledge-guide-card__desc">{description}</p>

        <button
          type="button"
          className="knowledge-guide-card__button"
          onClick={onOpen}
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
}
