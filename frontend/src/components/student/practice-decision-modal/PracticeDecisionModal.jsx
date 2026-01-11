import React, { useMemo, useState } from "react"
import { Modal, Slider, Button, Checkbox } from "antd"
import "./practice-decision-modal.css"

import SectionCard from "./SectionCard"
import SubjectPickerCard from "./SubjectPickerCard"
import ChapterPickerCard from "./ChapterPickerCard"
import KnowledgePickerCard from "./KnowledgePickerCard"

import { RiseOutlined, SettingOutlined } from "@ant-design/icons"

export default function PracticeDecisionModal({
  open,
  strategy, // "chapter" | "knowledge" | "mix"
  onClose,
  onStart,
  subjects = [],
}) {
  const [total, setTotal] = useState(20)
  const [split, setSplit] = useState([6, 14])

  const [includeTrue, setIncludeTrue] = useState(true)
  const [shuffle, setShuffle] = useState(false)

  const [selectedChapters, setSelectedChapters] = useState([])
  const [selectedKnowledge, setSelectedKnowledge] = useState([])

  const [easyEnd, midEnd] = split
  const easy = easyEnd
  const mid = midEnd - easyEnd
  const hard = total - midEnd

  // 只在 mix 模式使用
  const [mixScope, setMixScope] = useState("chapter") // "chapter" | "knowledge"

  // 默认科目
  const [subjectId, setSubjectId] = useState(() => subjects?.[0]?.id ?? null)

  const currentSubject = useMemo(() => {
    return subjects.find((s) => s.id === subjectId) || null
  }, [subjects, subjectId])

  const chapters = useMemo(() => {
    return currentSubject?.chapters || []
  }, [currentSubject])

  // 扁平化知识点（用于 knowledge / mix+knowledge）
  const allKnowledgePoints = useMemo(() => {
    const list = []
    for (const ch of chapters) {
      for (const kp of ch.knowledgePoints || []) {
        list.push({
          ...kp,
          chapterId: ch.id,
          chapterName: ch.name,
        })
      }
    }
    return list
  }, [chapters])

  const isChapterMode =
    strategy === "chapter" ||
    (strategy === "mix" && mixScope === "chapter")

  const isKnowledgeMode =
    strategy === "knowledge" ||
    (strategy === "mix" && mixScope === "knowledge")

  const handleStart = () => {
    const cfg = {
      strategy,
      total,
      includeTrue,
      shuffle,
      subjectId,
    }

    if (strategy === "chapter") {
      cfg.chapters = selectedChapters
    }

    if (strategy === "knowledge") {
      cfg.knowledgePoints = selectedKnowledge
    }

    if (strategy === "mix") {
      cfg.mixScope = mixScope
      cfg.split = split

      if (mixScope === "chapter") {
        cfg.chapters = selectedChapters
      } else {
        cfg.knowledgePoints = selectedKnowledge
      }
    }

    onStart(cfg)
    onClose()
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={860}
      title={
        <div className="pdm-title">
          <div className="pdm-title-main">刷题设置</div>
        </div>
      }
    >
      <div className="pdm-body">
        <SubjectPickerCard
          subjects={subjects}
          value={subjectId}
          onChange={(id) => {
            setSubjectId(id)
            setSelectedChapters([])
            setSelectedKnowledge([])
            setMixScope("chapter")
          }}
        />

        <SectionCard
          icon={<SettingOutlined />}
          title="题目数量"
          right={<div>{total}题</div>}
        >
          <Slider min={5} max={100} value={total} onChange={setTotal} />
        </SectionCard>

        {strategy === "mix" && (
          <SectionCard title="题目分布" icon={<SettingOutlined />}>
            <div className="pdm-scope-row">
              <button
                className={`pdm-scope-btn ${mixScope === "chapter" ? "is-active" : ""}`}
                onClick={() => {
                  setMixScope("chapter")
                  setSelectedKnowledge([])
                }}
              >
                按章节
              </button>

              <button
                className={`pdm-scope-btn ${mixScope === "knowledge" ? "is-active" : ""}`}
                onClick={() => {
                  setMixScope("knowledge")
                  setSelectedChapters([])
                }}
              >
                按知识点
              </button>
            </div>
          </SectionCard>
        )}

        {isChapterMode && (
          <ChapterPickerCard
            chapters={chapters}
            value={selectedChapters}
            onChange={setSelectedChapters}
          />
        )}

        {isKnowledgeMode && (
          <KnowledgePickerCard
            points={allKnowledgePoints}
            value={selectedKnowledge}
            onChange={setSelectedKnowledge}
          />
        )}

        {(strategy === "mix") && (
            <SectionCard
              title="难度划分"
              icon={<RiseOutlined />}
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
                onChange={setSplit}
                tooltip={{ formatter: (v) => `${v}题` }}
              />

              <div className="pdm-split-labels">
                <span>简单</span>
                <span>困难</span>
              </div>
            </SectionCard>
          )}

        <SectionCard icon={<SettingOutlined />} title="其他选项">
          <div className="pdm-checks">
            <label className="pdm-check">
              <Checkbox
                checked={includeTrue}
                onChange={(e) => setIncludeTrue(e.target.checked)}
              />
              <span>包含真题</span>
            </label>

            <label className="pdm-check">
              <Checkbox
                checked={shuffle}
                onChange={(e) => setShuffle(e.target.checked)}
              />
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
