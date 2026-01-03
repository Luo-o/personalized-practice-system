import React from 'react'
import { Layout, Typography, Button } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'
import './StudentHeader.css'
import { APP_NAME } from '../../../constants'


const { Header } = Layout
const { Title, Text } = Typography

export default function StudentHeader() {
  return (
    <Header className="student-header">
      <div className="header-left">
        <div className="header-logo">📘</div>
        <div className="header-info">
          <Title level={5} className="system-name">{APP_NAME}</Title>
          <Text className="welcome-text">你好，张同学</Text>
        </div>
      </div>
      <Button type="link" icon={<LogoutOutlined />}>退出登录</Button>
    </Header>
  )
}