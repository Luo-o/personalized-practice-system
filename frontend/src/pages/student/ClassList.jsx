import React, { useEffect, useMemo } from "react";
import { Row, Col } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  LaptopOutlined,
  RightOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useClassStore, useExamStore } from "../../store";
import "./class-list.css";

export default function ClassList() {
  const navigate = useNavigate();

  const classes = useClassStore((s) => s.classes);
  const fetchStudentClasses = useClassStore((s) => s.fetchStudentClasses);

  const exams = useExamStore((s) => s.exams);
  const fetchStudentExams = useExamStore((s) => s.fetchStudentExams);

  useEffect(() => {
    fetchStudentClasses();
    fetchStudentExams();
  }, [fetchStudentClasses, fetchStudentExams]);

  const myClasses = useMemo(() => {
    return (classes || []).map((c) => {
      const classExams = (exams || []).filter((e) => e.classId === c.id);

      const finishedExamCount = classExams.filter(
        (e) => Number(e.hasSubmitted) === 1,
      ).length;

      const pendingExamCount = classExams.filter(
        (e) => Number(e.hasSubmitted) !== 1,
      ).length;

      return {
        id: c.id,
        name: c.name,
        courseName: c.subjectName || "未命名课程",
        teacher: c.teacherName || "未知教师",
        studentCount: c.studentCount || 0,
        pendingExamCount,
        finishedExamCount,
      };
    });
  }, [classes, exams]);

  const stats = useMemo(() => {
    const classCount = myClasses.length;
    const pending = myClasses.reduce(
      (sum, c) => sum + (c.pendingExamCount || 0),
      0,
    );
    const finished = myClasses.reduce(
      (sum, c) => sum + (c.finishedExamCount || 0),
      0,
    );

    return { classCount, pending, finished };
  }, [myClasses]);

  const goDetail = (classId) => {
    navigate(`/student/class/${classId}`);
  };

  return (
    <div className="class-list-page">
      <PageHeader
        title="我的班级"
        subtitle={`共${stats.classCount}个班级`}
        icon={<TeamOutlined />}
      />

      <div className="class-list-body">
        <Row gutter={[18, 18]}>
          <Col xs={24} md={8}>
            <div className="cl-stat-card">
              <div className="cl-stat-left">
                <div className="cl-stat-title">我的班级数</div>
                <div className="cl-stat-value cl-stat-blue">
                  {stats.classCount}
                </div>
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
                <div className="cl-stat-value cl-stat-orange">
                  {stats.pending}
                </div>
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
                <div className="cl-stat-value cl-stat-green">
                  {stats.finished}
                </div>
              </div>
              <div className="cl-stat-icon cl-icon-green">
                <FileTextOutlined />
              </div>
            </div>
          </Col>
        </Row>

        {stats.pending > 0 && (
          <div className="cl-alert">
            <ExclamationCircleOutlined className="cl-alert-ico" />
            <span className="cl-alert-text">
              提醒：你有 <b>{stats.pending}</b> 个待完成的测验，请及时完成！
            </span>
          </div>
        )}

        <div className="cl-section-title">班级列表</div>

        <div className="cl-list">
          {myClasses.map((c) => {
            const hasPending = (c.pendingExamCount || 0) > 0;

            return (
              <div
                key={c.id}
                className={`cl-class-card ${hasPending ? "is-pending" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => goDetail(c.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") goDetail(c.id);
                }}
              >
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

                {hasPending && (
                  <div className="cl-class-hint">🔔 有待完成的测验</div>
                )}
              </div>
            );
          })}

          {myClasses.length === 0 && (
            <div className="cl-empty">你当前还没有加入任何班级</div>
          )}
        </div>
      </div>
    </div>
  );
}
