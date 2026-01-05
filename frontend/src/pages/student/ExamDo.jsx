import React, { useMemo } from "react"
import { useParams } from "react-router-dom"
import PageHeader from "../../components/PageHeader"
import { FileTextOutlined } from "@ant-design/icons"
import QuestionSheet from "../../components/student/question-sheet/QuestionSheet"

// 先写死：不同 examId 给不同题（后续你接接口只替换这里）
function buildMockQuestions(examId) {
  const base = [
    {
      id: "q1",
      difficulty: "简单",
      tag: "Python基础 · 变量与数据类型",
      stem: "以下关于Python变量的描述，正确的是？",
      options: [
        { key: "A", text: "Python变量必须先声明后使用" },
        { key: "B", text: "Python变量名可以以数字开头" },
        { key: "C", text: "Python是动态类型语言，变量类型可以改变" },
        { key: "D", text: "Python变量名区分大小写" },
      ],
      correct: "C",
      explanation: "Python 是动态类型语言，变量名绑定对象，类型可随赋值改变。",
    },
    {
      id: "q2",
      difficulty: "简单",
      tag: "Python基础 · 数据类型",
      stem: "下列哪个不是 Python 的内置数据类型？",
      options: [
        { key: "A", text: "list" },
        { key: "B", text: "tuple" },
        { key: "C", text: "map" },
        { key: "D", text: "dict" },
      ],
      correct: "C",
      explanation: "map 是内置函数，不是内置数据类型。",
    },
  ]

  // 你也可以根据 examId 拼更多题
  if (String(examId) === "2") {
    return base.map((q) => ({
      ...q,
      tag: "第二章 · 数据结构",
    }))
  }
  return base
}

export default function ExamDo() {
  const { examId } = useParams()

  const questions = useMemo(() => buildMockQuestions(examId), [examId])

  return (
    <div>
      <PageHeader
        title="答题进行中"
        subtitle={`测验ID：${examId} · 共${questions.length}题`}
        icon={<FileTextOutlined />}
      />

      <QuestionSheet
        questions={questions}
        // 先不做倒计时：给个静态展示
        showTimer={true}
        timerText="0:00"
        onSubmit={async ({ answers }) => {
          // 后续：把 answers 发给后端即可
          console.log("submit exam:", examId, answers)
          return {} // 这里返回空，QuestionSheet 会用题目自带 correct/explanation
        }}
      />
    </div>
  )
}
