import { createServer } from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, delimiter, dirname, join, resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { categories, difficultyLevels, problems } from './src/data/problemCatalog.js'
import { checkProblemTestOutput, getCodeforcesTestPackStatus, getProblemTests } from './judge/problemTests.mjs'
import { readGeneratedCodeforcesPack } from './judge/codeforcesPackStore.mjs'
import { runCodeforcesInteractiveTest } from './judge/codeforcesInteractive.mjs'
import {
  getCodeforcesContest,
  getCodeforcesProblem,
  getCodeforcesStatus,
  listCodeforcesContests,
  syncCodeforcesContests,
  getSeededProblem,
  getCachedCodeforcesTranslation,
  saveCodeforcesTranslation,
  pretranslateCodeforcesStatements,
} from './codeforcesService.mjs'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
const dataDir = resolve(projectRoot, '.data')
const submissionsPath = resolve(dataDir, 'submissions.json')
const editorialsPath = resolve(dataDir, 'editorials.json')
const bundledGppPath = resolve(projectRoot, 'tools', 'w64devkit', 'bin', 'g++.exe')

const MAX_CHAT_BYTES = 8 * 1024 * 1024
const MAX_JUDGE_BYTES = 160 * 1024
const MAX_CODE_BYTES = 100 * 1024
const MAX_OUTPUT_BYTES = 512 * 1024
const COMPILE_TIMEOUT_MS = 12_000

function loadEnvFile(fileName) {
  const filePath = resolve(projectRoot, fileName)
  if (!existsSync(filePath)) return
  for (const rawLine of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const separator = line.indexOf('=')
    if (separator < 1) continue
    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile('.env')
loadEnvFile('.env.local')

const port = Number(process.env.AI_API_PORT || 3001)
const host = process.env.SERVER_HOST || '127.0.0.1'
const apiBaseUrl = (process.env.AI_API_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
const apiKey = process.env.AI_API_KEY || ''
const model = process.env.AI_MODEL || 'gpt-5.5'
let codeforcesTestGenerationProcess = null

function scheduleCodeforcesTestPackGeneration() {
  if (codeforcesTestGenerationProcess && codeforcesTestGenerationProcess.exitCode === null) return false
  const generatorPath = resolve(projectRoot, 'scripts', 'generate-codeforces-test-packs.mjs')
  codeforcesTestGenerationProcess = spawn(process.execPath, [generatorPath, '--all', '--concurrency=1'], {
    cwd: projectRoot,
    windowsHide: true,
    stdio: 'ignore',
    env: { ...process.env, AI_TEST_MODEL: process.env.AI_TEST_MODEL || 'gpt-5.4' },
  })
  codeforcesTestGenerationProcess.unref?.()
  codeforcesTestGenerationProcess.once('exit', () => { codeforcesTestGenerationProcess = null })
  return true
}

// Server-side course index used by the global search resolver.
const courseIndex = [
  { id: 'dp-foundation', title: '动态规划：从状态设计到模型优化', category: '动态规划', description: '建立完整的动态规划思维框架，掌握背包、区间、树形与状态压缩 DP。' },
  { id: 'graph-advanced', title: '图论进阶：网络流与匹配专题', category: '图论', description: '从增广路出发，系统掌握最大流、最小割、费用流与二分图匹配。' },
  { id: 'data-structure', title: '高级数据结构精讲与实战', category: '数据结构', description: '线段树、树状数组、平衡树与可持久化结构。' },
  { id: 'search-thinking', title: '搜索与剪枝：解题思维训练', category: '搜索', description: '通过经典模型掌握 DFS、BFS、双向搜索、A* 与高效剪枝。' },
]

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload)
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  })
  response.end(body)
}

function readBody(request, maxBytes = MAX_CHAT_BYTES) {
  return new Promise((resolveBody, reject) => {
    let size = 0
    const chunks = []
    request.on('data', (chunk) => {
      size += chunk.length
      if (size > maxBytes) {
        reject(new Error('请求内容过大。'))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')))
    request.on('error', reject)
  })
}

async function readJson(request, maxBytes = MAX_JUDGE_BYTES) {
  const text = await readBody(request, maxBytes)
  if (!text.trim()) return {}
  return JSON.parse(text)
}

function normalizeContent(content) {
  if (typeof content === 'string') return content.slice(0, 40_000)
  if (!Array.isArray(content)) return ''
  return content
    .filter((part) => part?.type === 'text' || part?.type === 'image_url')
    .map((part) => {
      if (part.type === 'text') return { type: 'text', text: String(part.text || '').slice(0, 40_000) }
      const imageUrl = part.image_url?.url
      return imageUrl ? { type: 'image_url', image_url: { url: imageUrl } } : null
    })
    .filter(Boolean)
}

function normalizeMessages(messages) {
  return messages
    .filter((message) => ['user', 'assistant', 'system'].includes(message?.role))
    .slice(-40)
    .map((message) => ({ role: message.role, content: normalizeContent(message.content) }))
    .filter((message) => (typeof message.content === 'string' ? message.content.trim() : message.content.length))
}

async function streamChat(request, response) {
  if (!apiKey) {
    sendJson(response, 503, { error: { message: '未配置 AI_API_KEY，请检查 .env.local。' } })
    return
  }

  let body
  try {
    body = JSON.parse(await readBody(request, MAX_CHAT_BYTES))
  } catch (error) {
    sendJson(response, 400, { error: { message: error.message || '请求格式不正确。' } })
    return
  }

  const messages = normalizeMessages(Array.isArray(body.messages) ? body.messages : [])
  if (!messages.length || messages[messages.length - 1]?.role !== 'user') {
    sendJson(response, 400, { error: { message: '请先输入一个问题。' } })
    return
  }

  let upstream
  try {
    upstream = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    })
  } catch (error) {
    sendJson(response, 502, { error: { message: `无法连接 AI 网关：${error.message}` } })
    return
  }

  if (!upstream.ok || !upstream.body) {
    const errorText = await upstream.text().catch(() => '')
    let detail = errorText
    try {
      detail = JSON.parse(errorText)?.error?.message || errorText
    } catch {
      // Keep the original response text when the gateway does not return JSON.
    }
    sendJson(response, upstream.status || 502, { error: { message: detail || `AI 网关返回 HTTP ${upstream.status}` } })
    return
  }

  response.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no',
  })

  try {
    for await (const chunk of upstream.body) {
      if (response.destroyed) break
      response.write(chunk)
    }
  } catch {
    if (!response.destroyed) response.write(`data: ${JSON.stringify({ error: { message: 'AI 输出连接已中断。' } })}\n\n`)
  } finally {
    if (!response.destroyed) response.end()
  }
}

