import React from "react"
import { Row, Col, Button, Tag } from "antd"
import {
  TeamOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CheckCircleFilled,
} from "@ant-design/icons"
import PageHeader from "../../components/PageHeader"
import { useNavigate } from "react-router-dom"
import "./class-detail.css"

export default function ClassDetail() {
  const navigate = useNavigate()

  // ===== mock 数据（后续接接口直接替换这里）=====
  const classInfo = {
    className: "计算机2024-1班",
    teacher: "王老师",
    studentCount: 45,
    courseCode: "CS101",
  }

  const pendingExams = [
    {
      id: 1,
      no: 1,
      title: "第一章基础测验",
      deadline: "2024-12-30 23:59",
      questionCount: 20,
      durationMin: 60,
    },
    {
      id: 2,
      no: 2,
      title: "第二章数据结构测验",
      deadline: "2024-12-31 23:59",
      questionCount: 30,
      durationMin: 90,
    },
    {
      id: 3,
      no: 3,
      title: "第三章函数测验",
      deadline: "2025-01-05 23:59",
      questionCount: 25,
      durationMin: 60,
    },
  ]

  const finishedExams = [
    {
      id: 4,
      no: 4,
      title: "Python基础综合测验",
      questionCount: 50,
      durationMin: 120,
      deadline: "2024-12-25 23:59",
      score: 88,
      scoreTone: "blue",
    },
    {
      id: 5,
      no: 5,
      title: "期中测验",
      questionCount: 60,
      durationMin: 120,
      deadline: "2024-12-20 23:59",
      score: 92,
      scoreTone: "green",
    },
  ]

  // ===== 静态行为（后续接跳转）=====
  const onStart = (examId) => {
    navigate(`/student/exam/${examId}`)
  }
  const onDetail = (examId) => console.log("view detail:", examId)

  return (
    <div className="class-detail">
      {/* 顶部 */}
      <PageHeader
        title="我的班级"
        subtitle={classInfo.className}
        icon={<TeamOutlined />}
      />

      <div className="class-detail-body">
        {/* 班级信息蓝卡 */}
        <div className="class-info-card">
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={6}>
              <div className="info-item">
                <div className="info-label">班级名称</div>
                <div className="info-value">{classInfo.className}</div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="info-item">
                <div className="info-label">任课教师</div>
                <div className="info-value">{classInfo.teacher}</div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="info-item">
                <div className="info-label">班级人数</div>
                <div className="info-value">{classInfo.studentCount}人</div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="info-item">
                <div className="info-label">课程代码</div>
                <div className="info-value">{classInfo.courseCode}</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* 待完成测验 */}
        <div className="section">
          <div className="section-title">
            待完成测验 <span className="count-red">({pendingExams.length})</span>
          </div>

          <Row gutter={[18, 18]}>
            {pendingExams.map((e) => (
              <Col key={e.id} xs={24} md={12} lg={8}>
                <div className="pending-card">
                  <div className="pending-top">
                    <div className="pending-status">
                      <span className="pending-status-dot" />
                      <span className="pending-status-text">待完成</span>
                    </div>
                    <Tag className="pending-no" color="orange">
                      #{e.no}
                    </Tag>
                  </div>

                  <div className="pending-title">{e.title}</div>

                  <div className="pending-meta">
                    <div className="meta-row">
                      <ClockCircleOutlined className="meta-ico" />
                      <span className="meta-text">截止时间：{e.deadline}</span>
                    </div>
                    <div className="meta-row">
                      <FileTextOutlined className="meta-ico" />
                      <span className="meta-text">
                        {e.questionCount}题 · {e.durationMin}分钟
                      </span>
                    </div>
                  </div>

                  <Button
                    className="pending-btn"
                    type="primary"
                    onClick={() => onStart(e.id)}
                  >
                    开始答题
                  </Button>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* 已完成测验 */}
        <div className="section">
          <div className="section-title">
            已完成测验 <span className="count-green">({finishedExams.length})</span>
          </div>

          <div className="finished-list">
            {finishedExams.map((e) => (
              <div key={e.id} className="finished-item">
                <div className="finished-left">
                  <div className="finished-badge">
                    <CheckCircleFilled className="finished-check" />
                    <span className="finished-badge-text">已完成 · #{e.no}</span>
                  </div>

                  <div className="finished-title">{e.title}</div>

                  <div className="finished-meta">
                    {e.questionCount}题 · {e.durationMin}分钟 · 截止：{e.deadline}
                  </div>
                </div>

                <div className="finished-right">
                  <div className="score-wrap">
                    <div className="score-label">得分</div>
                    <div className={`score-value score-${e.scoreTone}`}>
                      {e.score}
                    </div>
                  </div>

                  <Button className="detail-btn" onClick={() => onDetail(e.id)}>
                    查看详情
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
