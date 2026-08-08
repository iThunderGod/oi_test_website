import { getAlgorithmBatch9Tests } from './algorithmBatch9Bank.mjs'
import { getAlgorithmBatch10Tests } from './algorithmBatch10Bank.mjs'
import { getAlgorithmBatch11Tests } from './algorithmBatch11Bank.mjs'
import { getAlgorithmBatch12Tests } from './algorithmBatch12Bank.mjs'
import { getAlgorithmBatch13Tests } from './algorithmBatch13Bank.mjs'
import { getAlgorithmBatch14Tests } from './algorithmBatch14Bank.mjs'
import { getAlgorithmBatch15Tests } from './algorithmBatch15Bank.mjs'
import { getAcmRegional2026Tests } from './acmRegional2026Bank.mjs'
import { getDpPracticeTests } from './dpPracticeBank.mjs'
import { getAlgorithmRoundTests } from './algorithmRoundBank.mjs'
import { getAlgorithmBatch3Tests } from './algorithmBatch3Bank.mjs'
import { getAlgorithmBatch4Tests } from './algorithmBatch4Bank.mjs'
import { getAlgorithmBatch5Tests } from './algorithmBatch5Bank.mjs'
import { getAlgorithmBatch6Tests } from './algorithmBatch6Bank.mjs'
import { getAlgorithmBatch7Tests } from './algorithmBatch7Bank.mjs'
import { getAlgorithmBatch8Tests } from './algorithmBatch8Bank.mjs'
import { compareCodeforcesOutput, getGeneratedCodeforcesPackIds, readGeneratedCodeforcesPack } from './codeforcesPackStore.mjs'
import { validateCodeforcesInteractor } from './codeforcesInteractive.mjs'

export const CODEFORCES_TEST_POLICY = Object.freeze({
  requiredCount: 20,
  requiredLargeCount: 10,
  requiredTotalScore: 100,
  minimumLargeSizeRatio: 0.8,
})

function solveCodeforces2248AString(value) {
  const zeroIndex = value.indexOf('0')
  const afterAlice = value.slice(0, zeroIndex) + value.slice(zeroIndex + 1)
  const oneIndex = afterAlice.indexOf('1')
  return afterAlice.slice(0, oneIndex) + afterAlice.slice(oneIndex + 1)
}

function makeCodeforces2248ALargeTest(name, strings, description) {
  if (strings.length !== 100 || strings.some((value) => value.length !== 100 || !value.includes('0') || !value.includes('1'))) {
    throw new Error(`${name} must contain 100 valid maximum-length test cases`)
  }
  return {
    name,
    score: 5,
    scale: 'large',
    sizeRatio: 1,
    dataDescription: description,
    input: `100\n${strings.join('\n')}\n`,
    output: `${strings.map(solveCodeforces2248AString).join('\n')}\n`,
  }
}

function deterministicBinaryString(seed) {
  let state = (seed + 1) * 0x45d9f3b
  let value = ''
  for (let index = 0; index < 100; index += 1) {
    state = (Math.imul(state ^ (state >>> 16), 0x45d9f3b) + index + 17) >>> 0
    value += (state >>> 30) & 1 ? '1' : '0'
  }
  if (!value.includes('0')) value = `0${value.slice(1)}`
  if (!value.includes('1')) value = `1${value.slice(1)}`
  return value
}

