import React from "react"
import "./qs-sheet.css"
import { FileDoneOutlined } from "@ant-design/icons"

export default function QuestionSubmitBar({ text, onClick, disabled, loading }) {
  return (
    <div className="qs-submitbar">
      <button
        className="qs-submitbtn"
        type="button"
        disabled={disabled || loading}
        onClick={onClick}
      >
        <FileDoneOutlined className="qs-submiticon" />
        {loading ? "提交中..." : text}
      </button>
    </div>
  )
}
