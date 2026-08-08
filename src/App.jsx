import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './pages/Dashboard'
import Problems from './pages/Problems'
import ProblemDetail from './pages/ProblemDetail'
import Courses from './pages/Courses'
import AiTutor from './pages/AiTutor'
import CodeforcesContests from './pages/CodeforcesContests'
import CodeforcesContest from './pages/CodeforcesContest'
import CodeforcesProblem from './pages/CodeforcesProblem'

function SettingsPlaceholder() {
  return <div className="page"><section className="content-card settings-placeholder"><h2>偏好设置</h2><p>账号、编辑器、通知与界面设置将在后续版本接入。</p></section></div>
}

export default function App() {
  const location = useLocation()
  const isProblemWorkspace = location.pathname.startsWith('/problems/') || (location.pathname.startsWith('/codeforces/contests/') && location.pathname.includes('/problems/'))

  return (
    <div className="app-shell">
      <Sidebar />
      <main className={`main-shell ${isProblemWorkspace ? 'workspace-shell' : ''}`}>
        {!isProblemWorkspace && <Topbar />}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/:id" element={<ProblemDetail />} />
          <Route path="/contests/acm-regional-2026" element={<Problems contestId="ACM-R2026-01" />} />
          <Route path="/codeforces" element={<CodeforcesContests />} />
          <Route path="/codeforces/contests/:contestId" element={<CodeforcesContest />} />
          <Route path="/codeforces/contests/:contestId/problems/:index" element={<CodeforcesProblem />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/ai" element={<AiTutor />} />
          <Route path="/settings" element={<SettingsPlaceholder />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
