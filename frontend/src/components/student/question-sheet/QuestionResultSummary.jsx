import React from "react"
import "./qs-sheet.css"

export default function QuestionResultSummary({
  total = 0,
  correctCount = 0,
  wrongCount = 0,
}) {
  const percent = total ? Math.round((correctCount / total) * 100) : 0

  // 你截图里 0% 是红色；可按分数分段
  const tone =
    percent >= 80 ? "good" : percent >= 60 ? "mid" : "bad"

  const title =
    percent >= 80 ? "表现优秀" : percent >= 60 ? "继续加油" : "需要加强"

  return (
    <div className={`qs-result ${tone}`}>
      <div className="qs-result-percent">{percent}%</div>
      <div className="qs-result-title">{title}</div>

      <div className="qs-result-stats">
        <div className="qs-result-stat">
          <div className="qs-result-stat-label">正确</div>
          <div className="qs-result-stat-value">{correctCount}</div>
        </div>
        <div className="qs-result-stat">
          <div className="qs-result-stat-label">错误</div>
          <div className="qs-result-stat-value">{wrongCount}</div>
        </div>
        <div className="qs-result-stat">
          <div className="qs-result-stat-label">总题数</div>
          <div className="qs-result-stat-value">{total}</div>
        </div>
      </div>
    </div>
  )
}
