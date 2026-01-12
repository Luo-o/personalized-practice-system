import React from "react"
import SectionCard from "./SectionCard"
import { BookOutlined } from "@ant-design/icons"
import "./practice-decision-modal.css"

/**
 * subjects: [{ id, name, chapters: [...] }]
 * value: 当前 subjectId
 */
export default function SubjectPickerCard({ subjects = [], value, onChange }) {
  return (
    <SectionCard icon={<BookOutlined />} title="选择科目">
      <div className="pdm-grid pdm-grid-3">
        {subjects.map((s) => {
          const active = value === s.id
          return (
            <button
              key={s.id}
              type="button"
              className={`pdm-choice ${active ? "is-active" : ""}`}
              onClick={() => onChange?.(s.id)}
            >
              {s.name}
            </button>
          )
        })}
      </div>
    </SectionCard>
  )
}
