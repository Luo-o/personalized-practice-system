import React from "react"
import "./practice-decision-modal.css"

export default function SectionCard({
  icon,
  title,
  right,
  children,
  className = "",
}) {
  return (
    <div className={`pdm-section-card ${className}`.trim()}>
      <div className="pdm-section-hd">
        <div className="pdm-section-left">
          {icon ? <span className="pdm-section-icon">{icon}</span> : null}
          <span className="pdm-section-title">{title}</span>
        </div>
        {right ? <div className="pdm-section-right">{right}</div> : null}
      </div>

      <div className="pdm-section-bd">{children}</div>
    </div>
  )
}
