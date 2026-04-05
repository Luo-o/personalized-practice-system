import React from "react";
import { Dropdown } from "antd";
import { TeamOutlined, MenuOutlined, LogoutOutlined } from "@ant-design/icons";

export default function ClassCard({ item, onGoDetail, onQuitClass }) {
  const menuItems = [
    {
      key: "quit",
      icon: <LogoutOutlined />,
      label: "退出班级",
      danger: true,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        onQuitClass(item);
      },
    },
  ];

  return (
    <div
      className="course-card"
      onClick={() => onGoDetail(item.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onGoDetail(item.id);
      }}
    >
      <div className="course-card-cover-wrap">
        <img className="course-card-cover" src={item.cover} alt={item.name} />
        <div className="course-card-subject-bar">{item.description}</div>
      </div>

      <div className="course-card-body">
        <div className="course-card-title-row">
          <div className="course-card-title" title={item.name}>
            {item.name}
          </div>

          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <button
              className="course-card-more"
              onClick={(e) => e.stopPropagation()}
            >
              <MenuOutlined />
            </button>
          </Dropdown>
        </div>

        <div className="course-card-teacher">{item.teacherName}</div>
        <div className="course-card-subject">科目：{item.subjectName}</div>
        <div className="course-card-footer">
          <div className="course-card-students">
            <TeamOutlined />
            <span>{item.studentCount}人</span>
          </div>

          {item.pendingTaskCount > 0 && (
            <div className="course-card-badge">
              待完成 {item.pendingTaskCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
