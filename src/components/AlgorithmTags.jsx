import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function AlgorithmTags({ tags = [], compact = false, stopNavigation = false }) {
  const [visible, setVisible] = useState(false)
  if (!tags.length) return null

  const toggle = (event) => {
    if (stopNavigation) {
      event.preventDefault()
      event.stopPropagation()
    }
    setVisible((value) => !value)
  }

  return (
    <span className={`algorithm-tags ${compact ? 'compact' : ''} ${visible ? 'visible' : ''}`}>
      <button type="button" className="algorithm-tags-toggle" onClick={toggle} aria-label={visible ? '隐藏算法标签' : '查看算法标签'} title={visible ? '隐藏算法标签' : '查看算法标签'}>
        {visible ? <EyeOff size={compact ? 14 : 16} /> : <Eye size={compact ? 14 : 16} />}
        {!compact && <span>{visible ? '隐藏算法标签' : '查看算法标签'}</span>}
      </button>
      {visible && <span className="algorithm-tags-list">{tags.map((tag) => <i key={tag}>{tag}</i>)}</span>}
    </span>
  )
}
