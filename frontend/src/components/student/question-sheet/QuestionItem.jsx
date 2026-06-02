import React from "react";
import { CheckCircleOutlined } from "@ant-design/icons";
import "./qs-sheet.css";

const BASE_FILE_URL = "http://localhost:8088";

function toneClass(difficulty) {
  if (difficulty === "简单") return "qs-tag-easy";
  if (difficulty === "中等") return "qs-tag-mid";
  if (difficulty === "困难") return "qs-tag-hard";
  return "qs-tag-easy";
}

function buildMetaText(question) {
  const parts = [];

  if (question?.subject_name) parts.push(question.subject_name);
  else if (question?.subjectName) parts.push(question.subjectName);

  if (question?.chapter_name) parts.push(question.chapter_name);
  else if (question?.chapterName) parts.push(question.chapterName);
  else if (question?.tag) parts.push(question.tag);

  return parts.join(" · ");
}

function resolveImageSrc(img) {
  const raw = img?.imageUrl || img?.image_url || img?.url || "";

  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  return `${BASE_FILE_URL}/${String(raw).replace(/^\/+/, "")}`;
}

export default function QuestionItem({
  index,
  question,
  value,
  mode = "answer",
  solution,
  onChange,
  onOpenAI,
  onPrev,
  onNext,
  onSubmit,
  isFirst,
  isLast,
  submitting,
  hideNav = false,
}) {
  const { difficulty, stem, options = [], images = [] } = question || {};

  const metaText = buildMetaText(question);
  const correct = (solution?.correct || question?.correct || "")
    .toString()
    .trim();
  const explanation = solution?.explanation || question?.explanation || "";

  const isReview = mode === "review";
  const isAnswered = !!value;
  const currentValue = (value || "").toString().trim();
  const hasCorrect = !!correct;

  const isCorrect =
    isReview && currentValue && hasCorrect && currentValue === correct;

  const isWrong =
    isReview && currentValue && hasCorrect && currentValue !== correct;

  const displayImages = Array.isArray(images) ? images : [];

  return (
    <div className="qs-question-wrap">
      <div className="qs-question-box">
        <div className="qs-question-meta">
          <span className="qs-qindex-pill">{index}</span>

          <span className={`qs-diff-tag ${toneClass(difficulty)}`}>
            {difficulty || "简单"}
          </span>

          {metaText ? <span className="qs-qmeta-text">{metaText}</span> : null}
        </div>

        <div className="qs-stem">{stem}</div>

        {displayImages.length > 0 ? (
          <div className="qs-images">
            {displayImages.map((img, i) => {
              const src = resolveImageSrc(img);
              if (!src) return null;

              return (
                <img
                  key={img.id || i}
                  src={src}
                  alt={`题目图片-${i + 1}`}
                  className="qs-image"
                />
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="qs-options-block">
        {options.map((op) => {
          const checked = currentValue === String(op.key).trim();

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

      {!hideNav && (
        <div className="qs-nav-row">
          <button
            type="button"
            className="qs-nav-btn"
            onClick={onPrev}
            disabled={isFirst}
          >
            上一题
          </button>

          {isReview ? (
            <button
              type="button"
              className="qs-nav-btn primary"
              onClick={onNext}
              disabled={isLast}
            >
              下一题
            </button>
          ) : isLast ? (
            <button
              type="button"
              className="qs-nav-btn primary"
              onClick={onSubmit}
              disabled={submitting}
            >
              {submitting ? "提交中..." : "提交"}
            </button>
          ) : (
            <button
              type="button"
              className="qs-nav-btn primary"
              onClick={onNext}
            >
              下一题
            </button>
          )}
        </div>
      )}

      {isReview ? (
        <div className="qs-review-block">
          <div className="qs-answer-pill">正确答案： {correct || "-"}</div>

          {explanation ? (
            <div className="qs-explain">
              <div className="qs-explain-title">解析</div>
              <div className="qs-explain-body">{explanation}</div>
            </div>
          ) : null}

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
            对这道题还有疑问？ 问问 AI 助手
          </button>
        </div>
      ) : null}
    </div>
  );
}