async function handleCodeforcesTranslate(request, response) {
  let body
  try { body = await readJson(request, MAX_CHAT_BYTES) } catch (error) { sendJson(response, 400, { error: { message: error.message } }); return }
  const problem = await findAnyProblem(body.problemId)
  if (!problem) { sendJson(response, 404, { error: { message: 'Problem not found' } }); return }
  const cached = getCachedCodeforcesTranslation(problem.id, problem.statement)
  if (cached) {
    sendJson(response, 200, { translation: cached, cached: true })
    return
  }
  if (!apiKey) {
    sendJson(response, 503, { error: { message: 'AI_API_KEY is not configured; English statement remains available.' } })
    return
  }
  const source = JSON.stringify(problem.statement)
  const upstream = await fetch(`${apiBaseUrl}/chat/completions`, {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, temperature: 0.1, messages: [{ role: 'system', content: 'Translate the JSON problem statement into Simplified Chinese. Return valid JSON with the same keys, preserving samples and sourceUrl.' }, { role: 'user', content: source }] }),
  }).catch((error) => ({ ok: false, status: 502, text: async () => error.message }))
  if (!upstream.ok) { sendJson(response, upstream.status || 502, { error: { message: (await upstream.text().catch(() => 'Translation failed')).slice(0, 1000) } }); return }
  const data = await upstream.json()
  const content = data.choices?.[0]?.message?.content || ''
  let translation
  try { translation = JSON.parse(content.replace(/^```json\s*|\s*```$/g, '')) } catch { sendJson(response, 502, { error: { message: 'AI returned an invalid translation format.' } }); return }
  await saveCodeforcesTranslation(problem.id, problem.statement, translation)
  sendJson(response, 200, { translation, cached: false })
}

async function translateCodeforcesProblem(problem) {
  if (!apiKey || !problem?.statement?.available) return null
  const source = JSON.stringify(problem.statement)
  const upstream = await fetch(`${apiBaseUrl}/chat/completions`, {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, temperature: 0.1, messages: [{ role: 'system', content: 'Translate the JSON problem statement into Simplified Chinese. Return valid JSON with the same keys, preserving samples and sourceUrl.' }, { role: 'user', content: source }] }),
  })
  if (!upstream.ok) throw new Error(`AI translation HTTP ${upstream.status}`)
  const data = await upstream.json()
  const content = data.choices?.[0]?.message?.content || ''
  try { return JSON.parse(content.replace(/^```json\s*|\s*```$/g, '')) } catch { throw new Error('AI returned an invalid translation format') }
}

function getExecutableExtensions() {
  if (process.platform !== 'win32') return ['']
  return (process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM')
    .split(';')
    .filter(Boolean)
    .map((item) => item.toLowerCase())
}

function findExecutable(command) {
  if (!command) return null
  const hasPath = /[\\/]/.test(command)
  const extensions = getExecutableExtensions()
  const candidates = []

  if (hasPath) {
    candidates.push(command)
    if (process.platform === 'win32' && !/\.[a-z0-9]+$/i.test(command)) {
      for (const ext of extensions) candidates.push(`${command}${ext}`)
    }
  } else {
    const pathItems = (process.env.PATH || '').split(delimiter).filter(Boolean)
    for (const dir of pathItems) {
      candidates.push(resolve(dir, command))
      if (process.platform === 'win32' && !/\.[a-z0-9]+$/i.test(command)) {
        for (const ext of extensions) candidates.push(resolve(dir, `${command}${ext}`))
      }
    }
  }

  return candidates.find((candidate) => existsSync(candidate)) || null
}

function compilerKind(command) {
  const name = basename(command || '').toLowerCase()
  if (name === 'cl.exe' || name === 'cl') return 'msvc'
  return 'gnu'
}

function detectCompiler() {
  const configured = process.env.JUDGE_CXX
  const configuredPath = configured && /[\\/]/.test(configured) && !/^[A-Za-z]:[\\/]/.test(configured)
    ? resolve(projectRoot, configured)
    : configured
  const candidates = [
    configuredPath,
    bundledGppPath,
    'g++',
    'clang++',
    'cl',
    'C:\\msys64\\ucrt64\\bin\\g++.exe',
    'C:\\msys64\\mingw64\\bin\\g++.exe',
    'C:\\mingw64\\bin\\g++.exe',
    'C:\\MinGW\\bin\\g++.exe',
  ].filter(Boolean)

  for (const candidate of candidates) {
    const command = findExecutable(candidate)
    if (command) {
      const kind = process.env.JUDGE_CXX_KIND || compilerKind(command)
      return {
        available: true,
        command,
        kind,
        standard: kind === 'msvc' ? '/std:c++17' : '-std=c++17',
        configured: Boolean(configured),
        env: createJudgeSubprocessEnv(command, kind),
      }
    }
  }

  return {
    available: false,
    command: null,
    kind: null,
    standard: 'C++17',
    configured: Boolean(configured),
    message: '未检测到 C++17 编译器。请安装 MinGW-w64/MSYS2/Visual Studio Build Tools，或设置 JUDGE_CXX 指向 g++.exe、clang++.exe 或 cl.exe。',
  }
}

function createJudgeSubprocessEnv(command, kind) {
  const toolDir = dirname(command)
  if (process.platform !== 'win32') {
    return { PATH: `${toolDir}${delimiter}/usr/local/bin:/usr/bin:/bin` }
  }

  const systemRoot = process.env.SystemRoot || process.env.WINDIR || 'C:\\Windows'
  const env = {
    PATH: `${toolDir}${delimiter}${join(systemRoot, 'System32')}${delimiter}${systemRoot}`,
    PATHEXT: process.env.PATHEXT || '.COM;.EXE;.BAT;.CMD',
    SystemRoot: systemRoot,
    WINDIR: systemRoot,
    TEMP: tmpdir(),
    TMP: tmpdir(),
    ComSpec: process.env.ComSpec || join(systemRoot, 'System32', 'cmd.exe'),
  }

  // MSVC obtains headers and libraries from these toolchain-specific variables.
  // They contain compiler locations, not application configuration or API secrets.
  if (kind === 'msvc') {
    if (process.env.INCLUDE) env.INCLUDE = process.env.INCLUDE
    if (process.env.LIB) env.LIB = process.env.LIB
    if (process.env.LIBPATH) env.LIBPATH = process.env.LIBPATH
  }
  return env
}

function killProcessTree(child) {
  if (!child?.pid) return
  if (process.platform === 'win32') {
    const killer = spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' })
    killer.on('error', () => {})
    return
  }
  child.kill('SIGKILL')
}

function runProcess(command, args, options = {}) {
  const { cwd, input = '', timeoutMs = 1000, maxOutputBytes = MAX_OUTPUT_BYTES, env } = options
  return new Promise((resolveRun) => {
    const startedAt = Date.now()
    const child = spawn(command, args, { cwd, windowsHide: true, env })
    let stdout = ''
    let stderr = ''
    let timedOut = false
    let outputTruncated = false
    let settled = false
    let outputBytes = 0

    const timer = setTimeout(() => {
      timedOut = true
      killProcessTree(child)
    }, timeoutMs)

    function appendOutput(target, chunk) {
      outputBytes += chunk.length
      if (outputBytes > maxOutputBytes) {
        outputTruncated = true
        killProcessTree(child)
        return target
      }
      return target + chunk.toString('utf8')
    }

    child.stdout.on('data', (chunk) => {
      stdout = appendOutput(stdout, chunk)
    })
    child.stderr.on('data', (chunk) => {
      stderr = appendOutput(stderr, chunk)
    })
    child.stdin.on('error', () => {})
    child.on('error', (error) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolveRun({
        exitCode: null,
        signal: null,
        stdout,
        stderr: stderr || error.message,
        timedOut,
        outputTruncated,
        durationMs: Date.now() - startedAt,
      })
    })
    child.on('close', (exitCode, signal) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolveRun({
        exitCode,
        signal,
        stdout,
        stderr,
        timedOut,
        outputTruncated,
        durationMs: Date.now() - startedAt,
      })
    })

    if (input) child.stdin.end(input)
    else child.stdin.end()
  })
}

