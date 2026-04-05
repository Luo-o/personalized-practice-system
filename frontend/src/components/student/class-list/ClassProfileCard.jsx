import React, { useMemo } from "react";
import { Avatar } from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";

export default function ClassProfileCard({
  avatar,
  avatarUrl,
  avatarText,
  studentName,
  studentGrade,
  studentMajor,
  courseCount,
  pendingTaskCount,
}) {
  const finalAvatar = useMemo(() => {
    return avatar || avatarUrl || "/avatars/default-student-avatar.svg";
  }, [avatar, avatarUrl]);

  const finalAvatarText = useMemo(() => {
    return avatarText || studentName?.trim()?.charAt(0) || "学";
  }, [avatarText, studentName]);

  return (
    <div className="class-profile-card">
      <div className="class-profile-left">
        <Avatar
          className="class-profile-avatar"
          size={96}
          src={finalAvatar}
          icon={<UserOutlined />}
        >
          {finalAvatarText}
        </Avatar>

        <div className="class-profile-user">
          <div className="class-profile-name">{studentName}</div>
          <div className="class-profile-major">专业：{studentMajor}</div>
          <div className="class-profile-grade">年级：{studentGrade}</div>
        </div>
      </div>

      <div className="class-profile-right">
        <div className="class-profile-metric">
          <div className="class-profile-metric-icon is-blue">
            <FileTextOutlined />
          </div>
          <div className="class-profile-metric-text">
            <div className="class-profile-metric-label">学习课程</div>
            <div className="class-profile-metric-value">{courseCount}</div>
          </div>
        </div>

        <div className="class-profile-metric">
          <div className="class-profile-metric-icon is-green">
            <SearchOutlined />
          </div>
          <div className="class-profile-metric-text">
            <div className="class-profile-metric-label">待完成任务</div>
            <div className="class-profile-metric-value">{pendingTaskCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
