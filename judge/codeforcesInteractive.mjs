import { spawn } from 'node:child_process'
import vm from 'node:vm'

const MAX_INTERACTOR_SOURCE_BYTES = 256 * 1024
const MAX_INTERACTOR_STATE_BYTES = 8 * 1024 * 1024

function killProcessTree(child) {
  if (!child?.pid) return
  if (process.platform === 'win32') {
    const killer = spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
      windowsHide: true,
      stdio: 'ignore',
    })
    killer.on('error', () => {})
    return
  }
  child.kill('SIGKILL')
}

function jsonClone(value) {
  return JSON.parse(JSON.stringify(value))
}

export function validateCodeforcesInteractor(interactor) {
  if (interactor?.type === 'security-game-v1') return true
  if (!interactor || interactor.type !== 'line-js') throw new Error('interactive pack requires a line-js interactor')
  if (typeof interactor.source !== 'string' || interactor.source.length < 40) throw new Error('interactive pack has no interactor source')
  if (Buffer.byteLength(interactor.source, 'utf8') > MAX_INTERACTOR_SOURCE_BYTES) throw new Error('interactive interactor source exceeds 256 KB')

  const sandbox = Object.create(null)
  sandbox.result = null
  vm.createContext(sandbox, { codeGeneration: { strings: false, wasm: false } })
  const script = new vm.Script(`result = (${interactor.source})`, { filename: 'codeforces-interactor.vm.js' })
  script.runInContext(sandbox, { timeout: 500 })
  if (typeof sandbox.result !== 'function') throw new Error('interactive interactor source is not a function')
  return true
}

export function createCodeforcesInteractiveSession(interactor, scenario) {
  validateCodeforcesInteractor(interactor)
  if (interactor.type === 'security-game-v1') return createFastSecurityGameSession(scenario)
  const sandbox = Object.create(null)
  sandbox.handler = null
  sandbox.event = null
  sandbox.state = null
  sandbox.result = null
  sandbox.scenario = jsonClone(scenario || {})
  vm.createContext(sandbox, { codeGeneration: { strings: false, wasm: false } })
  new vm.Script(`handler = (${interactor.source})`, { filename: 'codeforces-interactor.vm.js' })
    .runInContext(sandbox, { timeout: 500 })
  const invokeScript = new vm.Script('result = handler({ scenario, state, event })', { filename: 'codeforces-interactor-event.vm.js' })
  let invocationCount = 0

  return {
    invoke(line = null) {
      sandbox.event = line === null ? { type: 'start' } : { type: 'line', line: String(line) }
      sandbox.result = null
      invokeScript.runInContext(sandbox, { timeout: Number(interactor.eventTimeoutMs || 500) })
      const result = sandbox.result
      if (!result || typeof result !== 'object') throw new Error('interactor returned a non-object result')
      const responses = result.responses == null ? [] : result.responses
      if (!Array.isArray(responses) || responses.some((value) => typeof value !== 'string')) throw new Error('interactor responses must be strings')
      if (responses.some((value) => value.includes('\n') || value.includes('\r'))) throw new Error('each interactor response must contain exactly one line')
      sandbox.state = result.state == null ? null : result.state
      invocationCount += 1
      if (invocationCount === 1 || invocationCount % 512 === 0) {
        if (Buffer.byteLength(JSON.stringify(sandbox.state), 'utf8') > MAX_INTERACTOR_STATE_BYTES) throw new Error('interactor state exceeds 8 MB')
      }
      return {
        responses: Array.from(responses),
        done: Boolean(result.done),
        ok: result.ok !== false,
        message: String(result.message || '').slice(0, 500),
      }
    },
  }
}

function createFastSecurityGameSession(scenario) {
  const mask = (1 << 30) - 1
  const count = Number(scenario?.count || 0)
  let state = null
  const mix = (value) => {
    value = (value ^ (value >>> 16)) >>> 0
    value = Math.imul(value, 0x7feb352d) >>> 0
    value = (value ^ (value >>> 15)) >>> 0
    value = Math.imul(value, 0x846ca68b) >>> 0
    return (value ^ (value >>> 16)) >>> 0
  }
  const bad = (message) => ({ state, responses: [], done: true, ok: false, message })
  return {
    invoke(line = null) {
      if (line === null) {
        if (!Number.isInteger(count) || count < 1 || count > 100000) return bad('invalid security-game case count')
        state = { index: 0, phase: 'x' }
        return { state, responses: [String(count)], done: false, ok: true }
      }
      if (!state) return bad('invalid interactor state')
      const tokens = String(line || '').trim().split(/\s+/).filter(Boolean)
      const values = tokens.map(Number)
      if (values.some((v) => !Number.isInteger(v) || v < 0 || v > mask)) return bad('query value is outside [0, 2^30)')
      if (state.phase === 'x') {
        if (values.length !== 1) return bad('expected one initial value')
        const x = values[0]
        const base = mix((Number(scenario.seed || 1) + Math.imul(state.index + 1, 0x9e3779b1)) >>> 0)
        const b = (base >>> 4) & 1
        const ty = (base >>> 9) & 1
        let v
        if (Number(scenario.zeroEvery || 0) > 0 && state.index % Number(scenario.zeroEvery) === 0) v = 0
        else {
          v = mix(base ^ (scenario.adaptive ? x : 0)) & mask
          if (v === 0) v = 1 << ((base >>> 16) % 30)
        }
        state = { ...state, phase: 'm', b, ty, v }
        return { state, responses: [String(ty === 0 ? (v & x) : (v | x))], done: false, ok: true }
      }
      if (state.phase === 'm') {
        if (values.length !== 2) return bad('expected m0 and m1')
        state = { ...state, phase: 'answer' }
        return { state, responses: [String((values[state.b] ^ state.v) >>> 0)], done: false, ok: true }
      }
      if (state.phase !== 'answer' || values.length !== 1 || (values[0] !== 0 && values[0] !== 1)) return bad('expected the guessed bit')
      if (values[0] !== state.b) return bad('guessed bit is incorrect')
      const nextIndex = state.index + 1
      if (nextIndex === count) return { state: { ...state, index: nextIndex }, responses: [], done: true, ok: true, message: 'all security games solved' }
      state = { index: nextIndex, phase: 'x' }
      return { state, responses: [], done: false, ok: true }
    },
  }
}

