import React, { useMemo, useState } from "react"
import SectionCard from "./SectionCard"
import { BulbOutlined, SearchOutlined, CloseOutlined } from "@ant-design/icons"
import "./practice-decision-modal.css"

export default function KnowledgePickerCard({
  points = [], // [{id,name}]
  value = [],
  onChange,
}) {
  const [kw, setKw] = useState("")
  const [page, setPage] = useState(0)

  const PAGE_SIZE = 9 // ✅ 每页展示 9 个

  const selectedSet = useMemo(() => new Set(value), [value])

  const filtered = useMemo(() => {
    const k = kw.trim().toLowerCase()
    if (!k) return points
    return points.filter((p) => String(p.name).toLowerCase().includes(k))
  }, [points, kw])

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  }, [filtered.length])

  const safePage = useMemo(() => {
    const maxPage = totalPages - 1
    return Math.max(0, Math.min(page, maxPage))
  }, [page, totalPages])

  const pageItems = useMemo(() => {
    const start = safePage  * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, safePage])

  const toggle = (id) => {
    const has = selectedSet.has(id)
    const next = has ? value.filter((x) => x !== id) : [...value, id]
    onChange?.(next)
  }

  const remove = (id) => {
    onChange?.(value.filter((x) => x !== id))
  }

  const clear = () => onChange?.([])

  const selectedItems = useMemo(() => {
    const map = new Map(points.map((p) => [p.id, p]))
    return value.map((id) => map.get(id)).filter(Boolean)
  }, [points, value])

  const canPrev = page > 0
  const canNext = page < totalPages - 1

  return (
    <SectionCard
      icon={<BulbOutlined />}
      title="选择知识点"
      right={
        value.length ? (
          <button type="button" className="pdm-link-danger" onClick={clear}>
            清空选择
          </button>
        ) : null
      }
      className="pdm-kp"
    >
      {/* 搜索 */}
      <div className="pdm-search">
        <SearchOutlined className="pdm-search-icon" />
        <input
          className="pdm-search-input"
          value={kw}
          placeholder="搜索知识点..."
          onChange={(e) => {
            setKw(e.target.value)
            setPage(0) // ✅ 搜索后回到第一页
          }}
        />
      </div>

      {/* 已选 */}
      <div className="pdm-selected-box">
        <div className="pdm-selected-title">已选择 {value.length} 个知识点：</div>
        <div className="pdm-chip-row">
          {selectedItems.length ? (
            selectedItems.map((p) => (
              <span key={p.id} className="pdm-chip">
                <span className="pdm-chip-text">{p.name}</span>
                <button
                  type="button"
                  className="pdm-chip-x"
                  onClick={() => remove(p.id)}
                  aria-label="remove"
                >
                  <CloseOutlined />
                </button>
              </span>
            ))
          ) : (
            <span className="pdm-selected-empty">暂未选择</span>
          )}
        </div>
      </div>

      <div className="pdm-pager">
          <button
            type="button"
            className="pdm-page-btn pdm-page-btn--prev"
            disabled={!canPrev}
            onClick={() => canPrev && setPage(safePage - 1)}
          >
          ‹
        </button>

        <div className="pdm-grid pdm-grid-3 pdm-grid-9">
          {pageItems.map((p) => {
            const active = selectedSet.has(p.id)
            return (
              <button
                key={p.id}
                type="button"
                className={`pdm-choice ${active ? "is-active" : ""}`}
                onClick={() => toggle(p.id)}
                title={p.name}
              >
                {p.name}
              </button>
            )
          })}

          {/* 不足 9 个时补空位，让布局稳定 */}
          {pageItems.length < PAGE_SIZE
            ? Array.from({ length: PAGE_SIZE - pageItems.length }).map((_, i) => (
                <div key={`empty-${i}`} className="pdm-choice pdm-choice--empty" />
              ))
            : null}
        </div>

        <button
          type="button"
          className="pdm-page-btn pdm-page-btn--next"
          disabled={!canNext}
          onClick={() => canNext && setPage(safePage + 1)}
        >
          ›
        </button>
      </div>

      <div className="pdm-page-indicator">
        第 {totalPages === 0 ? 0 : page + 1} / {totalPages} 页（共 {filtered.length} 个）
      </div>
    </SectionCard>
  )
}
