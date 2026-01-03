import { Routes, Route, Navigate } from 'react-router-dom'
import StudentDashboard from '../pages/student/StudentDashboard'
import TeacherDashboard from '../pages/teacher/TeacherDashboard'

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/student/dashboard" />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
    </Routes>
  )
}

export default AppRouter
