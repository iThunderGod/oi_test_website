import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code2,
  Copy,
  FileText,
  Maximize2,
  MessageSquareText,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { difficultyClass, findProblem, problems as fallbackProblems } from '../data/problemCatalog'
import AlgorithmTags from '../components/AlgorithmTags'
import EditorialPanel from '../components/EditorialPanel'
import CppEditor from '../components/CppEditor'

const starterCode = `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // 在这里编写你的代码

    return 0;
}`

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

function verdictLabel(verdict) {
  return {
    AC: 'Accepted',
    WA: 'Wrong Answer',
    TLE: 'Time Limit Exceeded',
    RE: 'Runtime Error',
    CE: 'Compile Error',
  }[verdict] || verdict || 'Waiting'
}

function statusIcon(status) {
  if (status === 'AC') return <CheckCircle2 size={18} />
  if (status === 'CE') return <AlertTriangle size={18} />
  if (status === 'WA' || status === 'RE' || status === 'TLE') return <XCircle size={18} />
  return <AlertTriangle size={18} />
}

export default function ProblemDetail() {
  const { id } = useParams()
  const fallback = useMemo(() => findProblem(id) || fallbackProblems[0], [id])
  const [problem, setProblem] = useState(fallback)
  const [tab, setTab] = useState('题目描述')
  const [code, setCode] = useState(starterCode)
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState('')
  const [submissions, setSubmissions] = useState([])
  const [judgeHealth, setJudgeHealth] = useState(null)
  const [customInput, setCustomInput] = useState(fallback.samples?.[0]?.input || '')
  const [consoleTab, setConsoleTab] = useState('测试结果')
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setProblem(fallback)
    setCustomInput(fallback.samples?.[0]?.input || '')
    setResult(null)
    setError('')

    fetch(`/api/problems/${encodeURIComponent(id)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((data) => {
        if (alive && data.problem) {
          setProblem(data.problem)
          setCustomInput(data.problem.samples?.[0]?.input || '')
        }
      })
      .catch(() => {
        if (alive) setError('本地服务未启动，当前显示内置题面，评测不可用。')
      })

    fetch('/api/judge/health')
      .then((response) => response.json())
      .then((data) => {
        if (alive) setJudgeHealth(data)
      })
      .catch(() => {
        if (alive) setJudgeHealth({ compilerAvailable: false, message: '无法连接本地评测服务。' })
      })

    refreshSubmissions(() => alive)
    return () => {
      alive = false
    }
  }, [fallback, id])

  const refreshSubmissions = (canUpdate = () => true) => {
    fetch(`/api/judge/submissions?problemId=${encodeURIComponent(id)}`)
      .then((response) => response.json())
      .then((data) => {
        if (canUpdate()) {
          const history = Array.isArray(data.submissions) ? data.submissions : []
          setSubmissions(history)
          if (history[0]) {
            setResult((current) => current || history[0])
            if (history[0].code) setCode(history[0].code)
          }
        }
      })
      .catch(() => {
        if (canUpdate()) setSubmissions([])
      })
  }

  const lineCount = Math.max(16, code.split('\n').length)

  const runCode = async (mode) => {
    setBusy(mode)
    setError('')
    setResult(null)
    try {
      const response = await fetch(mode === 'submit' ? '/api/judge/submissions' : '/api/judge/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          code,
          ...(mode === 'custom' ? { customInput } : {}),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`)
      setResult(data.submission ? { ...data, ...data.submission } : data)
      if (mode === 'submit') {
        setTab('提交记录')
        refreshSubmissions()
      }
    } catch (requestError) {
      setError(requestError.message || '评测请求失败。')
      setResult({ verdict: 'CE', message: requestError.message || '评测请求失败。', cases: [] })
    } finally {
      setBusy('')
    }
  }

  const copyText = (text) => {
    navigator.clipboard?.writeText(text).catch(() => {})
  }

  return (
    <div className="problem-detail-page">
      <div className="detail-toolbar">
        <Link to="/problems"><ArrowLeft size={17} /> 返回题库</Link>
        <div className="problem-identity"><span>{problem.id}</span><strong>{problem.title}</strong><i className={`difficulty-label ${difficultyClass(problem.difficulty)}`}>{problem.difficulty}</i></div>
        <div className="detail-stats">
          <span>系列 <strong>{problem.series}</strong></span>
          <span>测试点 <strong>{problem.testPointCount || problem.samples?.length || 0}</strong></span>
          <span>通过率 <strong>{problem.passRate}%</strong></span>
        </div>
      </div>

      <div className="workspace">
        <section className="statement-pane">
          <div className="pane-tabs">
            {['题目描述', '题解', '提交记录', '讨论'].map((item) => (
              <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>
            ))}
          </div>

          {tab === '题目描述' ? (
            <article className="problem-statement">
              <div className="statement-meta">
                <span><Clock3 size={14} /> {problem.limitMs} ms</span>
                <span><Code2 size={14} /> {problem.memoryMb} MB</span>
                <span><FileText size={14} /> {problem.type}</span>
              </div>
              <h2>{problem.title}</h2>
              <div className="detail-algorithm-tags"><AlgorithmTags tags={problem.tags} /></div>
              <h3>题目描述</h3>
              {problem.statement.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <div className="statement-callout"><Sparkles size={17} /><p><strong>思考</strong> {problem.statement.hint}</p></div>
              <h3>输入格式</h3>
              <p>{problem.statement.input}</p>
              <h3>输出格式</h3>
              <p>{problem.statement.output}</p>
              <h3>数据范围</h3>
              <ul className="constraint-list">{problem.statement.constraints.map((item) => <li key={item}>{item}</li>)}</ul>
              <h3>样例</h3>
              <div className="sample-grid">
                {problem.samples.map((sample, index) => (
                  <div className="sample-pair" key={`${problem.id}-${index}`}>
                    <div><strong>样例输入 {index + 1}</strong><button onClick={() => copyText(sample.input)} aria-label="复制样例输入"><Copy size={14} /></button></div>
                    <pre>{sample.input}</pre>
                    <div><strong>样例输出 {index + 1}</strong><button onClick={() => copyText(sample.output)} aria-label="复制样例输出"><Copy size={14} /></button></div>
                    <pre>{sample.output}</pre>
                  </div>
                ))}
              </div>
              {problem.statement.sampleExplanation && <div className="sample-explanation"><strong>样例说明</strong><p>{problem.statement.sampleExplanation}</p></div>}
              {problem.statement.solutionOutline && (
                <div className="solution-outline">
                  <strong>建模提示与目标复杂度</strong>
                  <p>{problem.statement.solutionOutline}</p>
                  <code>{problem.statement.targetComplexity}</code>
                </div>
              )}
              <div className="local-warning">
                <AlertTriangle size={16} />
                <span>本地评测会直接运行 C++ 程序，只适合个人开发测试；不要提交不可信代码。</span>
              </div>
            </article>
          ) : tab === '题解' ? (
            <EditorialPanel problemId={problem.id} active={tab === '题解'} />
          ) : tab === '提交记录' ? (
            <div className="submission-history">
              <div className="history-head"><strong>本题提交记录</strong><span>{submissions.length} 条</span></div>
              {submissions.map((submission) => <SubmissionHistoryItem key={submission.id} submission={submission} onUseCode={setCode} />)}
              {!submissions.length && <div className="tab-placeholder"><FileText size={32} /><h3>暂无提交记录</h3><p>提交一次完整评测后，会在这里显示每次得分和测试点状态。</p></div>}
            </div>
          ) : (
            <div className="tab-placeholder">
              <MessageSquareText size={32} />
              <h3>讨论区暂未开放</h3><p>当前先完成题库和本地评测流程，讨论功能后续再接入。</p>
            </div>
          )}
        </section>

        <section className="editor-pane">
          <div className="editor-toolbar">
            <div className="language-select">C++17 <ChevronDown size={14} /></div>
            <span>main.cpp</span>
            <button onClick={() => setCode(starterCode)} aria-label="重置代码"><RotateCcw size={15} /></button>
            <button aria-label="全屏"><Maximize2 size={15} /></button>
          </div>
          <div className="code-editor-wrap"><CppEditor value={code} onChange={setCode} lineCount={lineCount} ariaLabel="C++17 代码编辑器" /></div>
          <div className="console-panel">
            <div className="console-tabs">
              <button className={consoleTab === '测试结果' ? 'active' : ''} onClick={() => setConsoleTab('测试结果')}>测试结果</button>
              <button className={consoleTab === '自定义输入' ? 'active' : ''} onClick={() => setConsoleTab('自定义输入')}>自定义输入</button>
            </div>
            {consoleTab === '自定义输入' ? (
              <textarea className="custom-input" value={customInput} onChange={(event) => setCustomInput(event.target.value)} />
            ) : (
              <div className={`judge-result ${result?.verdict || ''}`}>
                {!result && !busy && (
                  <div className="judge-empty">
                    <Play size={20} />
                    <span>{judgeHealth?.compilerAvailable === false ? judgeHealth.message : '运行样例或提交评测后，将在这里显示结果。'}</span>
                  </div>
                )}
                {busy && <div className="judge-empty"><span className="loading-spinner" /><span>{busy === 'submit' ? '正在完整评测...' : '正在编译并运行...'}</span></div>}
                {result && !busy && (
                  <div className="judge-report">
                    <div className="judge-summary">
                      {statusIcon(result.verdict)}
                      <div>
                        <strong>{verdictLabel(result.verdict)}</strong>
                        <span>{result.message || `得分 ${result.score}/${result.totalScore}`}</span>
                      </div>
                      <b>{result.score ?? 0}/{result.totalScore ?? 100}</b>
                    </div>
                    {result.compileOutput && <pre className="compile-output">{result.compileOutput}</pre>}
                    {result.stdout && <pre className="compile-output">{result.stdout}</pre>}
                    <div className="case-list">
                      {(result.cases || []).map((item, index) => (
                        <div className={`case-item ${item.status}`} key={`${item.name}-${index}`}>
                          <span>{item.name}</span><strong>{item.status}</strong><em>{item.score} 分</em><i>{item.timeMs || 0} ms</i>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {error && <div className="editor-error"><AlertTriangle size={15} /> {error}</div>}
          <div className="editor-actions">
            <Link to="/ai" className="ask-ai"><Sparkles size={16} /> 问问算法 AI</Link>
            <button className="button run-button" onClick={() => runCode('sample')} disabled={Boolean(busy)}><Play size={16} /> 运行样例</button>
            <button className="button run-button" onClick={() => runCode('custom')} disabled={Boolean(busy)}><Play size={16} /> 自测</button>
            <button className="button submit-button" onClick={() => runCode('submit')} disabled={Boolean(busy)}><Send size={16} /> 提交评测</button>
          </div>
        </section>
      </div>
    </div>
  )
}

function SubmissionHistoryItem({ submission, onUseCode }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <article className={`submission-item ${expanded ? 'expanded' : ''}`}>
      <button type="button" className="submission-summary" onClick={() => setExpanded((value) => !value)}>
        <span><strong className={`verdict ${submission.verdict}`}>{verdictLabel(submission.verdict)}</strong><span>{submission.id}</span></span>
        <span><span>{submission.score ?? '—'}/{submission.totalScore ?? '—'} 分</span><span>{submission.passed ?? '—'}/{submission.total ?? '—'} 测试点</span><span>{submission.timeMs || 0} ms</span><span>{formatDate(submission.createdAt)}</span></span>
      </button>
      {expanded && <div className="submission-details"><div className="submission-detail-actions"><strong>提交代码</strong><button type="button" onClick={() => onUseCode(submission.code || '')} disabled={!submission.code}>替换当前编辑器代码</button></div>{submission.code ? <pre className="submission-code"><code>{submission.code}</code></pre> : <p>该历史记录没有保存代码。</p>}{submission.compileOutput && <><strong>编译输出</strong><pre>{submission.compileOutput}</pre></>}{submission.cases?.length > 0 && <div className="submission-cases">{submission.cases.map((item, index) => <span key={`${item.name}-${index}`}>{item.name}: {item.status}</span>)}</div>}</div>}
    </article>
  )
}
