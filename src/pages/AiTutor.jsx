import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Bot,
  Braces,
  Bug,
  Check,
  ChevronDown,
  Code2,
  Copy,
  ImagePlus,
  Lightbulb,
  LoaderCircle,
  Paperclip,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'

const STORAGE_KEY = 'algo-arena-ai-conversations'
const MAX_IMAGE_BYTES = 4 * 1024 * 1024

const quickPrompts = [
  { icon: Lightbulb, title: '讲解算法', text: '帮我理解 Tarjan 算法的核心思想' },
  { icon: Bug, title: '排查 Bug', text: '帮我检查这段代码为什么会 TLE' },
  { icon: Braces, title: '分析复杂度', text: '分析下面代码的时间与空间复杂度' },
]

const starterConversations = [
  { id: 'demo-lazy', title: '线段树 lazy tag 问题', messages: [{ id: 'demo-lazy-answer', role: 'assistant', content: '这是一个历史会话示例。点击“新建对话”，即可开始连接真实的算法 AI。' }] },
  { id: 'demo-shortest', title: '最短路算法如何选择', messages: [{ id: 'demo-shortest-answer', role: 'assistant', content: '可以根据边权、图是否有负边和数据规模，在 BFS、Dijkstra、Bellman-Ford 与 Floyd 之间选择。' }] },
  { id: 'demo-knapsack', title: '背包问题状态转移', messages: [{ id: 'demo-knapsack-answer', role: 'assistant', content: '历史会话仅用于展示界面；真实对话会保存在本地，并通过项目服务端代理调用 AI 网关。' }] },
]

function makeId(prefix = 'message') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function readConversations() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
    if (Array.isArray(stored) && stored.length) return stored
  } catch {
    // Ignore malformed local data and fall back to the built-in examples.
  }
  return starterConversations
}

function conversationTitle(text) {
  const normalized = text.replace(/\s+/g, ' ').trim()
  return normalized.length > 26 ? `${normalized.slice(0, 26)}…` : normalized || '新对话'
}

function toApiMessages(messages) {
  return messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => {
      if (message.role === 'user' && message.image?.dataUrl) {
        return {
          role: 'user',
          content: [
            { type: 'text', text: message.content || '请分析我上传的题面图片。' },
            { type: 'image_url', image_url: { url: message.image.dataUrl } },
          ],
        }
      }
      return { role: message.role, content: message.content }
    })
}

function getDelta(payload) {
  const delta = payload?.choices?.[0]?.delta?.content
  if (typeof delta === 'string') return delta
  if (Array.isArray(delta)) return delta.map((part) => part?.text || '').join('')
  return ''
}

async function readError(response) {
  const text = await response.text().catch(() => '')
  try {
    return JSON.parse(text)?.error?.message || text
  } catch {
    return text
  }
}

async function consumeSse(response, onDelta, signal) {
  if (!response.ok) {
    throw new Error((await readError(response)) || `AI 服务返回 HTTP ${response.status}`)
  }
  if (!response.body) throw new Error('AI 服务没有返回可读取的内容。')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const processLines = (lines) => {
    for (const line of lines) {
      if (!line.startsWith('data:')) continue
      const payloadText = line.slice(5).trim()
      if (!payloadText || payloadText === '[DONE]') continue
      let payload
      try {
        payload = JSON.parse(payloadText)
      } catch {
        continue
      }
      if (payload.error?.message) throw new Error(payload.error.message)
      const delta = getDelta(payload)
      if (delta) onDelta(delta)
    }
  }

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    if (signal.aborted) throw new DOMException('请求已停止', 'AbortError')
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() || ''
    processLines(lines)
  }
  buffer += decoder.decode()
  if (buffer) processLines(buffer.split(/\r?\n/))
}

function persistableConversations(conversations) {
  return conversations.map((conversation) => ({
    ...conversation,
    messages: conversation.messages.map(({ image, ...message }) => ({
      ...message,
      ...(image ? { image: { name: image.name } } : {}),
    })),
  }))
}