function compileArgs(compiler, sourceFile, binaryFile) {
  if (compiler.kind === 'msvc') {
    return ['/nologo', '/EHsc', '/O2', '/std:c++17', `/Fe:${binaryFile}`, sourceFile]
  }
  return ['-std=c++17', '-O2', '-pipe', '-DONLINE_JUDGE', sourceFile, '-o', binaryFile]
}

function publicCompiler(compiler) {
  if (!compiler?.available) return null
  return {
    available: true,
    command: compiler.command,
    kind: compiler.kind,
    standard: compiler.standard,
  }
}

function normalizeOutput(value) {
  return String(value)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .trimEnd()
}

function publicProblem(problem, { detail = true } = {}) {
  const tests = getAnyProblemTests(problem)
  const metadata = {
    ...problem,
    testPointCount: tests.length,
    totalScore: tests.reduce((sum, item) => sum + Number(item.score || 0), 0),
  }
  if (detail) return metadata

  const { statement, samples, ...summary } = metadata
  return summary
}

function latestVerdictsFor(submissions, problemIds = null) {
  const allowed = problemIds ? new Set(problemIds) : null
  const latest = new Map()
  for (const submission of submissions) {
    if (allowed && !allowed.has(submission.problemId)) continue
    // A solved problem stays solved even if the user later submits an
    // experimental wrong answer. Before the first AC, show the latest result.
    if (latest.get(submission.problemId) !== 'AC') latest.set(submission.problemId, submission.verdict || '')
  }
  return Object.fromEntries(latest)
}

async function findAnyProblem(id) {
  const local = problems.find((item) => item.id === id)
  if (local) return local
  const match = String(id || '').match(/^CF-(\d+)-([A-Za-z][0-9]*)$/i)
  return match ? (await getCodeforcesProblem(match[1], match[2])) || getSeededProblem(match[1], match[2]) : null
}

function getAnyProblemTests(problem) {
  const local = getProblemTests(problem.id)
  if (local.length) return local
  // Codeforces samples are suitable for the Run Sample action only. Full
  // submissions require a policy-compliant local pack instead of silently
  // treating one or two public samples as the complete judge data.
  if (String(problem?.id || '').startsWith('CF-')) return []
  return problem?.statement?.samples?.map((sample, index) => ({ name: `Sample ${index + 1}`, score: 100 / Math.max(1, problem.statement.samples.length), ...sample })) || []
}

