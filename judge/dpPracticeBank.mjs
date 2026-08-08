const MOD = 1000000007

const integerTokens = (input) => input.trim().split(/\s+/).map(Number)
const lines = (input) => input.trim().split(/\s+/)

function frog(input) {
  const [n, ...height] = integerTokens(input)
  const dp = Array(n).fill(Infinity); dp[0] = 0
  for (let i = 1; i < n; i += 1) dp[i] = Math.min(dp[i - 1] + Math.abs(height[i] - height[i - 1]), i > 1 ? dp[i - 2] + Math.abs(height[i] - height[i - 2]) : Infinity)
  return `${dp[n - 1]}\n`
}
function rob(input) {
  const [n, ...a] = integerTokens(input); let previous = 0; let current = 0
  for (let i = 0; i < n; i += 1) [previous, current] = [current, Math.max(current, previous + a[i])]
  return `${current}\n`
}
function gridMin(input) {
  const data = integerTokens(input); const n = data.shift(); const m = data.shift(); const dp = Array(m).fill(Infinity)
  for (let i = 0; i < n; i += 1) for (let j = 0; j < m; j += 1) { const value = data.shift(); dp[j] = value + (i === 0 && j === 0 ? 0 : Math.min(dp[j], j ? dp[j - 1] : Infinity)) }
  return `${dp[m - 1]}\n`
}
function obstaclePaths(input) {
  const tokens = lines(input); const n = Number(tokens.shift()); const m = Number(tokens.shift()); let dp = Array(m).fill(0); dp[0] = 1
  for (let i = 0; i < n; i += 1) { const row = tokens.shift(); for (let j = 0; j < m; j += 1) dp[j] = row[j] === '#' ? 0 : (dp[j] + (j ? dp[j - 1] : 0)) % MOD }
  return `${dp[m - 1]}\n`
}
function minCoin(input) {
  const [n, target, ...coin] = integerTokens(input); const dp = Array(target + 1).fill(Infinity); dp[0] = 0
  for (let sum = 1; sum <= target; sum += 1) for (const value of coin) if (sum >= value) dp[sum] = Math.min(dp[sum], dp[sum - value] + 1)
  return `${Number.isFinite(dp[target]) ? dp[target] : -1}\n`
}
function coinWays(input) {
  const [n, target, ...coin] = integerTokens(input); const dp = Array(target + 1).fill(0); dp[0] = 1
  for (const value of coin) for (let sum = value; sum <= target; sum += 1) dp[sum] = (dp[sum] + dp[sum - value]) % MOD
  return `${dp[target]}\n`
}
function subsetSum(input) {
  const [n, target, ...a] = integerTokens(input); const dp = Array(target + 1).fill(false); dp[0] = true
  for (const value of a) for (let sum = target; sum >= value; sum -= 1) dp[sum] ||= dp[sum - value]
  return `${dp[target] ? 'YES' : 'NO'}\n`
}
function equalPartition(input) {
  const [n, ...a] = integerTokens(input); const total = a.reduce((sum, value) => sum + value, 0)
  if (total % 2) return 'NO\n'
  return subsetSum(`${n} ${total / 2}\n${a.join(' ')}\n`)
}
function lcs(input) {
  const [a, b] = lines(input); const dp = Array(b.length + 1).fill(0)
  for (const x of a) { let diagonal = 0; for (let j = 1; j <= b.length; j += 1) { const old = dp[j]; dp[j] = x === b[j - 1] ? diagonal + 1 : Math.max(dp[j], dp[j - 1]); diagonal = old } }
  return `${dp[b.length]}\n`
}
function editDistance(input) {
  const [a, b] = lines(input); let dp = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i += 1) { const next = [i]; for (let j = 1; j <= b.length; j += 1) next[j] = a[i - 1] === b[j - 1] ? dp[j - 1] : 1 + Math.min(dp[j - 1], dp[j], next[j - 1]); dp = next }
  return `${dp[b.length]}\n`
}
function palindromeInsert(input) { const [s] = lines(input); return `${s.length - Number(lcs(`${s}\n${[...s].reverse().join('')}\n`).trim())}\n` }
function matrixChain(input) {
  const [n, ...dimension] = integerTokens(input); const dp = Array.from({ length: n }, () => Array(n).fill(0))
  for (let length = 2; length <= n; length += 1) for (let left = 0; left + length <= n; left += 1) { const right = left + length - 1; dp[left][right] = Infinity; for (let middle = left; middle < right; middle += 1) dp[left][right] = Math.min(dp[left][right], dp[left][middle] + dp[middle + 1][right] + dimension[left] * dimension[middle + 1] * dimension[right + 1]) }
  return `${dp[0][n - 1]}\n`
}
function burstBalloons(input) {
  const [n, ...values] = integerTokens(input); const a = [1, ...values, 1]; const dp = Array.from({ length: n + 2 }, () => Array(n + 2).fill(0))
  for (let length = 1; length <= n; length += 1) for (let left = 1; left + length - 1 <= n; left += 1) { const right = left + length - 1; for (let last = left; last <= right; last += 1) dp[left][right] = Math.max(dp[left][right], dp[left][last - 1] + dp[last + 1][right] + a[left - 1] * a[last] * a[right + 1]) }
  return `${dp[1][n]}\n`
}
function weightedIntervals(input) {
  const data = integerTokens(input); const n = data.shift(); const jobs = Array.from({ length: n }, () => [data.shift(), data.shift(), data.shift()]).sort((a, b) => a[1] - b[1]); const dp = [0]
  for (let i = 0; i < n; i += 1) { let predecessor = i - 1; while (predecessor >= 0 && jobs[predecessor][1] > jobs[i][0]) predecessor -= 1; dp[i + 1] = Math.max(dp[i], jobs[i][2] + dp[predecessor + 1]) }
  return `${dp[n]}\n`
}
function maxSubarray(input) { const [n, ...a] = integerTokens(input); let best = a[0]; let end = a[0]; for (let i = 1; i < n; i += 1) { end = Math.max(a[i], end + a[i]); best = Math.max(best, end) } return `${best}\n` }
function circularRob(input) {
  const [n, ...a] = integerTokens(input); if (n === 1) return `${a[0]}\n`; const solve = (arr) => { let x = 0; let y = 0; for (const value of arr) [x, y] = [y, Math.max(y, x + value)]; return y }; return `${Math.max(solve(a.slice(0, -1)), solve(a.slice(1)))}\n`
}
function noAdjacentBits(input) {
  const [limit] = integerTokens(input); const bits = limit.toString(2); const memo = new Map(); const dfs = (pos, previousOne, tight) => { if (pos === bits.length) return 1; const key = `${pos}/${previousOne}/${tight}`; if (!tight && memo.has(key)) return memo.get(key); let result = 0; const upper = tight ? Number(bits[pos]) : 1; for (let bit = 0; bit <= upper; bit += 1) if (!(previousOne && bit)) result += dfs(pos + 1, bit, tight && bit === upper); if (!tight) memo.set(key, result); return result }; return `${dfs(0, 0, true)}\n`
}
function assignment(input) {
  const data = integerTokens(input); const n = data.shift(); const cost = Array.from({ length: n }, () => Array.from({ length: n }, () => data.shift())); const dp = Array(1 << n).fill(Infinity); dp[0] = 0
  for (let mask = 0; mask < (1 << n); mask += 1) { const worker = mask.toString(2).replaceAll('0', '').length; if (worker === n) continue; for (let job = 0; job < n; job += 1) if (!(mask & (1 << job))) dp[mask | (1 << job)] = Math.min(dp[mask | (1 << job)], dp[mask] + cost[worker][job]) }
  return `${dp.at(-1)}\n`
}
function hamiltonCycle(input) {
  const data = integerTokens(input); const n = data.shift(); const cost = Array.from({ length: n }, () => Array.from({ length: n }, () => data.shift())); const all = (1 << n) - 1; const dp = Array.from({ length: 1 << n }, () => Array(n).fill(Infinity)); dp[1][0] = 0
  for (let mask = 1; mask <= all; mask += 1) for (let last = 0; last < n; last += 1) if (Number.isFinite(dp[mask][last])) for (let next = 0; next < n; next += 1) if (!(mask & (1 << next)) && cost[last][next] >= 0) dp[mask | (1 << next)][next] = Math.min(dp[mask | (1 << next)][next], dp[mask][last] + cost[last][next])
  let answer = Infinity; for (let last = 1; last < n; last += 1) if (cost[last][0] >= 0) answer = Math.min(answer, dp[all][last] + cost[last][0]); return `${Number.isFinite(answer) ? answer : -1}\n`
}
function treeData(input) { const data = integerTokens(input); const n = data.shift(); const value = [0, ...data.splice(0, n)]; const graph = Array.from({ length: n + 1 }, () => []); while (data.length) { const a = data.shift(); const b = data.shift(); graph[a].push(b); graph[b].push(a) } return { n, value, graph } }
function treeIndependent(input) { const { n, value, graph } = treeData(input); const dfs = (node, parent) => { let skip = 0; let take = value[node]; for (const next of graph[node]) if (next !== parent) { const [a, b] = dfs(next, node); skip += Math.max(a, b); take += a } return [skip, take] }; return `${Math.max(...dfs(1, 0))}\n` }
function treeVertexCover(input) { const { graph } = treeData(input); const dfs = (node, parent) => { let skip = 0; let take = 1; for (const next of graph[node]) if (next !== parent) { const [a, b] = dfs(next, node); skip += b; take += Math.min(a, b) } return [skip, take] }; return `${Math.min(...dfs(1, 0))}\n` }
function treeDistanceSums(input) { const { n, graph } = treeData(input); const size = Array(n + 1).fill(1); const answer = Array(n + 1).fill(0); const down = (node, parent) => { for (const next of graph[node]) if (next !== parent) { down(next, node); size[node] += size[next]; answer[node] += answer[next] + size[next] } }; const reroot = (node, parent) => { for (const next of graph[node]) if (next !== parent) { answer[next] = answer[node] - size[next] + (n - size[next]); reroot(next, node) } }; down(1, 0); reroot(1, 0); return `${answer.slice(1).join(' ')}\n` }
function dagLongest(input) { const data = integerTokens(input); const n = data.shift(); const m = data.shift(); const graph = Array.from({ length: n + 1 }, () => []); const degree = Array(n + 1).fill(0); while (data.length) { const a = data.shift(); const b = data.shift(); const w = data.shift(); graph[a].push([b, w]); degree[b] += 1 } const queue = []; for (let i = 1; i <= n; i += 1) if (!degree[i]) queue.push(i); const dp = Array(n + 1).fill(-Infinity); dp[1] = 0; for (let head = 0; head < queue.length; head += 1) for (const [next, weight] of graph[queue[head]]) { dp[next] = Math.max(dp[next], dp[queue[head]] + weight); if (!--degree[next]) queue.push(next) } return `${Number.isFinite(dp[n]) ? dp[n] : -1}\n` }
function dagPaths(input) { const data = integerTokens(input); const n = data.shift(); const m = data.shift(); const source = data.shift(); const target = data.shift(); const graph = Array.from({ length: n + 1 }, () => []); const degree = Array(n + 1).fill(0); while (data.length) { const a = data.shift(); const b = data.shift(); graph[a].push(b); degree[b] += 1 } const queue = []; for (let i = 1; i <= n; i += 1) if (!degree[i]) queue.push(i); const dp = Array(n + 1).fill(0); dp[source] = 1; for (let head = 0; head < queue.length; head += 1) for (const next of graph[queue[head]]) { dp[next] = (dp[next] + dp[queue[head]]) % MOD; if (!--degree[next]) queue.push(next) } return `${dp[target]}\n` }
function exactKnapsack(input) { const data = integerTokens(input); const n = data.shift(); const capacity = data.shift(); const dp = Array(capacity + 1).fill(-Infinity); dp[0] = 0; for (let i = 0; i < n; i += 1) { const weight = data.shift(); const value = data.shift(); for (let c = capacity; c >= weight; c -= 1) dp[c] = Math.max(dp[c], dp[c - weight] + value) } return `${Number.isFinite(dp[capacity]) ? dp[capacity] : -1}\n` }
function groupKnapsack(input) { const data = integerTokens(input); const groups = data.shift(); const capacity = data.shift(); let dp = Array(capacity + 1).fill(0); for (let g = 0; g < groups; g += 1) { const count = data.shift(); const options = Array.from({ length: count }, () => [data.shift(), data.shift()]); const next = [...dp]; for (let c = 0; c <= capacity; c += 1) for (const [weight, value] of options) if (c >= weight) next[c] = Math.max(next[c], dp[c - weight] + value); dp = next } return `${dp[capacity]}\n` }
function boundedKnapsack(input) { const data = integerTokens(input); const n = data.shift(); const capacity = data.shift(); const dp = Array(capacity + 1).fill(0); for (let i = 0; i < n; i += 1) { const weight = data.shift(); const value = data.shift(); let count = data.shift(); for (let unit = 1; count; unit <<= 1) { const take = Math.min(unit, count); const w = weight * take; const v = value * take; for (let c = capacity; c >= w; c -= 1) dp[c] = Math.max(dp[c], dp[c - w] + v); count -= take } } return `${dp[capacity]}\n` }
function jumpScore(input) { const [n, k, ...a] = integerTokens(input); const dp = Array(n).fill(-Infinity); dp[0] = a[0]; const deque = [0]; for (let i = 1; i < n; i += 1) { while (deque[0] < i - k) deque.shift(); dp[i] = dp[deque[0]] + a[i]; while (deque.length && dp[deque.at(-1)] <= dp[i]) deque.pop(); deque.push(i) } return `${dp[n - 1]}\n` }
function digitSum(input) { const [n, sum] = integerTokens(input); let dp = Array(sum + 1).fill(0); dp[0] = 1; for (let pos = 0; pos < n; pos += 1) { const next = Array(sum + 1).fill(0); for (let current = 0; current <= sum; current += 1) for (let digit = 0; digit <= 9 && current + digit <= sum; digit += 1) next[current + digit] = (next[current + digit] + dp[current]) % MOD; dp = next } return `${dp[sum]}\n` }
function stoneMerge(input) { const [n, ...a] = integerTokens(input); const prefix = [0]; for (const value of a) prefix.push(prefix.at(-1) + value); const dp = Array.from({ length: n }, () => Array(n).fill(0)); for (let length = 2; length <= n; length += 1) for (let left = 0; left + length <= n; left += 1) { const right = left + length - 1; dp[left][right] = Infinity; for (let middle = left; middle < right; middle += 1) dp[left][right] = Math.min(dp[left][right], dp[left][middle] + dp[middle + 1][right] + prefix[right + 1] - prefix[left]) } return `${dp[0][n - 1]}\n` }

