import React from "react"
import "./question-sheet.css"

function toneClass(difficulty) {
  if (difficulty === "简单") return "qs-tag-easy"
  if (difficulty === "中等") return "qs-tag-mid"
  if (difficulty === "困难") return "qs-tag-hard"
  return "qs-tag-easy"
}

export default function QuestionItem({
  index,
  question,
  value,
  mode = "answer",
  solution, // {correct, explanation}
  onChange,
}) {
  const { difficulty, tag, stem, options = [] } = question || {}
  const correct = solution?.correct || question?.correct || ""
  const explanation = solution?.explanation || question?.explanation || ""

  const isReview = mode === "review"
  const isAnswered = !!value
  const isCorrect = isReview && value && correct && value === correct

  return (
    <div className={`qs-qcard ${isReview ? "is-review" : ""}`}>
      <div className="qs-qhead">
        <div className="qs-qhead-left">
          <div className="qs-qindex">{index}</div>
          <span className={`qs-diff-tag ${toneClass(difficulty)}`}>
            {difficulty || "简单"}
          </span>
          <span className="qs-qtag">{tag}</span>
        </div>

        {isReview ? (
          <div className={`qs-status ${isCorrect ? "ok" : "bad"}`}>
            {isAnswered ? (isCorrect ? "✅ 已答对" : "❌ 已答错") : "未作答"}
          </div>
        ) : null}
      </div>

      <div className="qs-stem">{stem}</div>

      <div className="qs-options">
        {options.map((op) => {
          const checked = value === op.key
          const correctMark = isReview && correct === op.key
          const wrongMark = isReview && checked && correct && op.key !== correct

          return (
            <label
              key={op.key}
              className={[
                "qs-option",
                checked ? "is-checked" : "",
                correctMark ? "is-correct" : "",
                wrongMark ? "is-wrong" : "",
              ].join(" ")}
            >
              <input
                type="radio"
                name={`q_${question.id}`}
                checked={checked}
                disabled={isReview}
                onChange={() => onChange?.(op.key)}
              />
              <span className="qs-op-key">{op.key}.</span>
              <span className="qs-op-text">{op.text}</span>

              {isReview && correctMark ? (
                <span className="qs-op-badge correct">正确答案</span>
              ) : null}
              {isReview && wrongMark ? (
                <span className="qs-op-badge wrong">你的选择</span>
              ) : null}
            </label>
          )
        })}
      </div>

      {isReview ? (
        <div className="qs-review">
          <div className="qs-review-row">
            <span className="qs-review-label">正确答案：</span>
            <span className="qs-review-val">{correct || "-"}</span>
          </div>
          {explanation ? (
            <div className="qs-review-row">
              <span className="qs-review-label">解析：</span>
              <span className="qs-review-val">{explanation}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
