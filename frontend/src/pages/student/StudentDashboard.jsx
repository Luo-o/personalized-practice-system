import React, { useState } from 'react'
import { useNavigate } from "react-router-dom"
import { Layout } from 'antd'
import StudentHeader from './components/StudentHeader'
import ClassCard from './components/ClassCard'
import StatsCards from './components/StatsCards'
import StrategyCards from './components/StrategyCards'
import QuickEntry from './components/QuickEntry'
import PracticeDecisionModal from "../../components/student/practice-decision-modal/PracticeDecisionModal"
import './student-dashboard.css'


const { Content } = Layout

export default function StudentDashboard() {
  const [open, setOpen] = useState(false)
  const [strategy, setStrategy] = useState(null)
  const navigate = useNavigate()
  const handleQuickEntryNavigate = (key) => {
    switch (key) {
      case "wrongbook":
        navigate("/student/wrong-book")
        break
      case "records":
        navigate("/student/records")
        break
      case "profile":
        navigate("/student/profile")
        break
      default:
        break
    }
  }
  const subjects = [
    {
      id: "math",
      name: "高等数学",
      chapters: [
        {
          id: "c1",
          name: "第一章 极限",
          knowledgePoints: [
            { id: "k1", name: "数列极限" },
            { id: "k2", name: "函数极限" },
            { id: "k3", name: "无穷小与无穷大" },
            { id: "k4", name: "无穷小与无穷大1" },
          ],
        },
        {
          id: "c2",
          name: "第二章 导数",
          knowledgePoints: [
            { id: "k8", name: "导数定义" },
            { id: "k9", name: "求导法则" },
            { id: "k10", name: "高阶导数" },
            { id: "k11", name: "高阶导数" },
          ],
        },
      ],
    },
  ]

  return (
    <Layout className="student-layout">
      <StudentHeader />
      <Content className="student-content">
        <ClassCard />
        <StatsCards />
        <StrategyCards 
          onSelectStrategy={(key) => {
            setStrategy(key)
            setOpen(true)
          }}
        />
        <QuickEntry 
          onNavigate={handleQuickEntryNavigate}
        />
      </Content>
      <PracticeDecisionModal
          open={open}
          strategy={strategy}
          onClose={() => setOpen(false)}
          onStart={(cfg) => {
            const examId = `exam_${Date.now()}`
            navigate(`/student/exam/${examId}`, { state: { cfg } })
          }}
          subjects={subjects}
        />
    </Layout>
  )
}