const solvers = { A0704: frog, A0705: rob, A0706: gridMin, A0707: obstaclePaths, A0708: minCoin, A0709: coinWays, A0710: subsetSum, A0711: equalPartition, A0712: lcs, A0713: editDistance, A0714: palindromeInsert, A0715: matrixChain, A0716: burstBalloons, A0717: weightedIntervals, A0718: maxSubarray, A0719: circularRob, A0720: noAdjacentBits, A0721: assignment, A0722: hamiltonCycle, A0723: treeIndependent, A0724: treeVertexCover, A0725: treeDistanceSums, A0726: dagLongest, A0727: dagPaths, A0728: exactKnapsack, A0729: groupKnapsack, A0730: boundedKnapsack, A0731: jumpScore, A0732: digitSum, A0733: stoneMerge }

const draft = [
  ['A0704', '跳石能量', '基础', ['线性 DP', '最小代价'], '青蛙从第 1 块石头出发，每次跳 1 或 2 格，跳跃代价是两块石头高度差的绝对值。求到达最后一块石头的最小总代价。', 'n 和 n 个高度。', '最小总代价。', ['1 <= n <= 2*10^5'], 'dp[i] 只依赖前两个位置。', ['4\n10 30 40 20\n', '1\n7\n', '6\n30 10 60 10 60 50\n']],
  ['A0705', '街区夜巡', '基础', ['打家劫舍', '线性 DP'], '一排仓库有非负补给值，不能同时巡查相邻仓库。求可取得补给值最大和。', 'n 和 n 个补给值。', '最大补给和。', ['1 <= n <= 2*10^5'], '每个位置只有“取”或“不取”两种转移。', ['5\n2 7 9 3 1\n', '4\n5 1 1 5\n', '1\n100\n']],
  ['A0706', '矿道最低风险', '基础', ['网格 DP', '最短路径'], '从左上走到右下，每步只能向右或向下，进入格子会增加其风险值。求最小总风险。', 'n、m 和 n 行风险矩阵。', '最小总风险。', ['1 <= n,m <= 2000'], '用一维数组滚动维护上一行。', ['2 3\n1 3 1\n1 5 1\n', '1 4\n5 2 4 1\n', '3 3\n1 9 1\n1 1 1\n9 1 1\n']],
  ['A0707', '封锁通道', '基础', ['网格 DP', '计数'], '网格中 # 为封锁格，其他格可走。只能向右或向下，从左上到右下共有多少条路线，答案模 1e9+7。', 'n、m 和网格。', '路线数量。', ['1 <= n,m <= 2000'], '遇到封锁格时对应 DP 状态归零。', ['3 3\n...\n.#.\n...\n', '2 2\n#.\n..\n', '2 4\n....\n....\n']],
  ['A0708', '零钱最少张数', '普及', ['完全背包', '最小值 DP'], '给定若干硬币面额，每种可无限使用，凑出目标金额所需最少硬币数；无法凑出输出 -1。', '硬币种数 n、目标 T 和 n 个面额。', '最少硬币数或 -1。', ['1 <= T <= 10^5'], '先处理金额，再枚举可用硬币。', ['3 11\n1 5 7\n', '2 3\n2 4\n', '3 6\n1 3 4\n']],
  ['A0709', '配方数量', '普及', ['完全背包', '组合计数'], '有 n 种原料，每种可取任意次。求凑出恰好 T 的不同组合数，组合中原料顺序不计，模 1e9+7。', 'n、T 和 n 个正整数。', '组合数。', ['1 <= T <= 10^5'], '外层枚举原料可避免把不同顺序重复计数。', ['3 5\n1 2 5\n', '2 7\n2 3\n', '3 10\n2 3 5\n']],
  ['A0710', '目标子集', '普及', ['0/1 背包', '可行性'], '从给定正整数中每个最多选一次，判断能否恰好得到目标和。', 'n、目标 T 和 n 个整数。', '能则输出 YES，否则输出 NO。', ['1 <= n <= 2000', '1 <= T <= 2*10^5'], '容量必须倒序枚举。', ['5 9\n3 34 4 12 5\n', '4 11\n2 4 6 8\n', '3 0\n5 6 7\n']],
  ['A0711', '均分装备', '普及', ['子集和', '划分 DP'], '把所有装备分给两队，每件恰好归一队，判断两队总重量能否相等。', 'n 和 n 个正整数重量。', '能均分输出 YES，否则输出 NO。', ['1 <= n <= 2000'], '总和为奇数时可立即排除。', ['4\n1 5 11 5\n', '3\n1 2 4\n', '4\n2 2 2 2\n']],
  ['A0712', '双序列信号', '普及', ['LCS', '序列 DP'], '给定两条只含小写字母的信号串，求最长公共子序列长度。', '两行字符串 a、b。', '最长公共子序列长度。', ['长度均不超过 3000'], '相同字符从左上角转移，否则取上方和左方最大值。', ['abcde ace\n', 'abc abc\n', 'abc def\n']],
  ['A0713', '文本修订', '普及', ['编辑距离', '字符串 DP'], '可对字符串进行插入、删除或替换，每次代价为 1。求把 a 变成 b 的最少操作次数。', '两行非空小写字符串。', '最少操作次数。', ['长度均不超过 3000'], '考虑最后一个字符对应的三种操作。', ['kitten sitting\n', 'abc abc\n', 'abc yabd\n']],
  ['A0714', '回文补全', '普及+/提高', ['区间 DP', 'LCS'], '允许在字符串任意位置插入字符，求把它变成回文串的最少插入次数。', '一行小写字符串。', '最少插入次数。', ['1 <= |s| <= 3000'], '答案等于长度减去最长回文子序列长度。', ['mbadm\n', 'zzazz\n', 'leetcode\n']],
  ['A0715', '矩阵链调度', '普及+/提高', ['区间 DP', '矩阵链乘'], '按顺序相乘 n 个矩阵，可任意添加括号。求标量乘法次数最少的方案。', 'n，随后 n+1 个维度。', '最少乘法次数。', ['2 <= n <= 400'], '枚举最后一次把区间切开的地方。', ['3\n10 30 5 60\n', '2\n5 4 6\n', '4\n40 20 30 10 30\n']],
  ['A0716', '气球积分赛', '提高', ['区间 DP', '逆向思考'], '每次戳破一个气球可获得相邻未破气球与它的乘积积分，边界值均为 1。求最大积分。', 'n 和 n 个气球值。', '最大积分。', ['1 <= n <= 300'], '将“最后戳破哪个”作为区间状态的决策。', ['4\n3 1 5 8\n', '1\n7\n', '3\n1 5 1\n']],
  ['A0717', '有报酬的预约', '普及+/提高', ['加权区间调度', '二分'], '每个预约有开始、结束和报酬，时间不重叠的预约可同时接受。求最大总报酬，端点相接允许。', 'n，随后 n 行 l r w。', '最大总报酬。', ['1 <= n <= 2*10^5'], '按结束时间排序，寻找最后一个可兼容预约。', ['4\n1 3 50\n3 5 20\n6 9 100\n2 7 200\n', '3\n1 2 5\n2 3 6\n3 4 7\n', '3\n1 10 100\n2 3 80\n3 4 80\n']],
  ['A0718', '连续波段', '基础', ['最大子段和', 'Kadane'], '从序列中选一个非空连续段，使其元素和最大。', 'n 和 n 个整数。', '最大连续段和。', ['1 <= n <= 2*10^5'], '维护“以当前位置结尾”的最优段。', ['9\n-2 1 -3 4 -1 2 1 -5 4\n', '3\n-5 -1 -8\n', '4\n1 2 3 4\n']],
  ['A0719', '环形巡逻', '普及', ['环形 DP', '状态拆分'], '环形排列的补给点不能同时选择相邻两点，求可取得的最大补给和。', 'n 和 n 个非负整数。', '最大补给和。', ['1 <= n <= 2*10^5'], '分成“不选第一个”和“不选最后一个”两次线性 DP。', ['4\n1 2 3 1\n', '3\n2 3 2\n', '1\n8\n']],
  ['A0720', '无连一编码', '提高', ['数位 DP', '二进制'], '统计闭区间 [0,n] 中二进制表示不含连续两个 1 的整数个数。', '一个非负整数 n。', '满足条件的数目。', ['0 <= n <= 10^18'], '从最高位到最低位维护上一位及是否贴紧上界。', ['5\n', '1\n', '20\n']],
  ['A0721', '任务分配', '提高', ['状态压缩 DP', '匹配'], 'n 名员工要一一分配 n 项任务，给出每个员工做每项任务的成本，求最小总成本。', 'n 和 n×n 成本矩阵。', '最小总成本。', ['1 <= n <= 20'], 'mask 表示已被占用的任务集合，已分配员工数等于 mask 的位数。', ['3\n9 2 7\n6 4 3\n5 8 1\n', '2\n1 100\n100 1\n', '3\n1 50 50\n50 1 50\n50 50 1\n']],
  ['A0722', '闭环配送', '省选', ['状态压缩 DP', 'Hamilton 环'], '从 1 号仓库出发访问每个仓库恰好一次并回到 1 号，求最小总路程；-1 表示道路不存在。', 'n 和 n×n 路程矩阵。', '最小回路长度；不存在输出 -1。', ['2 <= n <= 18'], 'dp[mask][last] 表示从 1 出发访问 mask 后停在 last 的最短路。', ['4\n0 10 15 20\n10 0 35 25\n15 35 0 30\n20 25 30 0\n', '3\n0 1 -1\n-1 0 1\n1 -1 0\n', '3\n0 1 -1\n-1 0 1\n-1 -1 0\n']],
  ['A0723', '树上选址', '提高', ['树形 DP', '最大独立集'], '树的每个点有收益，不能同时选择有边相连的两个点，求最大总收益。', 'n，n 个点权，随后 n-1 条边。', '最大收益。', ['1 <= n <= 2*10^5'], '分别维护“选当前点”和“不选当前点”。', ['5\n1 2 3 4 5\n1 2\n1 3\n3 4\n3 5\n', '3\n10 1 1\n1 2\n2 3\n', '1\n7\n']],
  ['A0724', '守卫布置', '提高', ['树形 DP', '最小点覆盖'], '在树上选择尽量少的点作为守卫，使每条边至少有一个端点被选择。', 'n，随后 n 个点权占位值（忽略），再输入 n-1 条边。', '最少守卫数。', ['1 <= n <= 2*10^5'], '不选当前点时，所有孩子都必须被选择。', ['4\n0 0 0 0\n1 2\n2 3\n2 4\n', '2\n0 0\n1 2\n', '5\n0 0 0 0 0\n1 2\n1 3\n1 4\n1 5\n']],
  ['A0725', '全城距离和', '提高', ['换根 DP', '树形 DP'], '给定一棵树，对每个点输出它到其他所有点距离之和。', 'n，n 个占位点权（忽略），随后 n-1 条边。', 'n 个距离和。', ['1 <= n <= 2*10^5'], '先从根计算子树大小与根的距离和，再把根换到每个孩子。', ['3\n0 0 0\n1 2\n2 3\n', '4\n0 0 0 0\n1 2\n1 3\n1 4\n', '1\n0\n']],
  ['A0726', '有向赛道', '普及+/提高', ['DAG DP', '拓扑排序'], '有向无环图中从 1 到 n 的边有分数，求最大总分；不可达输出 -1。', 'n、m，随后 m 行 u v w。', '最大总分或 -1。', ['1 <= n,m <= 2*10^5'], '按拓扑序做最长路转移。', ['4 4\n1 2 5\n1 3 2\n3 2 10\n2 4 1\n', '3 1\n1 2 4\n', '4 4\n1 2 1\n1 3 5\n2 4 10\n3 4 1\n']],
  ['A0727', 'DAG 路径计数', '普及+/提高', ['DAG DP', '计数'], '在有向无环图中统计从 s 到 t 的不同路径条数，模 1e9+7。', 'n、m、s、t，随后 m 条边。', '路径条数。', ['1 <= n,m <= 2*10^5'], '沿拓扑序将当前路径数传递到后继。', ['4 4 1 4\n1 2\n1 3\n2 4\n3 4\n', '3 1 1 3\n1 2\n', '5 5 1 5\n1 2\n1 3\n2 4\n3 4\n4 5\n']],
  ['A0728', '恰好装满', '普及+/提高', ['0/1 背包', '恰好容量'], '每件物品最多选一次，背包必须恰好装到 W，求最大价值；无法恰好装满输出 -1。', 'n、W，随后 n 行重量价值。', '最大价值或 -1。', ['1 <= W <= 2*10^5'], '不可达状态应初始化为负无穷，而不是 0。', ['3 5\n2 3\n3 4\n4 5\n', '2 5\n2 10\n4 20\n', '3 6\n1 1\n2 5\n3 8\n']],
  ['A0729', '分组器材', '提高', ['分组背包', '多选一'], '有若干组器材，每组至多选一件，在容量限制内最大化价值。', '组数 g、容量 W；每组先给 k，再给 k 对重量价值。', '最大价值。', ['总物品数不超过 2*10^4'], '每组转移时必须从上一组的 DP 状态读取。', ['2 5\n2 1 2 3 4\n2 2 2 4 5\n', '1 4\n3 1 2 2 5 4 9\n', '2 3\n1 3 10\n1 2 5\n']],
  ['A0730', '限量物资', '提高', ['多重背包', '二进制拆分'], '每种物品有重量、价值和数量上限，在容量内求最大价值。', 'n、W，随后 n 行 w v c。', '最大价值。', ['1 <= W <= 2*10^5'], '可把数量拆成若干个 2 的幂大小的 0/1 物品。', ['2 10\n2 3 3\n3 4 2\n', '1 7\n3 5 2\n', '2 8\n2 2 10\n5 10 1\n']],
  ['A0731', '受限跳跃得分', '省选', ['单调队列优化', 'DP'], '从第一个格子跳到最后一个格子，每次最多跨 k 格，经过格子获得对应分数。求最大总分。', 'n、k 和 n 个整数分数。', '最大总分。', ['1 <= n <= 2*10^5'], '维护最近 k 个 dp 值的单调递减队列。', ['6 2\n1 -1 -2 4 -7 3\n', '4 1\n5 -2 3 1\n', '5 3\n-1 -2 -3 -4 -5\n']],
  ['A0732', '数字和序列', '普及+/提高', ['计数 DP', '数位和'], '由数字 0 到 9 组成长度为 n 的字符串（允许前导 0），求数字和恰好为 S 的字符串数量，模 1e9+7。', 'n、S。', '方案数。', ['1 <= n <= 500', '0 <= S <= 4500'], '枚举最后一位数字并从较短长度转移。', ['2 3\n', '1 0\n', '3 27\n']],
  ['A0733', '合并石堆', '省选', ['区间 DP', '最优合并'], '一排石堆每次只能合并相邻两堆，代价为两堆当前重量和。求合并为一堆的最小总代价。', 'n 和 n 个石堆重量。', '最小总代价。', ['2 <= n <= 500'], '区间 [l,r] 的最后一次合并会把它切成两个子区间。', ['4\n4 1 1 4\n', '3\n1 2 3\n', '5\n5 2 4 7 3\n']],
]

