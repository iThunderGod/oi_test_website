import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, Globe2, RefreshCw, Trophy } from 'lucide-react'

function formatDate(seconds) {
  return seconds ? new Date(seconds * 1000).toLocaleString('en-US', { hour12: false }) : 'Date pending'
}

export default function CodeforcesContests() {
  const [contests, setContests] = useState([])
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async (force = false) => {
    setBusy(true)
    try {
      const response = force
        ? await fetch('/api/codeforces/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ days: 30 }) })
        : await fetch('/api/codeforces/contests')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`)
      setContests(data.contests || [])
      setError('')
      const health = await fetch('/api/codeforces/status').then((r) => r.json())
      setStatus(health)
    } catch (requestError) {
      setError(requestError.message || 'Unable to load Codeforces contests')
    } finally { setBusy(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="page cf-page">
      <section className="cf-hero">
        <div>
          <span className="eyebrow dark"><span className="live-dot" /> CODEFORCES ARCHIVE</span>
          <h2>Recent contests,<br />organized for practice.</h2>
          <p>Contest metadata is synced daily. Select a contest to open its original English problem statements and local practice workspace.</p>
        </div>
        <div className="cf-hero-icon"><Globe2 size={76} strokeWidth={1.1} /></div>
      </section>
      <div className="cf-toolbar">
        <div><strong>Recent 30-day contests</strong><span>{status?.syncedAt ? `Last sync ${new Date(status.syncedAt).toLocaleString('en-US', { hour12: false })}` : 'Daily sync and translation cache enabled'}</span>{status && <small>{status.translationCount || 0} Chinese statements cached · {status.readyTestPackCount || 0}/{status.problemCount || 0} verified 20-point judge packs · {status.generatingTestPackCount || 0} generating · {status.incompleteMetadataCount || 0} metadata pending · {status.pendingStatementCount || 0} statements pending</small>}</div>
        <button className="button button-light cf-refresh" onClick={() => load(true)} disabled={busy}><RefreshCw size={15} className={busy ? 'spin' : ''} /> {busy ? 'Syncing…' : 'Sync now'}</button>
      </div>
      {error && <div className="notice-bar">{error}</div>}
      <section className="cf-contest-grid">
        {contests.map((contest) => (
          <Link to={`/codeforces/contests/${contest.id}`} className="cf-contest-card" key={contest.id}>
            <div className="cf-contest-top"><span className="cf-contest-id">CF #{contest.id}</span><Trophy size={19} /></div>
            <h3>{contest.name}</h3>
            <div className="cf-contest-meta"><span><CalendarDays size={14} /> {formatDate(contest.startTimeSeconds)}</span><span>{contest.passedCount || 0}/{contest.totalProblemCount || contest.problems?.length || 0} solved</span></div>
            <div className="cf-contest-footer"><span>{contest.phase || 'ARCHIVED'}</span><ChevronRight size={16} /></div>
          </Link>
        ))}
        {!busy && !contests.length && <div className="empty-state"><Trophy size={30} /><strong>No contests found in the last 7 days</strong><p>Try Sync now to refresh the Codeforces archive.</p></div>}
      </section>
    </div>
  )
}
