import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { getCodeforcesTestPackStatus } from './judge/problemTests.mjs'

const root = fileURLToPath(new URL('.', import.meta.url))
const cacheDir = resolve(root, '.data', 'codeforces')
const cachePath = resolve(cacheDir, 'catalog.json')
const translationPath = resolve(cacheDir, 'translations.json')
const statementPath = resolve(cacheDir, 'statements.json')
const testPackGenerationPath = resolve(cacheDir, 'test-pack-generation.json')
const TTL = 24 * 60 * 60 * 1000
const TRANSLATION_TTL = 30 * 24 * 60 * 60 * 1000
const MIRROR_TIMEOUT = 15_000

const seededContest = {
  id: 2248,
  name: 'Codeforces Round 1113 (Div. 2)',
  type: 'CF',
  phase: 'FINISHED',
  startTimeSeconds: 1785594900,
  durationSeconds: 9000,
  problems: [
    ['A', 'You Delete, I Delete', 800, ['greedy']],
    ['B', 'Merge to Match', 1000, ['greedy', 'sortings']],
    ['C', 'Maximize the Score', 1300, ['dp', 'greedy']],
    ['D', 'Good Pair Queries', 1400, ['constructive algorithms', 'greedy', 'math']],
    ['E', 'Excuse for Breaks', 1900, ['binary search', 'brute force', 'greedy', 'math', 'two pointers']],
    ['F', 'Matrix Elimination', 2500, ['binary search', 'greedy', 'math']],
    ['G', 'No Balance Left', 3000, ['bitmasks', 'dp', 'math']],
  ].map(([index, name, rating, tags]) => ({ contestId: 2248, index, name, rating, tags, type: 'PROGRAMMING' })),
}

function readCache() {
  try {
    return JSON.parse(readFileSync(cachePath, 'utf8'))
  } catch {
    return { syncedAt: 0, contests: [] }
  }
}

function readTranslationCache() {
  try {
    const value = JSON.parse(readFileSync(translationPath, 'utf8'))
    return { version: 2, entries: {}, ...value }
  } catch {
    return { version: 2, entries: {} }
  }
}

function readStatementCache() {
  try {
    const value = JSON.parse(readFileSync(statementPath, 'utf8'))
    return { version: 3, entries: {}, ...value }
  } catch {
    return { version: 3, entries: {} }
  }
}

async function writeCache(data) {
  await mkdir(cacheDir, { recursive: true })
  const temp = `${cachePath}.${process.pid}.${Date.now()}.tmp`
  await writeFile(temp, JSON.stringify(data, null, 2), 'utf8')
  await rename(temp, cachePath)
}

async function writeTranslationCacheFile(data) {
  await mkdir(cacheDir, { recursive: true })
  const temp = `${translationPath}.${process.pid}.${Date.now()}.tmp`
  await writeFile(temp, JSON.stringify(data, null, 2), 'utf8')
  await rename(temp, translationPath)
}

let translationWriteChain = Promise.resolve()
let statementWriteChain = Promise.resolve()

async function writeStatementCache(data) {
  await mkdir(cacheDir, { recursive: true })
  const temp = `${statementPath}.${process.pid}.${Date.now()}.tmp`
  await writeFile(temp, JSON.stringify(data, null, 2), 'utf8')
  await rename(temp, statementPath)
}

function statementFingerprint(statement) {
  return createHash('sha256').update(JSON.stringify(statement || {})).digest('hex')
}

function statementMirrorUrls(problem) {
  return [
    `https://www.luogu.com.cn/problem/CF${problem.contestId}${problem.index}`,
    `https://cf-problemset.herokuapp.com/contest/${problem.contestId}/${problem.index}/`,
    `https://vjudge.net/problem/CodeForces-${problem.contestId}-${problem.index}`,
    `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`,
  ]
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<br\s*\/?>(?:\s*)/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
}

