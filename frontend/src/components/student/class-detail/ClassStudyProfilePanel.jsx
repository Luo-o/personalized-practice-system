import React from "react";
import { Empty, Progress } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";

function StatCard({
  title,
  valueText,
  percent,
  footerLeft,
  footerRight,
  icon,
}) {
  return (
    <div className="profile-stat-card">
      <div className="profile-stat-top">
        <div className="profile-stat-title-wrap">
          <span className="profile-stat-icon">{icon}</span>
          <span className="profile-stat-title">{title}</span>
        </div>
      </div>

      <div className="profile-stat-body">
        <Progress
          type="circle"
          percent={percent}
          size={148}
          strokeWidth={5}
          strokeColor="#1677ff"
          trailColor="#e5e7eb"
          format={() => <span style={{ color: "#1677ff" }}>{valueText}</span>}
        />
      </div>

      <div className="profile-stat-footer">
        <span>{footerLeft}</span>
        <span>{footerRight}</span>
      </div>
    </div>
  );
}

export default function ClassStudyProfilePanel({ classInfo, profileStats }) {
  const totalCount = profileStats?.totalCount || 0;
  const finishedCount = profileStats?.finishedCount || 0;
  const pendingCount = profileStats?.pendingCount || 0;
  const completionRate = profileStats?.taskCompletionRate || 0;
  const onTimeCount = profileStats?.onTimeCount || 0;
  const totalMinutes = profileStats?.totalMinutes || 0;

  const onTimePercent =
    finishedCount > 0 ? Math.round((onTimeCount / finishedCount) * 100) : 0;

  const studyHourPercent = Math.min(
    Math.round((totalMinutes / 600) * 100),
    100,
  );

  return (
    <div className="class-panel class-panel--fill">
      <div className="class-panel-header">
        <div className="class-panel-title">我的学情</div>
        <div className="class-panel-sub">{classInfo.className} - 我的画像</div>
      </div>

      <div className="class-line-tabs">
        <button type="button" className="class-line-tab active">
          我的画像
        </button>
      </div>

      {totalCount === 0 ? (
        <div className="class-table-panel class-empty-wrap">
          <Empty description="当前暂无可展示的学习数据" />
        </div>
      ) : (
        <div className="profile-stat-grid">
          <StatCard
            title="任务完成度"
            valueText={`${completionRate}%`}
            percent={completionRate}
            footerLeft={`已完成 ${finishedCount}`}
            footerRight={`待完成 ${pendingCount}`}
            icon={<CheckCircleOutlined />}
          />
          <StatCard
            title="按时完成任务数"
            valueText={`${onTimeCount}`}
            percent={onTimePercent}
            footerLeft={`按时完成 ${onTimeCount}`}
            footerRight={`已完成任务 ${finishedCount}`}
            icon={<ClockCircleOutlined />}
          />
          <StatCard
            title="学习时长"
            valueText={`${totalMinutes}m`}
            percent={studyHourPercent}
            footerLeft={`累计 ${totalMinutes} 分钟`}
            footerRight={`测验数 ${finishedCount}`}
            icon={<FieldTimeOutlined />}
          />
        </div>
      )}
    </div>
  );
}
