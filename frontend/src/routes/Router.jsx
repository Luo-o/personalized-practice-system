import { Navigate, useRoutes } from "react-router-dom";
import StudentLayout from "../pages/student/StudentLayout";
import StudentDashboard from "../pages/student/dashboard/StudentDashboard.jsx";
import ClassList from "../components/student/class-list/ClassList.jsx";
import ClassDetail from "../components/student/class-detail/ClassDetail.jsx";
import ExamDo from "../pages/student/ExamDo";
import WrongBook from "../pages/student/WrongBook";
import PracticeRecords from "../pages/student/PracticeRecords.jsx";
import PracticeRecordDetail from "../pages/student/PracticeRecordDetail.jsx";
import ProfilePage from "../pages/student/ProfilePage.jsx";

import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import TeacherBankTab from "../pages/teacher/components/TeacherBankTab";
import TeacherClassTab from "../pages/teacher/components/TeacherClassTab";
import TeacherProfileTab from "../pages/teacher/components/TeacherProfileTab";

import Login from "../pages/Login";

export default function Router() {
  return useRoutes([
    {
      path: "/",
      element: <Navigate to="/login" replace />,
    },
    {
      path: "/login",
      element: <Login />,
    },

    {
      path: "/student",
      element: <StudentLayout />,
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: <StudentDashboard /> },
        { path: "class-list", element: <ClassList /> },
        { path: "class/:classId", element: <ClassDetail /> },
        { path: "wrong-book", element: <WrongBook /> },
        { path: "records", element: <PracticeRecords /> },
        { path: "records/:recordId", element: <PracticeRecordDetail /> },
        { path: "profile", element: <ProfilePage /> },
        { path: "exam/:examId", element: <ExamDo /> },
      ],
    },

    {
      path: "/teacher",
      element: <TeacherDashboard />,
      children: [
        { index: true, element: <Navigate to="bank" replace /> },
        { path: "bank", element: <TeacherBankTab /> },
        { path: "class", element: <TeacherClassTab /> },
        { path: "profile", element: <TeacherProfileTab /> },
      ],
    },

    {
      path: "*",
      element: <Navigate to="/login" replace />,
    },
  ]);
}
