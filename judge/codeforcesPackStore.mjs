import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import vm from 'node:vm'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
export const codeforcesPackDir = resolve(projectRoot, '.data', 'codeforces', 'test-packs')
const cache = new Map()

function safeProblemId(problemId) {
  const value = String(problemId || '').toUpperCase()
  return /^CF-\d+-[A-Z][A-Z0-9]*$/.test(value) ? value : null
}

export function codeforcesPackPath(problemId) {
  const safeId = safeProblemId(problemId)
  return safeId ? resolve(codeforcesPackDir, `${safeId}.json.gz`) : null
}

export function readGeneratedCodeforcesPack(problemId) {
  const path = codeforcesPackPath(problemId)
  if (!path || !existsSync(path)) return null
  const modifiedAt = statSync(path).mtimeMs
  const cached = cache.get(path)
  if (cached?.modifiedAt === modifiedAt) return cached.pack
  try {
    const pack = JSON.parse(gunzipSync(readFileSync(path)).toString('utf8'))
    cache.set(path, { modifiedAt, pack })
    return pack
  } catch (error) {
    return { problemId, version: 0, tests: [], loadError: error.message }
  }
}

export function getGeneratedCodeforcesPackIds() {
  if (!existsSync(codeforcesPackDir)) return []
  return readdirSync(codeforcesPackDir)
    .filter((name) => /^CF-\d+-[A-Z][A-Z0-9]*\.json\.gz$/i.test(name))
    .map((name) => name.replace(/\.json\.gz$/i, '').toUpperCase())
}

function normalizeOutput(value) {
  return String(value || '').replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '').trim()
}

function compareFloatingTokens(expected, actual, tolerance) {
  const expectedTokens = normalizeOutput(expected).split(/\s+/).filter(Boolean)
  const actualTokens = normalizeOutput(actual).split(/\s+/).filter(Boolean)
  if (expectedTokens.length !== actualTokens.length) return { ok: false, message: '输出项数量不匹配' }
  for (let index = 0; index < expectedTokens.length; index += 1) {
    const left = Number(expectedTokens[index])
    const right = Number(actualTokens[index])
    if (!Number.isFinite(left) || !Number.isFinite(right)) {
      if (expectedTokens[index] !== actualTokens[index]) return { ok: false, message: `第 ${index + 1} 项不匹配` }
      continue
    }
    const allowed = tolerance * Math.max(1, Math.abs(left))
    if (Math.abs(left - right) > allowed) return { ok: false, message: `第 ${index + 1} 项误差过大` }
  }
  return { ok: true, message: '通过' }
}

export function compareCodeforcesOutput(test, actualOutput) {
  const expected = test.output || ''
  const checker = test.checker || { type: 'exact' }
  if (checker.type === 'case-insensitive') {
    const ok = normalizeOutput(expected).toLowerCase() === normalizeOutput(actualOutput).toLowerCase()
    return { ok, message: ok ? '通过' : '答案错误' }
  }
  if (checker.type === 'tokens') {
    const ok = normalizeOutput(expected).split(/\s+/).join(' ') === normalizeOutput(actualOutput).split(/\s+/).join(' ')
    return { ok, message: ok ? '通过' : '答案错误' }
  }
  if (checker.type === 'float') return compareFloatingTokens(expected, actualOutput, Number(checker.tolerance || 1e-6))
  if (checker.type === 'custom-js' && typeof checker.source === 'string') {
    try {
      const sandbox = Object.create(null)
      sandbox.input = String(test.input || '')
      sandbox.expected = String(expected)
      sandbox.actual = String(actualOutput || '')
      sandbox.result = null
      vm.createContext(sandbox, { codeGeneration: { strings: false, wasm: false } })
      const script = new vm.Script(`result = (${checker.source})(input, expected, actual)`, { filename: 'codeforces-checker.vm.js' })
      script.runInContext(sandbox, { timeout: 5000 })
      const result = sandbox.result
      if (typeof result === 'boolean') return { ok: result, message: result ? '通过' : '答案错误' }
      return { ok: Boolean(result?.ok), message: String(result?.message || (result?.ok ? '通过' : '答案错误')).slice(0, 300) }
    } catch (error) {
      return { ok: false, judgeError: true, message: `Checker 运行失败：${error.message}` }
    }
  }
  const ok = normalizeOutput(expected) === normalizeOutput(actualOutput)
  return { ok, message: ok ? '通过' : '答案错误' }
}