async function judgeCode({ problem, code, tests, customInput = null, expectedOutput = null }) {
  if (typeof code !== 'string' || !code.trim()) {
    return {
      verdict: 'CE',
      score: 0,
      totalScore: 100,
      passed: 0,
      total: tests.length,
      message: '代码不能为空。',
      cases: [],
    }
  }

  if (Buffer.byteLength(code, 'utf8') > MAX_CODE_BYTES) {
    return {
      verdict: 'CE',
      score: 0,
      totalScore: 100,
      passed: 0,
      total: tests.length,
      message: '代码超过 100 KB 限制。',
      cases: [],
    }
  }

  const compiler = detectCompiler()
  if (!compiler.available) {
    const cases = customInput !== null
      ? [{ name: '自定义输入', score: 100, status: 'CE', timeMs: 0, message: '本地编译器不可用' }]
      : tests.map((test) => ({ name: test.name, score: test.score, status: 'CE', timeMs: 0, message: '本地编译器不可用' }))
    return {
      verdict: 'CE',
      score: 0,
      totalScore: 100,
      passed: 0,
      total: cases.length,
      compilerAvailable: false,
      message: compiler.message,
      cases,
    }
  }

  const workDir = await mkdtemp(join(tmpdir(), 'algo-arena-judge-'))
  const sourceFile = join(workDir, 'main.cpp')
  const binaryFile = join(workDir, process.platform === 'win32' ? 'main.exe' : 'main')

  try {
    await writeFile(sourceFile, code, 'utf8')
    const compile = await runProcess(compiler.command, compileArgs(compiler, sourceFile, binaryFile), {
      cwd: workDir,
      timeoutMs: COMPILE_TIMEOUT_MS,
      maxOutputBytes: MAX_OUTPUT_BYTES,
      env: compiler.env,
    })

    if (compile.timedOut) {
      return {
        verdict: 'CE',
        score: 0,
        totalScore: 100,
        passed: 0,
        total: tests.length,
        compiler: publicCompiler(compiler),
        message: '编译超时。',
        compileOutput: compile.stderr || compile.stdout,
        cases: [],
      }
    }

    if (compile.outputTruncated || compile.exitCode !== 0) {
      return {
        verdict: 'CE',
        score: 0,
        totalScore: 100,
        passed: 0,
        total: tests.length,
        compiler: publicCompiler(compiler),
        message: '编译失败。',
        compileOutput: (compile.stderr || compile.stdout || '编译器没有输出错误信息。').slice(0, 6000),
        cases: [],
      }
    }

    if (customInput !== null) {
      const run = await runProcess(binaryFile, [], {
        cwd: workDir,
        input: String(customInput).slice(0, 64 * 1024),
        timeoutMs: Math.max(Number(problem.limitMs || 1000) + 800, 1200),
        maxOutputBytes: MAX_OUTPUT_BYTES,
        env: compiler.env,
      })
      let status = run.timedOut ? 'TLE' : run.outputTruncated || run.exitCode !== 0 ? 'RE' : expectedOutput === null ? 'RUN' : 'AC'
      if (status === 'AC' && normalizeOutput(run.stdout) !== normalizeOutput(expectedOutput)) status = 'WA'
      return {
        verdict: status,
        score: status === 'AC' ? 100 : null,
        totalScore: 100,
        passed: status === 'AC' ? 1 : null,
        total: 1,
        compiler: publicCompiler(compiler),
        stdout: run.stdout.slice(0, 20_000),
        stderr: run.stderr.slice(0, 6000),
        cases: [{
          name: expectedOutput !== null ? '样例' : '自定义输入',
          score: status === 'AC' ? 100 : null,
          status,
          timeMs: run.durationMs,
          message: status === 'TLE' ? '运行超时' : status === 'RE' ? '运行错误或输出过大' : status === 'WA' ? '样例输出不匹配' : status === 'RUN' ? '程序运行完成，未提供标准输出，未判定正误。' : '运行完成',
        }],
      }
    }

    const interactivePack = String(problem?.id || '').startsWith('CF-') ? readGeneratedCodeforcesPack(problem.id) : null
    if (interactivePack?.mode === 'interactive') {
      let score = 0
      let passed = 0
      let worstVerdict = 'AC'
      const cases = []
      for (const test of tests) {
        const run = await runCodeforcesInteractiveTest(binaryFile, test, interactivePack.interactor, {
          cwd: workDir,
          env: compiler.env,
          timeoutMs: Math.max(Number(test.timeoutMs || 0), Number(problem.limitMs || 1000) + 1500, 2500),
        })
        const status = run.status === 'JE' ? 'RE' : run.status
        if (status === 'AC') {
          score += Number(test.score || 0)
          passed += 1
        } else if (worstVerdict === 'AC' || (worstVerdict === 'WA' && status !== 'WA')) {
          worstVerdict = status
        }
        cases.push({
          name: test.name,
          score: Number(test.score || 0),
          status,
          timeMs: run.durationMs,
          message: run.status === 'JE' ? `判题器错误：${run.message}` : run.message,
        })
      }
      const totalScore = tests.reduce((sum, test) => sum + Number(test.score || 0), 0)
      return {
        verdict: passed === tests.length ? 'AC' : worstVerdict,
        score,
        totalScore,
        passed,
        total: tests.length,
        compiler: publicCompiler(compiler),
        cases,
        message: passed === tests.length ? '全部交互测试点通过。' : `通过 ${passed}/${tests.length} 个交互测试点。`,
      }
    }

    let score = 0
    let passed = 0
    let worstVerdict = 'AC'
    const cases = []

    for (const test of tests) {
      const run = await runProcess(binaryFile, [], {
        cwd: workDir,
        input: test.input,
        timeoutMs: Math.max(Number(problem.limitMs || 1000) + 800, 1200),
        maxOutputBytes: MAX_OUTPUT_BYTES,
        env: compiler.env,
      })

      let status = 'AC'
      let message = '通过'
      if (run.timedOut) {
        status = 'TLE'
        message = '运行超时'
      } else if (run.outputTruncated) {
        status = 'RE'
        message = '输出超过限制'
      } else if (run.exitCode !== 0) {
        status = 'RE'
        message = run.stderr ? `运行错误：${run.stderr.slice(0, 300)}` : '程序非零退出'
      } else {
        const comparison = checkProblemTestOutput(problem.id, test, run.stdout)
        if (!comparison.ok) {
          status = 'WA'
          message = comparison.message || '答案错误'
          if (comparison.judgeError) status = 'RE'
        }
      }

      if (status === 'AC') {
        score += Number(test.score || 0)
        passed += 1
      } else if (worstVerdict === 'AC' || (worstVerdict === 'WA' && status !== 'WA')) {
        worstVerdict = status
      }

      cases.push({
        name: test.name,
        score: Number(test.score || 0),
        status,
        timeMs: run.durationMs,
        message,
      })
    }

    const totalScore = tests.reduce((sum, test) => sum + Number(test.score || 0), 0)
    return {
      verdict: passed === tests.length ? 'AC' : worstVerdict,
      score,
      totalScore,
      passed,
      total: tests.length,
      compiler: publicCompiler(compiler),
      cases,
      message: passed === tests.length ? '全部测试点通过。' : `通过 ${passed}/${tests.length} 个测试点。`,
    }
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {})
  }
}

async function readSubmissions() {
  try {
    const text = await readFile(submissionsPath, 'utf8')
    const data = JSON.parse(text)
    return Array.isArray(data) ? retainRecentSubmissions(data) : []
  } catch {
    return []
  }
}

async function writeSubmissions(submissions) {
  await mkdir(dataDir, { recursive: true })
  const tempPath = `${submissionsPath}.${process.pid}.${Date.now()}.tmp`
  await writeFile(tempPath, JSON.stringify(submissions, null, 2), 'utf8')
  await rename(tempPath, submissionsPath)
}

