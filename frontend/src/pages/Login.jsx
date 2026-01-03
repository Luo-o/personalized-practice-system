import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Checkbox, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import './login.css'
import { APP_NAME } from '../constants'

const { Text, Link } = Typography

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [isStudent, setIsStudent] = useState(true)
  const navigate = useNavigate()

  const onFinish = () => {
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      message.success('登录成功')
      if (isStudent) {
        navigate('/student/dashboard')
      } else {
        navigate('/teacher/dashboard')
      }
    }, 1000)
  }

  return (
    <div className="login-wrapper">
      <div style={{ fontSize: 40, color: '#1677ff', marginBottom: 8 }}>📘</div>
      <div className="login-title">{APP_NAME}</div>
      <div className="login-subtitle">{isStudent ? '学生登录' : '教师登录'}</div>
      <div className="login-box">
        <Form layout="vertical" onFinish={onFinish} initialValues={{ remember: true }}>
          <Form.Item name="id" rules={[{ required: true, message: '请输入账号' }]}>
            <Input prefix={<UserOutlined />} placeholder="学号 / 工号" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Checkbox defaultChecked>记住我</Checkbox>
              <Link>忘记密码？</Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Text type="secondary">
              {isStudent ? '教师登录？' : '学生登录？'}
              <Link onClick={() => setIsStudent(!isStudent)} style={{ marginLeft: 4 }}>
                点击切换
              </Link>
            </Text>
          </Form.Item>
        </Form>
      </div>

      <Text type="secondary" style={{ marginTop: 48, fontSize: 12 }}>
        © 2026 {APP_NAME}
      </Text>
    </div>
  )
}
