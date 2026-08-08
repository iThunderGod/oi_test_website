import { useEffect, useState } from 'react'
import { BookOpenText, Check, Copy, LoaderCircle } from 'lucide-react'

export default function EditorialPanel({ problemId, active = true }) {
  const [editorials, setEditorials] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  useEffect(() => {
    if (!active || !problemId) return
    let alive = true
    setEditorials([])
    setLoading(true)
    setError('')
    fetch(`/api/problems/${encodeURIComponent(problemId)}/editorials`)
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`)
        return data
      })
      .then((data) => { if (alive) setEditorials(Array.isArray(data.editorials) ? data.editorials : []) })
      .catch((requestError) => { if (alive) setError(requestError.message || '题解暂时无法加载。') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [active, problemId])

  const copyCode = (code, key) => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(key)
      window.setTimeout(() => setCopied(''), 1200)
    }).catch(() => {})
  }

  if (loading) return <div className="editorial-loading"><LoaderCircle className="spin" size={22} /><strong>正在整理中文题解…</strong><span>首次打开会生成并缓存，之后可直接读取。</span></div>
  if (error) return <div className="editorial-error"><BookOpenText size={22} /><strong>题解加载失败</strong><span>{error}</span></div>
  if (!editorials.length) return <div className="editorial-loading"><BookOpenText size={22} /><strong>暂无题解</strong></div>

  return (
    <div className="editorial-list">
      <div className="editorial-intro"><BookOpenText size={20} /><div><strong>本题题解</strong><span>只将算法本质明显不同的方案拆分为多种做法。</span></div></div>
      {editorials.map((editorial, index) => {
        const key = `${problemId}-${index}`
        return (
          <article className="editorial-card" key={key}>
            <h2>{editorial.title || `做法 ${index + 1}`}</h2>
            <section><h3>算法思想</h3><p>{editorial.idea}</p></section>
            <section><h3>具体算法过程</h3><ol>{(editorial.process || []).map((step, stepIndex) => <li key={stepIndex}>{step}</li>)}</ol></section>
            <section><h3>复杂度分析</h3><p className="editorial-complexity">{editorial.complexity}</p></section>
            <section>
              <div className="editorial-code-head"><h3>完整 C++17 代码</h3>{editorial.code && <button type="button" onClick={() => copyCode(editorial.code, key)}>{copied === key ? <Check size={14} /> : <Copy size={14} />}{copied === key ? '已复制' : '复制代码'}</button>}</div>
              {editorial.code ? <pre className="editorial-code"><code>{editorial.code}</code></pre> : <p className="editorial-code-pending">完整代码正在补充中。</p>}
            </section>
          </article>
        )
      })}
    </div>
  )
}