const largeCodeforces2248ATests = [
  makeCodeforces2248ALargeTest('Large 01 blocks', Array.from({ length: 100 }, () => `${'0'.repeat(50)}${'1'.repeat(50)}`), '100 cases at |s| = 100 with two maximal uniform blocks.'),
  makeCodeforces2248ALargeTest('Large 10 blocks', Array.from({ length: 100 }, () => `${'1'.repeat(50)}${'0'.repeat(50)}`), '100 cases at |s| = 100 with the block order reversed.'),
  makeCodeforces2248ALargeTest('Large alternating 01', Array.from({ length: 100 }, () => '01'.repeat(50)), '100 maximum-length alternating strings beginning with 0.'),
  makeCodeforces2248ALargeTest('Large alternating 10', Array.from({ length: 100 }, () => '10'.repeat(50)), '100 maximum-length alternating strings beginning with 1.'),
  makeCodeforces2248ALargeTest('Large isolated one', Array.from({ length: 100 }, (_, index) => `${'0'.repeat(index % 99 + 1)}1${'0'.repeat(98 - index % 99)}`), 'The only 1 moves across every possible interior position at maximum length.'),
  makeCodeforces2248ALargeTest('Large isolated zero', Array.from({ length: 100 }, (_, index) => `${'1'.repeat(index % 99 + 1)}0${'1'.repeat(98 - index % 99)}`), 'The only 0 moves across every possible interior position at maximum length.'),
  makeCodeforces2248ALargeTest('Large periodic runs', Array.from({ length: 100 }, (_, index) => (index % 2 ? '00111' : '11000').repeat(20)), 'Maximum-length periodic runs expose incorrect local deletion rules.'),
  makeCodeforces2248ALargeTest('Large shifted split', Array.from({ length: 100 }, (_, index) => {
    const zeroCount = index % 99 + 1
    return `${'0'.repeat(zeroCount)}${'1'.repeat(100 - zeroCount)}`
  }), 'All non-trivial block split positions are exercised near the input limit.'),
  makeCodeforces2248ALargeTest('Large deterministic mixed', Array.from({ length: 100 }, (_, index) => deterministicBinaryString(index)), '100 deterministic mixed strings at the maximum length.'),
  makeCodeforces2248ALargeTest('Large adversarial rotations', Array.from({ length: 100 }, (_, index) => {
    const base = '0001011101'.repeat(10)
    const shift = index % base.length
    return base.slice(shift) + base.slice(0, shift)
  }), 'Maximum-length rotations vary the first useful 0 and 1 positions.'),
]

// Local Codeforces packs are independent practice data, not copied hidden
// tests. The first half covers examples and small boundaries; the second half
// is deliberately close to the input limits so complexity and bulk-input bugs
// are visible in local judging.
const codeforces2248ATests = [
  { name: 'Official samples', score: 5, scale: 'basic', sizeRatio: 0.25, input: '4\n101\n11001\n0010\n0101010000010100100101\n', output: '1\n101\n00\n01010000010100100101\n' },
  { name: 'Minimum length 001', score: 5, scale: 'boundary', sizeRatio: 0.03, input: '1\n001\n', output: '0\n' },
  { name: 'Minimum length 010', score: 5, scale: 'boundary', sizeRatio: 0.03, input: '1\n010\n', output: '0\n' },
  { name: 'Minimum length 011', score: 5, scale: 'boundary', sizeRatio: 0.03, input: '1\n011\n', output: '1\n' },
  { name: 'Minimum length 100', score: 5, scale: 'boundary', sizeRatio: 0.03, input: '1\n100\n', output: '0\n' },
  { name: 'Minimum length 110', score: 5, scale: 'boundary', sizeRatio: 0.03, input: '1\n110\n', output: '1\n' },
  { name: 'One trailing zero', score: 5, scale: 'basic', sizeRatio: 0.04, input: '1\n1110\n', output: '11\n' },
  { name: 'One leading one', score: 5, scale: 'basic', sizeRatio: 0.04, input: '1\n0001\n', output: '00\n' },
  { name: 'Alternating short', score: 5, scale: 'basic', sizeRatio: 0.05, input: '2\n0101\n1010\n', output: '01\n10\n' },
  { name: 'Mixed short cases', score: 5, scale: 'basic', sizeRatio: 0.06, input: '5\n1100\n11100\n10001\n01101\n11010\n', output: '10\n110\n001\n101\n110\n' },
  ...largeCodeforces2248ATests,
]

const codeforcesTestPacks = Object.freeze({
  'CF-2248-A': codeforces2248ATests,
})

