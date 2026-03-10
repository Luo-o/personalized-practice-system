import React, { useMemo, useState } from "react"
import "./practice-calendar-card.css"

const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function pad2(n) {
  return String(n).padStart(2, "0")
}

function ymd(date) {
  const y = date.getFullYear()
  const m = pad2(date.getMonth() + 1)
  const d = pad2(date.getDate())
  return `${y}-${m}-${d}`
}

function isSameDay(a, b) {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function dayStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/**
 * props:
 * - records: Set<string> 或 string[]，元素为 "YYYY-MM-DD"（有做题的日期）
 * - onSelectDate?: (date: Date) => void
 */
export default function PracticeCalendarCard({
  records = new Set(),
  onSelectDate,
  title = "练习日历",
}) {
  const today = useMemo(() => new Date(), [])
  const today0 = useMemo(() => dayStart(today), [today]) // 今天 00:00:00，用于比较

  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selected, setSelected] = useState(() => today)

  const recordSet = useMemo(() => {
    if (records instanceof Set) return records
    return new Set(Array.isArray(records) ? records : [])
  }, [records])

  const year = cursor.getFullYear()
  const month = cursor.getMonth() // 0-11

  const monthLabel = useMemo(() => {
    const names = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
    return names[month]
  }, [month])

  const days = useMemo(() => {
    const first = new Date(year, month, 1)
    const startWeekday = first.getDay()
    const start = new Date(year, month, 1 - startWeekday)

    const arr = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
      const inMonth = d.getMonth() === month
      const key = ymd(d)
      const hasRecord = recordSet.has(key)
      arr.push({ date: d, inMonth, key, hasRecord })
    }
    return arr
  }, [year, month, recordSet])

  const goPrev = () => setCursor(new Date(year, month - 1, 1))
  const goNext = () => setCursor(new Date(year, month + 1, 1))

  const handlePick = (d) => {
    setSelected(d)
    onSelectDate && onSelectDate(d)
  }

  return (
    <div className="spc-card">
      <div className="spc-header">
        <div className="spc-title">{title}</div>

        <div className="spc-toolbar">
          <button className="spc-btn" onClick={goPrev} aria-label="prev month" type="button">
            ‹
          </button>

          <div className="spc-center">
            <span className="spc-month">{monthLabel} 月</span>
          </div>

          <button className="spc-btn" onClick={goNext} aria-label="next month" type="button">
            ›
          </button>
        </div>
      </div>

      <div className="spc-week">
        {WEEK.map((w) => (
          <div key={w} className="spc-weekday">
            {w}
          </div>
        ))}
      </div>

      <div className="spc-grid">
        {days.map((cell) => {
          const { date, inMonth, key, hasRecord } = cell

          // 非本月：不显示
          if (!inMonth) {
            return <div key={key} className="spc-cell spc-cell--empty" />
          }

          const isToday = isSameDay(date, today)
          const isSel = isSameDay(date, selected)

          // ✅ 只在今日（含）以前显示圆点
          const isPastOrToday = dayStart(date).getTime() < today0.getTime()

          const cls = [
            "spc-cell",
            isToday ? "is-today" : "",
            isSel ? "is-selected" : "",
          ]
            .filter(Boolean)
            .join(" ")

          return (
            <button key={key} className={cls} onClick={() => handlePick(date)} type="button">
              <div className="spc-day">{date.getDate()}</div>

              <div
                className={[
                  "spc-dot",
                  isPastOrToday ? (hasRecord ? "dot-green" : "dot-red") : "spc-dot--placeholder",
                ].join(" ")}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
