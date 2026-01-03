import React from 'react'
import { Layout } from 'antd'
import StudentHeader from './components/StudentHeader'
import ClassCard from './components/ClassCard'
import StatsCards from './components/StatsCards'
import StrategyCards from './components/StrategyCards'
import QuickEntry from './components/QuickEntry'
import './student-dashboard.css'


const { Content } = Layout


export default function StudentDashboard() {
  return (
    <Layout className="student-layout">
      <StudentHeader />
      <Content className="student-content">
        <ClassCard />
        <StatsCards />
        <StrategyCards />
        <QuickEntry />
      </Content>
    </Layout>
  )
}