export default function AiTutor() {
  const [history, setHistory] = useState(readConversations)
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [codeMode, setCodeMode] = useState(false)
  const [pendingImage, setPendingImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apiStatus, setApiStatus] = useState('checking')
  const [showScrollButton, setShowScrollButton] = useState(false)
  const fileRef = useRef(null)
  const abortRef = useRef(null)
  const conversationRef = useRef(null)

  const activeConversation = useMemo(() => history.find((item) => item.id === activeConversationId), [history, activeConversationId])

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistableConversations(history))) } catch { /* localStorage is optional */ }
  }, [history])

  useEffect(() => {
    let alive = true
    fetch('/api/health')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('offline')))
      .then((data) => alive && setApiStatus(data.configured ? 'online' : 'unconfigured'))
      .catch(() => alive && setApiStatus('offline'))
    return () => { alive = false }
  }, [])

  useEffect(() => () => abortRef.current?.abort(), [])

  const updateConversation = (conversationId, updater) => {
    setHistory((items) => items.map((item) => item.id === conversationId ? updater(item) : item))
  }

  const startNewChat = () => {
    abortRef.current?.abort()
    setLoading(false)
    setActiveConversationId(null)
    setMessages([])
    setMessage('')
    setPendingImage(null)
    setError('')
  }

  const selectConversation = (conversation) => {
    if (loading) abortRef.current?.abort()
    setLoading(false)
    setActiveConversationId(conversation.id)
    setMessages(conversation.messages)
    setMessage('')
    setPendingImage(null)
    setError('')
  }

  const clearHistory = () => {
    if (loading) abortRef.current?.abort()
    setLoading(false)
    setHistory([])
    setActiveConversationId(null)
    setMessages([])
    setError('')
  }

  const updateMessage = (conversationId, messageId, updater) => {
    setMessages((items) => items.map((item) => item.id === messageId ? updater(item) : item))
    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      messages: conversation.messages.map((item) => item.id === messageId ? updater(item) : item),
    }))
  }

  const sendMessage = async (preset) => {
    if (loading) return
    const content = (preset || message).trim()
    if (!content && !pendingImage) return

    const userMessage = {
      id: makeId('user'),
      role: 'user',
      content: content || '请分析我上传的题面图片。',
      ...(pendingImage ? { image: pendingImage } : {}),
    }
    const assistantMessage = { id: makeId('assistant'), role: 'assistant', content: '' }
    const nextMessages = [...messages, userMessage, assistantMessage]
    const conversationId = activeConversationId || makeId('conversation')
    const conversation = activeConversationId
      ? { ...(activeConversation || {}), id: conversationId, messages: nextMessages }
      : { id: conversationId, title: conversationTitle(userMessage.content), messages: nextMessages }

    setHistory((items) => activeConversationId ? items.map((item) => item.id === conversationId ? conversation : item) : [conversation, ...items])
    setActiveConversationId(conversationId)
    setMessages(nextMessages)
    setMessage('')
    setPendingImage(null)
    setError('')
    setLoading(true)

    const controller = new AbortController()
    abortRef.current = controller
    conversationRef.current = conversationId

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: toApiMessages(nextMessages.slice(0, -1)) }),
        signal: controller.signal,
      })
      await consumeSse(response, (delta) => {
        updateMessage(conversationId, assistantMessage.id, (item) => ({ ...item, content: item.content + delta }))
      }, controller.signal)
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        const friendly = requestError.message || 'AI 请求失败，请稍后重试。'
        setError(friendly)
        updateMessage(conversationId, assistantMessage.id, (item) => ({ ...item, content: item.content || `请求失败：${friendly}`, isError: true }))
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null
      setLoading(false)
    }
  }

  const stopGeneration = () => {
    abortRef.current?.abort()
    setLoading(false)
  }

  const regenerate = (messageIndex) => {
    const previousUser = [...messages].slice(0, messageIndex).reverse().find((item) => item.role === 'user')
    if (!previousUser) return
    setMessages((items) => items.slice(0, messageIndex))
    updateConversation(activeConversationId, (conversation) => ({ ...conversation, messages: conversation.messages.slice(0, messageIndex) }))
    setMessage(previousUser.content)
  }

  const handleFile = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      setError('图片大小不能超过 4 MB。')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setPendingImage({ name: file.name, dataUrl: String(reader.result) })
    reader.onerror = () => setError('图片读取失败，请换一张图片重试。')
    reader.readAsDataURL(file)
  }

  const statusText = { checking: '检查连接中', online: '已配置', unconfigured: '未配置 API', offline: '服务未启动' }[apiStatus]

  return (
    <div className="ai-layout">
      <aside className="chat-history">
        <button className="new-chat" onClick={startNewChat}><Plus size={17} /> 新建对话</button>
        <div className="history-section">
          <span>最近对话</span>
          {history.length ? history.map((conversation) => (
            <button key={conversation.id} className={activeConversationId === conversation.id ? 'active' : ''} onClick={() => selectConversation(conversation)}>{conversation.title}</button>
          )) : <p className="history-empty">还没有对话</p>}
        </div>
        <div className="history-footer"><button onClick={clearHistory}><Trash2 size={15} /> 清空历史记录</button></div>
      </aside>

      <section className="chat-main">
        <div className="ai-model-bar">
          <div className="model-mark"><Bot size={18} /></div>
          <div><strong>Algo AI</strong><span>专注 OI / ACM 算法领域 · gpt-5.5</span></div>
          <button type="button">竞赛辅导模式 <ChevronDown size={14} /></button>
          <span className={`online-state ${apiStatus}`}><i /> {statusText}</span>
        </div>

        <div className={`conversation ${messages.length ? 'has-messages' : ''}`} ref={(node) => { conversationRef.current = node }} onScroll={(event) => setShowScrollButton(event.currentTarget.scrollHeight - event.currentTarget.scrollTop - event.currentTarget.clientHeight > 160)}>
          {!messages.length ? (
            <div className="ai-welcome">
              <div className="ai-orb"><Sparkles size={28} /><i /><i /></div>
              <span className="ai-label">ALGORITHM INTELLIGENCE</span>
              <h2>今天想一起解决什么问题？</h2>
              <p>我可以讲解算法思路、分析代码 Bug、解读题目，或给你循序渐进的提示。</p>
              <div className="quick-prompts">
                {quickPrompts.map(({ icon: Icon, title, text }) => (
                  <button key={title} onClick={() => sendMessage(text)}><span><Icon size={19} /></span><strong>{title}</strong><small>{text}</small><ArrowUp size={15} /></button>
                ))}
              </div>
              <div className="scope-note"><span>专注边界</span> 仅回答 OI / ACM、编程与算法竞赛相关问题，保证每一次对话都围绕你的算法成长。</div>
            </div>
          ) : (
            <div className="message-list">
              {messages.map((item, index) => (
                <div className={`message ${item.role} ${item.isError ? 'error' : ''}`} key={item.id || `${item.role}-${index}`}>
                  <div className="message-avatar">{item.role === 'assistant' ? <Bot size={18} /> : 'LY'}</div>
                  <div className="message-body">
                    <span>{item.role === 'assistant' ? 'Algo AI' : '你'}</span>
                    {item.image && <div className="message-image"><ImagePlus size={17} /> {item.image.name}</div>}
                    <p>{item.content || (loading && index === messages.length - 1 ? <span className="typing"><i /><i /><i /></span> : '')}</p>
                    {item.role === 'assistant' && item.content && !item.isError && <div className="message-actions"><button onClick={() => navigator.clipboard?.writeText(item.content)} title="复制回答"><Copy size={13} /> 复制</button><button onClick={() => regenerate(index)} title="重新生成"><RefreshCw size={13} /> 重试</button></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {showScrollButton && <button className="scroll-bottom" onClick={() => conversationRef.current?.scrollTo({ top: conversationRef.current.scrollHeight, behavior: 'smooth' })}><ArrowDown size={15} /></button>}
        </div>

        <div className="composer-shell">
          {error && <div className="ai-error"><span>{error}</span><button onClick={() => setError('')}><X size={14} /></button></div>}
          {pendingImage && <div className="attachment-preview"><ImagePlus size={16} /><span>{pendingImage.name}</span><button onClick={() => setPendingImage(null)}><X size={14} /></button></div>}
          <div className={`composer ${codeMode ? 'code-mode' : ''}`}>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage() } }}
              placeholder={codeMode ? '// 粘贴需要分析的代码片段...' : '描述你的算法问题，或粘贴题面与代码...'}
              rows={codeMode ? 5 : 2}
              disabled={loading}
            />
            <div className="composer-tools">
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={handleFile} />
              <button disabled={loading} onClick={() => fileRef.current?.click()} title="上传题面图片"><Paperclip size={18} /></button>
              <button disabled={loading} className={codeMode ? 'active' : ''} onClick={() => setCodeMode((value) => !value)} title="代码片段模式"><Code2 size={18} /></button>
              <span>Enter 发送 · Shift + Enter 换行</span>
              {loading ? <button className="stop-message" onClick={stopGeneration}><LoaderCircle size={17} /> 停止</button> : <button className="send-message" onClick={() => sendMessage()} disabled={!message.trim() && !pendingImage}><Send size={18} /></button>}
            </div>
          </div>
          <p className="ai-disclaimer">AI 生成内容可能存在误差，请结合数据范围、样例与实际评测验证答案。</p>
        </div>
      </section>
    </div>
  )
}