function normalizeLatexExpression(value) {
  let text = String(value || '')
    .replace(/^\s*(?:\$\$?|\\\(|\\\[)/, '')
    .replace(/(?:\$\$?|\\\)|\\\])\s*$/, '')
  const unwrap = /\\(?:text|textbf|textit|operatorname|mathrm|mathbf|mathit|mathtt|underline|overline)\{([^{}]*)\}/g
  for (let i = 0; i < 8; i += 1) {
    const next = text.replace(unwrap, '$1').replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)').replace(/\\sqrt\{([^{}]*)\}/g, '√($1)')
    if (next === text) break
    text = next
  }
  const replacements = [
    [/\\leq?\b/g, '≤'], [/\\geq?\b/g, '≥'], [/\\neq\b/g, '≠'], [/\\approx\b/g, '≈'],
    [/\\cdot\b/g, '·'], [/\\times\b/g, '×'], [/\\pm\b/g, '±'], [/\\oplus\b/g, '⊕'],
    [/\\lceil\b/g, '⌈'], [/\\rceil\b/g, '⌉'], [/\\lfloor\b/g, '⌊'], [/\\rfloor\b/g, '⌋'],
    [/\\sum\b/g, '∑'], [/\\prod\b/g, '∏'], [/\\in\b/g, '∈'], [/\\notin\b/g, '∉'],
    [/\\subseteq\b/g, '⊆'], [/\\supseteq\b/g, '⊇'], [/\\infty\b/g, '∞'], [/\\ldots?\b/g, '…'],
    [/\\dots\b/g, '…'], [/\\bmod\b/g, ' mod '], [/\\quad\b/g, ' '], [/\\qquad\b/g, ' '],
  ]
  for (const [pattern, replacement] of replacements) text = text.replace(pattern, replacement)
  return text
    .replace(/\\left|\\right|\\!|\\,|\\;|\\:/g, '')
    .replace(/\\([{}])/g, '$1')
    .replace(/\^\{([^{}]*)\}/g, '^$1')
    .replace(/_\{([^{}]*)\}/g, '_$1')
    .replace(/\\([a-zA-Z]+)/g, '$1')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanMirrorText(value) {
  return stripHtml(value)
    .replace(/\r\n/g, '\n')
    .replace(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])/g, (token) => normalizeLatexExpression(token))
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function statementCacheKey(problem) {
  return `CF-${problem.contestId}-${problem.index}`
}

function cachedMirrorStatement(problem) {
  const cache = readStatementCache()
  let entry = cache.entries?.[statementCacheKey(problem)]
  if (!entry) {
    const catalog = readCache()
    const aliases = (catalog.contests || []).flatMap((contest) => contest.problems || []).filter((item) => item.name === problem.name)
    entry = aliases.map((item) => cache.entries?.[statementCacheKey(item)]).find(Boolean)
  }
  return cache.version >= 3 && entry?.formatVersion >= 3 ? entry : null
}

async function fetchLuoguStatement(problem) {
  const url = `https://www.luogu.com.cn/problem/CF${problem.contestId}${problem.index}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'AlgoArena-CodeforcesMirrorSync/1.0', Accept: 'text/html' },
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Luogu HTTP ${response.status}`)
    const html = await response.text()
    const marker = '<script id="lentille-context"'
    const start = html.indexOf(marker)
    if (start < 0) throw new Error('Luogu problem data not found')
    const jsonStart = html.indexOf('>', start) + 1
    const jsonEnd = html.indexOf('</script>', jsonStart)
    const payload = JSON.parse(html.slice(jsonStart, jsonEnd))
    const content = payload?.data?.problem?.content
    if (!content?.description || !content?.formatI || !content?.formatO) throw new Error('Luogu statement is incomplete')
    const samples = (payload.data.problem.samples || []).map((sample) => ({ input: `${sample[0] || ''}\n`, output: `${sample[1] || ''}\n` }))
    return {
      available: true,
      sourceUrl: `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`,
      mirrorUrls: statementMirrorUrls(problem),
      mirrorSource: 'Luogu',
      formatVersion: 3,
      description: cleanMirrorText(content.description).split(/\n\s*\n/).filter(Boolean),
      input: cleanMirrorText(content.formatI),
      output: cleanMirrorText(content.formatO),
      constraints: [],
      samples,
      note: cleanMirrorText(content.hint),
      fetchedAt: Date.now(),
    }
  } finally {
    clearTimeout(timer)
  }
}

function htmlClassBlock(html, className, nextClasses = []) {
  const next = nextClasses.length ? `|${nextClasses.join('|')}` : ''
  const pattern = new RegExp(`<div[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>([\\s\\S]*?)(?=<div[^>]*class=["'][^"']*\\b(?:${className}${next})\\b|</div>\\s*</div>\\s*</div>)`, 'i')
  return pattern.exec(html)?.[1] || ''
}

