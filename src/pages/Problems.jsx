import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronRight, Circle, Filter, Search, SlidersHorizontal } from 'lucide-react'
import {
  categories as fallbackCategories,
  difficultyClass,
  difficultyLevels as fallbackDifficulties,
  problems as fallbackProblems,
} from '../data/problemCatalog'

export default function Problems() {
  const [activeCategory, setActiveCategory] = useState('全部题目')
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState('全部难度')
  const [catalog, setCatalog] = useState({
    categories: fallbackCategories,
    difficulties: fallbackDifficulties,
    problems: fallbackProblems,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    fetch('/api/problems')
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((data) => {
        if (!alive) return
        setCatalog({
          categories: data.categories?.length ? data.categories : fallbackCategories,
          difficulties: data.difficulties?.length ? data.difficulties : fallbackDifficulties,
          problems: data.problems?.length ? data.problems : fallbackProblems,
        })
        setError('')
      })
      .catch(() => {
        if (!alive) return
        setError('本地评测服务未启动，当前显示内置题库。')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const filtered = useMemo(() => catalog.problems.filter((problem) => {
    const searchText = `${problem.id}${problem.title}${problem.series}${problem.tags.join('')}`.toLowerCase()
    const matchesQuery = searchText.includes(query.trim().toLowerCase())
    const matchesCategory = activeCategory === '全部题目' || problem.series === activeCategory || problem.tags.includes(activeCategory)
    const matchesDifficulty = difficulty === '全部难度' || problem.difficulty === difficulty
    return matchesQuery && matchesCategory && matchesDifficulty
  }), [activeCategory, catalog.problems, difficulty, query])

  const judgedCount = catalog.problems.filter((problem) => problem.testPointCount || problem.sampleCount).length

  return (
    <div className="page problems-page">
      <section className="problem-banner">
        <div>
          <span className="eyebrow dark"><span className="live-dot" /> 训练题库</span>
          <h2>按算法系列推进，<br />每题都能提交评测。</h2>
          <p>题库按语言基础、搜索、动态规划、图论等系列组织，难度参考竞赛训练分层并做了本项目自己的调整。</p>
        </div>
        <div className="banner-metrics">
          <div><strong>{catalog.problems.length}</strong><span>原创题目</span></div>
          <div><strong>{catalog.categories.length}</strong><span>算法系列</span></div>
          <div><strong>{judgedCount}</strong><span>可评测题</span></div>
        </div>
      </section>

      {error && <div className="notice-bar">{error}</div>}

      <section className="category-strip">
        <button className={activeCategory === '全部题目' ? 'active' : ''} onClick={() => setActiveCategory('全部题目')}>
          <span className="category-number">ALL</span><strong>全部题目</strong><small>{catalog.problems.length}</small>
        </button>
        {catalog.categories.map((category) => (
          <button key={category.name} className={activeCategory === category.name ? 'active' : ''} onClick={() => setActiveCategory(category.name)}>
            <span className="category-number">{category.icon}</span><strong>{category.name}</strong><small>{category.count}</small>
          </button>
        ))}
      </section>

      <section className="content-card problem-table-card">
        <div className="table-tools">
          <label className="table-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索题号、标题或标签..." /></label>
          <div className="tool-select">
            <Filter size={15} />
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
              <option>全部难度</option>
              {catalog.difficulties.map((item) => <option key={item.name}>{item.name}</option>)}
            </select>
          </div>
          <span className="filter-button static"><SlidersHorizontal size={16} /> 按题号排序</span>
          <span className="result-count">{loading ? '正在加载题库...' : `共 ${filtered.length} 道题`}</span>
        </div>

        <div className="problem-table">
          <div className="problem-row table-head">
            <span>状态</span><span>题目</span><span>系列</span><span>难度</span><span>通过率</span><span>提交数</span><span />
          </div>
          {filtered.map((problem) => (
            <Link to={`/problems/${problem.id}`} className="problem-row" key={problem.id}>
              <span className={`status-mark ${problem.status === '通过' ? 'accepted' : problem.status ? 'tried' : ''}`}>
                {problem.status === '通过' ? <Check size={14} /> : <Circle size={13} />}
              </span>
              <span className="table-problem-title">
                <small>{problem.id}</small>
                <strong>{problem.title}</strong>
                <em>{problem.tags.slice(0, 3).map((tag) => <i key={tag}>{tag}</i>)}</em>
              </span>
              <span className="series-cell">{problem.series}</span>
              <span><i className={`difficulty-label ${difficultyClass(problem.difficulty)}`}>{problem.difficulty}</i></span>
              <span className="rate-cell"><span>{problem.passRate}%</span><i><b style={{ width: `${problem.passRate}%` }} /></i></span>
              <span className="submission-cell">{problem.submissions.toLocaleString()}</span>
              <ChevronRight size={17} />
            </Link>
          ))}
          {!filtered.length && <div className="empty-state"><Search size={28} /><strong>没有找到匹配的题目</strong><p>换个关键词或筛选条件试试。</p></div>}
        </div>
      </section>
    </div>
  )
}
