import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { getCodeforcesTestPackIds, getCodeforcesTestPackStatus } from '../judge/problemTests.mjs'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
let catalogProblemIds = []
try {
  const catalog = JSON.parse(await readFile(resolve(projectRoot, '.data', 'codeforces', 'catalog.json'), 'utf8'))
  catalogProblemIds = (catalog.contests || []).flatMap((contest) => (contest.problems || []).map((problem) => `CF-${contest.id}-${problem.index}`))
} catch { /* source-only validation remains available before first sync */ }
const problemIds = [...new Set([...catalogProblemIds, ...getCodeforcesTestPackIds()])].sort()
const failures = []

for (const problemId of problemIds) {
  const status = getCodeforcesTestPackStatus(problemId)
  if (!status.ready) failures.push(`${problemId}: ${status.issues.join('; ')}`)
  else console.log(`[codeforces tests] ${problemId}: ${status.count} points, ${status.largeCount} large, ${status.totalScore} total score`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log(`[codeforces tests] ${problemIds.length} registered pack(s) passed`)
}
