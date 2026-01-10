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
        <QuickEntry />
      </Content>
      <PracticeDecisionModal
          open={open}
          strategy={strategy}
          onClose={() => setOpen(false)}
          onStart={(cfg) => {
            const examId = `exam_${Date.now()}`
            navigate(`/student/exam/${examId}`, { state: { cfg } })
          }}
        />
    </Layout>
  )
}