export const problemTests = {
  A0101: [
    { name: '样例', score: 30, input: '5\n3 -2 9 4 1\n', output: '-2 9 15\n' },
    { name: '单日记录', score: 30, input: '1\n-7\n', output: '-7 -7 -7\n' },
    { name: '正负混合', score: 40, input: '6\n1000 -1000 0 5 -5 10\n', output: '-1000 1000 10\n' },
  ],
  A0102: [
    { name: '样例', score: 30, input: '6\n100 84 59 60 30 90\n', output: '2 2 2\n' },
    { name: '边界分数', score: 30, input: '3\n60 85 0\n', output: '1 1 1\n' },
    { name: '多段统计', score: 40, input: '8\n59 60 61 84 85 99 0 100\n', output: '2 3 3\n' },
  ],
  A0103: [
    { name: '闰年跨月', score: 30, input: '2024 2 27 3\n', output: '2024 3 1\n' },
    { name: '跨年', score: 30, input: '2023 12 31 1\n', output: '2024 1 1\n' },
    { name: '整年推进', score: 40, input: '1999 1 1 365\n', output: '2000 1 1\n' },
  ],
  A0201: [
    { name: '样例', score: 30, input: '8\n1 1 0 1 1 1 0 1\n', output: '3\n' },
    { name: '没有打卡', score: 30, input: '5\n0 0 0 0 0\n', output: '0\n' },
    { name: '全勤', score: 40, input: '7\n1 1 1 1 1 1 1\n', output: '7\n' },
  ],
  A0202: [
    { name: '样例', score: 30, input: '5 6\n1 2 3 3 0\n', output: '3\n' },
    { name: '包含重复零', score: 30, input: '4 0\n-1 0 1 0\n', output: '2\n' },
    { name: '递增数组', score: 40, input: '6 9\n1 2 3 4 5 6\n', output: '3\n' },
  ],
  A0203: [
    { name: '样例', score: 30, input: '5 5 2 2\nNNEESW\n', output: '2 3\n' },
    { name: '全部越界', score: 30, input: '2 2 1 1\nWWWNN\n', output: '1 1\n' },
    { name: '边界移动', score: 40, input: '3 4 3 4\nNNWSSSE\n', output: '3 4\n' },
  ],
  A0301: [
    { name: '样例', score: 30, input: '5\n5 1 4 1 3\n', output: '1 1 3 4 5\n' },
    { name: '单个元素', score: 30, input: '1\n42\n', output: '42\n' },
    { name: '负数与重复', score: 40, input: '6\n0 -3 7 -3 2 2\n', output: '-3 -3 0 2 2 7\n' },
  ],
  A0302: [
    { name: '样例', score: 30, input: '5 4\n1 3 3 7 9\n0 3 8 10\n', output: '1\n2\n5\n-1\n' },
    { name: '普通下界', score: 30, input: '3 3\n2 4 6\n1 6 7\n', output: '1\n3\n-1\n' },
    { name: '重复元素', score: 40, input: '4 4\n5 5 5 8\n5 6 8 9\n', output: '1\n4\n4\n-1\n' },
  ],
  A0303: [
    { name: '样例', score: 30, input: '3 7\n5 8 10\n', output: '2\n' },
    { name: '不可切出', score: 30, input: '2 10\n3 4\n', output: '0\n' },
    { name: '答案二分', score: 40, input: '4 5\n9 7 5 3\n', output: '3\n' },
  ],
  A0401: [
    { name: '样例', score: 30, input: '4\n1 3\n2 5\n4 6\n6 7\n', output: '3\n' },
    { name: '首尾相接', score: 30, input: '3\n1 2\n2 3\n3 4\n', output: '3\n' },
    { name: '舍弃长区间', score: 40, input: '5\n1 10\n2 3\n3 4\n4 5\n5 6\n', output: '4\n' },
  ],
  A0402: [
    { name: '样例', score: 30, input: '286\n', output: '8\n' },
    { name: '零金额', score: 30, input: '0\n', output: '0\n' },
    { name: '大金额', score: 40, input: '999\n', output: '19\n' },
  ],
  A0403: [
    { name: '样例', score: 30, input: '25 10 4\n10 10\n14 5\n20 10\n21 1\n', output: '2\n' },
    { name: '无法到达', score: 30, input: '10 3 1\n4 10\n', output: '-1\n' },
    { name: '多站选择', score: 40, input: '100 50 4\n25 25\n50 25\n75 25\n90 20\n', output: '2\n' },
  ],
  A0501: [
    { name: '样例', score: 30, input: '5 3\n1 2 3 4 5\n1 3\n2 5\n4 4\n', output: '6\n14\n4\n' },
    { name: '单点区间', score: 30, input: '1 2\n-5\n1 1\n1 1\n', output: '-5\n-5\n' },
    { name: '大整数答案', score: 40, input: '4 2\n1000000000 1000000000 1000000000 1000000000\n1 4\n2 3\n', output: '4000000000\n2000000000\n' },
  ],
  A0502: [
    { name: '样例', score: 30, input: '5 3\n1 3 2\n2 5 1\n4 4 -3\n', output: '2 3 3 -2 1\n' },
    { name: '局部修改', score: 30, input: '4 1\n2 3 5\n', output: '0 5 5 0\n' },
    { name: '正负叠加', score: 40, input: '3 3\n1 3 10\n1 1 -2\n3 3 -5\n', output: '8 10 5\n' },
  ],
  A0503: [
    { name: '样例', score: 30, input: '3 3 2\n1 2 3\n4 5 6\n7 8 9\n1 1 2 2\n2 2 3 3\n', output: '12\n28\n' },
    { name: '单行矩阵', score: 30, input: '1 3 2\n5 -1 2\n1 1 1 3\n1 2 1 2\n', output: '6\n-1\n' },
    { name: '边界子矩形', score: 40, input: '2 2 3\n1 2\n3 4\n1 1 2 2\n1 2 2 2\n2 1 2 1\n', output: '10\n6\n3\n' },
  ],
  A0601: [
    { name: '样例', score: 30, input: '3 4\nS..#\n.#..\n...T\n', output: '5\n' },
    { name: '无法到达', score: 30, input: '2 2\nS#\n#T\n', output: '-1\n' },
    { name: '单行迷宫', score: 40, input: '1 5\nS...T\n', output: '4\n' },
  ],
  A0602: [
    { name: '样例', score: 30, input: '3 5\n11000\n01011\n00101\n', output: '3\n' },
    { name: '没有陆地', score: 30, input: '2 3\n000\n000\n', output: '0\n' },
    { name: '对角不连通', score: 40, input: '3 3\n101\n010\n101\n', output: '5\n' },
  ],
  A0603: [
    { name: '样例', score: 30, input: '8 8 1 1 8 8\n', output: '6\n' },
    { name: '起终点相同', score: 30, input: '1 1 1 1 1 1\n', output: '0\n' },
    { name: '无法移动', score: 40, input: '2 2 1 1 2 2\n', output: '-1\n' },
  ],
  A0701: [
    { name: '样例', score: 30, input: '5\n', output: '8\n' },
    { name: '第一级', score: 30, input: '1\n', output: '1\n' },
    { name: '第十级', score: 40, input: '10\n', output: '89\n' },
  ],
  A0702: [
    { name: '样例', score: 30, input: '4 7\n3 4\n4 5\n2 3\n5 7\n', output: '10\n' },
    { name: '全部超重', score: 30, input: '3 5\n6 10\n7 9\n8 8\n', output: '0\n' },
    { name: '组合最优', score: 40, input: '5 10\n2 4\n3 5\n4 10\n5 11\n9 13\n', output: '21\n' },
  ],
  A0703: [
    { name: '样例', score: 30, input: '8\n10 9 2 5 3 7 101 18\n', output: '4\n' },
    { name: '严格下降', score: 30, input: '5\n5 4 3 2 1\n', output: '1\n' },
    { name: '重复元素', score: 40, input: '7\n1 2 2 3 4 0 5\n', output: '5\n' },
  ],
  A0801: [
    { name: '样例', score: 30, input: '7\nPUSH 3\nPUSH 5\nFRONT\nSIZE\nPOP\nFRONT\nSIZE\n', output: '3\n2\n5\n1\n' },
    { name: '空队查询', score: 30, input: '5\nFRONT\nSIZE\nPUSH 9\nFRONT\nSIZE\n', output: 'EMPTY\n0\n9\n1\n' },
    { name: '连续出队', score: 40, input: '8\nPUSH 1\nPUSH 2\nPOP\nPUSH 3\nFRONT\nPOP\nFRONT\nSIZE\n', output: '2\n3\n1\n' },
  ],
  A0802: [
    { name: '样例', score: 30, input: '4\n()[]{}\n([)]\n{[()]}\n(()\n', output: 'YES\nNO\nYES\nNO\n' },
    { name: '右括号开头', score: 30, input: '3\n]\n[]{}\n[{()}]\n', output: 'NO\nYES\nYES\n' },
    { name: '未闭合与交叉', score: 40, input: '2\n((((\n{[}]\n', output: 'NO\nNO\n' },
  ],
  A0803: [
    { name: '样例', score: 30, input: '5 5\n5 4 3 2 1\n2 1 5\n1 3 10\n2 2 4\n1 5 0\n2 4 5\n', output: '1\n2\n0\n' },
    { name: '单点维护', score: 30, input: '1 3\n7\n2 1 1\n1 1 -5\n2 1 1\n', output: '7\n-5\n' },
    { name: '多次查询', score: 40, input: '4 4\n8 6 7 5\n2 1 2\n1 2 9\n2 2 4\n2 3 3\n', output: '6\n5\n7\n' },
  ],
  A0901: [
    { name: '样例', score: 30, input: '5 3\n1 2\n2 3\n4 5\n', output: '2 3\n' },
    { name: '无边图', score: 30, input: '4 0\n', output: '4 1\n' },
    { name: '两个大块', score: 40, input: '6 5\n1 2\n2 3\n4 5\n5 6\n4 6\n', output: '2 3\n' },
  ],
  A0902: [
    { name: '样例', score: 30, input: '4 4 1\n1 2 5\n1 3 2\n3 2 1\n2 4 3\n', output: '0 3 2 6\n' },
    { name: '不可达点', score: 30, input: '3 1 2\n2 3 7\n', output: '-1 0 7\n' },
    { name: '多路径比较', score: 40, input: '5 6 1\n1 2 2\n1 3 5\n2 3 1\n2 4 2\n3 5 1\n4 5 5\n', output: '0 2 3 4 4\n' },
  ],
  A0903: [
    { name: '样例', score: 30, input: '4 3\n1 2\n1 3\n3 4\n', output: '1 2 3 4\n' },
    { name: '有环', score: 30, input: '2 2\n1 2\n2 1\n', output: 'IMPOSSIBLE\n' },
    { name: '字典序选择', score: 40, input: '5 3\n1 4\n2 4\n3 5\n', output: '1 2 3 4 5\n' },
  ],
  A1001: [
    { name: '样例', score: 30, input: '12 18\n', output: '6 36\n' },
    { name: '互质', score: 30, input: '7 13\n', output: '1 91\n' },
    { name: '倍数关系', score: 40, input: '1000000000 500000000\n', output: '500000000 1000000000\n' },
  ],
  A1002: [
    { name: '样例', score: 30, input: '2 10 1000\n', output: '24\n' },
    { name: '零指数', score: 30, input: '5 0 13\n', output: '1\n' },
    { name: '循环节', score: 40, input: '7 5 13\n', output: '11\n' },
  ],
  A1003: [
    { name: '样例', score: 30, input: '7 3\n1 2 3\n', output: '1 4 5\n' },
    { name: '小质数', score: 30, input: '5 4\n1 2 3 4\n', output: '1 3 2 4\n' },
    { name: '多个查询', score: 40, input: '11 3\n2 7 10\n', output: '6 8 10\n' },
  ],
  A1101: [
    { name: '样例', score: 30, input: 'abacaba\n', output: '4 2 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n' },
    { name: '单一字符', score: 30, input: 'zzz\n', output: '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 3\n' },
    { name: '稀疏分布', score: 40, input: 'abcxyz\n', output: '1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 1\n' },
  ],
  A1102: [
    { name: '样例', score: 30, input: 'aba\nababa\n', output: '2\n' },
    { name: '重叠匹配', score: 30, input: 'aa\naaaa\n', output: '3\n' },
    { name: '无匹配', score: 40, input: 'abc\ndefgh\n', output: '0\n' },
  ],
  A1103: [
    { name: '样例', score: 30, input: '4 3\napple\napp\napt\nbee\nap\napp\nb\n', output: '3\n2\n1\n' },
    { name: '链式前缀', score: 30, input: '3 4\na\nab\nabc\na\nab\nabc\nb\n', output: '3\n2\n1\n0\n' },
    { name: '多个首字母', score: 40, input: '3 4\ncat\ncar\ndog\nca\nc\ndo\nz\n', output: '2\n2\n1\n0\n' },
  ],
}

