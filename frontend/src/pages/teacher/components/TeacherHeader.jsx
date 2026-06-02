import React, { useMemo } from "react";
import { Avatar, Dropdown, message } from "antd";
import {
  DownOutlined,
  LogoutOutlined,
  ReadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store";
import "./teacher-header.css";

export default function TeacherHeader() {
  const navigate = useNavigate();

  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const profile = currentUser?.profile || {};

  const teacherName = useMemo(() => {
    return profile.name || currentUser?.name || "老师";
  }, [profile.name, currentUser?.name]);

  const teacherInitial = useMemo(() => {
    return teacherName?.trim()?.charAt(0) || "师";
  }, [teacherName]);

  const teacherAvatar = useMemo(() => {
    return profile.avatar || "/avatars/default-teacher-avatar.png";
  }, [profile.avatar]);

  const items = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "个人信息",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      danger: true,
    },
  ];

  const handleMenuClick = async ({ key }) => {
    if (key === "profile") {
      navigate("/teacher/profile");
      return;
    }

    if (key === "logout") {
      try {
        if (typeof logout === "function") {
          await logout();
        }
        message.success("已退出登录");
        navigate("/login", { replace: true });
      } catch (error) {
        console.error("教师退出登录失败：", error);
        message.error("退出登录失败，请稍后重试");
      }
    }
  };

  return (
    <header className="teacher-topbar">
      <div className="teacher-topbar-container">
        <div
          className="teacher-sidebar-brand"
          onClick={() => navigate("/teacher/bank")}
        >
          <div className="teacher-sidebar-brand-logo">
            <ReadOutlined />
          </div>
          <div className="teacher-sidebar-brand-text">
            <div className="teacher-sidebar-brand-title">智慧练习系统</div>
          </div>
        </div>

        <nav className="teacher-topbar-nav">
          <NavLink
            to="/teacher/bank"
            end
            className={({ isActive }) =>
              `teacher-topbar-nav-link ${isActive ? "active" : ""}`
            }
          >
            题库
          </NavLink>

          <NavLink
            to="/teacher/class"
            className={({ isActive }) =>
              `teacher-topbar-nav-link ${isActive ? "active" : ""}`
            }
          >
            班级
          </NavLink>

          <NavLink
            to="/teacher/profile"
            className={({ isActive }) =>
              `teacher-topbar-nav-link ${isActive ? "active" : ""}`
            }
          >
            个人信息
          </NavLink>
        </nav>

        <div className="teacher-topbar-right">
          <Dropdown
            menu={{
              items,
              onClick: handleMenuClick,
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="teacher-user-dropdown">
              <Avatar
                size={36}
                className="teacher-user-avatar"
                src={teacherAvatar}
              >
                {teacherInitial}
              </Avatar>

              <div className="teacher-user-meta">
                <div className="teacher-user-name">{teacherName}</div>
                <div className="teacher-user-role">教师</div>
              </div>

              <DownOutlined className="teacher-user-arrow" />
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