function retainRecentSubmissions(submissions, perProblem = 15, maxTotal = 500) {
  const counts = new Map()
  const kept = []
  for (let index = submissions.length - 1; index >= 0; index -= 1) {
    const submission = submissions[index]
    const count = counts.get(submission.problemId) || 0
    if (count >= perProblem) continue
    counts.set(submission.problemId, count + 1)
    kept.push(submission)
  }
  return kept.reverse().slice(-maxTotal)
}

async function listProblems() {
  const submissions = await readSubmissions()
  const statusByProblem = latestVerdictsFor(submissions)
  const counts = new Map()

  for (const submission of submissions) {
    counts.set(submission.problemId, (counts.get(submission.problemId) || 0) + 1)
  }
  return problems.map((problem) => {
    const problemSubmissions = submissions.filter((item) => item.problemId === problem.id)
    const latest = problemSubmissions.at(-1)
    const status = statusByProblem[problem.id] || ''
    return {
      ...publicProblem(problem, { detail: false }),
      submissions: problem.submissions + (counts.get(problem.id) || 0),
      // Keep the raw verdict so the UI can distinguish accepted, failed and
      // compile-error submissions. Problems with no submission remain blank.
      status,
      latestVerdict: status,
      lastSubmission: latest ? {
        id: latest.id,
        verdict: latest.verdict,
        score: latest.score,
        createdAt: latest.createdAt,
      } : null,
    }
  })
}

function normalizeSearchText(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('zh-CN')
    .replace(/[\s\u3000]+/g, ' ')
    .replace(/[\p{P}\p{S}]+/gu, '')
}

function problemSearchText(problem) {
  const statement = problem?.statement || {}
  return normalizeSearchText([
    problem.id,
    problem.title,
    problem.series,
    ...(problem.tags || []),
    ...(statement.description || []),
    statement.input,
    statement.output,
    statement.hint,
  ].filter(Boolean).join(' '))
}

function scoreSearchCandidate(problem, normalizedQuery) {
  const id = normalizeSearchText(problem.id)
  const title = normalizeSearchText(problem.title || problem.name)
  const series = normalizeSearchText(problem.series)
  const tags = normalizeSearchText((problem.tags || []).join(' '))
  const full = problemSearchText(problem)
  let score = 0
  if (id.includes(normalizedQuery)) score += id === normalizedQuery ? 120 : 90
  if (title.includes(normalizedQuery)) score += title === normalizedQuery ? 110 : 80
  if (series.includes(normalizedQuery)) score += 35
  if (tags.includes(normalizedQuery)) score += 32
  if (full.includes(normalizedQuery)) score += 10
  return score
}

async function askSearchAgent(query) {
  if (!apiKey) return 'ai'
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8_000)
  try {
    const upstream = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: 80,
        messages: [
          { role: 'system', content: '将搜索词分类为 ai 或 course，只返回 JSON：{"kind":"ai"}。题目匹配已经由本地完成。' },
          { role: 'user', content: query },
        ],
      }),
    })
    if (!upstream.ok) return 'ai'
    const data = await upstream.json()
    const content = String(data.choices?.[0]?.message?.content || '')
    const parsed = JSON.parse(content.replace(/^```json\s*|\s*```$/g, ''))
    return parsed.kind === 'course' ? 'course' : 'ai'
  } catch {
    return 'ai'
  } finally {
    clearTimeout(timer)
  }
}

async function resolveSearch(query) {
  const originalQuery = String(query || '').trim()
  const normalizedQuery = normalizeSearchText(originalQuery)
  if (!normalizedQuery) return { kind: 'none', query: originalQuery, target: '/', reason: 'empty-query' }

  const localProblems = problems
  const exactLocal = localProblems.find((problem) => normalizeSearchText(problem.id) === normalizedQuery || normalizeSearchText(problem.title) === normalizedQuery)
  if (exactLocal) {
    return { kind: 'problem-detail', query: originalQuery, target: `/problems/${encodeURIComponent(exactLocal.id)}`, problem: publicProblem(exactLocal), reason: 'exact-problem' }
  }

  // Codeforces ids/titles are searchable too, while keeping their native route.
  try {
    const contests = await listCodeforcesContests()
    for (const contest of contests) {
      for (const item of contest.problems || []) {
        const id = `CF-${contest.id}-${item.index}`
        if (normalizeSearchText(id) === normalizedQuery || normalizeSearchText(item.name) === normalizedQuery) {
          return { kind: 'problem-detail', query: originalQuery, target: `/codeforces/contests/${contest.id}/problems/${encodeURIComponent(item.index)}`, problem: item, reason: 'exact-codeforces-problem' }
        }
      }
    }
  } catch {
    // The local catalog remains usable when Codeforces is unavailable.
  }

  const related = localProblems
    .map((problem) => ({ problem, score: scoreSearchCandidate(problem, normalizedQuery) }))
    .filter((item) => item.score >= 30)
    .sort((a, b) => b.score - a.score || a.problem.id.localeCompare(b.problem.id))
    .slice(0, 20)
    .map(({ problem }) => publicProblem(problem, { detail: false }))
  if (related.length) {
    return { kind: 'problem-list', query: originalQuery, target: `/problems?query=${encodeURIComponent(originalQuery)}`, relatedProblems: related, reason: 'related-problems' }
  }

  const course = courseIndex.find((item) => normalizeSearchText(`${item.title} ${item.category} ${item.description}`).includes(normalizedQuery))
  if (course) return { kind: 'course', query: originalQuery, target: `/courses?query=${encodeURIComponent(originalQuery)}`, course, reason: 'course-match' }

  await askSearchAgent(originalQuery)
  return {
    kind: 'ai',
    query: originalQuery,
    target: `/ai?prompt=${encodeURIComponent(originalQuery)}`,
    aiPrompt: `请用中文详细回答这个算法知识问题，并给出必要的复杂度分析、思路和示例：${originalQuery}`,
    reason: 'knowledge-point',
  }
}

