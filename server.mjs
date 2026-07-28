import { createServer } from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, delimiter, dirname, join, resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { categories, difficultyLevels, problems } from './src/data/problemCatalog.js'
import { getProblemTests } from './judge/problemTests.mjs'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
const dataDir = resolve(projectRoot, '.data')
const submissionsPath = resolve(dataDir, 'submissions.json')
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
const apiBaseUrl = (process.env.AI_API_BASE_URL || 'https://aigw.sotatts.online/v1').replace(/\/$/, '')
const apiKey = process.env.AI_API_KEY || ''
const model = process.env.AI_MODEL || 'gpt-5.5'

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

function publicProblem(problem) {
  const tests = getProblemTests(problem.id)
  return {
    ...problem,
    testPointCount: tests.length,
    totalScore: tests.reduce((sum, item) => sum + Number(item.score || 0), 0),
  }
}

async function judgeCode({ problem, code, tests, customInput = null }) {
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
      const status = run.timedOut ? 'TLE' : run.outputTruncated || run.exitCode !== 0 ? 'RE' : 'AC'
      return {
        verdict: status,
        score: status === 'AC' ? 100 : 0,
        totalScore: 100,
        passed: status === 'AC' ? 1 : 0,
        total: 1,
        compiler: publicCompiler(compiler),
        stdout: run.stdout.slice(0, 20_000),
        stderr: run.stderr.slice(0, 6000),
        cases: [{
          name: '自定义输入',
          score: status === 'AC' ? 100 : 0,
          status,
          timeMs: run.durationMs,
          message: status === 'TLE' ? '运行超时' : status === 'RE' ? '运行错误或输出过大' : '运行完成',
        }],
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
      } else if (normalizeOutput(run.stdout) !== normalizeOutput(test.output)) {
        status = 'WA'
        message = '答案错误'
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
    return Array.isArray(data) ? data : []
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

async function listProblems() {
  const submissions = await readSubmissions()
  const latestByProblem = new Map()
  const counts = new Map()

  for (const submission of submissions) {
    counts.set(submission.problemId, (counts.get(submission.problemId) || 0) + 1)
  }
  for (const submission of [...submissions].reverse()) {
    if (!latestByProblem.has(submission.problemId)) latestByProblem.set(submission.problemId, submission)
  }

  return problems.map((problem) => {
    const latest = latestByProblem.get(problem.id)
    return {
      ...publicProblem(problem),
      submissions: problem.submissions + (counts.get(problem.id) || 0),
      status: latest?.verdict === 'AC' ? '通过' : latest ? '尝试过' : problem.status,
      lastSubmission: latest ? {
        id: latest.id,
        verdict: latest.verdict,
        score: latest.score,
        createdAt: latest.createdAt,
      } : null,
    }
  })
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

  const problem = problems.find((item) => item.id === body.problemId)
  if (!problem) {
    sendJson(response, 404, { error: { message: '题目不存在。' } })
    return
  }

  const tests = body.customInput !== undefined
    ? []
    : problem.samples.map((sample, index) => ({ name: `样例 ${index + 1}`, score: 100 / problem.samples.length, ...sample }))
  const result = await judgeCode({
    problem,
    code: String(body.code || ''),
    tests,
    customInput: body.customInput !== undefined ? String(body.customInput) : null,
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

  const problem = problems.find((item) => item.id === body.problemId)
  if (!problem) {
    sendJson(response, 404, { error: { message: '题目不存在。' } })
    return
  }

  const tests = getProblemTests(problem.id)
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
  }

  const submissions = await readSubmissions()
  submissions.push(submission)
  await writeSubmissions(submissions.slice(-500))
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
      .slice(0, 80),
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

  if (request.method === 'GET' && requestUrl.pathname === '/api/judge/health') {
    sendJson(response, 200, await getJudgeHealth())
    return
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/problems') {
    sendJson(response, 200, { categories, difficulties: difficultyLevels, problems: await listProblems() })
    return
  }

  const problemMatch = requestUrl.pathname.match(/^\/api\/problems\/([^/]+)$/)
  if (request.method === 'GET' && problemMatch) {
    const problem = problems.find((item) => item.id === decodeURIComponent(problemMatch[1]))
    if (!problem) {
      sendJson(response, 404, { error: { message: '题目不存在。' } })
      return
    }
    sendJson(response, 200, { problem: publicProblem(problem) })
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

server.listen(port, host, () => {
  const compiler = detectCompiler()
  console.log(`[local server] listening on http://${host}:${port}`)
  console.log(`[local server] AI upstream: ${apiBaseUrl} | model: ${model} | key: ${apiKey ? 'configured' : 'missing'}`)
  console.log(`[local server] judge compiler: ${compiler.available ? compiler.command : 'missing'}`)
})

process.on('SIGINT', () => server.close(() => process.exit(0)))
process.on('SIGTERM', () => server.close(() => process.exit(0)))
