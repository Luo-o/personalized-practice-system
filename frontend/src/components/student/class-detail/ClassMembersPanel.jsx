import React, { useMemo } from "react";
import { Avatar, Empty } from "antd";
import { UserOutlined } from "@ant-design/icons";

function getDefaultAvatarByRole(role) {
  return role === "教师" || role === "teacher"
    ? "/avatars/default-teacher-avatar.png"
    : "/avatars/default-student-avatar.png";
}

export default function ClassMembersPanel({ classInfo, classStudents = [] }) {
  const tableData = useMemo(() => {
    return (classStudents || []).map((item, index) => {
      const roleText =
        item.roleName ||
        item.role ||
        item.userRole ||
        item.memberRole ||
        "学生";

      const name =
        item.name ||
        item.realName ||
        item.studentName ||
        item.teacherName ||
        "-";

      const avatar =
        item.avatar ||
        item.avatarUrl ||
        item.profile?.avatar ||
        getDefaultAvatarByRole(roleText);

      return {
        key: item.id ?? item.studentId ?? item.teacherId ?? index,
        avatar,
        studentNo:
          item.student_no ||
          item.studentNo ||
          item.teacher_no ||
          item.teacherNo ||
          "-",
        name,
        role: roleText,
        major:
          item.major ||
          item.specialty ||
          item.department ||
          item.profile?.major ||
          item.profile?.department ||
          "-",
      };
    });
  }, [classStudents]);

  return (
    <div className="class-panel class-panel--fill">
      <div className="class-panel-header">
        <div className="class-panel-title">班级成员</div>
        <div className="class-panel-sub">
          {classInfo.className} 共 {tableData.length} 人
        </div>
      </div>

      <div className="class-line-tabs">
        <button type="button" className="class-line-tab active">
          班级成员
        </button>
      </div>

      <div className="class-table-panel class-table-panel--fill">
        <div className="class-table-wrap">
          <table className="class-table">
            <thead>
              <tr>
                <th>头像</th>
                <th>学号</th>
                <th>姓名</th>
                <th>角色</th>
                <th>专业</th>
              </tr>
            </thead>

            <tbody>
              {tableData.length > 0 ? (
                tableData.map((item) => {
                  const isTeacher =
                    item.role === "教师" || item.role === "teacher";

                  return (
                    <tr key={item.key}>
                      <td>
                        <Avatar
                          src={item.avatar}
                          size={42}
                          icon={<UserOutlined />}
                        >
                          {item.name?.[0]}
                        </Avatar>
                      </td>
                      <td>{item.studentNo}</td>
                      <td>{item.name}</td>
                      <td>
                        <span className="class-role-text">
                          {isTeacher ? "教师" : "学生"}
                        </span>
                      </td>
                      <td>{item.major}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5}>
                    <div className="class-table-empty">
                      <Empty description="当前暂无班级成员数据" />
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="class-table-footer">
          <span>共 {tableData.length} 条</span>
          <div className="class-table-pagination">
            <button type="button" className="page-btn" disabled>
              ‹
            </button>
            <button type="button" className="page-btn active">
              1
            </button>
            <button type="button" className="page-btn" disabled>
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
