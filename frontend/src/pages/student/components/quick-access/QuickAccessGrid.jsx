import React from "react";
import {
  FileDoneOutlined,
  ReadOutlined,
  HistoryOutlined,
  RightOutlined,
} from "@ant-design/icons";
import "./quick-access-grid.css";

function readIcon(type) {
  if (type === "exam") return <FileDoneOutlined />;
  if (type === "wrong") return <ReadOutlined />;
  return <HistoryOutlined />;
}

function readClass(type) {
  if (type === "exam") return "is-exam";
  if (type === "wrong") return "is-wrong";
  return "is-record";
}

function QuickAccessItem({ title, value, type, onClick }) {
  return (
    <button
      type="button"
      className={`quick-access-item ${readClass(type)}`}
      onClick={onClick}
    >
      <div className="quick-access-item__icon">{readIcon(type)}</div>
      <div className="quick-access-item__title">{title}</div>
      <div className="quick-access-item__value">{value}</div>
      <div className="quick-access-item__arrow"></div>
    </button>
  );
}

export default function QuickAccessGrid({ items = [] }) {
  return (
    <section className="quick-access-card">
      <h3 className="student-dashboard-section-title">快捷入口</h3>

      <div className="quick-access-grid">
        {items.map(({ key, ...rest }) => (
          <QuickAccessItem key={key} {...rest} />
        ))}
      </div>
    </section>
  );
}
