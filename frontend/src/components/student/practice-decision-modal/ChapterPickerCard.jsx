import React from "react"
import SectionCard from "./SectionCard"
import { BookOutlined } from "@ant-design/icons"
import "./practice-decision-modal.css"

export default function ChapterPickerCard({
  chapters = [],
  value = [],
  onChange,
}) {
  const toggle = (id) => {
    const has = value.includes(id)
    const next = has ? value.filter((x) => x !== id) : [...value, id]
    onChange?.(next)
  }

  return (
    <SectionCard icon={<BookOutlined />} title="选择章节">
      <div className="pdm-grid pdm-grid-3">
        {chapters.map((c) => {
          const active = value.includes(c.id)
          return (
            <button
              key={c.id}
              type="button"
              className={`pdm-choice ${active ? "is-active" : ""}`}
              onClick={() => toggle(c.id)}
            >
              {c.name}
            </button>
          )
        })}
      </div>
    </SectionCard>
  )
}