async function buildOverview() {
  const submissions = await readSubmissions()
  const catalog = await listProblems()
  const now = Date.now()
  const weekStart = now - 7 * 24 * 60 * 60 * 1000
  const weekSubmissions = submissions.filter((item) => Date.parse(item.createdAt || '') >= weekStart)
  const acceptedIds = new Set(submissions.filter((item) => item.verdict === 'AC').map((item) => item.problemId))
  const attemptedIds = new Set(submissions.map((item) => item.problemId))
  const seriesMap = new Map()
  for (const problem of catalog) {
    const current = seriesMap.get(problem.series) || { label: problem.series, total: 0, solved: 0 }
    current.total += 1
    if (acceptedIds.has(problem.id)) current.solved += 1
    seriesMap.set(problem.series, current)
  }
  const seriesProgress = [...seriesMap.values()].map((item) => ({ ...item, percent: item.total ? Math.round(item.solved / item.total * 100) : 0 }))
  const recentProblems = [...attemptedIds].map((id) => catalog.find((problem) => problem.id === id)).filter(Boolean).slice(-8).reverse()
  const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now - (6 - index) * 24 * 60 * 60 * 1000)
    const key = date.toISOString().slice(0, 10)
    return { date: key, submissions: weekSubmissions.filter((item) => String(item.createdAt || '').slice(0, 10) === key).length }
  })
  let streak = 0
  for (let offset = 0; offset < 365; offset += 1) {
    const key = new Date(now - offset * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    if (!submissions.some((item) => String(item.createdAt || '').slice(0, 10) === key)) break
    streak += 1
  }
  return {
    totalProblems: catalog.length,
    solvedProblems: [...acceptedIds].filter((id) => catalog.some((problem) => problem.id === id)).length,
    attemptedProblems: [...attemptedIds].filter((id) => catalog.some((problem) => problem.id === id)).length,
    totalSubmissions: submissions.length,
    weekSubmissions: weekSubmissions.length,
    weekAccepted: weekSubmissions.filter((item) => item.verdict === 'AC').length,
    passRate: submissions.length ? Math.round(submissions.filter((item) => item.verdict === 'AC').length / submissions.length * 1000) / 10 : 0,
    streak,
    recentProblems,
    seriesProgress,
    weeklyActivity,
  }
}

async function decorateCodeforcesContests(contests) {
  const submissions = await readSubmissions()
  const verdicts = latestVerdictsFor(submissions)
  return contests.map((contest) => {
    const problems = (contest.problems || []).map((problem) => {
      const id = `CF-${contest.id}-${problem.index}`
      const testPack = getCodeforcesTestPackStatus(id)
      return { ...problem, id, localJudgeReady: testPack.ready, testPointCount: testPack.count, largeTestPointCount: testPack.largeCount, testPack }
    })
    const passedCount = problems.reduce((count, problem) => count + (verdicts[`CF-${contest.id}-${problem.index}`] === 'AC' ? 1 : 0), 0)
    return { ...contest, problems, passedCount, totalProblemCount: problems.length }
  })
}

async function readEditorials() {
  try {
    const value = JSON.parse(await readFile(editorialsPath, 'utf8'))
    return value && typeof value === 'object' ? value : {}
  } catch {
    return {}
  }
}

async function writeEditorials(editorials) {
  await mkdir(dataDir, { recursive: true })
  const tempPath = `${editorialsPath}.${process.pid}.${Date.now()}.tmp`
  await writeFile(tempPath, JSON.stringify(editorials, null, 2), 'utf8')
  await rename(tempPath, editorialsPath)
}

function fallbackEditorial(problem) {
  const modelName = problem.coreModel || problem.tags?.join('、') || '题意建模与直接求解'
  const statement = problem.statement || {}
  const process = [
    `先按题意读取输入，明确需要维护的状态、边界条件以及最终输出。`,
    statement.hint || `将问题建模为“${modelName}”，只保留影响答案的必要信息。`,
    `按照题目给出的操作顺序更新状态；每一步都保持模型中的不变量，最后输出题目要求的唯一结果。`,
  ]
  return {
    title: `做法一：${modelName}`,
    idea: statement.solutionOutline || statement.hint || `本题的核心是把题意转换为${modelName}模型。先处理最小规模、重复值和极端值，再执行主流程。`,
    process,
    complexity: statement.targetComplexity || '时间复杂度和空间复杂度取决于题目约束与所选数据结构。',
    code: problem.referenceSolution || '',
  }
}