export function getProblemTests(problemId) {
  if (codeforcesTestPacks[problemId]) return codeforcesTestPacks[problemId]
  if (String(problemId || '').startsWith('CF-')) {
    const pack = readGeneratedCodeforcesPack(problemId)
    if (!Array.isArray(pack?.tests)) return []
    return pack.tests.map((test) => ({ ...test, checker: pack.checker || test.checker || { type: 'exact' } }))
  }
  const acmRegionalTests = getAcmRegional2026Tests(problemId)
  if (acmRegionalTests.length) return acmRegionalTests
  const batch15Tests = getAlgorithmBatch15Tests(problemId)
  if (batch15Tests.length) return batch15Tests
  const batch14Tests = getAlgorithmBatch14Tests(problemId)
  if (batch14Tests.length) return batch14Tests
  const batch13Tests = getAlgorithmBatch13Tests(problemId)
  if (batch13Tests.length) return batch13Tests
  const batch12Tests = getAlgorithmBatch12Tests(problemId)
  if (batch12Tests.length) return batch12Tests
  const batch11Tests = getAlgorithmBatch11Tests(problemId)
  if (batch11Tests.length) return batch11Tests
  const batch10Tests = getAlgorithmBatch10Tests(problemId)
  if (batch10Tests.length) return batch10Tests
  const batch9Tests = getAlgorithmBatch9Tests(problemId)
  if (batch9Tests.length) return batch9Tests
  const staticTests = problemTests[problemId]
  if (staticTests) return staticTests
  const dpTests = getDpPracticeTests(problemId)
  if (dpTests.length) return dpTests
  const roundTests = getAlgorithmRoundTests(problemId)
  if (roundTests.length) return roundTests
  const batch4Tests = getAlgorithmBatch4Tests(problemId)
  if (batch4Tests.length) return batch4Tests
  const batch5Tests = getAlgorithmBatch5Tests(problemId)
  if (batch5Tests.length) return batch5Tests
  const batch6Tests = getAlgorithmBatch6Tests(problemId)
  if (batch6Tests.length) return batch6Tests
  const batch7Tests = getAlgorithmBatch7Tests(problemId)
  if (batch7Tests.length) return batch7Tests
  const batch8Tests = getAlgorithmBatch8Tests(problemId)
  if (batch8Tests.length) return batch8Tests
  return getAlgorithmBatch3Tests(problemId)
}

