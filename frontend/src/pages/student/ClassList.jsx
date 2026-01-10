import React, { useMemo } from "react"
import { Row, Col } from "antd"
import {
  TeamOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  LaptopOutlined,
  RightOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import PageHeader from "../../components/PageHeader"
import "./class-list.css"

export default function ClassList() {
  const navigate = useNavigate()

  // ===== mock 数据（后续接接口直接替换这里）=====
  const classes = [
    {
      id: "c1",
      name: "计算机2024-1班",
      courseName: "Python程序设计",
      teacher: "王老师",
      studentCount: 45,
      pendingExamCount: 3,
      finishedExamCount: 5,
    },
    {
      id: "c2",
      name: "计算机2024-2班",
      courseName: "计算机网络",
      teacher: "李老师",
      studentCount: 48,
      pendingExamCount: 1,
      finishedExamCount: 6,
    },
    {
      id: "c3",
      name: "软件工程2024-1班",
      courseName: "数据结构",
      teacher: "张老师",
      studentCount: 52,
      pendingExamCount: 0,
      finishedExamCount: 5,
    },
  ]

  const stats = useMemo(() => {
    const classCount = classes.length
    const pending = classes.reduce((s, c) => s + (c.pendingExamCount || 0), 0)
    const finished = classes.reduce((s, c) => s + (c.finishedExamCount || 0), 0)
    return { classCount, pending, finished }
  }, [classes])

  const goDetail = (classId) => {
    navigate(`/student/class/${classId}`)
  }

  return (
    <div className="class-list-page">
      <PageHeader
        title="我的班级"
        subtitle={`共${stats.classCount}个班级`}
        icon={<TeamOutlined />}
      />

      <div className="class-list-body">
        {/* 统计卡 */}
        <Row gutter={[18, 18]}>
          <Col xs={24} md={8}>
            <div className="cl-stat-card">
              <div className="cl-stat-left">
                <div className="cl-stat-title">我的班级数</div>
                <div className="cl-stat-value cl-stat-blue">{stats.classCount}</div>
              </div>
              <div className="cl-stat-icon cl-icon-blue">
                <TeamOutlined />
              </div>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div className="cl-stat-card">
              <div className="cl-stat-left">
                <div className="cl-stat-title">待完成测验</div>
                <div className="cl-stat-value cl-stat-orange">{stats.pending}</div>
              </div>
              <div className="cl-stat-icon cl-icon-orange">
                <ClockCircleOutlined />
              </div>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div className="cl-stat-card">
              <div className="cl-stat-left">
                <div className="cl-stat-title">已完成测验</div>
                <div className="cl-stat-value cl-stat-green">{stats.finished}</div>
              </div>
              <div className="cl-stat-icon cl-icon-green">
                <FileTextOutlined />
              </div>
            </div>
          </Col>
        </Row>

        {/* 提醒条 */}
        {stats.pending > 0 && (
          <div className="cl-alert">
            <ExclamationCircleOutlined className="cl-alert-ico" />
            <span className="cl-alert-text">
              提醒：你有 <b>{stats.pending}</b> 个待完成的测验，请及时完成！
            </span>
          </div>
        )}

        {/* 班级列表 */}
        <div className="cl-section-title">班级列表</div>

        <div className="cl-list">
          {classes.map((c) => {
            const hasPending = (c.pendingExamCount || 0) > 0
            return (
              <div
                key={c.id}
                className={`cl-class-card ${hasPending ? "is-pending" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => goDetail(c.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") goDetail(c.id)
                }}
              >
                {/* 顶部蓝色信息区 */}
                <div className="cl-class-head">
                  <div className="cl-class-head-left">
                    <div className="cl-class-emoji">
                      <LaptopOutlined />
                    </div>
                    <div className="cl-class-meta">
                      <div className="cl-class-name">{c.name}</div>
                      <div className="cl-class-course">{c.courseName}</div>
                      <div className="cl-class-sub">
                        <span className="cl-sub-item">
                          <UserOutlined className="cl-sub-ico" />
                          {c.teacher}
                        </span>
                        <span className="cl-sub-item">
                          <TeamOutlined className="cl-sub-ico" />
                          {c.studentCount}人
                        </span>
                      </div>
                    </div>
                  </div>

                  <RightOutlined className="cl-class-arrow" />
                </div>

                {/* 底部统计区 */}
                <div className="cl-class-foot">
                  <div className="cl-foot-item">
                    <div className="cl-foot-icon cl-foot-orange">
                      <ClockCircleOutlined />
                    </div>
                    <div className="cl-foot-text">
                      <div className="cl-foot-label">待完成</div>
                      <div className="cl-foot-value cl-stat-orange">
                        {c.pendingExamCount || 0}
                      </div>
                    </div>
                  </div>

                  <div className="cl-foot-divider" />

                  <div className="cl-foot-item">
                    <div className="cl-foot-icon cl-foot-green">
                      <FileTextOutlined />
                    </div>
                    <div className="cl-foot-text">
                      <div className="cl-foot-label">已完成</div>
                      <div className="cl-foot-value cl-stat-green">
                        {c.finishedExamCount || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 提示行（有待完成才显示） */}
                {hasPending && (
                  <div className="cl-class-hint">
                    🔔 有待完成的测验
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