const complexityByProblem = {
  A0704: 'O(n)', A0705: 'O(n)', A0706: 'O(nm)', A0707: 'O(nm)', A0708: 'O(nT)', A0709: 'O(nT)', A0710: 'O(nT)', A0711: 'O(nΣ/2)', A0712: 'O(|a||b|)', A0713: 'O(|a||b|)', A0714: 'O(|s|²)', A0715: 'O(n³)', A0716: 'O(n³)', A0717: 'O(n log n)', A0718: 'O(n)', A0719: 'O(n)', A0720: 'O(log n)', A0721: 'O(n·2^n)', A0722: 'O(n²·2^n)', A0723: 'O(n)', A0724: 'O(n)', A0725: 'O(n)', A0726: 'O(n+m)', A0727: 'O(n+m)', A0728: 'O(nW)', A0729: 'O(W·物品总数)', A0730: 'O(W·Σlog c)', A0731: 'O(n)', A0732: 'O(nS·10)', A0733: 'O(n³)',
}

const sampleNotes = {
  A0704: '第一组高度中，选择 1→2→4 的跳法，代价为 |10-30|+|30-20|=30；还需比较所有允许跳法后取最小值。',
  A0705: '样例选择第 2、3、5 个仓库，收益为 7+9+1=17，且任意两个被选仓库均不相邻。',
  A0706: '从左上角出发，路径可以经过第一行、最右列；累计的是经过每个格子的风险，起点风险也计入。',
  A0707: '样例中央格被封锁，原本会穿过中央的路线全部失效，只统计其余只能向右或向下的路线。',
  A0708: '面额 1、5、7 凑出 11 时，可用 5+5+1，共 3 枚，且不存在只用 2 枚的方案。',
  A0709: '目标为 5 时，面额 1、2、5 的组合是 {5}、{2,2,1}、{2,1,1,1}、{1,1,1,1,1}。',
  A0710: '样例中可选择 4 和 5 恰好得到 9；元素 34 和 12 不需要被选择。',
  A0711: '总重量为 22，选择重量 11 的单元素即可让另一队也恰为 11。',
  A0712: 'abcde 与 ace 的最长公共子序列就是 ace，因此长度为 3。',
  A0713: 'kitten 可依次替换 k→s、替换 e→i、末尾插入 g，恰好变为 sitting。',
  A0714: 'mbadm 可通过插入两个字符变为回文，例如 m b a d a b m 的一种等价构造。',
  A0715: '三个矩阵的两种加括号方式乘法次数不同，必须比较所有最后切分位置。',
  A0716: '最后戳破某个气球时，它的左右邻居已经固定，这正是区间状态能独立计算的原因。',
  A0717: '样例中虽然 2→7 的报酬高，但接受 1→3、3→5、6→9 可取得更高的兼容总报酬。',
  A0718: '最优连续段是 4,-1,2,1，和为 6；子段必须连续且不能为空。',
  A0719: '环中第一个与最后一个也相邻，因此不能同时选择它们，需要拆成两种线性情况。',
  A0720: '0 到 5 的二进制为 0、1、10、11、100、101，其中只有 11 含连续两个 1。',
  A0721: '每名员工只分配一项任务，每项任务也只能被一名员工选择；样例的最优匹配成本为 9。',
  A0722: '配送必须回到 1 号仓库，访问顺序不仅影响中间路程，也影响最后回程是否存在。',
  A0723: '选中一个点会禁止选择所有相邻点，但不影响孙辈节点，因此需要在树上同时维护两种状态。',
  A0724: '若不在一个点放置守卫，则它所有孩子都必须放守卫，才能覆盖连接它的每条边。',
  A0725: '链形树 1-2-3 中，三个点到其他点的距离和依次为 3、2、3。',
  A0726: '图保证无环，按拓扑顺序处理时，一个点的所有前驱都会先完成转移。',
  A0727: '样例中从 1 到 4 可以经过 2 或经过 3，因此共有两条不同路径。',
  A0728: '容量必须恰好为 5；即使容量 4 时价值更高，也不能作为答案。',
  A0729: '同一组内最多选一件，第二组转移时只能基于尚未选第二组任何器材前的状态。',
  A0730: '数量上限不能忽略；二进制拆分把多件相同物品变成少量 0/1 物品。',
  A0731: '每次只能从最近 k 个格子跳来，维护这些格子的最大得分即可避免枚举所有前驱。',
  A0732: '长度为 2、数字和为 3 的串包括 03、12、21、30，共 4 个；前导 0 被允许。',
  A0733: '每次合并只能选择相邻石堆；不同合并顺序会导致后续石堆重量和代价不同。',
}