export function runCodeforcesInteractiveTest(binaryPath, test, interactor, options = {}) {
  const {
    cwd,
    env,
    timeoutMs = 10_000,
    maxContestantOutputBytes = 32 * 1024 * 1024,
    maxInteractorOutputBytes = 32 * 1024 * 1024,
  } = options

  return new Promise((resolveRun) => {
    const startedAt = Date.now()
    let session
    try {
      session = createCodeforcesInteractiveSession(interactor, test.scenario)
    } catch (error) {
      resolveRun({ status: 'JE', message: `交互器初始化失败：${error.message}`, durationMs: 0, stderr: '' })
      return
    }

    const child = spawn(binaryPath, [], { cwd, windowsHide: true, env, stdio: ['pipe', 'pipe', 'pipe'] })
    let contestantBuffer = ''
    let contestantBytes = 0
    let interactorBytes = 0
    let stderr = ''
    let stderrBytes = 0
    let finished = false
    let interactorDone = false
    let interactorOk = false
    let forcedStatus = ''
    let forcedMessage = ''
    let timedOut = false

    function fail(status, message) {
      if (!forcedStatus) {
        forcedStatus = status
        forcedMessage = message
      }
      killProcessTree(child)
    }

    function applyResult(result) {
      for (const response of result.responses) {
        const payload = `${response}\n`
        interactorBytes += Buffer.byteLength(payload)
        if (interactorBytes > maxInteractorOutputBytes) {
          fail('JE', '交互器输出超过限制')
          return
        }
        if (!child.stdin.destroyed) child.stdin.write(payload)
      }
      if (result.done) {
        interactorDone = true
        interactorOk = result.ok
        if (!result.ok) {
          fail('WA', result.message || '交互答案错误')
          return
        }
        if (!child.stdin.destroyed) child.stdin.end()
      }
    }

    function processLine(line) {
      if (forcedStatus) return
      if (interactorDone) {
        if (line.trim()) fail('WA', '交互结束后仍有额外输出')
        return
      }
      try {
        applyResult(session.invoke(line.replace(/\r$/, '')))
      } catch (error) {
        fail('JE', `交互器运行失败：${error.message}`)
      }
    }

    const timer = setTimeout(() => {
      timedOut = true
      fail('TLE', '交互运行超时或未及时刷新输出')
    }, timeoutMs)

    child.stdin.on('error', () => {})
    child.stdout.on('data', (chunk) => {
      contestantBytes += chunk.length
      if (contestantBytes > maxContestantOutputBytes) {
        fail('RE', '选手程序输出超过交互限制')
        return
      }
      contestantBuffer += chunk.toString('utf8')
      let newline = contestantBuffer.indexOf('\n')
      while (newline >= 0) {
        const line = contestantBuffer.slice(0, newline)
        contestantBuffer = contestantBuffer.slice(newline + 1)
        processLine(line)
        newline = contestantBuffer.indexOf('\n')
      }
    })
    child.stderr.on('data', (chunk) => {
      stderrBytes += chunk.length
      if (stderrBytes <= 64 * 1024) stderr += chunk.toString('utf8')
    })
    child.on('error', (error) => fail('RE', `程序启动失败：${error.message}`))
    child.on('close', (exitCode) => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      if (contestantBuffer.length && !forcedStatus && !interactorDone) processLine(contestantBuffer)
      let status = forcedStatus
      let message = forcedMessage
      if (!status && exitCode !== 0) {
        status = 'RE'
        message = stderr ? `程序非零退出：${stderr.slice(0, 300)}` : '程序非零退出'
      } else if (!status && !interactorDone) {
        status = 'WA'
        message = '程序在完成交互前退出'
      } else if (!status && !interactorOk) {
        status = 'WA'
        message = '交互答案错误'
      } else if (!status) {
        status = 'AC'
        message = '通过'
      }
      resolveRun({ status, message, durationMs: Date.now() - startedAt, stderr: stderr.slice(0, 6000), timedOut })
    })

    try {
      applyResult(session.invoke(null))
    } catch (error) {
      fail('JE', `交互器启动失败：${error.message}`)
    }
  })
}
