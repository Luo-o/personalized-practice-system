import React, { useMemo } from "react";
import { Menu } from "antd";
import {
  AppstoreOutlined,
  BookOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import "./student-sidebar.css";

const menuItems = [
  {
    key: "/student/dashboard",
    icon: <AppstoreOutlined />,
    label: "首页",
  },
  {
    key: "/student/wrong-book",
    icon: <BookOutlined />,
    label: "错题本",
  },
  {
    key: "/student/records",
    icon: <ProfileOutlined />,
    label: "刷题记录",
  },
];

function getSelectedKey(pathname) {
  if (pathname.startsWith("/student/class")) return "/student/class-list";
  if (pathname.startsWith("/student/wrong-book")) return "/student/wrong-book";
  if (pathname.startsWith("/student/records")) return "/student/records";
  if (pathname.startsWith("/student/profile")) return "/student/profile";
  return "/student/dashboard";
}

export default function StudentSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKeys = useMemo(
    () => [getSelectedKey(location.pathname)],
    [location.pathname],
  );

  return (
    <div className="student-sidebar">
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        items={menuItems}
        className="student-sidebar-menu"
        onClick={({ key }) => navigate(key)}
      />
    </div>
  );
}
