import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, CheckCircle2, ExternalLink, FileText, Play, RotateCcw, Send, Sparkles, XCircle } from 'lucide-react'
import AlgorithmTags from '../components/AlgorithmTags'
import EditorialPanel from '../components/EditorialPanel'
import CppEditor from '../components/CppEditor'

const starter = '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    return 0;\n}'
const verdictLabel = { AC: 'Accepted', WA: 'Wrong Answer', TLE: 'Time Limit Exceeded', RE: 'Runtime Error', CE: 'Compile Error' }

export default function CodeforcesProblem() {
  const { contestId, index } = useParams()
  const id = `CF-${contestId}-${index}`
  const [problem, setProblem] = useState(null)
  const [code, setCode] = useState(starter)
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [busy, setBusy] = useState('')
  const [translated, setTranslated] = useState(null)
  const [translationError, setTranslationError] = useState('')
  const [tab, setTab] = useState('statement')
  const [consoleTab, setConsoleTab] = useState('result')
  const lineCount = Math.max(16, code.split('\n').length)

  useEffect(() => {
    fetch(`/api/codeforces/problems/${contestId}/${index}`).then((r) => r.json()).then((data) => {
      setProblem(data.problem)
      setTranslated(data.problem?.translatedStatement || null)
      setInput(data.problem?.statement?.samples?.[0]?.input || '')
    })
    fetch(`/api/judge/submissions?problemId=${encodeURIComponent(id)}`).then((r) => r.json()).then((data) => {
      const history = Array.isArray(data.submissions) ? data.submissions : []
      setSubmissions(history)
      if (history[0]) {
        setResult((current) => current || history[0])
        if (history[0].code) setCode(history[0].code)
      }
    }).catch(() => setSubmissions([]))
  }, [contestId, index])

  // Keep the original English statement as the source of truth. The cached
  // Chinese version is rendered only in the translation tab.
  const statement = problem?.statement
  const run = async (mode) => {
    setBusy(mode); setResult(null)
    try {
      const response = await fetch(mode === 'submit' ? '/api/judge/submissions' : '/api/judge/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemId: id, code, ...(mode === 'sample' ? { customInput: statement?.samples?.[0]?.input || '', expectedOutput: statement?.samples?.[0]?.output || '' } : {}), ...(mode === 'custom' ? { customInput: input } : {}) }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`)
      setResult(data.submission ? { ...data, ...data.submission } : data)
      if (mode === 'submit') {
        const history = await fetch(`/api/judge/submissions?problemId=${encodeURIComponent(id)}`).then((r) => r.json()).then((data) => data.submissions || []).catch(() => [])
        setSubmissions(history)
      }
      setConsoleTab('result')
    } catch (error) { setResult({ verdict: 'CE', message: error.message, cases: [] }) } finally { setBusy('') }
  }
  const translate = async () => {
    if (translated) {
      setTab('translation')
      return
    }
    setTranslationError('')
    try {
      const response = await fetch('/api/codeforces/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemId: id }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error?.message || data.message || `HTTP ${response.status}`)
      if (data.translation) {
        setTranslated(data.translation)
        setTab('translation')
      }
      else setTranslationError(data.message || 'AI translation is not configured; English remains available.')
    } catch (error) { setTranslationError(error.message || 'Translation unavailable') }
  }
  if (!problem) return <div className="page"><div className="content-card cf-loading">Loading problem…</div></div>
  return (
    <div className="cf-workspace-page">
      <div className="cf-problem-toolbar"><Link to={`/codeforces/contests/${contestId}`}><ArrowLeft size={16} /> Back to {problem.contestName}</Link><div><strong>{index}. {problem.name}</strong><span>Rating {problem.rating || '—'} · {problem.limitMs} ms · {problem.memoryMb} MB</span></div><a href={problem.statement.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Codeforces</a></div>
      <div className="cf-workspace-grid">
        <article className="content-card cf-statement-pane">
          <div className="cf-statement-tabs"><button className={tab === 'statement' ? 'active' : ''} onClick={() => setTab('statement')}>English statement</button><button className={tab === 'translation' ? 'active' : ''} onClick={() => setTab('translation')} disabled={!translated}>中文翻译</button><button className={tab === 'editorial' ? 'active' : ''} onClick={() => setTab('editorial')}>题解</button><button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>提交记录{` (${submissions.length})`}</button><AlgorithmTags tags={problem.tags} compact /><button className="cf-translate-btn" onClick={translate}><Sparkles size={14} /> {translated ? '已缓存中文' : '显示中文'}</button></div>
          {translationError && <div className="cf-translation-note"><AlertTriangle size={15} /> {translationError}</div>}
          {tab === 'editorial' ? <EditorialPanel problemId={id} active={tab === 'editorial'} /> : tab === 'history' ? <CodeforcesSubmissionHistory submissions={submissions} onUseCode={setCode} /> : tab === 'translation' && translated ? <StatementContent statement={translated} /> : <StatementContent statement={statement} />}
        </article>
        <section className="content-card cf-editor-pane">
          <div className="cf-editor-head"><span>C++17</span><span>main.cpp</span><button onClick={() => setCode(starter)} aria-label="Reset code"><RotateCcw size={15} /></button></div>
          <div className="cf-code-editor-wrap"><CppEditor value={code} onChange={setCode} lineCount={lineCount} className="cf-cpp-editor" /></div>
          <div className="cf-console">
            <div className="cf-console-tabs"><button className={consoleTab === 'result' ? 'active' : ''} onClick={() => setConsoleTab('result')}>Test result</button><button className={consoleTab === 'input' ? 'active' : ''} onClick={() => setConsoleTab('input')}>Custom input</button><button className="cf-load-sample" onClick={() => { setInput(statement?.samples?.[0]?.input || ''); setConsoleTab('input') }}><FileText size={13} /> Load sample</button></div>
            {consoleTab === 'input' ? <textarea className="cf-custom-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Custom input" /> : <div className="cf-result-scroll">{busy && <div className="cf-empty-result"><span className="loading-spinner" />{busy === 'submit' ? 'Submitting and judging…' : 'Compiling and running…'}</div>}{!busy && !result && <div className="cf-empty-result"><Play size={18} />Run the sample or submit code to see results.</div>}{!busy && result && <div className={`cf-result ${result.verdict}`}><div className="cf-result-summary">{result.verdict === 'AC' ? <CheckCircle2 size={17} /> : result.verdict === 'CE' ? <AlertTriangle size={17} /> : <XCircle size={17} />}<strong>{verdictLabel[result.verdict] || result.verdict}</strong><span>{result.message}</span><b>{result.score ?? 0}/{result.totalScore ?? 100}</b></div>{result.compileOutput && <pre>{result.compileOutput}</pre>}{result.stdout && <pre>{result.stdout}</pre>}{result.cases?.map((item, i) => <p key={`${item.name}-${i}`}><span>{item.name}</span><b>{item.status}</b><small>{item.timeMs || 0} ms</small></p>)}</div>}</div>}
          </div>
          <div className="cf-editor-actions"><button className="button button-light" onClick={() => run('sample')} disabled={Boolean(busy) || !(statement?.samples?.length)}><Play size={15} /> {busy === 'sample' ? 'Running sample…' : 'Run sample'}</button><button className="button button-light" onClick={() => { if (!input.trim()) setInput(statement?.samples?.[0]?.input || ''); setConsoleTab('input'); }} disabled={Boolean(busy)}><FileText size={15} /> {input.trim() ? 'Edit input' : 'Load sample'}</button><button className="button button-light" onClick={() => run('custom')} disabled={Boolean(busy)}><Play size={15} /> {busy === 'custom' ? 'Running…' : 'Self-test'}</button><button className="button cf-submit" onClick={() => run('submit')} disabled={Boolean(busy) || !problem.localJudgeReady}><Send size={15} /> {problem.localJudgeReady ? (busy === 'submit' ? 'Submitting…' : 'Submit locally') : 'Submit unavailable'}</button></div>
        </section>
      </div>
    </div>
  )
}

function StatementContent({ statement }) {
  if (!statement) return <div className="cf-loading">Statement pending</div>
  return <div className="cf-statement-content"><div className="cf-availability">{statement.available ? 'Cached from Codeforces' : 'Statement pending'} <span className="cf-source-links"><a href={statement.sourceUrl} target="_blank" rel="noreferrer">Codeforces</a>{statement.mirrorUrls?.[0] && <a href={statement.mirrorUrls[0]} target="_blank" rel="noreferrer">Mirror</a>}</span></div><h1>{statement.title || ''}</h1>{statement.description?.map((part, index) => <div className="cf-statement-paragraph" key={`${index}-${part.slice(0, 24)}`}>{renderFormattedText(part)}</div>)}<h3>Input</h3><div className="cf-statement-paragraph">{renderFormattedText(statement.input)}</div><h3>Output</h3><div className="cf-statement-paragraph">{renderFormattedText(statement.output)}</div>{statement.constraints?.length > 0 && <><h3>Constraints</h3><ul>{statement.constraints.map((item) => <li key={item}>{renderFormattedText(item)}</li>)}</ul></>}{statement.samples?.length > 0 && <><h3>Samples</h3>{statement.samples.map((sample, i) => <div className="cf-sample" key={i}><div><b>Input</b><pre>{sample.input}</pre></div><div><b>Output</b><pre>{sample.output}</pre></div></div>)}</>}{statement.note && <div className="cf-note"><strong>Note</strong><div>{renderFormattedText(statement.note)}</div></div>}</div>
}

function CodeforcesSubmissionHistory({ submissions, onUseCode }) {
  if (!submissions.length) return <div className="editorial-loading"><FileText size={22} /><strong>暂无提交记录</strong><span>提交代码后，历史结果会保存在这里。</span></div>
  return <div className="cf-submission-history">{submissions.map((submission) => <CodeforcesSubmissionItem key={submission.id} submission={submission} onUseCode={onUseCode} />)}</div>
}

function CodeforcesSubmissionItem({ submission, onUseCode }) {
  const [expanded, setExpanded] = useState(false)
  return <article className={`cf-submission-item ${expanded ? 'expanded' : ''}`}><button type="button" className="cf-submission-summary" onClick={() => setExpanded((value) => !value)}><span><strong className={`verdict ${submission.verdict}`}>{verdictLabel[submission.verdict] || submission.verdict}</strong><span>{submission.id}</span></span><span><span>{submission.score ?? '—'}/{submission.totalScore ?? '—'}</span><span>{submission.passed ?? '—'}/{submission.total ?? '—'} test points</span><span>{submission.timeMs || 0} ms</span><span>{submission.createdAt ? new Date(submission.createdAt).toLocaleString('zh-CN', { hour12: false }) : ''}</span></span></button>{expanded && <div className="cf-submission-details"><div className="submission-detail-actions"><strong>提交代码</strong><button type="button" onClick={() => onUseCode(submission.code || '')} disabled={!submission.code}>替换当前编辑器代码</button></div>{submission.code ? <pre className="submission-code"><code>{submission.code}</code></pre> : <p>该历史记录没有保存代码。</p>}{submission.compileOutput && <pre>{submission.compileOutput}</pre>}{submission.cases?.length > 0 && <div className="submission-cases">{submission.cases.map((item, index) => <span key={`${item.name}-${index}`}>{item.name}: {item.status}</span>)}</div>}</div>}</article>
}

function renderFormattedText(value) {
  const text = String(value || '')
  const tokens = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])/g).filter(Boolean)
  return tokens.map((token, index) => {
    const isMath = /^(\$\$|\$|\\\(|\\\[)/.test(token)
    if (!isMath) return <span key={index}>{token.split('\n').map((line, lineIndex) => <span key={lineIndex}>{line}{lineIndex < token.split('\n').length - 1 && <br />}</span>)}</span>
    const expression = token.replace(/^\$\$?|\$\$?$|^\\\(|\\\)$|^\\\[|\\\]$/g, '').trim()
    const block = token.startsWith('$$') || token.startsWith('\\[')
    return block ? <div className="cf-math-block" key={index}>{normalizeMath(expression)}</div> : <span className="cf-math-inline" key={index}>{normalizeMath(expression)}</span>
  })
}

function normalizeMath(value) {
  return String(value || '')
    .replace(/\\(?:text|textbf|textit|operatorname|mathrm|mathbf|mathit|mathtt)\{([^{}]*)\}/g, '$1')
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^{}]*)\}/g, '√($1)')
    .replace(/\\leq?|\\le/g, '≤').replace(/\\geq?|\\ge/g, '≥').replace(/\\neq/g, '≠')
    .replace(/\\cdot/g, '·').replace(/\\times/g, '×').replace(/\\oplus/g, '⊕')
    .replace(/\\lceil/g, '⌈').replace(/\\rceil/g, '⌉').replace(/\\lfloor/g, '⌊').replace(/\\rfloor/g, '⌋')
    .replace(/\\left|\\right|\\,/g, '').replace(/\\([a-zA-Z]+)/g, '$1').replace(/[{}]/g, '')
    .replace(/\^\{([^{}]*)\}/g, '^$1').replace(/_\{([^{}]*)\}/g, '_$1')
}
