import { acmRegional2026Solutions } from './acmRegional2026Solutions.mjs'

const contest = '北陆区域赛模拟 2026'
const names = ['Typical structure', 'Boundary conditions', 'Comprehensive trap']
const scores = [30, 30, 40]

const definitions = [
  {
    id: 'ACM26-A', label: 'A', title: '十二色信标', difficulty: '入门', tags: ['模拟', '模运算'], model: '环形状态机',
    description: ['北陆海岸的救援船以十二种相位的灯光与港口通信。初始相位为 p（0 到 11）；收到字符 R 时顺时针旋转一格，收到 L 时逆时针旋转一格，收到 . 时设备自检但相位不变。', '暴风会让报文变得很长，因此控制台不会逐步输出状态。请在完整报文执行后给出最终相位。所有操作按输入从左至右执行，0 的逆时针下一格是 11。'],
    input: '一行包含整数 p 与非空字符串 s。s 仅包含 R、L、.。', output: '输出最终相位。', constraints: ['0 ≤ p ≤ 11', '1 ≤ |s| ≤ 10^6'], sampleExplanation: '从 2 出发执行 R、.、L 后相位又回到 2。', hint: '维护一个 0 到 11 的变量；逆时针可加 11 后对 12 取模。', targetComplexity: 'O(|s|) 时间，O(1) 空间。', difficultyReason: '区域赛签到题，考查输入处理和环形边界。', tests: [['2 R.L\n','2\n'], ['0 L\n','11\n'], ['11 RRRLL..R\n','1\n']],
  },
  {
    id: 'ACM26-B', label: 'B', title: '潮汐码头', difficulty: '基础', tags: ['贪心', '优先队列'], model: '区间资源分配',
    description: ['港口会收到 n 艘驳船的靠泊请求，第 i 艘船占用半开时间段 [l_i,r_i)。同一泊位在一艘船离开的时刻可以立刻交给另一艘船使用。', '调度员希望预先开放尽量少的泊位，并允许任意船只使用任意泊位。请计算在所有请求都被接受时所需泊位的最小数量。'],
    input: '第一行整数 n。接下来 n 行每行两个整数 l_i,r_i。', output: '输出最少泊位数。', constraints: ['1 ≤ n ≤ 2×10^5', '0 ≤ l_i < r_i ≤ 10^9'], sampleExplanation: '时刻 2 有两艘船在港；时刻 3 离开的船可被新船立即替换，因此峰值为 2。', hint: '按到达时刻排序，最小堆维护仍未离开的船。', targetComplexity: 'O(n log n) 时间，O(n) 空间。', difficultyReason: '比签到题多出半开区间和资源复用的细节。', tests: [['3\n1 4\n2 3\n3 5\n','2\n'], ['1\n7 8\n','1\n'], ['4\n1 2\n2 3\n3 4\n4 9\n','1\n']],
  },
  {
    id: 'ACM26-C', label: 'C', title: '晚点的渡轮', difficulty: '普及+/提高', tags: ['最短路', 'Dijkstra'], model: '时间依赖最短路',
    description: ['群岛之间有单向渡轮航线。航线 (u,v,p,d) 从时刻 0 起每隔 p 分钟发船，航行 d 分钟；你在时刻 x 到达 u 时，只能搭乘不早于 x 的第一班船。', '你从 s 在时刻 0 出发，想尽快到达 t。等待不会产生额外代价，所有 p 与 d 为正数。若无法到达，则报告失败。'],
    input: '第一行 n,m,s,t。接下来 m 行每行 u,v,p,d，表示一条单向航线。', output: '输出最早到达 t 的时刻；不可达输出 -1。', constraints: ['1 ≤ n ≤ 2×10^5', '0 ≤ m ≤ 3×10^5', '1 ≤ p,d ≤ 10^9'], sampleExplanation: '先到 2 号岛的时刻为 4，下一班 2→3 在时刻 6 发船，故总到达时刻为 8。', hint: '边权依赖当前到达时刻，但“越晚出发不会更早到达”，仍可使用 Dijkstra。等待量为 (p-x mod p) mod p。', targetComplexity: 'O((n+m) log n) 时间，O(n+m) 空间。', difficultyReason: '需要把发船周期转化为动态等待时间，并保证 64 位计算。', tests: [['3 3 1 3\n1 2 5 4\n2 3 3 2\n1 3 10 20\n','8\n'], ['1 0 1 1\n','0\n'], ['3 1 1 3\n1 2 2 1\n','-1\n']],
  },
  {
    id: 'ACM26-D', label: 'D', title: '档案压缩', difficulty: '提高', tags: ['动态规划', '回文'], model: '回文分割 DP',
    description: ['档案馆把一串小写代号切分为若干连续字段。为了让扫描仪能双向读取，每个字段必须是回文串；字段数量越少，索引表越短。', '请输出将整个代号切分成回文字段所需的最少字段数。字段必须覆盖全部字符，且相邻字段之间不能交叠或留空。'],
    input: '一行一个仅含小写字母的字符串 s。', output: '输出最少字段数。', constraints: ['1 ≤ |s| ≤ 2500'], sampleExplanation: 'aab 可以切成 aa 与 b，共 2 个字段。', hint: '从右端点递增地判断 [l,r] 是否回文，同时转移 dp[r+1]=min(dp[l]+1)。', targetComplexity: 'O(n²) 时间，O(n²) 空间。', difficultyReason: '区域赛中档 DP，需要同时维护区间性质与最优前缀。', tests: [['aab\n','2\n'], ['z\n','1\n'], ['abacdc\n','2\n']],
  },
  {
    id: 'ACM26-E', label: 'E', title: '双塔物流', difficulty: '提高', tags: ['折半搜索', '子集和'], model: 'Meet-in-the-middle 精确计数',
    description: ['两座浮塔之间有 n 个可独立启用的货柜模块，第 i 个模块会给载荷平衡值带来 a_i 的变化。指挥中心希望知道有多少种模块集合恰好使总变化等于 T。', '模块可以不选，数值也可能为负；两种集合只要包含的模块编号不同就视为不同方案。答案保证在 64 位有符号整数范围内。'],
    input: '第一行 n,T。第二行 n 个整数 a_i。', output: '输出满足条件的子集数量。', constraints: ['1 ≤ n ≤ 40', '|a_i|,|T| ≤ 10^12'], sampleExplanation: '目标为 5 时，{1,4} 与 {2,3} 是两种不同选择。', hint: '将模块分成两半，枚举两侧的子集和；排序后一侧并用 equal_range 计数。', targetComplexity: 'O(2^(n/2) log 2^(n/2)) 时间，O(2^(n/2)) 空间。', difficultyReason: 'n 不能直接枚举，需识别折半搜索的边界。', tests: [['4 5\n1 2 3 4\n','2\n'], ['1 0\n0\n','2\n'], ['6 3\n1 1 1 1 1 1\n','20\n']],
  },
  {
    id: 'ACM26-F', label: 'F', title: '镜湖花火', difficulty: '提高', tags: ['动态规划', '网格'], model: '双路径同步 DP',
    description: ['两架无人机要同时从镜湖左上角飞到右下角，每一步只能向右或向下。格子里是可收集的花火价值，值为 -1 的格子被禁飞。', '同一时刻若两架无人机落在同一格，该格价值只能收集一次；否则两格价值都收集。请在二者都能到达终点时最大化收集总价值，否则输出 -1。'],
    input: '第一行 n,m。接下来 n 行每行 m 个整数，值为 -1 或非负花火价值。', output: '输出最大总价值；无可行的双人飞行方案输出 -1。', constraints: ['1 ≤ n,m ≤ 150', '普通格子的值不超过 10^9'], sampleExplanation: '2×2 网格中两条不同的单调路径恰好覆盖四个格子，所以总价值为 10。', hint: '按已走步数同步两人；状态记录两人的行坐标，列坐标由步数推出。', targetComplexity: 'O((n+m)n²) 时间，O(n²) 空间。', difficultyReason: '状态压缩后的转移有四种前驱，并需避免重复计分。', tests: [['2 2\n1 2\n3 4\n','10\n'], ['1 1\n5\n','5\n'], ['3 3\n1 1 1\n1 -1 1\n1 1 1\n','8\n']],
  },
  {
    id: 'ACM26-G', label: 'G', title: '观测树', difficulty: '提高', tags: ['树形 DP', '最大独立集'], model: '树上最大权独立集',
    description: ['山区观测站由一棵树形电缆网连接。启用某站会获得价值 w_i，但任何一条电缆两端不能同时启用，否则会互相干扰。价值可以为负，且允许一个站也不启用。', '请在不发生干扰的前提下求最大可获得价值。电缆网保证连通且无环。'],
    input: '第一行 n。第二行 n 个整数 w_i。接下来 n-1 行每行一条边 u,v。', output: '输出最大总价值。', constraints: ['1 ≤ n ≤ 2×10^5', '|w_i| ≤ 10^12'], sampleExplanation: '链 1-2-3 中选择两端可得 5+6=11，优于只选中点。', hint: '对每个点分别维护“选它”和“不选它”的最优值。', targetComplexity: 'O(n) 时间，O(n) 空间。', difficultyReason: '需要在深树上避免递归爆栈，并正确处理负权与空集。', tests: [['3\n5 10 6\n1 2\n2 3\n','11\n'], ['1\n-7\n','0\n'], ['4\n10 6 6 6\n1 2\n1 3\n1 4\n','18\n']],
  },
  {
    id: 'ACM26-H', label: 'H', title: '单向河网', difficulty: '省选', tags: ['强连通分量', 'DAG DP'], model: 'SCC 缩点最长路',
    description: ['一条单向河网覆盖 n 个补给点，经过点 i 可领取价值 a_i 的补给。船从起点 s 出发，可沿河道任意航行；同一补给点最多领取一次。', '如果若干点互相可达，船可以在其中安排航线领取全部补给。请计算从 s 出发能够取得的最大补给总值。'],
    input: '第一行 n,m,s。第二行 n 个整数 a_i。接下来 m 行每行一条有向边 u,v。', output: '输出最大可获得总值。', constraints: ['1 ≤ n ≤ 2×10^5', '0 ≤ m ≤ 4×10^5', '|a_i| ≤ 10^12'], sampleExplanation: '1 与 2 构成可完整收集的环，之后可继续到 3 与 4，总价值为 12。', hint: '先求强连通分量并求分量权和，缩点后从起点分量在 DAG 上做最长路。', targetComplexity: 'O(n+m) 时间，O(n+m) 空间。', difficultyReason: '需把“环内可全部收集”的叙述转化为 SCC，并处理负权。', tests: [['4 4 1\n1 2 4 5\n1 2\n2 1\n2 3\n3 4\n','12\n'], ['1 0 1\n-5\n','-5\n'], ['5 5 1\n5 2 3 1 10\n1 2\n2 3\n3 2\n1 4\n4 5\n','16\n']],
  },
  {
    id: 'ACM26-I', label: 'I', title: '遗失的广播片段', difficulty: '省选', tags: ['后缀自动机', '字典序'], model: '第 k 小不同子串',
    description: ['应急广播将一段小写字符串 s 的所有不同连续片段按字典序编目，从 1 开始编号。重复出现的片段只登记一次，例如同一段文字在不同时间发送也只占一个条目。', '给定编号 k，请还原第 k 个条目。保证 k 合法。输出的条目长度可能很长，必须按字典序而不是首次出现位置排序。'],
    input: '一行包含字符串 s 与整数 k。', output: '输出第 k 小不同非空子串。', constraints: ['1 ≤ |s| ≤ 2×10^5', '1 ≤ k ≤ 不同非空子串数'], sampleExplanation: 'ababa 的不同子串按字典序排到第 6 个为 b。', hint: '后缀自动机状态的所有出边代表可扩展字符；按长度逆序计算每个状态可生成的条目数。', targetComplexity: 'O(|s| log |Σ|) 时间，O(|s||Σ|) 的实际边数空间。', difficultyReason: '既要建立后缀自动机，又要把状态计数用于字典序第 k 项构造。', tests: [['ababa 6\n','b\n'], ['z 1\n','z\n'], ['aaaa 4\n','aaaa\n']],
  },
  {
    id: 'ACM26-J', label: 'J', title: '星港转运', difficulty: '挑战', tags: ['费用流', '最小费用最大流'], model: '带容量最小费用流',
    description: ['星港有 L 个货源舱与 R 个目的舱。货源 i 最多提供 a_i 单位货物，目的舱 j 必须收到 b_j 单位货物；一条登记通道 (i,j,c,w) 最多运输 c 单位，每单位成本为 w。', '货物可拆分到多条通道。请判断所有需求能否满足；若可以，输出总成本的最小值。所有运输成本非负，但总数量和总成本都可能超过 32 位范围。'],
    input: '第一行 L,R,m。第二行 L 个 a_i，第三行 R 个 b_j。接下来 m 行每行 i,j,c,w。', output: '若可满足全部需求输出最小成本，否则输出 -1。', constraints: ['1 ≤ L,R ≤ 100', '0 ≤ m ≤ 5000', '0 ≤ a_i,b_j,c,w ≤ 10^9'], sampleExplanation: '先把两个单位送往目的舱 1，再让第二个货源直接服务目的舱 2，总成本为 9。', hint: '建立超级源、货源点、目的点与超级汇；用势能优化的连续最短增广路。', targetComplexity: 'O(F·m log V) 的增广路实现，其中 F 为增广次数；空间 O(V+m)。', difficultyReason: '压轴题要求同时保证可行流、容量约束与全局最小费用。', tests: [['2 2 3\n3 2\n2 3\n1 1 2 1\n1 2 3 5\n2 2 2 1\n','9\n'], ['1 1 0\n2\n2\n','-1\n'], ['2 2 4\n2 2\n2 2\n1 1 2 5\n1 2 2 1\n2 1 2 1\n2 2 2 5\n','4\n']],
  },
]

