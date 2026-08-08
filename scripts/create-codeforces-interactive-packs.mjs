import { mkdir, rename, writeFile } from 'node:fs/promises'
import { gzip } from 'node:zlib'
import { promisify } from 'node:util'
import { codeforcesPackDir, codeforcesPackPath } from '../judge/codeforcesPackStore.mjs'
import { getCodeforcesTestPackStatus } from '../judge/problemTests.mjs'
import { validateCodeforcesInteractor } from '../judge/codeforcesInteractive.mjs'

const gzipAsync = promisify(gzip)

const npcTreeInteractor = String.raw`({ scenario, state, event }) => {
  const tests = scenario.tests || [];
  const bad = (message, nextState = state) => ({ state: nextState, responses: [], done: true, ok: false, message });
  const beginCase = (caseIndex) => ({ caseIndex, phase: 'query', queryCost: 0, answerEdges: [] });
  if (event.type === 'start') {
    if (!tests.length) return bad('empty hidden-tree scenario', null);
    return { state: beginCase(0), responses: [String(tests.length), String(tests[0].n)], done: false, ok: true };
  }
  if (!state || event.type !== 'line') return bad('invalid interactor state');
  const current = tests[state.caseIndex];
  if (!current) return bad('hidden test case is missing');
  const n = Number(current.n);
  const tokens = String(event.line || '').trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return bad('empty protocol line');

  if (state.phase === 'query') {
    if (tokens[0] === '?') {
      const k = Number(tokens[1]);
      if (!Number.isInteger(k) || k < 1 || k > n || tokens.length !== k + 2) return bad('invalid query length');
      const order = tokens.slice(2).map(Number);
      if (order.some((v) => !Number.isInteger(v) || v < 1 || v > n) || new Set(order).size !== order.length) return bad('query vertices must be distinct and in range');
      const cost = state.queryCost + k;
      if (cost > 30 * n) return bad('query budget exceeded');
      const adjacency = Array.from({ length: n + 1 }, () => []);
      for (const edge of current.edges || []) {
        const u = Number(edge[0]), v = Number(edge[1]);
        adjacency[u].push(v); adjacency[v].push(u);
      }
      const selected = Array(n + 1).fill(false);
      let bits = '';
      for (const vertex of order) {
        let accepted = true;
        for (const neighbor of adjacency[vertex]) if (selected[neighbor]) { accepted = false; break; }
        bits += accepted ? '1' : '0';
        if (accepted) selected[vertex] = true;
      }
      return { state: { ...state, queryCost: cost }, responses: [bits], done: false, ok: true };
    }
    if (tokens[0] === '!' && tokens.length === 1) {
      return { state: { ...state, phase: 'answer', answerEdges: [] }, responses: [], done: false, ok: true };
    }
    return bad('expected a query or final answer marker');
  }

  if (state.phase !== 'answer' || tokens.length !== 2) return bad('expected one answer edge');
  const u = Number(tokens[0]), v = Number(tokens[1]);
  if (!Number.isInteger(u) || !Number.isInteger(v) || u < 1 || u > n || v < 1 || v > n || u === v) return bad('invalid answer edge');
  const answerEdges = state.answerEdges.concat([[Math.min(u, v), Math.max(u, v)]]);
  if (answerEdges.length < n - 1) return { state: { ...state, answerEdges }, responses: [], done: false, ok: true };
  const expected = new Set((current.edges || []).map((edge) => Math.min(edge[0], edge[1]) + ':' + Math.max(edge[0], edge[1])));
  const actual = new Set(answerEdges.map((edge) => edge[0] + ':' + edge[1]));
  if (actual.size !== n - 1 || expected.size !== actual.size || Array.from(expected).some((edge) => !actual.has(edge))) return bad('reported tree is incorrect', { ...state, answerEdges });
  const nextIndex = state.caseIndex + 1;
  if (nextIndex === tests.length) return { state: { ...state, answerEdges }, responses: [], done: true, ok: true, message: 'all hidden trees reconstructed' };
  return { state: beginCase(nextIndex), responses: [String(tests[nextIndex].n)], done: false, ok: true };
}`

