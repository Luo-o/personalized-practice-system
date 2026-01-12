import React, { useMemo, useState } from "react"
import { Drawer, message } from "antd"
import QuestionItem from "../question-sheet/QuestionItem"
import "../question-sheet/qs-sheet.css"
import "../../../pages/student/wrong-book.css"

export default function WrongQuestionSheetDrawer({
  open,
  onClose,
  wrong,
  defaultView = "practice", // practice | analysis
  onMarkMastered,
}) {
  const question = wrong?.question || null
  const lastAnswer = wrong?.lastAttempt?.answer || ""

  // ✅ 1. 不再使用 submitted
  const [view, setView] = useState(defaultView)
  const [answer, setAnswer] = useState(
    defaultView === "analysis" ? lastAnswer : ""
  )

  // ✅ 2. 当 Drawer 打开 / 关闭时，直接通过 key 强制重新挂载
  // （下面 Drawer 上会用到）
  const drawerKey = useMemo(() => {
    return `${wrong?.id || "empty"}-${defaultView}`
  }, [wrong?.id, defaultView])

  const title = useMemo(() => {
    if (!wrong) return "错题详情"
    return wrong.knowledgePoint
      ? `错题 · ${wrong.knowledgePoint}`
      : "错题详情"
  }, [wrong])

  const mode = view === "analysis" ? "review" : "answer"

  const handleSubmit = () => {
    if (!answer) {
      message.warning("请选择一个选项")
      return
    }
    // 提交后直接切到解析态
    setView("analysis")
  }

  // ✅ 切换逻辑：显式设置 view + answer
  const switchToPractice = () => {
    setView("practice")
    setAnswer("")
  }

  const switchToAnalysis = () => {
    setView("analysis")
    setAnswer(lastAnswer)
  }

  const handleMarkMastered = () => {
    if (!wrong?.id) return
    onMarkMastered?.(wrong.id)
    onClose()
  }

  return (
    <Drawer
      key={drawerKey}               // ⭐ 关键：避免 useEffect 初始化
      open={open}
      onClose={onClose}
      placement="bottom"
      height="92vh"
      className="wb-sheet"
      title={null}
      closeIcon={null}
    >
      <div className="wb-sheet-head">
        <div className="wb-sheet-title">{title}</div>
        <button className="wb-sheet-close" type="button" onClick={onClose}>
          关闭
        </button>
      </div>

      {/* Sheet 切换 */}
      <div className="wb-sheet-tabs">
        <button
          type="button"
          className={`wb-sheet-tab ${view === "practice" ? "is-active" : ""}`}
          onClick={switchToPractice}
        >
          重新练习
        </button>
        <button
          type="button"
          className={`wb-sheet-tab ${view === "analysis" ? "is-active" : ""}`}
          onClick={switchToAnalysis}
        >
          查看解析
        </button>
      </div>

      <div className="wb-sheet-body">
        {question ? (
          <QuestionItem
            index={1}
            question={question}
            value={answer}
            mode={mode}
            onChange={setAnswer}
          />
        ) : (
          <div className="wb-empty">暂无题目数据</div>
        )}
      </div>

      {view === "practice" && (
        <div className="wb-sheet-footer">
          <button
            className="wb-sheet-submit"
            type="button"
            onClick={handleSubmit}
          >
            提交并查看解析
          </button>
        </div>
      )}

      {view === "analysis" && (
        <div className="wb-sheet-footer wb-sheet-footer-analysis">
          <button
            className="wb-sheet-mastered"
            type="button"
            onClick={handleMarkMastered}
          >
            已掌握
          </button>
        </div>
      )}
    </Drawer>
  )
}
