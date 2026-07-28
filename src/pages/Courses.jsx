import { useState } from 'react'
import { ArrowRight, BookOpen, Check, Clock3, GraduationCap, Play, ShieldCheck, Star, Users } from 'lucide-react'
import { courses } from '../data/mockData'
import Modal from '../components/Modal'

export default function Courses() {
  const [activeCategory, setActiveCategory] = useState('全部课程')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const categories = ['全部课程', '基础算法', '动态规划', '数据结构', '图论', '数学', '字符串']
  const filtered = activeCategory === '全部课程' ? courses : courses.filter((course) => course.category === activeCategory)

  return (
    <div className="page courses-page">
      <section className="courses-hero">
        <div className="course-hero-copy">
          <span className="eyebrow dark">系统化学习路径</span>
          <h2>不只学会一道题，<br />而是真正掌握一类题。</h2>
          <p>由竞赛教练精心设计，从核心概念、经典模型到真题实战，帮你构建完整的算法知识体系。</p>
          <div className="hero-trust"><span><Check /> 专题永久回看</span><span><Check /> 配套练习题单</span><span><Check /> 学习答疑社区</span></div>
        </div>
        <div className="course-hero-art" aria-hidden="true">
          <div className="book-stack book-one"><span>DATA<br />STRUCTURE</span></div>
          <div className="book-stack book-two"><span>GRAPH<br />THEORY</span></div>
          <div className="book-stack book-three"><span>DYNAMIC<br />PROGRAMMING</span></div>
          <div className="floating-formula">O(n log n)</div>
          <div className="floating-play"><Play size={23} fill="currentColor" /></div>
        </div>
      </section>

      <div className="course-filter-row">
        <div className="course-categories">
          {categories.map((category) => <button className={activeCategory === category ? 'active' : ''} onClick={() => setActiveCategory(category)} key={category}>{category}</button>)}
        </div>
        <span>{filtered.length} 个专题课程</span>
      </div>

      <section className="course-grid">
        {filtered.map((course) => (
          <article className="course-card" key={course.id}>
            <div className={`course-cover ${course.accent}-cover`}>
              <span className="cover-category">{course.category}</span>
              <strong>{course.symbol}</strong>
              <div className="cover-grid" />
              <button aria-label={`试听 ${course.title}`}><Play size={18} fill="currentColor" /></button>
            </div>
            <div className="course-body">
              <div className="course-level"><span>{course.level}</span><em><Star size={13} fill="currentColor" /> 4.9</em></div>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-meta"><span><BookOpen size={14} /> {course.lessons} 讲</span><span><Clock3 size={14} /> {course.hours} 小时</span><span><Users size={14} /> {course.students}</span></div>
              <div className="course-footer">
                <div><strong>¥{course.price}</strong><del>¥{course.originalPrice}</del></div>
                <button onClick={() => setSelectedCourse(course)}>查看课程 <ArrowRight size={15} /></button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {!filtered.length && <div className="empty-courses"><GraduationCap size={36} /><h3>这个分类的课程正在制作中</h3><p>先看看其他专题，更多内容即将上线。</p></div>}

      <section className="teacher-banner">
        <div className="teacher-avatar"><span>林</span></div>
        <div><span className="section-kicker">本周公开课</span><h3>如何建立动态规划的状态设计直觉？</h3><p>周六 20:00 · 林栩教练在线直播答疑</p></div>
        <button className="button">预约直播 <ArrowRight size={16} /></button>
      </section>

      <Modal open={Boolean(selectedCourse)} onClose={() => setSelectedCourse(null)} title="确认课程">
        {selectedCourse && <div className="purchase-content">
          <div className={`purchase-cover ${selectedCourse.accent}-cover`}><span>{selectedCourse.symbol}</span></div>
          <div className="purchase-info"><span>{selectedCourse.category} · {selectedCourse.level}</span><h4>{selectedCourse.title}</h4><p>讲师：{selectedCourse.teacher}</p></div>
          <div className="purchase-benefits"><span><Check /> {selectedCourse.lessons} 节完整课程</span><span><Check /> 配套题单与解析</span><span><ShieldCheck /> 支付功能将在后端接入后开放</span></div>
          <div className="purchase-total"><span>课程价格</span><strong>¥{selectedCourse.price}</strong></div>
          <button className="button purchase-button" onClick={() => setSelectedCourse(null)}>我知道了（前端演示）</button>
        </div>}
      </Modal>
    </div>
  )
}
