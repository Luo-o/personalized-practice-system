import React, { useMemo, useState } from "react"
import SectionCard from "./SectionCard"

import { BulbOutlined } from "@ant-design/icons"

export default function KnowledgePickerCard({
  points = [],
  value = [],
  onChange,
}) {
  const [keyword, setKeyword] = useState("")
  const [open, setOpen] = useState(false)

  const selectedSet = useMemo(() => new Set(value), [value])

  const filteredPoints = useMemo(() => {
    const key = keyword.trim()
    if (!key) return points
    return points.filter((p) => p.name.includes(key) || p.chapterName.includes(key))
  }, [points, keyword])

  const selectedPoints = useMemo(() => {
    if (!value.length) return []
    // 保持选择顺序（更符合用户直觉）
    const map = new Map(points.map((p) => [p.id, p]))
    return value.map((id) => map.get(id)).filter(Boolean)
  }, [points, value])

  const toggle = (id) => {
    if (selectedSet.has(id)) onChange(value.filter((x) => x !== id))
    else onChange([...value, id])
  }

  const remove = (id) => onChange(value.filter((x) => x !== id))

  const clearAll = () => onChange([])

  return (
    <SectionCard
      icon={<BulbOutlined />}
      title="选择知识点"
      right={
        value.length ? (
          <button className="pdm-link-danger" onClick={clearAll}>
            清空
          </button>
        ) : null
      }
    >
      {/* 搜索框 */}
      <div className="pdm-search">
        <input
          className="pdm-search-input"
          placeholder="搜索知识点或章节"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 已选知识点（折叠摘要） */}
      <div className="pdm-selected-box">
        <div className="pdm-kp-chapterline">
          <div className="pdm-selected-title">已选知识点（{value.length}）</div>
          <button className="pdm-link-danger" onClick={() => setOpen((v) => !v)}>
            {open ? "收起" : "展开"}
          </button>
        </div>

        {open ? (
          value.length ? (
            <div className="pdm-chip-row">
              {selectedPoints.map((p) => (
                <div key={p.id} className="pdm-chip">
                  <span className="pdm-chip-text">{p.name}</span>
                  <button className="pdm-chip-x" onClick={() => remove(p.id)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="pdm-selected-empty">尚未选择任何知识点</div>
          )
        ) : (
          // 折叠态给一个轻提示，不占空间
          <div className="pdm-selected-empty">
            {value.length ? "已选择，点击展开查看" : "尚未选择任何知识点"}
          </div>
        )}
      </div>

      {/* 知识点选择（内部滚动） */}
      <div className="pdm-kp-scroll">
        <div className="pdm-grid pdm-grid-3">
          {filteredPoints.map((p) => {
            const active = selectedSet.has(p.id)
            return (
              <button
                key={p.id}
                type="button"
                className={`pdm-choice ${active ? "is-active" : ""}`}
                onClick={() => toggle(p.id)}
                title={`${p.name}（${p.chapterName}）`}
              >
                {p.name}
              </button>
            )
          })}

          {!filteredPoints.length && (
            <div className="pdm-kp-empty">未找到匹配的知识点</div>
          )}
        </div>
      </div>
    </SectionCard>
  )
}
