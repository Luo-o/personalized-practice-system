import React from "react";
import { Outlet } from "react-router-dom";
import TeacherHeader from "./components/TeacherHeader";
import "./teacher-dashboard.css";

export default function TeacherDashboard() {
  return (
    <div className="td-page">
      <TeacherHeader />

      <main className="td-body">
        <Outlet />
      </main>
    </div>
  );
}