function parseHtmlStatement(html, problem, sourceUrl, mirrorSource) {
  const inputHtml = htmlClassBlock(html, 'input-specification', ['output-specification', 'sample-tests', 'note'])
  const outputHtml = htmlClassBlock(html, 'output-specification', ['sample-tests', 'note'])
  if (!inputHtml || !outputHtml) return null
  const statementStart = html.search(/class=["'][^"']*problem-statement\b/i)
  const descriptionHtml = statementStart >= 0 ? html.slice(statementStart, html.indexOf('input-specification', statementStart)) : ''
  const sampleHtml = htmlClassBlock(html, 'sample-tests', ['note'])
  const samples = []
  for (const match of sampleHtml.matchAll(/class=["'][^"']*input[^"']*["'][\s\S]*?<pre[^>]*>([\s\S]*?)<\/pre>[\s\S]*?class=["'][^"']*output[^"']*["'][\s\S]*?<pre[^>]*>([\s\S]*?)<\/pre>/gi)) {
    samples.push({ input: `${cleanMirrorText(match[1])}\n`, output: `${cleanMirrorText(match[2])}\n` })
  }
  return {
    available: true,
    sourceUrl,
    mirrorUrls: statementMirrorUrls(problem),
    mirrorSource,
    formatVersion: 3,
    description: cleanMirrorText(descriptionHtml).split(/\n\s*\n/).filter(Boolean).slice(-12),
    input: cleanMirrorText(inputHtml),
    output: cleanMirrorText(outputHtml),
    constraints: [],
    samples,
    note: cleanMirrorText(htmlClassBlock(html, 'note')),
    fetchedAt: Date.now(),
  }
}

async function fetchProblemStatementMirrors(problem) {
  const errors = []
  try {
    return await fetchLuoguStatement(problem)
  } catch (error) {
    errors.push(`Luogu: ${error.message}`)
  }
  const htmlSources = [
    { url: `https://cf-problemset.herokuapp.com/contest/${problem.contestId}/${problem.index}/`, name: 'Codeforces mirror' },
    { url: `https://vjudge.net/problem/CodeForces-${problem.contestId}-${problem.index}`, name: 'VJudge' },
    { url: `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`, name: 'Codeforces web' },
  ]
  for (const source of htmlSources) {
    try {
      const statement = parseHtmlStatement(await fetchText(source.url), problem, source.url, source.name)
      if (statement) return statement
      errors.push(`${source.name}: statement fields are incomplete`)
    } catch (error) {
      errors.push(`${source.name}: ${error.message}`)
    }
  }
  throw new Error(errors.join(' | ') || 'all statement sources failed')
}

async function getProblemStatement(problem) {
  const original = statementFor(problem)
  if (original.available) return original
  const cached = cachedMirrorStatement(problem)
  if (cached) return cached
  try {
    const statement = await fetchProblemStatementMirrors(problem)
    await saveMirrorStatement(problem, statement)
    return statement
  } catch (error) {
    return { ...original, mirrorError: error.message }
  }
}

async function saveMirrorStatement(problem, statement) {
  const write = statementWriteChain.then(async () => {
    const cache = readStatementCache()
    cache.version = 3
    cache.entries[statementCacheKey(problem)] = { ...statement, formatVersion: 3 }
    await writeStatementCache(cache)
  })
  statementWriteChain = write.catch(() => {})
  return write
}

function statementFor(problem) {
  if (problem.contestId === 2248 && problem.index === 'A') {
    return {
      available: true,
      sourceUrl: 'https://codeforces.com/contest/2248/problem/A',
      mirrorUrls: statementMirrorUrls(problem),
      description: [
        'Alice and Bob are given a binary string s. It contains at least one 0 and at least one 1.',
        'Alice chooses an occurrence of 0 and deletes it. Then Bob chooses an occurrence of 1 in the resulting string and deletes it. Alice wants the final string to be lexicographically as large as possible, while Bob wants it to be lexicographically as small as possible. Determine the final string if both players act optimally.',
      ],
      input: 'The first line contains t (1≤t≤100). Each test case contains a binary string s (3≤|s|≤100) with at least one 0 and one 1.',
      output: 'For each test case, print the final string if both players act optimally.',
      constraints: ['s consists only of 0 and 1.', 'The string contains at least one occurrence of each digit.'],
      samples: [
        { input: '4\n101\n11001\n0010\n0101010000010100100101\n', output: '1\n101\n00\n01010000010100100101\n' },
      ],
      note: 'A binary string is lexicographically smaller when its first differing digit is smaller.',
    }
  }
  return {
    available: false,
    sourceUrl: `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`,
    mirrorUrls: statementMirrorUrls(problem),
    description: ['The original English statement is available on Codeforces. This local cache has the contest metadata, but the statement fetch is pending because Codeforces may present a Cloudflare interstitial to server-side requests.'],
    input: 'See the original statement on Codeforces.',
    output: 'See the original statement on Codeforces.',
    constraints: [],
    samples: [],
    note: 'Open the official source link to read the complete statement.',
  }
}

function normalizeContest(raw) {
  const problems = (raw.problems || []).map((problem) => ({
    contestId: raw.id,
    index: problem.index,
    name: problem.name,
    rating: problem.rating || null,
    tags: problem.tags || [],
    type: problem.type || 'PROGRAMMING',
  }))
  return { ...raw, problems }
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'AlgoArena-CodeforcesSync/1.0' } })
  if (!response.ok) throw new Error(`Codeforces API HTTP ${response.status}`)
  const data = await response.json()
  if (data.status !== 'OK') throw new Error(data.comment || 'Codeforces API error')
  return data.result
}

async function fetchText(url, { userAgent = 'AlgoArena-CodeforcesMirrorSync/1.0' } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), MIRROR_TIMEOUT)
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': userAgent, Accept: 'text/html,application/xhtml+xml,application/json' },
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.text()
  } finally {
    clearTimeout(timer)
  }
}

