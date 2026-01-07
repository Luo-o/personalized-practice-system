import React, { useMemo, useState } from "react"
import QuestionProgress from "./QuestionProgress"
import QuestionItem from "./QuestionItem"
import QuestionSubmitBar from "./QuestionSubmitBar"
import "./question-sheet.css"

/**
 * ✅新增：
 * - onModeChange：用于外层 Nav 替换（图1）
 * - onViewWrong / onBackHome：结果页按钮回调（图4）
 */
export default function QuestionSheet({
  questions = [],
  initialAnswers,
  onSubmit,
  showTimer = true,
  timerText = "0:00",
  mode: controlledMode,
  /**
   * 可选：当模式从答题 -> 结果页时通知外层，用于替换 Nav 标题/副标题（图1）
   * onModeChange({ mode, total, answeredCount, correctCount, wrongCount, percent })
   */
  onModeChange,
  /** 结果页按钮回调（由页面层接路由） */
  onViewWrong,
  onBackHome,
}) {
  const [answers, setAnswers] = useState(initialAnswers || {})
  const [submitting, setSubmitting] = useState(false)
  const [innerMode, setInnerMode] = useState("answer") // answer | review
  const [solutions, setSolutions] = useState({}) // qid -> {correct, explanation}

  const mode = controlledMode || innerMode

  const total = questions.length
  const answeredCount = useMemo(() => {
    let c = 0
    for (const q of questions) {
      if (answers[q.id]) c++
    }
    return c
  }, [questions, answers])

  const progressPercent = total ? Math.round((answeredCount / total) * 100) : 0

  const updateAnswer = (qid, val) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }))
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const res = (await onSubmit?.({ answers, questions })) || null

      // 统一成 finalSolutions，便于后续统计/渲染
      const sol = res?.solutions || null
      let finalSolutions = {}

      if (sol && typeof sol === "object") {
        finalSolutions = sol
      } else {
        const fallback = {}
        for (const q of questions) {
          if (q.correct || q.explanation) {
            fallback[q.id] = {
              correct: q.correct,
              explanation: q.explanation,
            }
          }
        }
        finalSolutions = fallback
      }

      setSolutions(finalSolutions)
      setInnerMode("review")

      // ✅通知外层替换 nav（图1）
      if (onModeChange) {
        let ok = 0
        let bad = 0
        for (const q of questions) {
          const chosen = answers[q.id]
          if (!chosen) continue
          const corr =
            (finalSolutions[q.id]?.correct || q.correct || "").toString().trim()
          if (corr && chosen === corr) ok++
          else bad++
        }
        const percent = total ? Math.round((ok / total) * 100) : 0
        onModeChange({
          mode: "review",
          total,
          answeredCount,
          correctCount: ok,
          wrongCount: bad,
          percent,
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="qs-page">
      <div className="qs-wrap">
        {/* ✅图1：结果页标题在 Nav 替换，这里不重复显示进度卡 */}
        {mode !== "review" ? (
          <QuestionProgress
            answered={answeredCount}
            total={total}
            percent={progressPercent}
            showTimer={showTimer}
            timerText={timerText}
          />
        ) : null}

        <div className="qs-list">
          {questions.map((q, idx) => (
            <QuestionItem
              key={q.id}
              index={idx + 1}
              question={q}
              value={answers[q.id] || ""}
              mode={mode}
              solution={solutions[q.id]}
              onChange={(val) => updateAnswer(q.id, val)}
            />
          ))}
        </div>

        {/* ✅图4：提交/结果按钮都在题单末尾，不 fixed */}
        <div className="qs-footerbar">
          {mode === "review" ? (
            <div className="qs-result-actions">
              <button
                className="qs-resultbtn danger"
                type="button"
                onClick={onViewWrong}
              >
                查看错题
              </button>
              <button
                className="qs-resultbtn primary"
                type="button"
                onClick={onBackHome}
              >
                返回首页
              </button>
            </div>
          ) : (
            <QuestionSubmitBar
              disabled={submitting || total === 0}
              loading={submitting}
              text="提交答卷"
              onClick={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  )
}
