import React from "react"
import { Row, Col } from "antd"
import {
  ReadOutlined,
  BarChartOutlined,
  UserOutlined,
} from "@ant-design/icons"
import "./QuickEntry.css"

export default function QuickEntry({ counts, onNavigate }) {
  // counts: { wrongCount: 23, recordCount: 156 }
  const wrongCount = counts?.wrongCount
  const recordCount = counts?.recordCount

  const items = [
    {
      key: "wrongbook",
      title: "错题本",
      tone: "red",
      icon: <ReadOutlined />,
      rightValue: typeof wrongCount === "number" ? wrongCount : 1,
    },
    {
      key: "records",
      title: "刷题记录",
      tone: "blue",
      icon: <BarChartOutlined />,
      rightValue: typeof recordCount === "number" ? recordCount : 1,
    },
    {
      key: "profile",
      title: "个人中心",
      tone: "gray",
      icon: <UserOutlined />,
      rightValue: null,
    },
  ]

  return (
    <div className="quick-entry-section">
      <div className="quick-entry-title">快捷入口</div>

      <Row gutter={[18, 18]}>
        {items.map((it) => (
          <Col key={it.key} xs={24} sm={12} lg={8}>
            <button
              type="button"
              className="quick-card"
              onClick={() => onNavigate?.(it.key)}
            >
              <div className="quick-left">
                <div className={`quick-icon tone-${it.tone}`}>{it.icon}</div>
                <div className="quick-name">{it.title}</div>
              </div>

              {it.rightValue !== null && (
                <div className="quick-right">{it.rightValue}</div>
              )}
            </button>
          </Col>
        ))}
      </Row>
    </div>
  )
}
