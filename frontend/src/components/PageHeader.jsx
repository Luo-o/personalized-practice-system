import React from "react"
import { Typography } from "antd"
import { ArrowLeftOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import "./page-header.css"

const { Title, Text } = Typography

/**
 * PageHeader（通用）
 * - 返回 + 图标 + 标题/副标题 + 右侧插槽
 *
 * props:
 * - title: string
 * - subtitle?: string
 * - icon?: ReactNode
 * - right?: ReactNode
 * - onBack?: () => void           不传则默认 navigate(-1)
 * - backTo?: string               可选：固定返回到某个路由（优先级低于 onBack）
 */
export default function PageHeader({
  title,
  subtitle,
  icon,
  right,
  onBack,
  backTo,
}) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) return onBack()
    if (backTo) return navigate(backTo)
    navigate(-1)
  }

  return (
    <div className="page-header">
      <div className="page-header-inner">
        <div className="ph-left">
          <button className="ph-back" type="button" onClick={handleBack}>
            <ArrowLeftOutlined />
          </button>

          {icon ? <div className="ph-icon">{icon}</div> : null}

          <div className="ph-text">
            <Title level={5} className="ph-title">
              {title}
            </Title>
            {subtitle ? <Text className="ph-subtitle">{subtitle}</Text> : null}
          </div>
        </div>

        <div className="ph-right">{right}</div>
      </div>
    </div>
  )
}
