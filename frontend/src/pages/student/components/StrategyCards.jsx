import React from "react"
import { Row, Col } from "antd"
import {
  BookOutlined,
  AimOutlined,
  BulbOutlined,
  AppstoreOutlined,
} from "@ant-design/icons"
import "./StrategyCards.css"

export default function StrategyCards({
  onSelectStrategy,
}) {
  const strategies = [
    {
      key: "chapter",
      title: "按章节刷题",
      desc: "系统学习，逐章攻克",
      tone: "blue",
      icon: <BookOutlined />,
    },
    {
      key: "difficulty",
      title: "按难度刷题",
      desc: "循序渐进，稳步提升",
      tone: "green",
      icon: <AimOutlined />,
    },
    {
      key: "knowledge",
      title: "按知识点刷题",
      desc: "精准练习，查漏补缺",
      tone: "purple",
      icon: <BulbOutlined />,
    },
    {
      key: "mix",
      title: "组合刷题",
      desc: "自定义策略，高效学习",
      tone: "orange",
      icon: <AppstoreOutlined />,
    },
  ]

  const handleClick = (item) => {
    onSelectStrategy?.(item.key)
  }

  return (
    <div className="strategy-section">
      <div className="strategy-header">
        <div className="strategy-title">刷题模式</div>


      </div>

      <Row gutter={[18, 18]}>
        {strategies.map((s) => (
          <Col key={s.key} xs={24} sm={12} lg={6}>
            <button
              type="button"
              className={`strategy-card tone-${s.tone}`}
              onClick={() => handleClick(s)}
            >
              <div className={`strategy-icon tone-${s.tone}`}>
                {s.icon}
              </div>

              <div className="strategy-text">
                <div className="strategy-card-title">{s.title}</div>
                <div className="strategy-card-desc">{s.desc}</div>
              </div>
            </button>
          </Col>
        ))}
      </Row>
    </div>
  )
}