function codeforces2248AEditorial(problem) {
  return {
    title: '做法一：分别找到双方最优删除位置',
    idea: 'Alice 删除一个 0，希望剩余串字典序尽可能大，因此应删除最靠前的 0；越早消除 0，越可能让后面的 1 提前。Alice 操作后，Bob 删除一个 1，希望结果尽可能小，因此应删除当前串最靠前的 1。两次选择相互独立地服从字典序的首个不同位置原则。',
    process: [
      '从左向右找到原串中第一个字符 0，删除它。题目保证至少存在一个 0。',
      '在删除后的字符串中再次从左向右扫描，找到第一个字符 1 并删除。题目保证至少存在一个 1，且 Alice 删除的是 0，所以 1 仍然存在。',
      '输出剩余字符串。每个测试用例只需要两次线性扫描。',
    ],
    complexity: '设字符串长度为 n。时间复杂度 O(n)，额外空间复杂度 O(n)（使用 string::erase 保存结果；若原地构造答案也可做到 O(1) 额外工作空间）。',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int t;
    cin >> t;
    while (t--) {
        string s;
        cin >> s;
        s.erase(s.find('0'), 1);
        s.erase(s.find('1'), 1);
        cout << s << '\n';
    }
    return 0;
}`,
  }
}

function localEditorials(problem) {
  if (problem.id === 'CF-2248-A') return [codeforces2248AEditorial(problem)]
  return [fallbackEditorial(problem)]
}

async function generateEditorials(problem) {
  if (problem.id === 'CF-2248-A') return localEditorials(problem)
  if (!apiKey) return localEditorials(problem)
  const payload = {
    id: problem.id,
    title: problem.title || problem.name,
    tags: problem.tags || [],
    statement: problem.statement,
    referenceSolution: problem.referenceSolution || '',
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 35_000)
  let upstream
  try {
    upstream = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_tokens: 6000,
        messages: [
          { role: 'system', content: '你是算法竞赛题解作者。根据题目与参考代码输出简体中文 JSON：{"editorials":[{"title":"差异明显的做法名称","idea":"算法思想详细说明","process":["步骤1","步骤2"],"complexity":"时间与空间复杂度","code":"完整 C++17 代码"}]}。只有算法本质明显不同才拆成多种做法；不要伪造不可验证的做法；必须返回可解析 JSON。' },
          { role: 'user', content: JSON.stringify(payload) },
        ],
      }),
    })
  } finally {
    clearTimeout(timer)
  }
  if (!upstream.ok) throw new Error(`题解生成服务返回 HTTP ${upstream.status}`)
  const data = await upstream.json()
  const content = data.choices?.[0]?.message?.content || ''
  const parsed = JSON.parse(content.replace(/^```json\s*|\s*```$/g, ''))
  if (!Array.isArray(parsed.editorials) || !parsed.editorials.length) throw new Error('题解生成结果为空')
  return parsed.editorials.filter((item) => item?.idea && item?.complexity).map((item, index) => ({
    title: item.title || `做法 ${index + 1}`,
    idea: String(item.idea),
    process: Array.isArray(item.process) ? item.process.map(String) : [String(item.process || '')].filter(Boolean),
    complexity: String(item.complexity),
    code: String(item.code || problem.referenceSolution || ''),
  }))
}

async function handleProblemEditorial(requestUrl, response, problemId) {
  const problem = await findAnyProblem(problemId)
  if (!problem) { sendJson(response, 404, { error: { message: '题目不存在。' } }); return }
  const force = requestUrl.searchParams.get('force') === '1'
  const cache = await readEditorials()
  if (!force && Array.isArray(cache[problem.id]?.editorials)) {
    sendJson(response, 200, { editorials: cache[problem.id].editorials, cached: true })
    return
  }
  let editorials
  try {
    editorials = await generateEditorials(problem)
  } catch (error) {
    console.warn(`[editorial] fallback for ${problem.id}: ${error.message}`)
    editorials = localEditorials(problem)
  }
  cache[problem.id] = { generatedAt: Date.now(), editorials }
  await writeEditorials(cache)
  sendJson(response, 200, { editorials, cached: false })
}

async function getJudgeHealth() {
  const compiler = detectCompiler()
  return {
    ok: true,
    compilerAvailable: compiler.available,
    compiler: compiler.available ? {
      command: compiler.command,
      kind: compiler.kind,
      standard: compiler.standard,
    } : null,
    message: compiler.available
      ? `已检测到 ${compiler.kind === 'msvc' ? 'MSVC' : 'GNU/Clang'} C++17 编译器。`
      : compiler.message,
    problemCount: problems.length,
    judgedProblemCount: problems.filter((problem) => getProblemTests(problem.id).length).length,
    warning: '本地评测会直接运行提交的 C++ 程序，当前仅适合个人本机开发，不具备强隔离沙箱能力。',
  }
}

async function handleRun(request, response) {
  let body
  try {
    body = await readJson(request)
  } catch (error) {
    sendJson(response, 400, { error: { message: error.message || '请求格式不正确。' } })
    return
  }

  const problem = await findAnyProblem(body.problemId)
  if (!problem) {
    sendJson(response, 404, { error: { message: '题目不存在。' } })
    return
  }

  const tests = body.customInput !== undefined ? [] : getAnyProblemTests(problem)
  if (body.customInput === undefined && String(problem.id || '').startsWith('CF-')) {
    const testPack = getCodeforcesTestPackStatus(problem.id)
    if (!testPack.ready) {
      sendJson(response, 503, { error: { message: `Codeforces 本地评测数据未通过门禁：${testPack.issues.join('；')}` } })
      return
    }
  }
  /*
    : problem.samples.map((sample, index) => ({ name: `样例 ${index + 1}`, score: 100 / problem.samples.length, ...sample }))
  */
  const result = await judgeCode({
    problem,
    code: String(body.code || ''),
    tests,
    customInput: body.customInput !== undefined ? String(body.customInput) : null,
    expectedOutput: body.expectedOutput !== undefined ? String(body.expectedOutput) : null,
  })
  sendJson(response, 200, result)
}

async function handleSubmit(request, response) {
  let body
  try {
    body = await readJson(request)
  } catch (error) {
    sendJson(response, 400, { error: { message: error.message || '请求格式不正确。' } })
    return
  }

  const problem = await findAnyProblem(body.problemId)
  if (!problem) {
    sendJson(response, 404, { error: { message: '题目不存在。' } })
    return
  }

  const tests = getAnyProblemTests(problem)
  if (String(problem.id || '').startsWith('CF-')) {
    const testPack = getCodeforcesTestPackStatus(problem.id)
    if (!testPack.ready) {
      sendJson(response, 503, { error: { message: `Codeforces 本地评测数据未通过门禁：${testPack.issues.join('；')}` } })
      return
    }
  }
  if (!tests.length) {
    sendJson(response, 503, { error: { message: '该题暂未配置评测数据。' } })
    return
  }

  const id = `S${Date.now()}${Math.random().toString(36).slice(2, 7).toUpperCase()}`
  const startedAt = Date.now()
  const result = await judgeCode({ problem, code: String(body.code || ''), tests })
  const submission = {
    id,
    problemId: problem.id,
    problemTitle: problem.title,
    language: 'C++17',
    verdict: result.verdict,
    score: result.score,
    totalScore: result.totalScore,
    passed: result.passed,
    total: result.total,
    timeMs: result.cases?.length ? Math.max(...result.cases.map((item) => item.timeMs || 0)) : 0,
    message: result.message,
    compileOutput: result.compileOutput || '',
    cases: result.cases || [],
    createdAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    code: String(body.code || ''),
  }

  const submissions = await readSubmissions()
  submissions.push(submission)
  await writeSubmissions(retainRecentSubmissions(submissions))
  sendJson(response, 200, { ...result, submission })
}

async function handleListSubmissions(requestUrl, response) {
  const problemId = requestUrl.searchParams.get('problemId')
  const submissions = await readSubmissions()
  const filtered = problemId ? submissions.filter((item) => item.problemId === problemId) : submissions
  sendJson(response, 200, {
    submissions: filtered
      .slice()
      .reverse()
      .slice(0, 15),
  })
}

async function route(request, response) {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    })
    response.end()
    return
  }

  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || '127.0.0.1'}`)

  if (request.method === 'GET' && requestUrl.pathname === '/api/health') {
    sendJson(response, 200, { ok: true, configured: Boolean(apiKey), model, judge: await getJudgeHealth() })
    return
  }

  if (request.method === 'POST' && requestUrl.pathname === '/api/ai/chat') {
    await streamChat(request, response)
    return
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/overview') {
    sendJson(response, 200, await buildOverview())
    return
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/search') {
    sendJson(response, 200, await resolveSearch(requestUrl.searchParams.get('q') || ''))
    return
  }

  if (request.method === 'POST' && requestUrl.pathname === '/api/codeforces/translate') {
    await handleCodeforcesTranslate(request, response)
    return
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/judge/health') {
    sendJson(response, 200, await getJudgeHealth())
    return
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/codeforces/status') {
    sendJson(response, 200, getCodeforcesStatus())
    return
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/codeforces/contests') {
    sendJson(response, 200, { contests: await decorateCodeforcesContests(await listCodeforcesContests()) })
    return
  }

  if (request.method === 'POST' && requestUrl.pathname === '/api/codeforces/sync') {
    let body = {}
    try { body = await readJson(request) } catch { /* defaults are safe */ }
    const data = await syncCodeforcesContests({ days: Number(body.days) || 30, force: true })
    void pretranslateCodeforcesStatements({ days: 30, translate: translateCodeforcesProblem }).then(() => scheduleCodeforcesTestPackGeneration())
    sendJson(response, 200, { ...data, contests: await decorateCodeforcesContests(await listCodeforcesContests()) })
    return
  }

  if (request.method === 'POST' && requestUrl.pathname === '/api/codeforces/generate-tests') {
    const started = scheduleCodeforcesTestPackGeneration()
    sendJson(response, 202, { started, status: getCodeforcesStatus() })
    return
  }

  const cfContestMatch = requestUrl.pathname.match(/^\/api\/codeforces\/contests\/(\d+)$/)
  if (request.method === 'GET' && cfContestMatch) {
    const contest = await getCodeforcesContest(cfContestMatch[1])
    if (!contest) { sendJson(response, 404, { error: { message: 'Contest not found' } }); return }
    const submissions = await readSubmissions()
    const problemIds = (contest.problems || []).map((problem) => `CF-${contest.id}-${problem.index}`)
    const decoratedContest = (await decorateCodeforcesContests([contest]))[0]
    sendJson(response, 200, { contest: decoratedContest, verdicts: latestVerdictsFor(submissions, problemIds) })
    return
  }

  const cfProblemMatch = requestUrl.pathname.match(/^\/api\/codeforces\/problems\/(\d+)\/([^/]+)$/)
  if (request.method === 'GET' && cfProblemMatch) {
    const problem = await getCodeforcesProblem(cfProblemMatch[1], decodeURIComponent(cfProblemMatch[2]))
    if (!problem) { sendJson(response, 404, { error: { message: 'Codeforces problem not found' } }); return }
    sendJson(response, 200, { problem: publicProblem(problem) })
    return
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/problems') {
    sendJson(response, 200, { categories, difficulties: difficultyLevels, problems: await listProblems() })
    return
  }

  const problemMatch = requestUrl.pathname.match(/^\/api\/problems\/([^/]+)$/)
  if (request.method === 'GET' && problemMatch) {
    const problem = await findAnyProblem(decodeURIComponent(problemMatch[1]))
    if (!problem) {
      sendJson(response, 404, { error: { message: '题目不存在。' } })
      return
    }
    sendJson(response, 200, { problem: publicProblem(problem) })
    return
  }

  const editorialMatch = requestUrl.pathname.match(/^\/api\/problems\/([^/]+)\/editorials$/)
  if (request.method === 'GET' && editorialMatch) {
    await handleProblemEditorial(requestUrl, response, decodeURIComponent(editorialMatch[1]))
    return
  }

  if (request.method === 'POST' && requestUrl.pathname === '/api/judge/run') {
    await handleRun(request, response)
    return
  }

  if (request.method === 'POST' && requestUrl.pathname === '/api/judge/submissions') {
    await handleSubmit(request, response)
    return
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/judge/submissions') {
    await handleListSubmissions(requestUrl, response)
    return
  }

  const submissionMatch = requestUrl.pathname.match(/^\/api\/judge\/submissions\/([^/]+)$/)
  if (request.method === 'GET' && submissionMatch) {
    const submissions = await readSubmissions()
    const submission = submissions.find((item) => item.id === decodeURIComponent(submissionMatch[1]))
    if (!submission) {
      sendJson(response, 404, { error: { message: '提交记录不存在。' } })
      return
    }
    sendJson(response, 200, { submission })
    return
  }

  sendJson(response, 404, { error: { message: '接口不存在。' } })
}

