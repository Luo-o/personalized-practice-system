// src/pages/student/PracticeRecordDetail.jsx
import React, { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import PageHeader from "../../components/PageHeader"
import QuestionSheet from "../../components/student/question-sheet/QuestionSheet"
import "./practice-records.css"

// 这里为了示例，复用同一份 mock；实际项目你改成按 recordId 请求接口
const MOCK_RECORDS = [
  {
    id: "r4",
    title: "Python基础综合测验",
    finishedAt: "2024-12-25 21:32",
    score: 88,
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
    finishedAt: "2024-12-20 22:10",
    score: 92,
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

export default function PracticeRecordDetail() {
  const navigate = useNavigate()
  const { recordId } = useParams()

  const record = useMemo(() => {
    return MOCK_RECORDS.find((x) => x.id === recordId) || null
  }, [recordId])

  return (
    <div className="pr-detail-page">
      <PageHeader
        title={record ? record.title : "记录详情"}
        subtitle={record ? `完成时间：${record.finishedAt} · 得分 ${record.score}` : ""}
        onBack={() => navigate(-1)}
      />

      {/* 直接复用题单的“结果预览” */}
      <QuestionSheet
        questions={record?.questions || []}
        initialAnswers={record?.answers || {}}
        mode="review"
        showTimer={false}
        onSubmit={async () => ({})}
        onViewWrong={() => navigate("/student/wrong-book")}
        onBackHome={() => navigate("/student/dashboard")}
      />
    </div>
  )
}
