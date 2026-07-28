import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Code2,
  Flame,
  Play,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import { problems, studyPlan } from '../data/mockData'

export default function Dashboard() {
  return (
    <div className="page dashboard-page">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={14} /> 今日训练</span>
          <h2>把复杂问题，<br />拆成清晰的每一步。</h2>
          <p>今日推荐：从基础题开始热身，再进入二分和动态规划专题。</p>
          <div className="hero-actions">
            <Link className="button button-light" to="/problems/A0101">
              开始训练 <ArrowRight size={17} />
            </Link>
            <button className="button button-ghost"><CalendarDays size={16} /> 调整计划</button>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="code-cube cube-one">for</div>
          <div className="code-cube cube-two">O(n)</div>
          <div className="code-cube cube-three">{'{ }'}</div>
          <div className="hero-score">
            <strong>12</strong>
            <span>连续训练日</span>
          </div>
        </div>
      </section>

      <section className="stat-grid">
        <article className="stat-card">
          <div className="stat-icon mint"><CheckCircle2 /></div>
          <div><span>已通过题目</span><strong>128</strong><small><TrendingUp size={13} /> 本周 +9</small></div>
        </article>
        <article className="stat-card">
          <div className="stat-icon violet"><Target /></div>
          <div><span>提交通过率</span><strong>67.4%</strong><small>高于 71% 学习者</small></div>
        </article>
        <article className="stat-card">
          <div className="stat-icon amber"><Flame /></div>
          <div><span>本周训练</span><strong>8.5h</strong><small>目标完成 82%</small></div>
        </article>
        <article className="stat-card">
          <div className="stat-icon coral"><CircleDot /></div>
          <div><span>当前段位</span><strong>普及+</strong><small>距提高组 320 XP</small></div>
        </article>
      </section>

      <div className="dashboard-columns">
        <section className="content-card recommended-card">
          <div className="section-heading">
            <div><span className="section-kicker">为你挑选</span><h3>推荐练习</h3></div>
            <Link to="/problems">全部题目 <ChevronRight size={16} /></Link>
          </div>
          <div className="compact-problem-list">
            {problems.slice(0, 4).map((problem, index) => (
              <Link to={`/problems/${problem.id}`} className="compact-problem" key={problem.id}>
                <span className="problem-index">0{index + 1}</span>
                <div className="problem-main">
                  <strong>{problem.title}</strong>
                  <span>{problem.tags.join(' · ')}</span>
                </div>
                <span className={`difficulty diff-${index}`}>{problem.difficulty}</span>
                <div className="pass-rate"><i style={{ width: `${problem.passRate}%` }} /><span>{problem.passRate}%</span></div>
                <ChevronRight size={17} />
              </Link>
            ))}
          </div>
        </section>

        <aside className="dashboard-side">
          <section className="content-card plan-card">
            <div className="section-heading">
              <div><span className="section-kicker">学习路径</span><h3>进行中的专题</h3></div>
            </div>
            <div className="study-plans">
              {studyPlan.map((item) => (
                <div className="study-plan" key={item.label}>
                  <div><strong>{item.label}</strong><span>{item.detail}</span></div>
                  <div className="progress-line"><i style={{ width: `${item.percent}%`, background: item.color }} /></div>
                </div>
              ))}
            </div>
            <Link className="text-link" to="/courses">查看课程中心 <ArrowRight size={15} /></Link>
          </section>

          <section className="ai-promo-card">
            <div className="ai-promo-icon"><Bot size={23} /></div>
            <span className="new-pill">ALGO AI</span>
            <h3>卡题了？让 AI 给你一点提示</h3>
            <p>支持题面截图、代码诊断与复杂度分析。</p>
            <Link to="/ai">立即提问 <ArrowRight size={15} /></Link>
            <Code2 className="ai-card-code" size={82} strokeWidth={1} />
          </section>
        </aside>
      </div>

      <section className="continue-course">
        <div className="course-cover course-cover-mini violet-cover"><span>G(V,E)</span></div>
        <div className="continue-info">
          <span className="section-kicker">继续学习</span>
          <h3>图论进阶 · 最短路算法优化</h3>
          <p>第 7 讲：Dijkstra 的堆优化与常见陷阱</p>
        </div>
        <div className="continue-progress"><span>课程进度 42%</span><div><i /></div></div>
        <button className="round-play" aria-label="继续播放"><Play size={19} fill="currentColor" /></button>
      </section>
    </div>
  )
}
