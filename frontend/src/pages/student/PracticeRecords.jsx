// src/pages/student/PracticeRecords.jsx
import React, { useMemo, useState } from "react"
import { DatePicker, Tag } from "antd"
import { useNavigate } from "react-router-dom"
import { BarChartOutlined, CalendarOutlined } from "@ant-design/icons"
import PageHeader from "../../components/PageHeader"
import "./practice-records.css"

const { RangePicker } = DatePicker

// ===== mock 数据（后续换接口即可）=====
const MOCK_OVERVIEW = {
  totalSolved: 156,
  todayDelta: 12,
  streakDays: 7,
  studyHoursWeek: 18,
}

// record: { id, title, total, correct, score, durationMin, finishedAt, questions, answers, solutions }
const MOCK_RECORDS = [
  {
    id: "r4",
    title: "Python基础综合测验",
    total: 50,
    score: 88,
    durationMin: 120,
    finishedAt: "2024-12-25 21:32",
    // 详情页预览用（questions + answers）
    questions: [
      {
        id: "q1",
        tag: "列表与元组",
        difficulty: "简单",
        stem: "以下哪个是不可变序列？",
        options: [
          { key: "A", text: "list" },
          { key: "B", text: "tuple" },
          { key: "C", text: "dict" },
          { key: "D", text: "set" },
        ],
        correct: "B",
        explanation: "tuple（元组）不可变。",
      },
    ],
    answers: { q1: "A" },
  },
  {
    id: "r5",
    title: "期中测验",
    total: 60,
    score: 92,
    durationMin: 120,
    finishedAt: "2024-12-20 22:10",
    questions: [
      {
        id: "q2",
        tag: "字典操作",
        difficulty: "中等",
        stem: "关于 dict 的说法正确的是？",
        options: [
          { key: "A", text: "键可以是 list" },
          { key: "B", text: "键必须可哈希" },
          { key: "C", text: "dict 不能嵌套" },
          { key: "D", text: "dict 不支持 in" },
        ],
        correct: "B",
        explanation: "dict 的键必须是可哈希类型。",
      },
    ],
    answers: { q2: "B" },
  },
]

function toDateOnlyStr(datetimeStr) {
  // "2024-12-25 21:32" -> "2024-12-25"
  return (datetimeStr || "").split(" ")[0]
}

export default function PracticeRecords() {
  const navigate = useNavigate()

  const [overview] = useState(MOCK_OVERVIEW)
  const [records] = useState(MOCK_RECORDS)

  // 时间筛选（RangePicker）
  const [range, setRange] = useState(null) // [dayjs, dayjs] | null

  const filteredRecords = useMemo(() => {
    if (!range || range.length !== 2 || !range[0] || !range[1]) return records
    const start = range[0].format("YYYY-MM-DD")
    const end = range[1].format("YYYY-MM-DD")
    return records.filter((r) => {
      const d = toDateOnlyStr(r.finishedAt)
      return d >= start && d <= end
    })
  }, [records, range])

  return (
    <div className="pr-page">
      <PageHeader
        title="刷题记录"
        subtitle="近30天学习数据分析"
        icon={
          <div className="pr-ph-icon">
            <BarChartOutlined />
          </div>
        }
      />

      <div className="pr-wrap">
        {/* 顶部 3 卡（不含正确率卡） */}
        <div className="pr-stats">
          <div className="pr-card tone-blue">
            <div className="pr-card-label">累计刷题</div>
            <div className="pr-card-value">{overview.totalSolved}</div>
            <div className="pr-card-sub">+{overview.todayDelta} 今日</div>
          </div>

          <div className="pr-card tone-orange">
            <div className="pr-card-label">连续打卡</div>
            <div className="pr-card-value">{overview.streakDays}天</div>
            <div className="pr-card-sub">继续保持！</div>
          </div>

          <div className="pr-card tone-purple">
            <div className="pr-card-label">学习时长</div>
            <div className="pr-card-value">{overview.studyHoursWeek}h</div>
            <div className="pr-card-sub">本周</div>
          </div>
        </div>

        {/* 图1下面：做题记录列表（带时间筛选） */}
        <div className="pr-list-card">
          <div className="pr-list-head">
            <div className="pr-list-title">
              <CalendarOutlined />
              <span>做题记录</span>
            </div>

            <RangePicker
              className="pr-range"
              allowClear
              onChange={(val) => setRange(val)}
              placeholder={["开始日期", "结束日期"]}
            />
          </div>

          <div className="pr-list">
            {filteredRecords.map((r) => (
              <div key={r.id} className="pr-item">
                <div className="pr-item-left">
                  <div className="pr-item-title">{r.title}</div>
                  <div className="pr-item-sub">
                    <span>{r.total}题</span>
                    <span className="dot">·</span>
                    <span>{r.durationMin}分钟</span>
                    <span className="dot">·</span>
                    <span>完成：{r.finishedAt}</span>
                  </div>
                </div>

                <div className="pr-item-right">
                  <div className="pr-score">
                    <div className="pr-score-label">得分</div>
                    <div className="pr-score-value">{r.score}</div>
                  </div>

                  <button
                    type="button"
                    className="pr-detail-btn"
                    onClick={() => navigate(`/student/records/${r.id}`)}
                  >
                    查看详情
                  </button>
                </div>
              </div>
            ))}

            {filteredRecords.length === 0 && (
              <div className="pr-empty">该时间范围内暂无记录</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
