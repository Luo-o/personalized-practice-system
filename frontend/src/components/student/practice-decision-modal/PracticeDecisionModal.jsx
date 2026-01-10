import React, { useMemo, useState } from "react"
import { Modal, Slider, Button, Checkbox } from "antd"
import "./practice-decision-modal.css"

import SectionCard from "./SectionCard"
import ChapterPickerCard from "./ChapterPickerCard"
import KnowledgePickerCard from "./KnowledgePickerCard"

import { SettingOutlined } from "@ant-design/icons"

export default function PracticeDecisionModal({
  open,
  strategy, // "chapter" | "difficulty" | "knowledge" | "mix"
  onClose,
  onStart,

  // ✅ 章节/知识点数据：建议从父层传入（不固定 6 章）
  chapters: chaptersProp,
  knowledgePoints: knowledgeProp,
}) {
  const [total, setTotal] = useState(20)
  const [split, setSplit] = useState([6, 14])

  const [includeTrue, setIncludeTrue] = useState(true)
  const [shuffle, setShuffle] = useState(false)

  // ✅ 新增：章节/知识点选择
  const [selectedChapters, setSelectedChapters] = useState([])
  const [selectedKnowledge, setSelectedKnowledge] = useState([])

  // ====== 可替换默认数据（你后面接接口只需要传 props）=====
  const chapters = useMemo(() => {
    return (
      chaptersProp || [
        { id: "c1", name: "第1章 Python基础" },
        { id: "c2", name: "第2章 数据结构" },
        { id: "c3", name: "第3章 函数与模块" },
        { id: "c4", name: "第4章 面向对象编程" },
        { id: "c5", name: "第5章 文件处理" },
        { id: "c6", name: "第6章 异常处理" },
      ]
    )
  }, [chaptersProp])

  const knowledgePoints = useMemo(() => {
    return (
      knowledgeProp || [
        { id: "k1", name: "变量与数据类型" },
        { id: "k2", name: "运算符" },
        { id: "k3", name: "控制流程" },
        { id: "k4", name: "列表与元组" },
        { id: "k5", name: "字典与集合" },
        { id: "k6", name: "函数定义" },
        { id: "k7", name: "类与对象" },
        { id: "k8", name: "继承与多态" },
        { id: "k9", name: "文件读写" },
        { id: "k10", name: "装饰器" },
        { id: "k11", name: "生成器" },
        { id: "k12", name: "异常处理" },
        { id: "k13", name: "上下文管理器" },
        { id: "k14", name: "lambda 表达式" },
        { id: "k15", name: "正则表达式" },
        { id: "k16", name: "模块导入" },
      ]
    )
  }, [knowledgeProp])

  const titleMap = useMemo(
    () => ({
      chapter: ["刷题设置", "按章节刷题"],
      difficulty: ["刷题设置", "按难度刷题"],
      knowledge: ["刷题设置", "按知识点刷题"],
      mix: ["刷题设置", "组合刷题"],
    }),
    []
  )

  const [t1, t2] = titleMap[strategy] || ["刷题设置", ""]

  // ====== split 逻辑（保持你之前修复的版本）=====
  const normalizeSplit = (v, t) => {
    let p1 = Array.isArray(v) ? Number(v[0] ?? 0) : 0
    let p2 = Array.isArray(v) ? Number(v[1] ?? 0) : 0
    p1 = Math.max(0, Math.min(p1, t))
    p2 = Math.max(0, Math.min(p2, t))
    if (p2 < p1) [p1, p2] = [p2, p1]
    return [p1, p2]
  }

  const [easyEnd, midEnd] = split
  const easy = easyEnd
  const mid = midEnd - easyEnd
  const hard = total - midEnd

  const setSplitIfChanged = (next) => {
    setSplit((prev) => (prev[0] === next[0] && prev[1] === next[1] ? prev : next))
  }

  const handleSplitChange = (v) => {
    const next = normalizeSplit(v, total)
    setSplitIfChanged(next)
  }

  const handleSplitAfterChange = (v) => {
    const next = normalizeSplit(v, total)
    setSplitIfChanged(next)
  }

  const handleTotalChange = (t) => {
    setTotal(t)
    setSplitIfChanged(normalizeSplit(split, t))
  }

  const showSplit = strategy === "difficulty" || strategy === "mix"
  const showChapter = strategy === "chapter" || strategy === "mix"
  const showKnowledge = strategy === "knowledge" || strategy === "mix"

  const handleStart = () => {
    const cfg = {
      strategy,
      total,
      includeTrue,
      shuffle,
    }

    if (showSplit) {
      cfg.difficulty = { easy, mid, hard }
      cfg.split = split
    }

    if (showChapter) {
      cfg.chapters = selectedChapters
    }

    if (showKnowledge) {
      cfg.knowledgePoints = selectedKnowledge
    }

    onStart?.(cfg)
    onClose?.()
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={860}
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
          paddingRight: 8, 
        },
      }}
      title={
        <div className="pdm-title">
          <div className="pdm-title-main">{t1}</div>
          <div className="pdm-title-sub">{t2}</div>
        </div>
      }
    >
      <div className="pdm-body">
        {/* 题目数量 */}
        <SectionCard
          icon={<SettingOutlined />}
          title="题目数量"
          right={<div className="pdm-total">{total}题</div>}
        >
          <Slider className="pdm-slider" min={5} max={100} value={total} onChange={handleTotalChange} />
          <div className="pdm-minmax">
            <span>5题</span>
            <span>100题</span>
          </div>
        </SectionCard>

        {/* 章节选择（图1） */}
        {showChapter ? (
          <ChapterPickerCard
            chapters={chapters}
            value={selectedChapters}
            onChange={setSelectedChapters}
          />
        ) : null}

        {/* 知识点选择（图2） */}
        {showKnowledge ? (
          <KnowledgePickerCard
            points={knowledgePoints}
            value={selectedKnowledge}
            onChange={setSelectedKnowledge}
          />
        ) : null}

        {/* 难度划分 */}
        {showSplit ? (
          <SectionCard
            title="难度划分"
            right={
              <div className="pdm-section-meta">
                简单 {easy} · 中等 {mid} · 困难 {hard}
              </div>
            }
          >
            <Slider
              className="pdm-slider pdm-split"
              range={{ draggableTrack: true }}
              allowCross={false}
              min={0}
              max={total}
              value={split}
              onChange={handleSplitChange}
              onChangeComplete={handleSplitAfterChange}
              tooltip={{ formatter: (v) => `${v}题` }}
            />

            <div className="pdm-split-labels">
              <span>简单</span>
              <span>中等</span>
              <span>困难</span>
            </div>
          </SectionCard>
        ) : null}

        {/* 其他选项 */}
        <SectionCard title="其他选项">
          <div className="pdm-checks">
            <label className="pdm-check">
              <Checkbox checked={includeTrue} onChange={(e) => setIncludeTrue(e.target.checked)} />
              <span>包含真题</span>
            </label>

            <label className="pdm-check">
              <Checkbox checked={shuffle} onChange={(e) => setShuffle(e.target.checked)} />
              <span>随机顺序</span>
            </label>
          </div>
        </SectionCard>

        <Button className="pdm-start" type="primary" size="large" onClick={handleStart}>
          开始刷题
        </Button>
      </div>
    </Modal>
  )
}
