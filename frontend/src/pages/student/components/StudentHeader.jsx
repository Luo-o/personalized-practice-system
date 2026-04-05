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
import "./student-header.css";

export default function StudentHeader() {
  const navigate = useNavigate();

  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const profile = currentUser?.profile || {};

  const studentName = useMemo(() => {
    return profile.name || currentUser?.name || "同学";
  }, [profile.name, currentUser?.name]);

  const studentInitial = useMemo(() => {
    return studentName?.trim()?.charAt(0) || "学";
  }, [studentName]);

  const studentAvatar = useMemo(() => {
    return profile.avatar || "/avatars/default-student-avatar.svg";
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
      navigate("/student/profile");
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
        console.error("学生退出登录失败：", error);
        message.error("退出登录失败，请稍后重试");
      }
    }
  };

  return (
    <header className="student-topbar">
      <div className="student-topbar-container">
        <div
          className="student-sidebar-brand"
          onClick={() => navigate("/student/dashboard")}
        >
          <div className="student-sidebar-brand-logo">
            <ReadOutlined />
          </div>
          <div className="student-sidebar-brand-text">
            <div className="student-sidebar-brand-title">智慧刷题系统</div>
          </div>
        </div>

        <nav className="student-topbar-nav">
          <NavLink
            to="/student/dashboard"
            end
            className={({ isActive }) =>
              `student-topbar-nav-link ${isActive ? "active" : ""}`
            }
          >
            首页
          </NavLink>

          <NavLink
            to="/student/class-list"
            className={({ isActive }) =>
              `student-topbar-nav-link ${isActive ? "active" : ""}`
            }
          >
            班级
          </NavLink>

          <NavLink
            to="/student/wrong-book"
            className={({ isActive }) =>
              `student-topbar-nav-link ${isActive ? "active" : ""}`
            }
          >
            错题
          </NavLink>

          <NavLink
            to="/student/records"
            className={({ isActive }) =>
              `student-topbar-nav-link ${isActive ? "active" : ""}`
            }
          >
            记录
          </NavLink>
        </nav>

        <div className="student-topbar-right">
          <Dropdown
            menu={{
              items,
              onClick: handleMenuClick,
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="student-user-dropdown">
              <Avatar
                size={36}
                className="student-user-avatar"
                src={studentAvatar}
              >
                {studentInitial}
              </Avatar>

              <div className="student-user-meta">
                <div className="student-user-name">{studentName}</div>
                <div className="student-user-role">学生</div>
              </div>

              <DownOutlined className="student-user-arrow" />
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