const securityGameInteractor = String.raw`({ scenario, state, event }) => {
  const mask = (1 << 30) - 1;
  const count = Number(scenario.count || 0);
  const bad = (message, nextState = state) => ({ state: nextState, responses: [], done: true, ok: false, message });
  const mix = (value) => {
    value = (value ^ (value >>> 16)) >>> 0;
    value = Math.imul(value, 0x7feb352d) >>> 0;
    value = (value ^ (value >>> 15)) >>> 0;
    value = Math.imul(value, 0x846ca68b) >>> 0;
    return (value ^ (value >>> 16)) >>> 0;
  };
  if (event.type === 'start') {
    if (!Number.isInteger(count) || count < 1 || count > 100000) return bad('invalid security-game case count', null);
    return { state: { index: 0, phase: 'x' }, responses: [String(count)], done: false, ok: true };
  }
  if (!state || event.type !== 'line') return bad('invalid interactor state');
  const tokens = String(event.line || '').trim().split(/\s+/).filter(Boolean);
  const values = tokens.map(Number);
  if (values.some((v) => !Number.isInteger(v) || v < 0 || v > mask)) return bad('query value is outside [0, 2^30)');
  if (state.phase === 'x') {
    if (values.length !== 1) return bad('expected one initial value');
    const x = values[0];
    const base = mix((Number(scenario.seed || 1) + Math.imul(state.index + 1, 0x9e3779b1)) >>> 0);
    const b = (base >>> 4) & 1;
    const ty = (base >>> 9) & 1;
    let v;
    if (Number(scenario.zeroEvery || 0) > 0 && state.index % Number(scenario.zeroEvery) === 0) v = 0;
    else {
      v = mix(base ^ (scenario.adaptive ? x : 0)) & mask;
      if (v === 0) v = 1 << ((base >>> 16) % 30);
    }
    const o = ty === 0 ? (v & x) : (v | x);
    return { state: { ...state, phase: 'm', b, ty, v }, responses: [String(o)], done: false, ok: true };
  }
  if (state.phase === 'm') {
    if (values.length !== 2) return bad('expected m0 and m1');
    const r = (values[state.b] ^ state.v) >>> 0;
    return { state: { ...state, phase: 'answer' }, responses: [String(r)], done: false, ok: true };
  }
  if (state.phase !== 'answer' || values.length !== 1 || (values[0] !== 0 && values[0] !== 1)) return bad('expected the guessed bit');
  if (values[0] !== state.b) return bad('guessed bit is incorrect');
  const nextIndex = state.index + 1;
  if (nextIndex === count) return { state: { ...state, index: nextIndex }, responses: [], done: true, ok: true, message: 'all security games solved' };
  return { state: { index: nextIndex, phase: 'x' }, responses: [], done: false, ok: true };
}`

function pathTree(n) {
  return Array.from({ length: n - 1 }, (_, index) => [index + 1, index + 2])
}

function starTree(n, center = 1) {
  const edges = []
  for (let vertex = 1; vertex <= n; vertex += 1) if (vertex !== center) edges.push([center, vertex])
  return edges
}

function binaryTree(n) {
  return Array.from({ length: n - 1 }, (_, index) => [Math.floor((index + 2) / 2), index + 2])
}

function broomTree(n) {
  const handle = Math.floor(n * 0.7)
  const edges = pathTree(handle)
  for (let vertex = handle + 1; vertex <= n; vertex += 1) edges.push([handle, vertex])
  return edges
}

function caterpillarTree(n) {
  const spine = Math.ceil(n / 2)
  const edges = pathTree(spine)
  for (let vertex = spine + 1; vertex <= n; vertex += 1) edges.push([vertex - spine, vertex])
  return edges
}

