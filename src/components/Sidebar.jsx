import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Code2,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Trophy,
} from 'lucide-react'

const mainNav = [
  { to: '/', label: '学习概览', icon: LayoutDashboard, end: true },
  { to: '/problems', label: 'Online Judge', icon: Code2 },
  { to: '/courses', label: '精品课程', icon: GraduationCap },
  { to: '/ai', label: '算法 AI', icon: Bot, badge: 'AI' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        {!collapsed && (
          <div>
            <strong>ALGO</strong>
            <small>ARENA</small>
          </div>
        )}
      </div>

      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed((value) => !value)}
        aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <nav className="sidebar-nav" aria-label="主导航">
        <p className="nav-caption">{collapsed ? '···' : '训练中心'}</p>
        {mainNav.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon size={20} strokeWidth={1.8} />
            {!collapsed && <span>{label}</span>}
            {!collapsed && badge && <em>{badge}</em>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <div className="weekly-card">
        <div className="weekly-icon"><Trophy size={18} /></div>
        {!collapsed && (
          <div>
            <strong>本周挑战</strong>
            <span>再完成 2 道题</span>
            <div className="mini-progress"><i style={{ width: '68%' }} /></div>
          </div>
        )}
      </div>

      <NavLink to="/settings" className="nav-item sidebar-settings">
        <Settings size={20} strokeWidth={1.8} />
        {!collapsed && <span>偏好设置</span>}
      </NavLink>
      <div className="sidebar-profile">
        <div className="avatar">LY</div>
        {!collapsed && (
          <div>
            <strong>林一</strong>
            <span>算法学习者</span>
          </div>
        )}
      </div>
    </aside>
  )
}