function metadataKey(contestId, index) {
  return `${contestId}-${String(index).toUpperCase()}`
}

function parseMirrorContestMetadata(html, contestId) {
  const result = new Map()
  const linkPattern = new RegExp(`href=["'](?:https?://[^"']+)?/contest/${contestId}/problem/([A-Z][A-Z0-9]*)[^"']*["'][^>]*>([\\s\\S]*?)</a>`, 'gi')
  for (const match of html.matchAll(linkPattern)) {
    const index = String(match[1]).toUpperCase()
    const around = html.slice(Math.max(0, (match.index || 0) - 500), Math.min(html.length, (match.index || 0) + 1800))
    const labelledRating = around.match(/(?:rating|difficulty|points)[^0-9]{0,80}(\d{3,4})/i)?.[1]
    const numericRatings = [...around.matchAll(/>(\d{3,4})</g)].map((item) => Number(item[1])).filter((value) => value >= 500 && value <= 4000)
    const rating = labelledRating ? Number(labelledRating) : numericRatings[0] || null
    const tagText = around.match(/(?:tags?|algorithms?)[^>]*>([\\s\\S]{0,400})</i)?.[1] || ''
    result.set(index, {
      index,
      name: cleanMirrorText(match[2]),
      rating: Number.isFinite(rating) ? rating : null,
      tags: [...tagText.matchAll(/>([^<>]{2,40})</g)].map((item) => cleanMirrorText(item[1])).filter(Boolean).slice(0, 8),
      metadataSource: 'Codeforces mirror',
      metadataFetchedAt: Date.now(),
    })
  }
  return result
}

async function fetchMirrorContestMetadata(contestId) {
  const urls = [
    `https://cf-problemset.herokuapp.com/contest/${contestId}/`,
    `https://codeforces.com/contest/${contestId}/`,
  ]
  for (const url of urls) {
    try {
      const metadata = parseMirrorContestMetadata(await fetchText(url), contestId)
      if (metadata.size) return metadata
    } catch { /* try the next mirror */ }
  }
  return new Map()
}

async function fetchProblemsetMetadata() {
  try {
    const result = await fetchJson('https://codeforces.com/api/problemset.problems')
    return new Map((result.problems || []).filter((problem) => problem.contestId != null && problem.index).map((problem) => [
      metadataKey(problem.contestId, problem.index),
      {
        index: problem.index,
        name: problem.name,
        rating: problem.rating || null,
        tags: problem.tags || [],
        metadataSource: 'Codeforces problemset API',
        metadataFetchedAt: Date.now(),
      },
    ]))
  } catch {
    return new Map()
  }
}