function deterministicTree(n, seed) {
  let value = seed >>> 0
  const edges = []
  for (let vertex = 2; vertex <= n; vertex += 1) {
    value = (Math.imul(value ^ (value >>> 15), 2246822519) + vertex) >>> 0
    edges.push([vertex, value % (vertex - 1) + 1])
  }
  return edges
}

function hiddenTreeInput(tests) {
  return `${tests.length}\n${tests.map((test) => `${test.n}\n${test.edges.map((edge) => edge.join(' ')).join('\n')}`).join('\n')}\n`
}

function treeTest(name, tests, scale, description) {
  const sumN = tests.reduce((sum, test) => sum + test.n, 0)
  return { name, score: 5, scale, sizeRatio: sumN / 1000, dataDescription: description, input: hiddenTreeInput(tests), output: '', timeoutMs: 15_000, scenario: { tests } }
}

const npcTreeTests = [
  treeTest('Two vertices', [{ n: 2, edges: [[1, 2]] }], 'basic', 'Minimum hidden tree.'),
  treeTest('Short path', [{ n: 7, edges: pathTree(7) }], 'basic', 'Small path checks ordered independent-set responses.'),
  treeTest('Small star', [{ n: 12, edges: starTree(12, 6) }], 'boundary', 'A non-first center catches index assumptions.'),
  treeTest('Small binary tree', [{ n: 31, edges: binaryTree(31) }], 'basic', 'Balanced branching structure.'),
  treeTest('Small broom', [{ n: 45, edges: broomTree(45) }], 'boundary', 'Mixed path and high-degree endpoint.'),
  treeTest('Small caterpillar', [{ n: 60, edges: caterpillarTree(60) }], 'boundary', 'Long spine with leaves.'),
  treeTest('Several tiny trees', Array.from({ length: 20 }, (_, i) => ({ n: 2 + i % 5, edges: deterministicTree(2 + i % 5, 101 + i) })), 'basic', 'Exercises transitions between many test cases.'),
  treeTest('Random medium tree', [{ n: 150, edges: deterministicTree(150, 2245) }], 'boundary', 'Deterministic non-special tree.'),
  treeTest('Two medium opposites', [{ n: 180, edges: pathTree(180) }, { n: 180, edges: starTree(180, 90) }], 'boundary', 'Path and star in one interaction.'),
  treeTest('Mixed forest-shaped batch', [40, 55, 70, 85, 100].map((n, i) => ({ n, edges: deterministicTree(n, 500 + i) })), 'boundary', 'Multiple differently shaped hidden trees.'),
  treeTest('Large path 1000', [{ n: 1000, edges: pathTree(1000) }], 'large', 'Maximum total n with diameter 999.'),
  treeTest('Large star 1000', [{ n: 1000, edges: starTree(1000, 1) }], 'large', 'Maximum total n and degree 999.'),
  treeTest('Large centered star', [{ n: 1000, edges: starTree(1000, 731) }], 'large', 'Maximum total n with a shuffled high-degree center.'),
  treeTest('Large binary 1000', [{ n: 1000, edges: binaryTree(1000) }], 'large', 'Maximum total n with balanced depth.'),
  treeTest('Large broom 1000', [{ n: 1000, edges: broomTree(1000) }], 'large', 'Maximum total n mixing long diameter and high degree.'),
  treeTest('Large caterpillar 1000', [{ n: 1000, edges: caterpillarTree(1000) }], 'large', 'Maximum total n with many leaves along a spine.'),
  treeTest('Large deterministic tree A', [{ n: 1000, edges: deterministicTree(1000, 0x2245a) }], 'large', 'Maximum total n with deterministic irregular branching.'),
  treeTest('Large deterministic tree B', [{ n: 1000, edges: deterministicTree(1000, 0x2245b) }], 'large', 'A second maximum irregular tree with a different seed.'),
  treeTest('Large 100 paths', Array.from({ length: 100 }, () => ({ n: 10, edges: pathTree(10) })), 'large', 'Maximum aggregate n and t=100 transition pressure.'),
  treeTest('Large 100 mixed trees', Array.from({ length: 100 }, (_, i) => ({ n: 10, edges: deterministicTree(10, 9000 + i) })), 'large', 'Maximum aggregate n across 100 distinct small trees.'),
]

