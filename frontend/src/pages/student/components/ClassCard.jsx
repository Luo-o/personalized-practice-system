import React from "react"
import { Card, Typography } from "antd"
import { RightOutlined, TeamOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import "./class-card.css"

const { Text } = Typography

export default function ClassCard() {
  const navigate = useNavigate()

  const go = () => navigate("/student/class-list")

  return (
    <Card className="class-card" onClick={go}>
      <div className="class-card-content">
        <div className="class-card-left">
          <div className="class-card-icon">
            <TeamOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>

          <div className="class-card-text">
            <Text className="class-card-title">我的班级</Text>
            <Text className="class-card-subtitle">3个班级 · 4个待完成测验</Text>
          </div>
        </div>

        <div className="class-card-right" onClick={(e) => e.stopPropagation()}>
          <span className="class-card-link" onClick={go}>
            查看详情 <RightOutlined />
          </span>
        </div>
      </div>
    </Card>
  )
}
