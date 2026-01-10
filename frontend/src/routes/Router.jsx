import { Routes, Route, Navigate } from 'react-router-dom'
import StudentDashboard from '../pages/student/StudentDashboard.jsx'
import ClassList from "../pages/student/ClassList"
import ClassDetail from "../pages/student/ClassDetail"
import ExamDo from "../pages/student/ExamDo"
import TeacherDashboard from '../pages/teacher/TeacherDashboard'
import Login from '../pages/Login'

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/class-list" element={<ClassList />} />
      <Route path="/student/class/:id" element={<ClassDetail />} />
      <Route path="/student/exam/:examId" element={<ExamDo />} />
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  )
}

export default AppRouter