function mergeContestProblems(contest, previous, problemsetMetadata, mirrorMetadata) {
  const currentProblems = new Map((contest.problems || []).map((problem) => [String(problem.index).toUpperCase(), problem]))
  const previousProblems = new Map((previous?.problems || []).map((problem) => [String(problem.index).toUpperCase(), problem]))
  const indexes = new Set([...previousProblems.keys(), ...currentProblems.keys(), ...mirrorMetadata.keys()])
  for (const key of problemsetMetadata.keys()) {
    if (key.startsWith(`${contest.id}-`)) indexes.add(key.slice(String(contest.id).length + 1).toUpperCase())
  }
  const problems = [...indexes].filter(Boolean).map((index) => {
    const current = currentProblems.get(index) || {}
    const old = previousProblems.get(index) || {}
    const mirror = mirrorMetadata.get(index) || {}
    const api = problemsetMetadata.get(metadataKey(contest.id, index)) || {}
    const rating = current.rating ?? old.rating ?? api.rating ?? mirror.rating ?? null
    const tags = current.tags?.length ? current.tags : old.tags?.length ? old.tags : api.tags?.length ? api.tags : mirror.tags || []
    const metadataSources = [...new Set([
      ...(old.metadataSources || []),
      ...(current.metadataSources || []),
      current.rating != null ? 'Codeforces standings API' : '',
      api.rating != null ? api.metadataSource : '',
      mirror.rating != null ? mirror.metadataSource : '',
    ].filter(Boolean))]
    return {
      ...old,
      ...current,
      contestId: contest.id,
      index,
      name: current.name || old.name || api.name || mirror.name || `Problem ${index}`,
      rating,
      tags,
      type: current.type || old.type || 'PROGRAMMING',
      metadataSources,
      metadataComplete: Boolean((current.name || old.name || api.name || mirror.name) && rating != null),
      metadataUpdatedAt: Date.now(),
    }
  })
  return { ...previous, ...contest, problems }
}

async function enrichContestMetadata(contests, previousContests) {
  const previousById = new Map((previousContests || []).map((contest) => [String(contest.id), contest]))
  const needsProblemset = contests.some((contest) => {
    const previous = previousById.get(String(contest.id))
    const problems = contest.problems?.length ? contest.problems : previous?.problems || []
    return problems.some((problem) => problem.rating == null || !problem.name)
  })
  const problemsetMetadata = needsProblemset ? await fetchProblemsetMetadata() : new Map()
  const enriched = []
  for (const contest of contests) {
    const previous = previousById.get(String(contest.id))
    const existing = contest.problems?.length ? contest.problems : previous?.problems || []
    const needsMirror = existing.length === 0 || existing.some((problem) => problem.rating == null || !problem.name)
    const mirrorMetadata = needsMirror ? await fetchMirrorContestMetadata(contest.id) : new Map()
    enriched.push(mergeContestProblems(contest, previous, problemsetMetadata, mirrorMetadata))
  }
  return enriched
}