export function getCodeforcesTestPackStatus(problemId) {
  const tests = getProblemTests(problemId)
  const generatedPack = readGeneratedCodeforcesPack(problemId)
  const totalScore = tests.reduce((sum, test) => sum + Number(test.score || 0), 0)
  const largeTests = tests.filter((test) => test.scale === 'large' && Number(test.sizeRatio || 0) >= CODEFORCES_TEST_POLICY.minimumLargeSizeRatio)
  const issues = []

  if (!String(problemId || '').startsWith('CF-')) issues.push('not a Codeforces problem id')
  if (tests.length !== CODEFORCES_TEST_POLICY.requiredCount) issues.push(`requires exactly ${CODEFORCES_TEST_POLICY.requiredCount} test points, found ${tests.length}`)
  if (largeTests.length < CODEFORCES_TEST_POLICY.requiredLargeCount) issues.push(`requires at least ${CODEFORCES_TEST_POLICY.requiredLargeCount} large test points, found ${largeTests.length}`)
  if (totalScore !== CODEFORCES_TEST_POLICY.requiredTotalScore) issues.push(`test scores must total ${CODEFORCES_TEST_POLICY.requiredTotalScore}, found ${totalScore}`)
  if (tests.some((test) => Number(test.score) !== CODEFORCES_TEST_POLICY.requiredTotalScore / CODEFORCES_TEST_POLICY.requiredCount)) issues.push('every Codeforces test point must be worth 5 points')
  if (new Set(tests.map((test) => test.name)).size !== tests.length) issues.push('test point names must be unique')
  if (tests.some((test) => typeof test.input !== 'string' || typeof test.output !== 'string')) issues.push('every test point must contain string input and output')
  if (largeTests.some((test) => !String(test.dataDescription || '').trim())) issues.push('every large test point must describe why it is large')
  if (generatedPack?.loadError) issues.push(`test pack cannot be loaded: ${generatedPack.loadError}`)
  if (generatedPack?.mode === 'interactive') {
    if (tests.some((test) => !test.scenario || typeof test.scenario !== 'object')) issues.push('every interactive test point must contain a scenario object')
    try { validateCodeforcesInteractor(generatedPack.interactor) } catch (error) { issues.push(error.message) }
  }

  return {
    ready: issues.length === 0,
    count: tests.length,
    largeCount: largeTests.length,
    totalScore,
    issues,
  }
}

export function isCodeforcesTestPackReady(problemId) {
  return getCodeforcesTestPackStatus(problemId).ready
}

export function getCodeforcesTestPackIds() {
  return [...new Set([...Object.keys(codeforcesTestPacks), ...getGeneratedCodeforcesPackIds()])].sort()
}

export function checkProblemTestOutput(problemId, test, actualOutput) {
  if (String(problemId || '').startsWith('CF-')) return compareCodeforcesOutput(test, actualOutput)
  const expected = String(test.output || '').replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '').trimEnd()
  const actual = String(actualOutput || '').replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '').trimEnd()
  return { ok: expected === actual, message: expected === actual ? '通过' : '答案错误' }
}