export const acmRegional2026Problems = definitions.map((definition, index) => {
  const { tests, model, difficultyReason, ...problem } = definition
  return {
    ...problem,
    seriesId: 'ACM', series: 'ACM 模拟竞赛', contest, type: 'ACM 区域赛模拟',
    limitMs: ['省选', '挑战'].includes(problem.difficulty) ? 4000 : 2200,
    memoryMb: 512, score: 100, status: '', passRate: Math.max(24, 85 - index * 6), submissions: 12 + index * 3,
    coreModel: model, difficultyReason, referenceSolution: acmRegional2026Solutions[problem.id],
    statement: { description: problem.description, input: problem.input, output: problem.output, constraints: problem.constraints, sampleExplanation: problem.sampleExplanation, hint: problem.hint, solutionOutline: problem.hint, targetComplexity: problem.targetComplexity, difficultyReason },
    samples: [{ input: tests[0][0], output: tests[0][1] }],
  }
})

export function getAcmRegional2026Tests(problemId) {
  const definition = definitions.find((item) => item.id === problemId)
  return definition ? definition.tests.map(([input, output], index) => ({ name: names[index], score: scores[index], input, output })) : []
}

export function getAcmRegional2026Sample(problemId) {
  const tests = getAcmRegional2026Tests(problemId)
  return tests.length ? { input: tests[0].input, output: tests[0].output } : null
}

export const acmRegional2026Models = definitions.map(({ id, label, model }) => ({ id, label, model }))
