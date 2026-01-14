// src/pages/student/WrongBookPage.jsx
import React, { useEffect, useMemo, useState } from "react"
import { Input, Tag } from "antd"
import { FileTextOutlined, FilterOutlined, SearchOutlined } from "@ant-design/icons"
import { useSearchParams } from "react-router-dom"
import PageHeader from "../../components/PageHeader"
import WrongQuestionSheetDrawer from "../../components/student/wrong-book/WrongQuestionSheetDrawer"
import "./wrong-book.css"

// ====== 临时示例数据（你后续换成接口即可） ======
const MOCK_WRONGS = [
  {
    id: "w2",
    wrongCount: 2,
    lastPracticeAt: "2024-12-27",
    chapterText: "第2章 数据结构",
    knowledgePoint: "列表与元组",
    title: "下列关于列表和元组的描述，错误的是？",
    difficulty: "中等",
    tag: "列表与元组",
    question: {
      id: "q_2",
      difficulty: "中等",
      tag: "列表与元组",
      stem: "下列关于列表和元组的描述，错误的是？",
      options: [
        { key: "A", text: "列表是可变序列" },
        { key: "B", text: "元组是不可变序列" },
        { key: "C", text: "列表和元组都可以包含不同类型元素" },
        { key: "D", text: "元组支持 append 方法" },
      ],
      correct: "D",
      explanation: "元组是不可变序列，不支持 append / remove 等原地修改操作。",
    },
    lastAttempt: {
      answer: "B",
      answeredAt: "2024-12-27 19:20",
    },
    mastered: false,
  },
  {
    id: "w6",
    wrongCount: 1,
    lastPracticeAt: "2024-12-26",
    chapterText: "第2章 数据结构",
    knowledgePoint: "字典操作",
    title: "关于 Python 字典的操作，以下说法不正确的是？",
    difficulty: "简单",
    tag: "字典操作",
    question: {
      id: "q_6",
      difficulty: "简单",
      tag: "字典操作",
      stem: "关于 Python 字典的操作，以下说法不正确的是？",
      options: [
        { key: "A", text: "字典通过键访问值" },
        { key: "B", text: "字典的键必须是可哈希类型" },
        { key: "C", text: "可以用 in 判断键是否存在" },
        { key: "D", text: "字典是有序的，且自 Python 3.3 起保证插入有序" },
      ],
      correct: "D",
      explanation:
        "从 Python 3.7 起语言层面保证 dict 保持插入顺序（3.6 是 CPython 实现细节）。",
    },
    lastAttempt: {
      answer: "D",
      answeredAt: "2024-12-26 21:05",
    },
    mastered: true,
  },
]