function securityTest(name, count, seed, scale, description, options = {}) {
  return {
    name,
    score: 5,
    scale,
    sizeRatio: count / 100000,
    dataDescription: description,
    input: `${count}\n`,
    output: '',
    timeoutMs: scale === 'large' ? 25_000 : 8_000,
    scenario: { count, seed, adaptive: options.adaptive !== false, zeroEvery: options.zeroEvery || 0 },
  }
}

const securityTests = [
  securityTest('Single fixed game', 1, 224601, 'basic', 'Minimum t with fixed hidden values.', { adaptive: false }),
  securityTest('Zero-value cases', 32, 224602, 'boundary', 'Frequent v=0 cases exercise the probabilistic corner.', { zeroEvery: 2 }),
  securityTest('Small adaptive set', 64, 224603, 'basic', 'v is selected after x as permitted by the statement.'),
  securityTest('Both operations and bits', 128, 224604, 'basic', 'Balanced deterministic coverage of b and both operations.'),
  securityTest('Sparse zero values', 257, 224605, 'boundary', 'Prime-sized batch with occasional v=0.', { zeroEvery: 37 }),
  securityTest('Medium fixed secrets', 1000, 224606, 'boundary', 'One thousand non-adaptive games.', { adaptive: false, zeroEvery: 199 }),
  securityTest('Medium adaptive secrets', 2500, 224607, 'boundary', 'Adaptive v choices over thousands of rounds.', { zeroEvery: 503 }),
  securityTest('Ten thousand games', 10000, 224608, 'boundary', 'Substantial protocol throughput with all bit positions.'),
  securityTest('Thirty thousand games', 30000, 224609, 'boundary', 'High-volume interaction below the maximum.'),
  securityTest('Half-limit games', 50000, 224610, 'boundary', 'Half of the maximum t for timing coverage.'),
  ...Array.from({ length: 10 }, (_, i) => securityTest(
    `Large maximum games ${i + 1}`,
    100000,
    224700 + i,
    'large',
    `Maximum t=100000 with ${i % 2 ? 'fixed' : 'adaptive'} hidden values and broad 30-bit coverage.`,
    { adaptive: i % 2 === 0, zeroEvery: 4093 + i * 2 },
  )),
]

async function writePack(problemId, interactorSource, tests, analysis) {
  const interactor = { type: problemId === 'CF-2246-E' ? 'security-game-v1' : 'line-js', source: interactorSource, eventTimeoutMs: 500 }
  validateCodeforcesInteractor(interactor)
  const pack = { version: 2, problemId, generatedAt: Date.now(), generatorModel: 'source-defined', mode: 'interactive', analysis, interactor, tests }
  await mkdir(codeforcesPackDir, { recursive: true })
  const path = codeforcesPackPath(problemId)
  const temporary = `${path}.${process.pid}.tmp`
  const compressed = await gzipAsync(Buffer.from(JSON.stringify(pack), 'utf8'), { level: 9 })
  await writeFile(temporary, compressed)
  await rename(temporary, path)
  const status = getCodeforcesTestPackStatus(problemId)
  if (!status.ready) throw new Error(`${problemId}: ${status.issues.join('; ')}`)
  console.log(`[interactive pack] ${problemId}: ${status.count} points, ${status.largeCount} large, ${compressed.length} bytes`)
}

await writePack('CF-2245-G', npcTreeInteractor, npcTreeTests, 'Real line-oriented interactor for ordered greedy independent-set queries over hidden trees.')
await writePack('CF-2246-E', securityGameInteractor, securityTests, 'Real line-oriented partially adaptive interactor for the two-query 30-bit security game.')
