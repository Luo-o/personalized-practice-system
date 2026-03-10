import React from "react";
import "./qs-sheet.css";
import { CheckCircleOutlined } from "@ant-design/icons";

function toneClass(difficulty) {
  if (difficulty === "简单") return "qs-tag-easy";
  if (difficulty === "中等") return "qs-tag-mid";
  if (difficulty === "困难") return "qs-tag-hard";
  return "qs-tag-easy";
}

export default function QuestionItem({
  index,
  question,
  value,
  mode = "answer",
  solution, // { correct, explanation }
  onChange,

  // ✅新增：由父组件统一打开浮窗
  onOpenAI,
}) {
  const { difficulty, tag, stem, options = [] } = question || {};
  const correct = solution?.correct || question?.correct || "";
  const explanation = solution?.explanation || question?.explanation || "";

  const isReview = mode === "review";
  const isAnswered = !!value;
  const hasCorrect = !!correct;
  const isCorrect = isReview && value && hasCorrect && value === correct;
  const isWrong = isReview && value && hasCorrect && value !== correct;

  return (
    <div
      className={[
        "qs-qcard",
        isReview ? "is-review" : "",
        isWrong ? "is-wrong-card" : "",
        isCorrect ? "is-right-card" : "",
      ].join(" ")}
    >
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
            {isAnswered ? (isCorrect ? "√ 正确" : "× 错误") : "未作答"}
          </div>
        ) : null}
      </div>

      <div className="qs-stem">{stem}</div>

      <div className="qs-options">
        {options.map((op) => {
          const checked = value === op.key;

          const showCorrect = isReview && hasCorrect && correct === op.key;
          const showWrong = isReview && isWrong && checked;

          const correctMark =
            showCorrect && (isWrong || !isAnswered || isCorrect);
          const wrongMark = showWrong;

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
                className="qs-option-input"
                type="radio"
                name={`q_${question?.id || index}`}
                checked={checked}
                disabled={isReview}
                onChange={() => onChange?.(op.key)}
              />
              <span className="qs-radio">
                <CheckCircleOutlined className="qs-radio-icon" />
              </span>

              <span className="qs-op-key">{op.key}.</span>
              <span className="qs-op-text">{op.text}</span>

              {isReview && wrongMark ? (
                <span className="qs-op-badge wrong">你的选择</span>
              ) : null}

              {isReview && correctMark && (isWrong || !isAnswered) ? (
                <span className="qs-op-badge correct">正确答案</span>
              ) : null}
            </label>
          );
        })}
      </div>

      {isReview ? (
        <div className="qs-review">
          <div className="qs-answer-pill">正确答案：{correct || "-"}</div>

          {explanation ? (
            <div className="qs-explain">
              <div className="qs-explain-title">解析</div>
              <div className="qs-explain-body">{explanation}</div>
            </div>
          ) : null}

          {/* ✅只触发父组件打开全局浮窗 */}
          <button
            type="button"
            className="qs-askai"
            onClick={() =>
              onOpenAI?.({
                ...question,
                correct,
                explanation,
              })
            }
          >
            对这道题还有疑问？问问ai助手
          </button>
        </div>
      ) : null}
    </div>
  );
}
