import { Bell, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const titles = {
  '/': ['学习概览', '继续保持，你正在稳步变强'],
  '/problems': ['Online Judge', '在一次次提交中精进算法'],
  '/courses': ['精品课程', '跟随体系化路径，突破算法瓶颈'],
  '/ai': ['算法 AI', '你的专属 OI / ACM 解题搭档'],
}

export default function Topbar() {
  const location = useLocation()
  const rootPath = `/${location.pathname.split('/')[1]}`
  const [title, subtitle] = location.pathname.startsWith('/problems/')
    ? ['题目详情', '阅读题面、编写代码并提交评测']
    : titles[rootPath === '/' ? '/' : rootPath] || ['Algo Arena', '专注每一次思考']

  return (
    <header className="topbar">
      <div className="page-heading">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="topbar-actions">
        <label className="global-search">
          <Search size={17} />
          <input placeholder="搜索题目、课程或知识点" />
          <kbd>⌘ K</kbd>
        </label>
        <button className="icon-button notification" aria-label="通知">
          <Bell size={19} />
          <span />
        </button>
      </div>
    </header>
  )
}