export const dpPracticeProblems = draft.map(([id, title, difficulty, tags, description, input, output, constraints, hint, testInputs], index) => ({
  id, title, difficulty, seriesId: 'S07', series: '动态规划', tags, type: '传统题', limitMs: ['A0721', 'A0722', 'A0731'].includes(id) ? 1800 : 1000, memoryMb: 256, score: 100, status: '', passRate: Math.max(22, 81 - index * 2), submissions: 80 + index * 17,
  statement: {
    description: [
      `任务背景：${description}`,
      '你只需要输出题目要求的最终数值或判定结果，不需要输出具体方案。除题面明确允许外，所有编号均从 1 开始；输入保证满足给出的范围。请特别注意题目中的“恰好”“最多一次”“相邻”“回到起点”等限定，它们会改变状态定义。',
      '评测说明：本题设置三个互相独立的测试点。它们分别检查常规结构、极小/不可行/边界情况，以及容易让朴素转移或错误初始化失效的综合情况。'
    ],
    input,
    output,
    constraints,
    hint,
    sampleExplanation: sampleNotes[id],
    solutionOutline: `推荐从“${tags.join(' + ')}”建模：${hint}`,
    targetComplexity: complexityByProblem[id],
  },
  samples: [{ input: testInputs[0], output: solvers[id](testInputs[0]) }],
  testInputs,
}))

export function getDpPracticeTests(id) {
  const problem = dpPracticeProblems.find((item) => item.id === id)
  if (!problem) return []
  return problem.testInputs.map((input, index) => ({ name: ['样例结构', '边界情形', '综合反例'][index], score: [30, 30, 40][index], input, output: solvers[id](input) }))
}