export default function WrongBook() {
  const [wrongs, setWrongs] = useState(MOCK_WRONGS)

  const totalWrongCount = wrongs.length
  const masteredCount = wrongs.filter((w) => w.mastered).length
  const pendingCount = wrongs.filter((w) => !w.mastered).length

  // ====== URL 参数：kp ======
  const [searchParams, setSearchParams] = useSearchParams()

  // knowledge point tabs + 搜索
  const [kpSearch, setKpSearch] = useState("")
  const [activeKp, setActiveKp] = useState("全部")

  // ✅ URL 同步：/student/wrong-book?kp=xxx
  useEffect(() => {
    const kpFromUrl = searchParams.get("kp")
    if (!kpFromUrl) return

    // 同步搜索框
    setKpSearch((prev) => (prev === kpFromUrl ? prev : kpFromUrl))

    // 如果存在该知识点，则选中对应 tab
    const exists = wrongs.some((w) => (w.knowledgePoint || "未归类") === kpFromUrl)
    if (exists) {
      setActiveKp((prev) => (prev === kpFromUrl ? prev : kpFromUrl))
    } else {
      // 不存在则保持 tabs 不变（也可以强制回到全部）
      // setActiveKp("全部")
    }

    // 可选：跳转后滚动到顶部
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [searchParams, wrongs])

  const kpStats = useMemo(() => {
    const map = new Map()
    for (const w of wrongs) {
      const kp = w.knowledgePoint || "未归类"
      map.set(kp, (map.get(kp) || 0) + 1)
    }
    return Array.from(map.entries())
      .map(([kp, count]) => ({ kp, count }))
      .sort((a, b) => b.count - a.count)
  }, [wrongs])

  // tabs 区域：按搜索过滤可见 tab（但不影响 activeKp 自身）
  const filteredKpStats = useMemo(() => {
    const s = kpSearch.trim().toLowerCase()
    if (!s) return kpStats
    return kpStats.filter((x) => x.kp.toLowerCase().includes(s))
  }, [kpStats, kpSearch])

  // ✅ 列表展示：tabs + 搜索框都生效
  const displayWrongs = useMemo(() => {
    let list = wrongs

    // 1) tabs 过滤
    if (activeKp !== "全部") {
      list = list.filter((w) => (w.knowledgePoint || "未归类") === activeKp)
    }

    // 2) 搜索过滤（知识点名包含）
    const s = kpSearch.trim().toLowerCase()
    if (s) {
      list = list.filter((w) =>
        (w.knowledgePoint || "未归类").toLowerCase().includes(s)
      )
    }

    return list
  }, [wrongs, activeKp, kpSearch])

  // ====== 弹窗控制 ======
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerDefaultView, setDrawerDefaultView] = useState("practice") // practice | analysis
  const [currentWrong, setCurrentWrong] = useState(null)

  const openPractice = (wrong) => {
    setCurrentWrong(wrong)
    setDrawerDefaultView("practice")
    setDrawerOpen(true)
  }

  const openAnalysis = (wrong) => {
    setCurrentWrong(wrong)
    setDrawerDefaultView("analysis")
    setDrawerOpen(true)
  }

  const hasFilter = activeKp !== "全部" || kpSearch.trim().length > 0

  const clearFilter = () => {
    setActiveKp("全部")
    setKpSearch("")
    setSearchParams({}) // ✅ 清掉 URL 参数
  }

  return (
    <div className="wb-page">
      <PageHeader
        title="我的错题本"
        subtitle={`共${pendingCount}道错题待复习`}
        icon={
          <div className="wb-ph-icon">
            <FileTextOutlined />
          </div>
        }
      />

      <div className="wb-wrap">
        {/* 统计卡：只保留 2 个 */}
        <div className="wb-stats">
          <div className="wb-stat">
            <div className="wb-stat-label">总错题数</div>
            <div className="wb-stat-value is-red">{totalWrongCount}</div>
          </div>
          <div className="wb-stat">
            <div className="wb-stat-label">已掌握</div>
            <div className="wb-stat-value is-green">{masteredCount}</div>
          </div>
        </div>

        {/* 按知识点筛选 + 搜索框 */}
        <div className="wb-filter-card">
          <div className="wb-filter-head">
            <div className="wb-filter-title">
              <FilterOutlined />
              <span>按知识点筛选</span>
            </div>

            <Input
              className="wb-kp-search"
              placeholder="搜索知识点"
              allowClear
              value={kpSearch}
              onChange={(e) => setKpSearch(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </div>

          <div className="wb-kp-tabs">
            <button
              type="button"
              className={["wb-kp-tab", activeKp === "全部" ? "is-active" : ""].join(" ")}
              onClick={() => setActiveKp("全部")}
            >
              全部（{totalWrongCount}）
            </button>

            {filteredKpStats.map((x) => (
              <button
                key={x.kp}
                type="button"
                className={["wb-kp-tab", activeKp === x.kp ? "is-active" : ""].join(" ")}
                onClick={() => setActiveKp(x.kp)}
              >
                {x.kp}（{x.count}）
              </button>
            ))}
          </div>

        </div>

        {/* 列表 */}
        <div className="wb-list">
          {displayWrongs.map((w, idx) => (
            <div key={w.id} className="wb-item">
              <div className="wb-item-head">
                <div className="wb-item-left">
                  <div className="wb-item-index">#{idx + 1}</div>
                  <Tag className="wb-tag-wrong" color="red">
                    错误{w.wrongCount}次
                  </Tag>
                  <span className="wb-item-title">{w.title}</span>
                </div>

                <div className="wb-item-right">
                  {w.mastered ? (
                    <Tag color="green" className="wb-tag-mastered">
                      已掌握
                    </Tag>
                  ) : (
                    <Tag color="orange" className="wb-tag-pending">
                      待复习
                    </Tag>
                  )}
                </div>
              </div>

              <div className="wb-item-sub">
                <span className="wb-sub">{w.chapterText}</span>
                <span className="wb-dot">·</span>
                <span className="wb-sub">{w.knowledgePoint}</span>
                <span className="wb-dot">·</span>
                <span className="wb-sub">最后练习：{w.lastPracticeAt}</span>
              </div>

              <div className="wb-item-actions">
                <button className="wb-btn primary" type="button" onClick={() => openPractice(w)}>
                  重新练习
                </button>

                <button className="wb-btn ghost" type="button" onClick={() => openAnalysis(w)}>
                  查看解析
                </button>
              </div>
            </div>
          ))}

          {displayWrongs.length === 0 && (
            <div className="wb-empty">
              当前筛选下暂无错题
              {hasFilter && (
                <button type="button" className="wb-empty-clear" onClick={clearFilter}>
                  清除筛选
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 底部 Sheet 弹窗 */}
      <WrongQuestionSheetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        wrong={currentWrong}
        defaultView={drawerDefaultView}
        onMarkMastered={(wrongId) => {
          setWrongs((prev) =>
            prev.map((w) => (w.id === wrongId ? { ...w, mastered: true } : w))
          )
        }}
      />
    </div>
  )
}
