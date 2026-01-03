import React from 'react'
import { Card, Typography, Button } from 'antd'
import { RightOutlined, TeamOutlined } from '@ant-design/icons'
import './ClassCard.css'

const { Text, Link } = Typography

export default function ClassCard() {
  return (
    <Card className="class-card" variant={false}>
      <div className="class-card-content">
        <div className="class-card-left">
          <div className="class-card-icon">
            <TeamOutlined style={{ fontSize: 28, color: '#fff' }} />
          </div>
          <div>
            <Text className="class-card-title">我的班级</Text>
            <Text className="class-card-subtitle">计算机2024-1班 · 3个待完成测验</Text>
          </div>
        </div>
        <div className="class-card-right">
          <Link className="class-card-link">
            查看详情 <RightOutlined />
          </Link>
        </div>
      </div>
    </Card>
  )
}