const server = createServer((request, response) => {
  route(request, response).catch((error) => {
    sendJson(response, 500, { error: { message: error.message || '服务端内部错误。' } })
  })
})

// Keep the Codeforces archive warm in the background. The request path still
// performs a TTL check, so this timer is only a convenience for running the
// daily sync even when nobody opens the archive page that day.
const codeforcesDailySync = setInterval(() => {
  syncCodeforcesContests({ days: 30, force: true }).then(() => pretranslateCodeforcesStatements({ days: 30, translate: translateCodeforcesProblem })).then(() => scheduleCodeforcesTestPackGeneration()).catch((error) => {
    console.warn(`[codeforces] daily sync skipped: ${error.message}`)
  })
}, 24 * 60 * 60 * 1000)
codeforcesDailySync.unref?.()
syncCodeforcesContests({ days: 30 }).then(() => pretranslateCodeforcesStatements({ days: 30, translate: translateCodeforcesProblem })).then(() => scheduleCodeforcesTestPackGeneration()).catch((error) => {
  console.warn(`[codeforces] initial sync/translation skipped: ${error.message}`)
})

server.listen(port, host, () => {
  const compiler = detectCompiler()
  console.log(`[local server] listening on http://${host}:${port}`)
  console.log(`[local server] AI upstream: ${apiBaseUrl} | model: ${model} | key: ${apiKey ? 'configured' : 'missing'}`)
  console.log(`[local server] judge compiler: ${compiler.available ? compiler.command : 'missing'}`)
})

process.on('SIGINT', () => server.close(() => process.exit(0)))
process.on('SIGTERM', () => server.close(() => process.exit(0)))
