import { existsSync } from 'node:fs'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { delimiter, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readGeneratedCodeforcesPack } from '../judge/codeforcesPackStore.mjs'
import { runCodeforcesInteractiveTest } from '../judge/codeforcesInteractive.mjs'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const bundledCompiler = resolve(projectRoot, 'tools', 'w64devkit', 'bin', 'g++.exe')
const compiler = process.env.JUDGE_CXX || (existsSync(bundledCompiler) ? bundledCompiler : 'g++')

const npcReference = String.raw`#include <bits/stdc++.h>
using namespace std;
string query(const vector<int>& a) {
    cout << "? " << a.size(); for (int v : a) cout << " " << v + 1; cout << endl;
    string s; cin >> s; return s;
}
vector<int> work(const vector<int>& a, const vector<int>& b) {
    if (a.empty() || b.empty()) return {};
    vector<int> q = a; q.insert(q.end(), b.begin(), b.end());
    string s = query(q); vector<int> result;
    for (int i = 0; i < (int)b.size(); ++i) if (s[i + a.size()] == '0') result.push_back(b[i]);
    return result;
}
void solve() {
    int n; cin >> n; vector<vector<int>> graph(n);
    auto findEdges = [&](auto&& self, vector<int> a, vector<int> b) -> void {
        if (a.empty() || b.empty()) return;
        if (a.size() == 1) { for (int v : b) graph[v].push_back(a[0]), graph[a[0]].push_back(v); return; }
        int middle = a.size() / 2;
        vector<int> left(a.begin(), a.begin() + middle), right(a.begin() + middle, a.end());
        auto hitLeft = work(left, b); set<int> seen(hitLeft.begin(), hitLeft.end());
        vector<int> remaining, hitRight;
        for (int v : b) (seen.count(v) ? remaining : hitRight).push_back(v);
        self(self, left, hitLeft);
        for (int v : work(right, remaining)) hitRight.push_back(v);
        self(self, right, hitRight);
    };
    auto decompose = [&](auto&& self, vector<int> vertices) -> void {
        if (vertices.size() <= 1) return;
        string s = query(vertices); vector<int> independent, rejected;
        for (int i = 0; i < (int)vertices.size(); ++i) (s[i] == '1' ? independent : rejected).push_back(vertices[i]);
        self(self, rejected);
        vector<int> color(n, -1); vector<vector<int>> sides(2);
        for (int root : rejected) if (color[root] == -1) {
            queue<int> q; q.push(root); color[root] = 0;
            while (!q.empty()) { int u = q.front(); q.pop(); sides[color[u]].push_back(u); for (int v : graph[u]) if (color[v] == -1) color[v] = color[u] ^ 1, q.push(v); }
        }
        for (int side = 0; side < 2; ++side) findEdges(findEdges, sides[side], work(sides[side], independent));
    };
    vector<int> vertices(n); iota(vertices.begin(), vertices.end(), 0); decompose(decompose, vertices);
    cout << "!" << endl;
    for (int u = 0; u < n; ++u) for (int v : graph[u]) if (v > u) cout << u + 1 << " " << v + 1 << endl;
}
int main() { ios::sync_with_stdio(false); cin.tie(nullptr); int t; cin >> t; while (t--) solve(); }
`

const securityReference = String.raw`#include <bits/stdc++.h>
using namespace std;
uint32_t state_value = 0x91e10da5u;
uint32_t random30() { state_value ^= state_value << 13; state_value ^= state_value >> 17; state_value ^= state_value << 5; return state_value & ((1u << 30) - 1); }
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int t; cin >> t;
    while (t--) {
        int x = 1; cout << x << endl;
        int o; cin >> o;
        bool knownOneAboveZero = (o & ~1) != 0;
        int bit = 0;
        if (knownOneAboveZero) bit = __builtin_ctz((unsigned)(o & ~1));
        int m0 = random30(), m1 = random30();
        m0 |= 1 << bit; m1 &= ~(1 << bit);
        cout << m0 << " " << m1 << endl;
        int r; cin >> r;
        int answer;
        if (r == m0) answer = 0;
        else if (r == m1) answer = 1;
        else {
            int knownVBit = knownOneAboveZero ? 1 : (o & 1);
            int resultBit = (r >> bit) & 1;
            answer = resultBit == knownVBit ? 1 : 0;
        }
        cout << answer << endl;
    }
}
`

function run(command, args, cwd) {
  return new Promise((resolveRun) => {
    const child = spawn(command, args, { cwd, windowsHide: true, env: existsSync(command) ? { ...process.env, PATH: `${resolve(command, '..')}${delimiter}${process.env.PATH || ''}` } : process.env })
    let output = ''
    child.stdout.on('data', (chunk) => { output += chunk })
    child.stderr.on('data', (chunk) => { output += chunk })
    child.on('close', (code) => resolveRun({ code, output }))
  })
}

async function compile(source, directory, name) {
  const sourcePath = join(directory, `${name}.cpp`)
  const binaryPath = join(directory, process.platform === 'win32' ? `${name}.exe` : name)
  await writeFile(sourcePath, source, 'utf8')
  const result = await run(compiler, ['-std=c++17', '-O2', '-pipe', '-DONLINE_JUDGE', sourcePath, '-o', binaryPath], directory)
  if (result.code !== 0) throw new Error(result.output)
  return binaryPath
}

async function validate(problemId, source) {
  const pack = readGeneratedCodeforcesPack(problemId)
  if (pack?.mode !== 'interactive') throw new Error(`${problemId} interactive pack is unavailable`)
  const directory = await mkdtemp(join(tmpdir(), 'cf-interactive-validation-'))
  try {
    const binary = await compile(source, directory, problemId)
    for (const [index, test] of pack.tests.entries()) {
      const result = await runCodeforcesInteractiveTest(binary, test, pack.interactor, { cwd: directory, timeoutMs: test.timeoutMs || 15000 })
      if (result.status !== 'AC') throw new Error(`${problemId} ${test.name}: ${result.status} ${result.message}`)
      console.log(`[interactive validation] ${problemId} ${index + 1}/20 AC (${result.durationMs} ms)`)
    }
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

await validate('CF-2245-G', npcReference)
await validate('CF-2246-E', securityReference)
console.log('[interactive validation] both reference submissions passed all 40 points')
