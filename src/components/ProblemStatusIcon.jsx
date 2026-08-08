import { AlertTriangle, Check, X } from 'lucide-react'

export default function ProblemStatusIcon({ verdict, size = 14 }) {
  const state = verdict === 'AC' ? 'accepted' : verdict === 'CE' ? 'compile-error' : ['WA', 'RE', 'TLE'].includes(verdict) ? 'failed' : 'empty'
  return (
    <span className={`status-mark ${state}`} aria-label={verdict || '尚未提交'} title={verdict || ''}>
      {verdict === 'AC' && <Check size={size} />}
      {['WA', 'RE', 'TLE'].includes(verdict) && <X size={size} />}
      {verdict === 'CE' && <AlertTriangle size={size} />}
    </span>
  )
}