async function fetchMirrorContestList() {
  const sources = [
    'https://cf-problemset.herokuapp.com/',
    'https://www.luogu.com.cn/contest/list',
  ]
  for (const url of sources) {
    try {
      const html = await fetchText(url)
      const contests = new Map()
      const patterns = [
        /href=["'](?:https?:\/\/[^"']+)?\/contest\/(\d+)[^"']*["'][^>]*>([\\s\\S]{0,180}?)<\/a>/gi,
        /(?:contestId|contest_id)[^0-9]{0,20}(\d{3,6})/gi,
      ]
      for (const pattern of patterns) {
        for (const match of html.matchAll(pattern)) {
          const id = Number(match[1])
          if (!Number.isInteger(id) || id < 1) continue
          contests.set(id, { id, name: cleanMirrorText(match[2] || `Codeforces Contest ${id}`), type: 'CF', problems: [], mirrorSource: url, metadataFetchedAt: Date.now() })
        }
      }
      if (contests.size) return [...contests.values()].slice(0, 20)
    } catch { /* try the next contest mirror */ }
  }
  return []
}

function catalogNeedsMetadataRefresh(cache) {
  return (cache.contests || []).some((contest) => !(contest.problems || []).length || (contest.problems || []).some((problem) => !problem.name || problem.rating == null || !problem.tags?.length))
}

export async function syncCodeforcesContests({ days = 7, force = false } = {}) {
  const old = readCache()
  if (!force && old.syncedAt && Date.now() - old.syncedAt < TTL && old.contests.length && Number(old.days || 0) >= days && !catalogNeedsMetadataRefresh(old)) return old
  let contests = []
  try {
    const list = await fetchJson('https://codeforces.com/api/contest.list?gym=false')
    const cutoff = Math.floor(Date.now() / 1000) - days * 86400
    const upper = Math.floor(Date.now() / 1000) + 86400
    contests = list
      .filter((item) => item.phase === 'FINISHED' && item.startTimeSeconds >= cutoff && item.startTimeSeconds <= upper)
      .slice(0, 20)
      .map(normalizeContest)
    for (const contest of contests) {
      if (contest.problems.length) continue
      try {
        const standings = await fetchJson(`https://codeforces.com/api/contest.standings?contestId=${contest.id}`)
        contest.problems = (standings.problems || []).map((problem) => ({ contestId: contest.id, index: problem.index, name: problem.name, rating: problem.rating || null, tags: problem.tags || [], type: problem.type || 'PROGRAMMING' }))
      } catch { /* metadata remains useful even when standings are unavailable */ }
    }
  } catch {
    contests = await fetchMirrorContestList()
    if (!contests.length) contests = old.contests.length ? old.contests : [seededContest]
  }
  if (!contests.length && old.contests.length) contests = old.contests
  if (!contests.length) contests = [seededContest]
  contests = await enrichContestMetadata(contests, old.contests)
  const data = { syncedAt: Date.now(), days, contests, metadataRetryAt: Date.now() }
  await writeCache(data)
  return data
}

export async function ensureCodeforcesSync({ days = 30 } = {}) {
  const cache = readCache()
  if (!cache.contests.length || Date.now() - Number(cache.syncedAt || 0) >= TTL || Number(cache.days || 0) < days) {
    return syncCodeforcesContests({ days })
  }
  return cache
}

export function getCodeforcesStatus() {
  const cache = readCache()
  const translations = readTranslationCache().entries || {}
  const validTranslations = Object.values(translations).filter((entry) => Date.now() - Number(entry.translatedAt || 0) <= TRANSLATION_TTL)
  const problems = (cache.contests || []).flatMap((contest) => (contest.problems || []).map((problem) => ({ ...problem, contestId: contest.id })))
  const problemIds = problems.map((problem) => `CF-${problem.contestId}-${problem.index}`)
  const incompleteMetadataCount = problems.filter((problem) => !problem.name || problem.rating == null || !problem.tags?.length).length
  const pendingStatementCount = problems.filter((problem) => !statementFor(problem).available && !cachedMirrorStatement(problem)).length
  const packStatuses = problemIds.map((problemId) => getCodeforcesTestPackStatus(problemId))
  let generation = {}
  try { generation = JSON.parse(readFileSync(testPackGenerationPath, 'utf8')) } catch { /* generation has not started */ }
  return {
    syncedAt: cache.syncedAt || 0,
    contestCount: cache.contests?.length || 0,
    problemCount: problemIds.length,
    days: Number(cache.days || 0),
    ttlMs: TTL,
    translationCount: validTranslations.length,
    translationTtlMs: TRANSLATION_TTL,
    incompleteMetadataCount,
    pendingStatementCount,
    testPackPolicy: { requiredCount: 20, requiredLargeCount: 10, totalScore: 100 },
    readyTestPackCount: packStatuses.filter((status) => status.ready).length,
    pendingTestPackCount: packStatuses.filter((status) => !status.ready).length,
    generatingTestPackCount: Object.values(generation).filter((item) => String(item?.status || '').startsWith('generating')).length,
    failedTestPackCount: Object.values(generation).filter((item) => item?.status === 'failed').length,
  }
}

export async function listCodeforcesContests({ days = null } = {}) {
  const cache = await ensureCodeforcesSync()
  const cutoff = days ? Math.floor(Date.now() / 1000) - days * 86400 : null
  return cache.contests.filter((contest) => !cutoff || !contest.startTimeSeconds || contest.startTimeSeconds >= cutoff).map((contest) => {
    // Older cache entries may contain contest metadata without the problem
    // list (for example when the standings endpoint was temporarily
    // unavailable). Keep the seeded 2248 catalog usable in that case.
    const source = String(contest.id) === '2248' && !(contest.problems || []).length
      ? seededContest
      : contest
    return {
      ...source,
      problems: (source.problems || []).map((problem) => {
        const statement = statementFor(problem)
        return { ...problem, id: `CF-${source.id}-${problem.index}`, title: problem.name, statementAvailable: statement.available || Boolean(cachedMirrorStatement(problem)) }
      }),
    }
  })
}

export async function getCodeforcesContest(contestId) {
  const contests = await listCodeforcesContests({ days: null })
  const found = contests.find((contest) => String(contest.id) === String(contestId))
  if (found?.problems?.length) return found
  if (String(contestId) === '2248') return { ...seededContest, problems: seededContest.problems.map((problem) => ({ ...problem, id: `CF-2248-${problem.index}`, title: problem.name, statementAvailable: statementFor(problem).available })) }
  return found || null
}

export async function getCodeforcesProblem(contestId, index) {
  const contest = await getCodeforcesContest(contestId)
  if (!contest) return getSeededProblem(contestId, index)
  const problem = contest.problems.find((item) => item.index.toUpperCase() === String(index).toUpperCase())
  if (!problem) return getSeededProblem(contestId, index)
  const id = `CF-${contest.id}-${problem.index}`
  const testPack = getCodeforcesTestPackStatus(id)
  return {
    ...problem,
    id,
    contestName: contest.name,
    statement: await getProblemStatement(problem),
    translatedStatement: getCachedCodeforcesTranslation(`CF-${contest.id}-${problem.index}`, await getProblemStatement(problem)),
    limitMs: 1000,
    memoryMb: 256,
    difficulty: problem.rating ? `CF ${problem.rating}` : problem.metadataComplete ? 'Unrated' : 'Rating pending',
    series: contest.name,
    passRate: null,
    submissions: 0,
    localJudgeReady: testPack.ready,
    testPack,
  }
}

export function getSeededProblem(contestId, index) {
  const problem = seededContest.problems.find((item) => String(item.contestId) === String(contestId) && item.index.toUpperCase() === String(index).toUpperCase())
  if (!problem) return null
  const id = `CF-${contestId}-${problem.index}`
  const testPack = getCodeforcesTestPackStatus(id)
  return { ...problem, id, contestName: seededContest.name, statement: statementFor(problem), translatedStatement: getCachedCodeforcesTranslation(id, statementFor(problem)), limitMs: 1000, memoryMb: 256, difficulty: problem.rating ? `CF ${problem.rating}` : 'Unrated', series: seededContest.name, passRate: null, submissions: 0, localJudgeReady: testPack.ready, testPack }
}

export function getCachedCodeforcesTranslation(problemId, statement = null) {
  const entry = readTranslationCache().entries?.[problemId]
  if (!entry || Date.now() - Number(entry.translatedAt || 0) > TRANSLATION_TTL) return null
  if (statement && entry.sourceHash && entry.sourceHash !== statementFingerprint(statement)) return null
  return entry.statement || null
}

export async function saveCodeforcesTranslation(problemId, statement, translation) {
  const write = translationWriteChain.then(async () => {
    const cache = readTranslationCache()
    cache.entries[problemId] = {
      translatedAt: Date.now(),
      sourceHash: statementFingerprint(statement),
      statement: translation,
    }
    await writeTranslationCacheFile(cache)
    return cache.entries[problemId]
  })
  translationWriteChain = write.catch(() => {})
  return write
}

export async function pretranslateCodeforcesStatements({ days = 30, translate, force = false } = {}) {
  if (typeof translate !== 'function') return { attempted: 0, translated: 0, skipped: 0 }
  const contests = await listCodeforcesContests({ days })
  let attempted = 0
  let translated = 0
  let skipped = 0
  for (const contest of contests) {
    for (const item of contest.problems || []) {
      const problem = await getCodeforcesProblem(contest.id, item.index)
      if (!problem?.statement?.available) {
        skipped += 1
        continue
      }
      if (!force && getCachedCodeforcesTranslation(problem.id, problem.statement)) {
        skipped += 1
        continue
      }
      attempted += 1
      try {
        const translation = await translate(problem, problem.statement)
        if (translation) {
          await saveCodeforcesTranslation(problem.id, problem.statement, translation)
          translated += 1
        }
      } catch (error) {
        console.warn(`[codeforces] translation skipped for ${problem.id}: ${error.message}`)
      }
    }
  }
  return { attempted, translated, skipped }
}
