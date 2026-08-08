import { Bell, LoaderCircle, Search } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const titles = {
  '/': ['学习概览', '继续保持，你正在稳步变强'],
  '/problems': ['Online Judge', '在一次次提交中精进算法'],
  '/contests': ['ACM 模拟竞赛', '以区域赛节奏完成一整套赛题'],
  '/courses': ['精品课程', '跟随体系化路径，突破算法瓶颈'],
  '/ai': ['算法 AI', '你的专属 OI / ACM 解题搭档'],
}

export default function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const rootPath = `/${location.pathname.split('/')[1]}`
  const [title, subtitle] = location.pathname.startsWith('/problems/')
    ? ['题目详情', '阅读题面、编写代码并提交评测']
    : titles[rootPath === '/' ? '/' : rootPath] || ['Algo Arena', '专注每一次思考']

  const submitSearch = async (event) => {
    event.preventDefault()
    const value = query.trim()
    if (!value || searching) return
    setSearching(true)
    setSearchError('')
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(value)}`)
      if (!response.ok) throw new Error('搜索服务暂时不可用')
      const result = await response.json()
      if (['problem-detail', 'problem-list', 'course', 'ai'].includes(result.kind)) navigate(result.target)
      else setSearchError('请输入要搜索的内容')
    } catch (error) {
      setSearchError(error.message || '搜索失败，请稍后重试')
    } finally {
      setSearching(false)
    }
  }

  return (
    <header className="topbar">
      <div className="page-heading"><h1>{title}</h1><p>{subtitle}</p></div>
      <div className="topbar-actions">
        <form className="global-search" onSubmit={submitSearch}>
          {searching ? <LoaderCircle className="spin" size={17} /> : <Search size={17} />}
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索题目、课程或知识点" aria-label="全局搜索" />
          <kbd>⌘K</kbd>
          {searchError && <span className="search-error">{searchError}</span>}
        </form>
        <button className="icon-button notification" aria-label="通知"><Bell size={19} /><span /></button>
      </div>
    </header>
  )
}
