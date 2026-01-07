import React from "react"
import "./qs-sheet.css"

export default function QuestionProgress({
  answered = 0,
  total = 0,
  percent = 0,
  showTimer = true,
  timerText = "0:00",
}) {
  return (
    <div className="qs-progress-card">
      <div className="qs-progress-head">
        <div className="qs-progress-title">答题进度</div>
        <div className="qs-progress-right">
          <span className="qs-progress-count">
            {answered}/{total}
          </span>
          {showTimer ? (
            <span className="qs-progress-timer">⏱ {timerText}</span>
          ) : null}
        </div>
      </div>

      <div className="qs-progress-bar">
        <div
          className="qs-progress-bar-inner"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
