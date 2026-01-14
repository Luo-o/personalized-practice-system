import { Routes, Route, Navigate } from 'react-router-dom'
import StudentDashboard from '../pages/student/StudentDashboard.jsx'
import ClassList from "../pages/student/ClassList"
import ClassDetail from "../pages/student/ClassDetail"
import ExamDo from "../pages/student/ExamDo"
import WrongBook from "../pages/student/WrongBook"
import PracticeRecords from '../pages/student/PracticeRecords.jsx'
import PracticeRecordDetail from '../pages/student/PracticeRecordDetail.jsx'
import ProfilePage from '../pages/student/ProfilePage.jsx'
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
      <Route path="/student/wrong-book" element={<WrongBook />} />
      <Route path="/student/records" element={<PracticeRecords />} />
      <Route path="/student/records/:recordId" element={<PracticeRecordDetail />} />
      <Route path="/student/profile" element={<ProfilePage />} />
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<div style={{ padding: 24 }}>404 Not Found</div>} />
    </Routes>
  )
}

export default AppRouter
