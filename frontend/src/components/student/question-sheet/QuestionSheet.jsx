import React, { useMemo, useState } from "react"
import QuestionProgress from "./QuestionProgress"
import QuestionItem from "./QuestionItem"
import QuestionSubmitBar from "./QuestionSubmitBar"
import "./question-sheet.css"

/**
 * QuestionSheet
 * - 题单容器：进度 + 题目列表 + 提交栏
 *
 * props:
 * - questions: Array<Question>
 * - initialAnswers?: Record<string, string>   // 题目 id -> 选项 key（单选）
 * - onSubmit?: ({ answers, questions }) => Promise<{ solutions?: Record<string, { correct: string, explanation: string }> } | void>
 * - showTimer?: boolean
 * - timerText?: string                         // 右上角时间文案（交给页面层管理也行）
 * - mode?: "answer" | "review"                 // 可外部控制；不传则内部控制
 *
 * Question 结构建议：
 * {
 *   id: "q1",
 *   difficulty: "简单" | "中等" | "困难",
 *   tag: "Python基础 · 变量与数据类型",
 *   stem: "题干",
 *   options: [{ key:"A", text:"..." }, ...],
 *   correct?: "C",                 // 可选：若后端已给
 *   explanation?: "解析"           // 可选：若后端已给
 * }
 */
export default function QuestionSheet({
  questions = [],
  initialAnswers,
  onSubmit,
  showTimer = true,
  timerText = "0:00",
  mode: controlledMode,
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
    // 这里不强制必须答完，你也可以改成：answeredCount < total 则提示
    try {
      setSubmitting(true)
      const res = (await onSubmit?.({ answers, questions })) || null

      // 如果后端返回了正确答案与解析
      const sol = res?.solutions || null
      if (sol && typeof sol === "object") {
        setSolutions(sol)
      } else {
        // 没有返回就尝试从 questions 自带 correct/explanation 构建
        const fallback = {}
        for (const q of questions) {
          if (q.correct || q.explanation) {
            fallback[q.id] = {
              correct: q.correct,
              explanation: q.explanation,
            }
          }
        }
        setSolutions(fallback)
      }

      setInnerMode("review")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="qs-page">
      {/* 你现在的 header 用 PageHeader，这里只做题单区域 */}
      <div className="qs-wrap">
        <QuestionProgress
          answered={answeredCount}
          total={total}
          percent={progressPercent}
          showTimer={showTimer}
          timerText={timerText}
        />

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
      </div>

      <QuestionSubmitBar
        disabled={submitting || total === 0}
        loading={submitting}
        text={mode === "review" ? "已提交" : "提交答卷"}
        onClick={mode === "review" ? undefined : handleSubmit}
      />
    </div>
  )
}
