import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight, ExternalLink } from 'lucide-react'
import AlgorithmTags from '../components/AlgorithmTags'
import ProblemStatusIcon from '../components/ProblemStatusIcon'

export default function CodeforcesContest() {
  const { contestId } = useParams()
  const [contest, setContest] = useState(null)
  const [verdicts, setVerdicts] = useState({})
  const [error, setError] = useState('')
  useEffect(() => {
    fetch(`/api/codeforces/contests/${contestId}`).then(async (response) => {
      const data = await response.json()
      if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`)
      setContest(data.contest)
      setVerdicts(data.verdicts || {})
    }).catch((requestError) => setError(requestError.message || 'Contest unavailable'))
  }, [contestId])
  if (error) return <div className="page"><div className="notice-bar">{error}</div></div>
  if (!contest) return <div className="page"><div className="content-card cf-loading">Loading contest…</div></div>
  return (
    <div className="page cf-page">
      <Link className="cf-back" to="/codeforces"><ArrowLeft size={16} /> Back to contests</Link>
      <section className="content-card cf-contest-heading"><div><span className="section-kicker">CODEFORCES CONTEST #{contest.id}</span><h2>{contest.name}</h2><p>{contest.phase} · {contest.problems.length} problems · English original statements</p></div><a className="button button-light" href={`https://codeforces.com/contest/${contest.id}`} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Official contest</a></section>
      <section className="content-card cf-problem-list">
        <div className="cf-list-head"><span>Status</span><span>Index</span><span>Problem</span><span>Rating</span><span>Algorithms</span><span /></div>
        {contest.problems.map((problem) => (
          <Link className="cf-problem-row" key={problem.index} to={`/codeforces/contests/${contest.id}/problems/${problem.index}`}>
            <ProblemStatusIcon verdict={verdicts[`CF-${contest.id}-${problem.index}`]} /><strong className="cf-index">{problem.index}</strong><span><b>{problem.name}</b><small>{problem.localJudgeReady ? `${problem.testPointCount} test points · ${problem.largeTestPointCount} large` : problem.statementAvailable ? 'Statement cached · 20-point judge pack generating' : 'Statement pending · source link available'}</small></span><em>{problem.rating || (problem.metadataComplete ? 'Unrated' : 'Rating pending')}</em><AlgorithmTags tags={problem.tags} compact stopNavigation /><ChevronRight size={17} />
          </Link>
        ))}
      </section>
    </div>
  )
}
