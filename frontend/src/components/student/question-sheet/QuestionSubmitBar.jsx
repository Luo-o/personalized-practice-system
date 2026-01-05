import React from "react"
import "./question-sheet.css"

export default function QuestionSubmitBar({ text, onClick, disabled, loading }) {
  return (
    <div className="qs-submitbar">
      <button
        className="qs-submitbtn"
        type="button"
        disabled={disabled || loading}
        onClick={onClick}
      >
        <span className="qs-submiticon">✈</span>
        {loading ? "提交中..." : text}
      </button>
    </div>
  )
}
