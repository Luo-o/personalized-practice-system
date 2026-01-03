import React, { useMemo } from "react"
import { Row, Col } from "antd"
import {
  BookOutlined,
  AimOutlined,
  BarChartOutlined,
} from "@ant-design/icons"
import "./StatsCard.css"

export default function StatsCards({ stats }) {
  const data = useMemo(() => {
    const fallback = {
      todayDone: 12,
      accuracy: 85, 
      streakDays: 7,
    }
    return { ...fallback, ...(stats || {}) }
  }, [stats])

  const cards = [
    {
      title: "今日已刷题",
      value: String(data.todayDone),
      valueClass: "value-default",
      icon: <BookOutlined />,
      tone: "blue",
    },
    {
      title: "正确率",
      value: `${data.accuracy}%`,
      valueClass: "value-green",
      icon: <AimOutlined />,
      tone: "green",
    },
    {
      title: "连续打卡",
      value: `${data.streakDays}天`,
      valueClass: "value-orange",
      icon: <BarChartOutlined />,
      tone: "orange",
    },
  ]

  return (
    <div className="stats-cards-wrap">
      <Row gutter={[18, 18]}>
        {cards.map((c) => (
          <Col key={c.title} xs={24} sm={12} lg={8}>
            <div className="stats-card-ui">
              <div className="stats-left">
                <div className="stats-title">{c.title}</div>
                <div className={`stats-value ${c.valueClass}`}>{c.value}</div>
              </div>

              <div className={`stats-icon-box tone-${c.tone}`}>
                <span className="stats-icon">{c.icon}</span>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  )
}
