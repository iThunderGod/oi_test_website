import { useMemo, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

const completions = [
  { label: 'ios::sync_with_stdio(false);', insert: 'ios::sync_with_stdio(false);' },
  { label: 'cin.tie(nullptr);', insert: 'cin.tie(nullptr);' },
  { label: 'vector<type> name;', insert: 'vector<int> name;' },
  { label: 'for (int i = 0; i < n; ++i)', insert: 'for (int i = 0; i < n; ++i) {\n    \n}' },
  { label: 'for (auto &x : a)', insert: 'for (auto &x : a) {\n    \n}' },
  { label: 'sort(a.begin(), a.end());', insert: 'sort(a.begin(), a.end());' },
  { label: 'long long', insert: 'long long' },
  { label: 'unordered_map', insert: 'unordered_map' },
  { label: 'priority_queue', insert: 'priority_queue' },
  { label: 'lower_bound', insert: 'lower_bound' },
  { label: 'upper_bound', insert: 'upper_bound' },
  { label: 'accumulate', insert: 'accumulate' },
  { label: 'std::', insert: 'std::' },
]

const keywords = new Set('alignas alignof and and_eq asm atomic_cancel atomic_commit atomic_noexcept auto bitand bitor bool break case catch char char8_t char16_t char32_t class compl concept const consteval constexpr constinit const_cast continue co_await co_return co_yield decltype default delete do double dynamic_cast else enum explicit export extern false float for friend goto if inline int long mutable namespace new noexcept not nullptr operator or private protected public register reinterpret_cast requires return short signed sizeof static static_assert static_cast struct switch template this thread_local throw true try typedef typeid typename union unsigned using virtual void volatile wchar_t while xor vector string map set unordered_map priority_queue'.split(' '))

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
}

function highlightCpp(value) {
  const source = String(value || '')
  const pattern = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#[A-Za-z_]+|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b)/g
  let html = ''
  let last = 0
  for (const match of source.matchAll(pattern)) {
    const start = match.index || 0
    html += escapeHtml(source.slice(last, start))
    const token = match[0]
    const type = token.startsWith('//') || token.startsWith('/*') ? 'comment' : token.startsWith('"') || token.startsWith("'") ? 'string' : token.startsWith('#') ? 'preprocessor' : /^\d/.test(token) ? 'number' : keywords.has(token) ? 'keyword' : 'identifier'
    html += `<span class="cpp-token-${type}">${escapeHtml(token)}</span>`
    last = start + token.length
  }
  html += escapeHtml(source.slice(last))
  return html || ' '
}

export default function CppEditor({ value, onChange, lineCount = 16, className = '', ariaLabel = 'C++17 code editor' }) {
  const textareaRef = useRef(null)
  const highlightRef = useRef(null)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState(0)
  const prefix = useMemo(() => String(value || '').match(/[A-Za-z_][A-Za-z0-9_:]*$/)?.[0] || '', [value])
  const suggestions = useMemo(() => {
    if (!suggestionsOpen) return []
    const normalized = prefix.toLowerCase()
    return completions.filter((item) => !normalized || item.label.toLowerCase().startsWith(normalized)).slice(0, 7)
  }, [prefix, suggestionsOpen])

  const syncScroll = () => {
    if (!textareaRef.current || !highlightRef.current) return
    highlightRef.current.scrollTop = textareaRef.current.scrollTop
    highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
  }

  const insertSuggestion = (item) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const prefixStart = start - prefix.length
    const next = `${String(value).slice(0, prefixStart)}${item.insert}${String(value).slice(end)}`
    onChange(next)
    setSuggestionsOpen(false)
    requestAnimationFrame(() => {
      textarea.focus()
      const position = prefixStart + item.insert.length
      textarea.setSelectionRange(position, position)
    })
  }

  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.code === 'Space') {
      event.preventDefault()
      setSuggestionsOpen(true)
      setSelectedSuggestion(0)
      return
    }
    if (suggestionsOpen && suggestions.length) {
      if (event.key === 'ArrowDown') { event.preventDefault(); setSelectedSuggestion((index) => (index + 1) % suggestions.length); return }
      if (event.key === 'ArrowUp') { event.preventDefault(); setSelectedSuggestion((index) => (index + suggestions.length - 1) % suggestions.length); return }
      if (event.key === 'Tab' || event.key === 'Enter') { event.preventDefault(); insertSuggestion(suggestions[selectedSuggestion]); return }
      if (event.key === 'Escape') { event.preventDefault(); setSuggestionsOpen(false); return }
    }
    if (event.key === 'Tab') {
      event.preventDefault()
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      onChange(`${String(value).slice(0, start)}    ${String(value).slice(end)}`)
      requestAnimationFrame(() => textarea.setSelectionRange(start + 4, start + 4))
    }
  }

  return (
    <div className={`cpp-editor ${className}`}>
      <div className="cpp-line-numbers" aria-hidden="true">{Array.from({ length: lineCount }, (_, index) => <span key={index}>{index + 1}</span>)}</div>
      <div className="cpp-highlight" ref={highlightRef} aria-hidden="true" dangerouslySetInnerHTML={{ __html: highlightCpp(value) }} />
      <textarea ref={textareaRef} spellCheck="false" value={value} aria-label={ariaLabel} onChange={(event) => { onChange(event.target.value); setSuggestionsOpen(false) }} onKeyDown={handleKeyDown} onScroll={syncScroll} onFocus={() => setSuggestionsOpen(false)} />
      <div className="cpp-editor-status"><span>C++17</span><span>Ctrl/⌘ + Space 补全</span><span><Check size={13} /> 语法高亮</span></div>
      {suggestionsOpen && suggestions.length > 0 && <div className="cpp-completions">{suggestions.map((item, index) => <button type="button" className={index === selectedSuggestion ? 'active' : ''} key={item.label} onMouseDown={(event) => { event.preventDefault(); insertSuggestion(item) }}><strong>{item.label}</strong><ChevronDown size={13} /></button>)}</div>}
    </div>
  )
}
