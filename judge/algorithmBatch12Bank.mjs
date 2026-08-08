import { algorithmBatch12Solutions } from './algorithmBatch12Solutions.mjs'

const seriesNames = { S01: '语言基础', S02: '模拟与枚举', S03: '排序与二分', S04: '贪心', S05: '前缀和与差分', S06: '搜索', S07: '动态规划', S08: '数据结构', S09: '图论', S10: '数学', S11: '字符串' }
const generatedTestFactories = {
  A0331: () => {
    const n = 100000
    return [String(n) + '\n' + Array.from({ length: n }, (_, i) => i + 1).join(' ') + '\n', '29290\n']
  },
  A0632: () => {
    const values = Array.from({ length: 40 }, (_, i) => 1 << (i % 20))
    return ['40 1048575\n' + values.join(' ') + '\n', '1048575 20\n']
  },
  A0763: () => {
    const n = 1800
    const values = Array.from({ length: n }, (_, i) => i + 1).join(' ')
    return [String(n) + ' ' + String(n) + '\n' + values + '\n' + values + '\n', String(n) + '\n']
  },
  A0832: () => {
    const n = 50000
    const operations = ['SUM 1 50000']
    for (let i = 1; i <= 20000; i += 1) operations.push(i % 2 ? 'REV 1 50000' : 'ADD 1 50000 1')
    operations.push('SUM 1 50000')
    const expected = 1250025000 + 10000 * n
    return [String(n) + ' ' + String(operations.length) + '\n' + Array.from({ length: n }, (_, i) => i + 1).join(' ') + '\n' + operations.join('\n') + '\n', '1250025000\n' + String(expected) + '\n']
  },
  A0833: () => {
    const addCount = 100000
    const lines = Array.from({ length: addCount }, (_, i) => 'ADD ' + String(i - 50000) + ' ' + String(i))
    lines.push('QUERY 1000')
    return [String(lines.length) + '\n' + lines.join('\n') + '\n', '-50000000\n']
  },
  A0934: () => {
    const n = 100000
    const edges = Array.from({ length: n - 1 }, (_, i) => String(i + 1) + ' ' + String(i + 2)).join('\n')
    return [String(n) + ' 3\n' + edges + '\nASK ' + String(n) + '\nMARK 50000\nASK ' + String(n) + '\n', '99999\n50000\n']
  },
  A1032: () => ['1000000009 1\n750000009\n', '500000003\n'],
  A1033: () => ['1\n1000000000000000000 999999999999999937 123456789012345678 987654321098765432\n', '61728394506172843314814780481481754\n'],
}
const testNames = ['Typical structure', 'Boundary conditions', 'Comprehensive trap']
const testScores = [30, 30, 40]
const rawDefinitions = [
  {
    "id": "A0131",
    "title": "云端账本长除法",
    "seriesId": "S01",
    "difficulty": "基础",
    "tags": [
      "高精度",
      "字符串模拟"
    ],
    "model": "十进制长除法",
    "description": [
      "审计系统收到一个可能有二十万位的非负十进制账本编号，以及一个正整数除数。普通整数类型装不下被除数，需要输出精确的商与余数。",
      "从最高位到最低位依次落位；每一步先把旧余数乘 10 再加当前数字。输入允许前导零，商必须写成标准十进制形式，余数满足 0≤r<d。"
    ],
    "input": "第一行给出十进制字符串 A，第二行给出正整数 d。",
    "output": "第一行输出 A÷d 的整数商，第二行输出余数。",
    "constraints": [
      "1 ≤ |A| ≤ 200000",
      "0 ≤ A，1 ≤ d ≤ 10^9"
    ],
    "sampleExplanation": "把 12345678901234567890 按位除以 97，得到商 127275040218913071、余数 3。",
    "hint": "维护不超过 d-1 的余数即可；只有商已经出现非零位后才输出后续的零。",
    "targetComplexity": "时间 O(|A|)，额外空间 O(|A|)。",
    "difficultyReason": "基础难度来自手写逐位除法与前导零边界，不要求复杂数据结构。",
    "tests": [
      [
        "12345678901234567890\n97\n",
        "127275040218913071\n3\n"
      ],
      [
        "0\n7\n",
        "0\n0\n"
      ],
      [
        "999999999999999999999999999999\n99991\n",
        "10000900081007290656159054\n31485\n"
      ]
    ]
  },
  {
    "id": "A0132",
    "title": "连分数复原",
    "seriesId": "S01",
    "difficulty": "普及",
    "tags": [
      "连分数",
      "高精度整数"
    ],
    "model": "连分数自底向上复原",
    "description": [
      "一段压缩比例用有限简单连分数 [a0;a1,…,an-1] 表示。需要把它复原为最简正分数 p/q，其中 q>0。",
      "计算顺序必须从最后一项开始：若当前尾部为 p/q，向前加入 ai 后变成 (ai·p+q)/p。系数可使结果超过 64 位，但简单连分数的递推保证最终分子分母互质。"
    ],
    "input": "第一行整数 n，第二行 n 个非负整数 a0…an-1；当 n>1 时保证 a1…an-1 为正。",
    "output": "输出最简分数的分子 p 和分母 q。",
    "constraints": [
      "1 ≤ n ≤ 2000",
      "0 ≤ ai ≤ 10^9",
      "答案十进制位数不超过 20000"
    ],
    "sampleExplanation": "[3;1,4,1,5] 自底向上复原为 134/35。",
    "hint": "使用自包含的十进制大整数保存 p、q；每加入一个更靠前的系数就交换并乘加。",
    "targetComplexity": "执行 O(n) 次高精度乘加，空间与答案位数同阶。",
    "difficultyReason": "普及难度要求理解嵌套分式的逆序递推，并实现高精度乘加。",
    "tests": [
      [
        "5\n3 1 4 1 5\n",
        "134 35\n"
      ],
      [
        "1\n7\n",
        "7 1\n"
      ],
      [
        "3\n1 2 2\n",
        "7 5\n"
      ]
    ]
  },
  {
    "id": "A0133",
    "title": "平衡三进制刻度",
    "seriesId": "S01",
    "difficulty": "普及",
    "tags": [
      "进制转换",
      "带余除法"
    ],
    "model": "平衡三进制转换",
    "description": [
      "实验砝码使用平衡三进制：每一位权值为 3^i，数字 1、0、- 分别表示系数 1、0、-1。给定十进制整数，输出其唯一表示。",
      "余数为 2 时不能直接写 2，应写 - 并向更高位进 1；负数除法也要把余数规范到 -1、0、1。除数字 0 外，结果不得有前导零。"
    ],
    "input": "输入一个十进制整数 x。",
    "output": "输出 x 的平衡三进制表示。",
    "constraints": [
      "-10^18 ≤ x ≤ 10^18"
    ],
    "sampleExplanation": "10=9+1，因此表示为 101。",
    "hint": "循环做除以 3；遇到余数 ±2 时用等价的 ∓1 并修正商。",
    "targetComplexity": "时间 O(log |x|)，额外空间 O(log |x|)。",
    "difficultyReason": "普及难度来自负余数和进位规范化，而不是普通的非负进制转换。",
    "tests": [
      [
        "10\n",
        "101\n"
      ],
      [
        "-8\n",
        "-01\n"
      ],
      [
        "23\n",
        "10--\n"
      ]
    ]
  },
  {
    "id": "A0231",
    "title": "环形元胞演化",
    "seriesId": "S02",
    "difficulty": "普及",
    "tags": [
      "状态模拟",
      "位运算"
    ],
    "model": "初等元胞自动机",
    "description": [
      "有 n 个首尾相接的二进制元胞。每一轮同时更新全部元胞，新值只由旧状态中的左邻、自身、右邻组成。",
      "八种三位邻域 000 到 111 对应规则整数 rule 的第 0 到第 7 位。所有位置必须基于同一轮旧串更新，不能边算边覆盖；n=1 时三个邻居位置都指向唯一元胞。"
    ],
    "input": "第一行 n、rule、t，第二行长度为 n 的 01 串。",
    "output": "输出恰好演化 t 轮后的状态串。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "0 ≤ rule ≤ 255",
      "0 ≤ t ≤ 200"
    ],
    "sampleExplanation": "规则 30 对单个中心 1 演化一轮得到 0011100。",
    "hint": "将三位邻域解释为 0…7 的下标，再取 rule 对应二进制位。",
    "targetComplexity": "时间 O(nt)，空间 O(n)。",
    "difficultyReason": "普及难度要求准确处理同步更新、环形下标与规则位序。",
    "tests": [
      [
        "7 30 1\n0001000\n",
        "0011100\n"
      ],
      [
        "1 90 100\n1\n",
        "0\n"
      ],
      [
        "5 110 4\n10101\n",
        "00000\n"
      ]
    ]
  },
  {
    "id": "A0232",
    "title": "翻饼排序步数",
    "seriesId": "S02",
    "difficulty": "提高",
    "tags": [
      "双向状态搜索",
      "排列编码"
    ],
    "model": "煎饼排序最短翻转",
    "description": [
      "一叠 n 张大小互异的饼从上到下给出。一次操作选择 k≥2，把最上面的 k 张整体翻转，使其顺序完全逆转。",
      "目标是按大小从小到大排列，并求最少操作次数。不同翻转序列只比较长度；已经有序时答案为 0。状态是整个排列，不能用只记录逆序数的贪心替代。"
    ],
    "input": "第一行 n，第二行给出一个 1…n 的排列。",
    "output": "输出达到升序所需的最少前缀翻转次数。",
    "constraints": [
      "1 ≤ n ≤ 10",
      "输入保证为排列"
    ],
    "sampleExplanation": "3 1 2 可先翻转前 3 张得到 2 1 3，再翻转前 2 张得到 1 2 3，共 2 步。",
    "hint": "从起始与目标排列双向 BFS；每轮扩展状态较少的一侧，并用排列编码去重。",
    "targetComplexity": "时间最坏 O(n!·n)，空间 O(n!)。",
    "difficultyReason": "提高难度对应排列状态空间、最短性与去重，n=10 可区分普通暴力 DFS。",
    "tests": [
      [
        "3\n3 1 2\n",
        "2\n"
      ],
      [
        "5\n1 2 3 4 5\n",
        "0\n"
      ],
      [
        "5\n3 5 1 4 2\n",
        "5\n"
      ]
    ]
  },
  {
    "id": "A0233",
    "title": "蜂巢巡检轨迹",
    "seriesId": "S02",
    "difficulty": "基础",
    "tags": [
      "坐标模拟",
      "集合去重"
    ],
    "model": "六边形轴坐标行走",
    "description": [
      "巡检机器人位于无限六边形网格的原点，依次执行 E、W、NE、NW、SE、SW 六种一步指令。需要知道终点到原点的最短六边形距离，以及轨迹访问过多少个不同格子。",
      "起点也算访问一次；同一格多次到达只计一次。所有指令按输入顺序执行，距离使用轴坐标而不是方格曼哈顿距离。"
    ],
    "input": "第一行整数 n，接下来 n 行每行一个方向字符串。",
    "output": "输出终点到原点的最短步数和不同访问格数。",
    "constraints": [
      "0 ≤ n ≤ 200000"
    ],
    "sampleExplanation": "六条指令绕一圈后回到原点，但途中访问了 6 个不同格子。",
    "hint": "用轴坐标 (x,y) 表示六方向，距离为 (|x|+|y|+|x+y|)/2。",
    "targetComplexity": "时间 O(n log n)，空间 O(n)；哈希集合可达期望 O(n)。",
    "difficultyReason": "基础难度重点是六边形坐标映射、距离公式和起点计数。",
    "tests": [
      [
        "6\nE\nNE\nNW\nW\nSW\nSE\n",
        "0 6\n"
      ],
      [
        "1\nE\n",
        "1 2\n"
      ],
      [
        "5\nNE\nNE\nW\nSW\nSE\n",
        "0 5\n"
      ]
    ]
  },
  {
    "id": "A0331",
    "title": "距离中位数",
    "seriesId": "S03",
    "difficulty": "提高",
    "tags": [
      "答案二分",
      "双指针计数"
    ],
    "model": "两两距离第 k 小",
    "description": [
      "给定 n 个数，考虑所有 i<j 的绝对差 |ai-aj|，共有 n(n-1)/2 个距离。需要输出这些距离从小到大排序后的中位数。",
      "若距离个数为奇数取正中项；若为偶数取靠前的中位数，即第 (总数+1)/2 小。重复数产生距离 0，也必须按下标对重复计数。"
    ],
    "input": "第一行 n，第二行 n 个整数。",
    "output": "输出指定的距离中位数。",
    "constraints": [
      "2 ≤ n ≤ 200000",
      "|ai| ≤ 10^9"
    ],
    "sampleExplanation": "1,3,6,10 的六个距离排序为 2,3,4,5,7,9，靠前中位数为 4。",
    "hint": "排序后答案具有单调性；对候选 d 用双指针统计差值不超过 d 的下标对数。",
    "targetComplexity": "时间 O(n log V)，空间 O(n)，V 为值域跨度。",
    "difficultyReason": "提高难度来自二次规模的隐式距离集合，必须二分并线性计数。",
    "tests": [
      [
        "4\n1 3 6 10\n",
        "4\n"
      ],
      [
        "3\n5 5 5\n",
        "0\n"
      ],
      [
        "5\n-10 -3 0 8 20\n",
        "11\n"
      ]
    ]
  },
  {
    "id": "A0332",
    "title": "全频道最窄频段",
    "seriesId": "S03",
    "difficulty": "普及+/提高",
    "tags": [
      "排序",
      "滑动窗口"
    ],
    "model": "多类别最小覆盖区间",
    "description": [
      "频谱中有 n 个带频道类别的信号点，要找一个闭区间，使每种 1…k 类至少有一个点落在其中。",
      "目标先最小化区间宽度 R-L；若并列，依次选择 L 更小、R 更小的区间。区间端点必须取自现有信号坐标，重复坐标和重复类别都保留。"
    ],
    "input": "第一行 n、k；接下来 n 行给出坐标 x 和类别 c。",
    "output": "输出 L、R 和宽度 R-L。",
    "constraints": [
      "1 ≤ k ≤ n ≤ 200000",
      "-10^9 ≤ x ≤ 10^9",
      "每种类别至少出现一次"
    ],
    "sampleExplanation": "排序后窗口 [7,10] 同时含三类，宽度 3 且最优。",
    "hint": "按坐标排序，用计数数组维护窗口内覆盖的类别数，满足全覆盖时收缩左端。",
    "targetComplexity": "时间 O(n log n)，空间 O(n+k)。",
    "difficultyReason": "普及+/提高难度来自覆盖计数、窗口收缩和三级确定性比较。",
    "tests": [
      [
        "6 3\n1 1\n4 2\n7 3\n8 1\n10 2\n12 3\n",
        "7 10 3\n"
      ],
      [
        "3 3\n5 1\n5 2\n5 3\n",
        "5 5 0\n"
      ],
      [
        "6 3\n-10 1\n-3 2\n0 3\n7 1\n8 2\n9 3\n",
        "7 9 2\n"
      ]
    ]
  },
  {
    "id": "A0333",
    "title": "第 k 小真分数",
    "seriesId": "S03",
    "difficulty": "省选",
    "tags": [
      "堆归并",
      "分数比较"
    ],
    "model": "有序分数矩阵堆选",
    "description": [
      "给定严格递增的正整数数组，所有 i<j 形成真分数 ai/aj。把这些分数按数值从小到大排列，求第 k 个分数。",
      "保证任意两对下标产生的分数值不同。比较分数时必须交叉相乘，不能使用浮点数；输出原数组中的分子和分母。"
    ],
    "input": "第一行 n、k，第二行严格递增数组。",
    "output": "输出第 k 小分数的分子和分母。",
    "constraints": [
      "2 ≤ n ≤ 2000",
      "1 ≤ k ≤ n(n-1)/2",
      "1 ≤ ai ≤ 10^9"
    ],
    "sampleExplanation": "1,2,3,5 的第 4 小真分数是 1/2。",
    "hint": "对每个固定分母 j，其分子序列递增；把 n-1 条有序链用小根堆归并。",
    "targetComplexity": "时间 O((n+k)log n)，空间 O(n)。",
    "difficultyReason": "省选难度来自隐式二维有序集合、精确分数比较和大 k 的堆归并。",
    "tests": [
      [
        "4 4\n1 2 3 5\n",
        "1 2\n"
      ],
      [
        "2 1\n2 7\n",
        "2 7\n"
      ],
      [
        "4 5\n1 2 3 5\n",
        "3 5\n"
      ]
    ]
  },
  {
    "id": "A0431",
    "title": "字典序邻位避让",
    "seriesId": "S04",
    "difficulty": "提高",
    "tags": [
      "贪心构造",
      "频次约束"
    ],
    "model": "相邻异字符字典序构造",
    "description": [
      "给定一个只含小写字母的多重集合，要重排全部字符，使任意相邻字符不同。",
      "若无解输出 IMPOSSIBLE；否则在所有合法重排中输出字典序最小者。每一步尝试较小字符时，必须确认剩余字符仍能完成，而不能只挑当前最小的不同字符。"
    ],
    "input": "输入一个小写字符串 s，字符顺序只代表多重集合。",
    "output": "输出字典序最小合法重排或 IMPOSSIBLE。",
    "constraints": [
      "1 ≤ |s| ≤ 200000"
    ],
    "sampleExplanation": "aaabbc 可构造成 ababac；任何更小前缀都会使剩余频次无法隔开。",
    "hint": "逐位枚举候选字符，暂时扣减后检查剩余最大频次是否不超过可用间隔数。",
    "targetComplexity": "时间 O(26|s|)，空间 O(字符集)。",
    "difficultyReason": "提高难度来自带可行性判定的字典序贪心；单纯优先队列不能保证字典序最小。",
    "tests": [
      [
        "aaabbc\n",
        "ababac\n"
      ],
      [
        "aaaa\n",
        "IMPOSSIBLE\n"
      ],
      [
        "bbbaaacc\n",
        "ababacbc\n"
      ]
    ]
  },
  {
    "id": "A0432",
    "title": "保留最大子序列",
    "seriesId": "S04",
    "difficulty": "普及",
    "tags": [
      "单调栈",
      "贪心"
    ],
    "model": "定长字典序最大子序列",
    "description": [
      "给定一个数字串，需要删除恰好若干字符并保持剩余相对顺序，使长度恰为 k 的结果字典序最大。",
      "结果允许含前导零，也必须原样输出 k 位。遇到相等数字时保留较早者不会变差；若扫描结束仍有删除额度，应从末尾删除。"
    ],
    "input": "第一行数字串 s，第二行整数 k。",
    "output": "输出长度为 k 的字典序最大子序列。",
    "constraints": [
      "1 ≤ k ≤ |s| ≤ 500000"
    ],
    "sampleExplanation": "1924 删除 1 和 2 后得到 94，为长度 2 的最大结果。",
    "hint": "维护单调不增栈；当前数字更大且仍可删除时弹出栈顶。",
    "targetComplexity": "时间 O(|s|)，空间 O(|s|)。",
    "difficultyReason": "普及难度需要同时控制删除额度、相对顺序和前导零。",
    "tests": [
      [
        "1924\n2\n",
        "94\n"
      ],
      [
        "0000\n2\n",
        "00\n"
      ],
      [
        "4177252841\n4\n",
        "7841\n"
      ]
    ]
  },
  {
    "id": "A0433",
    "title": "最大延误排程",
    "seriesId": "S04",
    "difficulty": "普及+/提高",
    "tags": [
      "交换论证",
      "排序"
    ],
    "model": "最大延误最小化",
    "description": [
      "有 n 个不可中断任务，机器从时刻 0 开始连续处理。任务 i 需要 pi 时间，截止时刻为 di，完成时刻为 Ci，延误定义 Li=Ci-di，可为负数。",
      "目标最小化最大延误 max Li。输出一种最优任务顺序；相同截止时刻按原编号升序，使答案唯一。"
    ],
    "input": "第一行 n，接下来 n 行给出 pi、di。",
    "output": "第一行输出最小可能的最大延误，第二行输出任务编号顺序。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "1 ≤ pi ≤ 10^9",
      "|di| ≤ 10^18"
    ],
    "sampleExplanation": "按截止时刻 4、6、9 排序后完成时刻为 3、5、9，最大延误为 0。",
    "hint": "Jackson 规则：按截止时刻非降序处理；相邻逆序交换不会增大最大延误。",
    "targetComplexity": "时间 O(n log n)，空间 O(n)。",
    "difficultyReason": "普及+/提高难度要求正确使用交换论证，并允许最优最大延误为负数。",
    "tests": [
      [
        "3\n3 4\n2 6\n4 9\n",
        "0\n1 2 3\n"
      ],
      [
        "1\n2 10\n",
        "-8\n1\n"
      ],
      [
        "4\n4 5\n1 2\n3 5\n2 4\n",
        "5\n2 4 1 3\n"
      ]
    ]
  },
  {
    "id": "A0531",
    "title": "删除区间后的公约数",
    "seriesId": "S05",
    "difficulty": "基础",
    "tags": [
      "前缀后缀",
      "最大公约数"
    ],
    "model": "删除区间 GCD 查询",
    "description": [
      "给定整数数组，多次询问：若删除闭区间 [l,r] 的所有元素，剩余元素绝对值的最大公约数是多少。",
      "空集合的最大公约数按 0 处理，数值 0 可参与 gcd。每次询问彼此独立，不真正修改原数组。"
    ],
    "input": "第一行 n、q，第二行数组；接下来 q 行给出 l、r。",
    "output": "每个询问输出一行答案。",
    "constraints": [
      "1 ≤ n,q ≤ 200000",
      "|ai| ≤ 10^9"
    ],
    "sampleExplanation": "删除 2…3 后剩下 6 和 18，最大公约数为 6。",
    "hint": "预处理前缀 gcd 与后缀 gcd，答案为 gcd(pre[l-1],suf[r+1])。",
    "targetComplexity": "预处理 O(n)，每次查询 O(1)，空间 O(n)。",
    "difficultyReason": "基础难度对应前后缀摘要与删除全数组的空集合边界。",
    "tests": [
      [
        "4 3\n6 10 15 18\n2 3\n1 1\n1 4\n",
        "6\n1\n0\n"
      ],
      [
        "1 2\n0\n1 1\n1 1\n",
        "0\n0\n"
      ],
      [
        "5 3\n12 -18 24 30 42\n2 4\n3 3\n1 2\n",
        "6\n6\n6\n"
      ]
    ]
  },
  {
    "id": "A0532",
    "title": "矩阵异或窗口",
    "seriesId": "S05",
    "difficulty": "普及",
    "tags": [
      "二维前缀",
      "异或"
    ],
    "model": "二维前缀异或",
    "description": [
      "给定 n×m 整数矩阵，多次查询一个闭合子矩形内所有元素的按位异或值。",
      "异或满足自反性，重叠区域出现偶数次会抵消。查询端点均为 1-based 且 x1≤x2、y1≤y2，矩阵不发生修改。"
    ],
    "input": "第一行 n、m、q；接下来矩阵；随后 q 行 x1、y1、x2、y2。",
    "output": "每个查询输出子矩形异或值。",
    "constraints": [
      "1 ≤ n,m ≤ 1000",
      "1 ≤ q ≤ 200000",
      "0 ≤ 元素 < 2^31"
    ],
    "sampleExplanation": "样例首个 2×2 窗口为 1 xor 2 xor 4 xor 5=2。",
    "hint": "建立二维前缀异或，使用与二维前缀和相同的四角容斥结构。",
    "targetComplexity": "预处理 O(nm)，每次查询 O(1)，空间 O(nm)。",
    "difficultyReason": "普及难度要求将容斥从加法迁移到异或并处理边界行列。",
    "tests": [
      [
        "3 3 3\n1 2 3\n4 5 6\n7 8 9\n1 1 2 2\n2 2 3 3\n1 1 3 3\n",
        "2\n2\n1\n"
      ],
      [
        "1 1 1\n42\n1 1 1 1\n",
        "42\n"
      ],
      [
        "2 4 3\n0 1 1 0\n7 7 3 3\n1 2 2 3\n1 1 2 4\n2 3 2 4\n",
        "4\n0\n0\n"
      ]
    ]
  },
  {
    "id": "A0533",
    "title": "静态区间颜色数",
    "seriesId": "S05",
    "difficulty": "提高",
    "tags": [
      "离线查询",
      "树状数组"
    ],
    "model": "按右端点离线不同值",
    "description": [
      "给定一个静态整数数组，多次询问区间 [l,r] 中有多少种不同数值。",
      "相同数值无论出现多少次只计一种；询问必须按原输入顺序输出。n、q 均较大，逐查询哈希或普通莫队不是目标复杂度。"
    ],
    "input": "第一行 n、q，第二行数组；接下来 q 行 l、r。",
    "output": "每个询问输出区间不同值数量。",
    "constraints": [
      "1 ≤ n,q ≤ 200000",
      "|ai| ≤ 10^9"
    ],
    "sampleExplanation": "区间 1…5 中出现 1、2、3 三种值。",
    "hint": "按右端点排序询问；扫描到位置 r 时，只让每个值最新出现位置在树状数组中贡献 1。",
    "targetComplexity": "时间 O((n+q)log n)，空间 O(n+q)。",
    "difficultyReason": "提高难度对应离线顺序、最近位置撤销与树状数组区间计数。",
    "tests": [
      [
        "7 3\n1 2 1 3 2 4 1\n1 5\n3 7\n4 4\n",
        "3\n4\n1\n"
      ],
      [
        "1 2\n9\n1 1\n1 1\n",
        "1\n1\n"
      ],
      [
        "8 4\n5 5 6 7 6 8 5 9\n1 8\n2 6\n3 5\n6 8\n",
        "5\n4\n2\n3\n"
      ]
    ]
  },
  {
    "id": "A0631",
    "title": "周期门迷宫",
    "seriesId": "S06",
    "difficulty": "提高",
    "tags": [
      "BFS",
      "时间扩展状态"
    ],
    "model": "周期相位网格 BFS",
    "description": [
      "迷宫包含起点 S、终点 T、墙 #、普通格 . 和数字门。每次行动耗时 1，可向四邻移动，也可原地等待。",
      "全局时刻从 0 开始；若在时刻 t 行动，到达时刻 t+1。数字门 c 只允许在到达时刻满足 (t+1) mod p=c 时进入，S、T、. 随时可进入。"
    ],
    "input": "第一行 n、m、p，接下来 n 行地图；门字符在 0…p-1 中。",
    "output": "输出到达 T 的最早时刻，不可达输出 -1。",
    "constraints": [
      "1 ≤ n,m ≤ 500",
      "2 ≤ p ≤ 10",
      "地图恰有一个 S 和 T"
    ],
    "sampleExplanation": "直线路径中的门 0 需要等到偶数时刻进入，因此最早 4 步到达终点。",
    "hint": "状态必须包含位置与时刻模 p；把等待视为第五种边后做 BFS。",
    "targetComplexity": "时间与空间 O(nmp)。",
    "difficultyReason": "提高难度来自周期门的到达时刻语义和位置×相位状态扩展。",
    "tests": [
      [
        "1 4 2\nS0.T\n",
        "4\n"
      ],
      [
        "1 2 3\nST\n",
        "1\n"
      ],
      [
        "3 4 3\nS1#T\n.#..\n....\n",
        "7\n"
      ]
    ]
  },
  {
    "id": "A0632",
    "title": "最接近目标的子集",
    "seriesId": "S06",
    "difficulty": "提高",
    "tags": [
      "折半搜索",
      "二分"
    ],
    "model": "Meet-in-the-middle 最近子集和",
    "description": [
      "给定 n 个可正可负的整数和目标 T，可任选一个下标子集。需要使子集和与 T 的绝对差最小。",
      "若多个子集同样接近，先选择子集和更小者；若和也相同，选择元素个数更少者。空集允许选择，重复数按不同下标处理。"
    ],
    "input": "第一行 n、T，第二行 n 个整数。",
    "output": "输出选中子集的和与元素个数。",
    "constraints": [
      "1 ≤ n ≤ 40",
      "|ai|,|T| ≤ 10^12"
    ],
    "sampleExplanation": "从 8、-3、5、11 中选 8 和 5，可恰好得到 13，使用 2 个元素。",
    "hint": "把数组分成两半枚举子集和；对一半排序去重后，为另一半的每个和二分 T-s。",
    "targetComplexity": "时间 O(2^(n/2) log 2^(n/2))，空间 O(2^(n/2))。",
    "difficultyReason": "提高难度对应 2^40 不可直接枚举，以及三层决胜规则。",
    "tests": [
      [
        "4 13\n8 -3 5 11\n",
        "13 2\n"
      ],
      [
        "1 0\n7\n",
        "0 0\n"
      ],
      [
        "5 6\n10 -4 3 3 20\n",
        "6 2\n"
      ]
    ]
  },
  {
    "id": "A0633",
    "title": "精确覆盖最少行",
    "seriesId": "S06",
    "difficulty": "省选",
    "tags": [
      "回溯剪枝",
      "精确覆盖"
    ],
    "model": "Algorithm X 最少精确覆盖",
    "description": [
      "有 n 个候选行和 m 个列，每行覆盖若干列。要选出尽量少的行，使每一列恰好被覆盖一次。",
      "任意两条被选行不能共享列；所有列必须出现。若不存在精确覆盖输出 -1，只需输出最少行数。"
    ],
    "input": "第一行 n、m；接下来 n 行先给覆盖列数 c，再给 c 个 1-based 列号。",
    "output": "输出最少选中行数或 -1。",
    "constraints": [
      "1 ≤ n ≤ 100",
      "1 ≤ m ≤ 60",
      "每行列号互异"
    ],
    "sampleExplanation": "选第 2 行覆盖 {1,3}、第 3 行覆盖 {2,4}，两行恰好覆盖全部四列。",
    "hint": "每层选择当前可用候选最少的未覆盖列分支，并剪去与已选列相交的行。",
    "targetComplexity": "最坏指数级；MRV/Algorithm X 剪枝，空间 O(n+m+总覆盖数)。",
    "difficultyReason": "省选难度来自精确覆盖建模、最少行分支界和稀疏约束剪枝。",
    "tests": [
      [
        "4 4\n2 1 2\n2 1 3\n2 2 4\n2 3 4\n",
        "2\n"
      ],
      [
        "1 2\n1 1\n",
        "-1\n"
      ],
      [
        "5 6\n3 1 2 3\n2 1 4\n2 2 5\n2 3 6\n3 4 5 6\n",
        "2\n"
      ]
    ]
  },
  {
    "id": "A0763",
    "title": "最长公共上升子序列",
    "seriesId": "S07",
    "difficulty": "提高",
    "tags": [
      "序列 DP",
      "LCIS"
    ],
    "model": "最长公共上升子序列",
    "description": [
      "给定两个整数序列，求同时是二者子序列且严格上升的最长序列长度。",
      "子序列可以跳过元素但不能改变相对顺序；严格上升意味着相邻选中值必须变大，重复值不能连续贡献长度。只输出长度。"
    ],
    "input": "第一行 n、m；第二行序列 A；第三行序列 B。",
    "output": "输出最长公共上升子序列长度。",
    "constraints": [
      "1 ≤ n,m ≤ 3000",
      "|元素| ≤ 10^9"
    ],
    "sampleExplanation": "两个序列可共同选择 3、9，长度为 2。",
    "hint": "依次扫描 A；对每个 ai 顺序扫描 B，用 best 维护 Bj<ai 时旧 dp[j] 的最大值。",
    "targetComplexity": "时间 O(nm)，空间 O(m)。",
    "difficultyReason": "提高难度来自同时满足公共子序列与严格上升，普通 LCS 或 LIS 均不能直接解决。",
    "tests": [
      [
        "4 7\n3 4 9 1\n5 3 8 9 10 2 1\n",
        "2\n"
      ],
      [
        "1 1\n7\n7\n",
        "1\n"
      ],
      [
        "6 5\n1 3 2 4 3 5\n1 2 3 4 5\n",
        "4\n"
      ]
    ]
  },
  {
    "id": "A0764",
    "title": "双调巡检环线",
    "seriesId": "S07",
    "difficulty": "提高",
    "tags": [
      "区间 DP",
      "计算几何"
    ],
    "model": "双调旅行商 DP",
    "description": [
      "平面上 n 个点的 x 坐标严格递增。巡检环线从最左点出发沿一条链严格向右到最右点，再沿另一条链严格向左返回；每个点恰好属于一条去程或回程链，两个端点由两链共享。",
      "边长为欧氏距离，求满足上述双调结构的最短闭合路线长度。n=2 时两点间的边需要往返计算两次。"
    ],
    "input": "第一行 n，接下来 n 行按 x 递增给出实数坐标 x、y。",
    "output": "输出最短长度，四舍五入保留两位小数。",
    "constraints": [
      "2 ≤ n ≤ 2000",
      "|x|,|y| ≤ 10^6",
      "x 严格递增"
    ],
    "sampleExplanation": "四个点形成上拱折线，最短双调环线长度为 6.83。",
    "hint": "令 dp[i][j] 表示两条链当前最右端为 i、j 且 j 更右，按新点是否接在 j 链或另一链转移。",
    "targetComplexity": "时间 O(n²)，空间 O(n²)。",
    "difficultyReason": "提高难度对应双调结构的双端状态、欧氏精度和 n² 转移。",
    "tests": [
      [
        "4\n0 0\n1 1\n2 1\n3 0\n",
        "6.83\n"
      ],
      [
        "2\n0 0\n3 4\n",
        "10.00\n"
      ],
      [
        "5\n0 0\n1 0\n2 0\n3 0\n4 0\n",
        "8.00\n"
      ]
    ]
  },
  {
    "id": "A0765",
    "title": "少量终端连通代价",
    "seriesId": "S07",
    "difficulty": "省选",
    "tags": [
      "状压 DP",
      "最短路"
    ],
    "model": "Steiner 树子集 DP",
    "description": [
      "给定无向非负权图和 k 个终端点，需要选择若干边，使所有终端位于同一连通子图，总代价最小。非终端点可以作为中转。",
      "允许选择的连通子图含环，但最优解可视为树。若无法连通全部终端输出 -1；重复路径的公共边只计一次。"
    ],
    "input": "第一行 n、m、k；第二行 k 个终端编号；接下来 m 行 u、v、w。",
    "output": "输出连接全部终端的最小总代价或 -1。",
    "constraints": [
      "1 ≤ n ≤ 200",
      "0 ≤ m ≤ 5000",
      "1 ≤ k ≤ 8",
      "0 ≤ w ≤ 10^9"
    ],
    "sampleExplanation": "选择 1-2-3-4-5 的四条边可连接终端 1、4、5，总代价 7。",
    "hint": "dp[mask][v] 表示终端子集在 v 汇合的代价；枚举子集划分合并，再对每个 mask 做多源 Dijkstra。",
    "targetComplexity": "时间 O(3^k n+2^k(m+n)log n)，空间 O(2^k n)。",
    "difficultyReason": "省选难度来自 Steiner 树子集划分与图上最短路松弛的组合，可区分枚举子树和两两最短路拼接。",
    "tests": [
      [
        "5 6 3\n1 4 5\n1 2 2\n2 3 2\n3 4 2\n3 5 3\n1 5 10\n4 5 1\n",
        "7\n"
      ],
      [
        "1 0 1\n1\n",
        "0\n"
      ],
      [
        "4 2 3\n1 3 4\n1 2 1\n3 4 2\n",
        "-1\n"
      ]
    ]
  },
  {
    "id": "A0832",
    "title": "序列翻转加法台",
    "seriesId": "S08",
    "difficulty": "省选",
    "tags": [
      "隐式 Treap",
      "懒标记"
    ],
    "model": "隐式 Treap 区间维护",
    "description": [
      "维护一个长度固定的整数序列，支持区间翻转、区间加法和区间求和。所有区间端点以操作执行前的当前顺序为准。",
      "翻转会改变后续操作看到的下标；加法与翻转都应使用懒标记，向下传播时要保证左右子树和区间和保持一致。"
    ],
    "input": "第一行 n、q，第二行初始序列；接下来为 REV l r、ADD l r x 或 SUM l r。",
    "output": "每个 SUM 输出一行区间和。",
    "constraints": [
      "1 ≤ n,q ≤ 200000",
      "|初值|,|x| ≤ 10^9",
      "答案在 64 位有符号整数范围内"
    ],
    "sampleExplanation": "翻转 2…4 后再给 3…5 加 10，两个查询依次为 15、29、15。",
    "hint": "用按子树大小分裂的隐式 Treap，把区间切成三段；在中段挂 reverse 或 add 标记后再合并。",
    "targetComplexity": "每次操作期望 O(log n)，空间 O(n)。",
    "difficultyReason": "省选难度对应随机平衡树分裂合并、两类懒标记组合和 64 位区间和。",
    "tests": [
      [
        "5 5\n1 2 3 4 5\nSUM 1 5\nREV 2 4\nADD 3 5 10\nSUM 2 4\nSUM 5 5\n",
        "15\n29\n15\n"
      ],
      [
        "1 4\n5\nADD 1 1 -7\nSUM 1 1\nREV 1 1\nSUM 1 1\n",
        "-2\n-2\n"
      ],
      [
        "6 6\n3 1 4 1 5 9\nREV 1 6\nADD 2 5 2\nSUM 1 3\nREV 3 6\nSUM 2 6\nSUM 4 4\n",
        "19\n22\n3\n"
      ]
    ]
  },
  {
    "id": "A0833",
    "title": "动态直线最低值",
    "seriesId": "S08",
    "difficulty": "省选",
    "tags": [
      "Li Chao 树",
      "在线查询"
    ],
    "model": "Li Chao 最小值维护",
    "description": [
      "系统在线加入一次函数 y=kx+b，并在指定整数 x 处查询所有已加入直线的最小函数值。",
      "保证第一次查询前至少加入一条直线。直线永久存在，操作必须按输入顺序处理；斜率可相等，应保留截距更小者的效果。"
    ],
    "input": "第一行 q；接下来 q 行为 ADD k b 或 QUERY x。",
    "output": "每个 QUERY 输出一行最小值。",
    "constraints": [
      "1 ≤ q ≤ 200000",
      "|k|,|b|,|x| ≤ 10^9",
      "所有函数值在 64 位范围内"
    ],
    "sampleExplanation": "加入 2x+3 与 -x+5 后，在 x=0、2 的最小值为 3、3；常数 -4 加入后，x=100 时直线 -x+5 仍给出更小的 -95。",
    "hint": "在线 Li Chao 树在区间中点比较两条直线，保留中点更优者，把另一条递归到仍可能获胜的一侧。",
    "targetComplexity": "每次操作 O(log 2·10^9)，空间 O(q log X) 的动态节点上界。",
    "difficultyReason": "省选难度来自函数优势区间判断、动态值域和精确 64 位计算。",
    "tests": [
      [
        "6\nADD 2 3\nADD -1 5\nQUERY 0\nQUERY 2\nADD 0 -4\nQUERY 100\n",
        "3\n3\n-95\n"
      ],
      [
        "3\nADD 0 7\nQUERY -1000000000\nQUERY 1000000000\n",
        "7\n7\n"
      ],
      [
        "7\nADD 1 0\nADD -1 0\nQUERY -5\nQUERY 5\nADD 2 -100\nQUERY 50\nQUERY -50\n",
        "-5\n-5\n-50\n-200\n"
      ]
    ]
  },
  {
    "id": "A0834",
    "title": "子树众数颜色和",
    "seriesId": "S08",
    "difficulty": "提高",
    "tags": [
      "DSU on tree",
      "小并大"
    ],
    "model": "子树频次小并大",
    "description": [
      "一棵以 1 为根的树，每个顶点有正整数颜色。对每个顶点 u，统计其子树内出现次数最多的颜色；若多种颜色并列，输出这些颜色编号之和。",
      "子树包含 u 本身。每个顶点都要回答，朴素为每个子树重新计数会达到 O(n²)。"
    ],
    "input": "第一行 n，第二行 n 个颜色；接下来 n-1 行无向边。",
    "output": "输出 n 个整数，第 i 个为顶点 i 的答案。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "1 ≤ 颜色 ≤ 10^9"
    ],
    "sampleExplanation": "根子树中颜色 1 和 2 都出现两次，答案为 3；顶点 3 的三种颜色各一次，答案为 6。",
    "hint": "后序遍历；每个节点保留最大子树的频次表，把小表逐项合并并同步维护最大频次与颜色和。",
    "targetComplexity": "期望时间 O(n log n)，空间 O(n)。",
    "difficultyReason": "提高难度来自全树子树统计、小并大复杂度证明和并列众数和维护。",
    "tests": [
      [
        "5\n1 2 1 3 2\n1 2\n1 3\n3 4\n3 5\n",
        "3 2 6 3 2\n"
      ],
      [
        "1\n100\n",
        "100\n"
      ],
      [
        "5\n1 2 1 2 3\n1 2\n2 3\n3 4\n4 5\n",
        "3 2 6 5 3\n"
      ]
    ]
  },
  {
    "id": "A0933",
    "title": "根定向最小树形图",
    "seriesId": "S09",
    "difficulty": "省选",
    "tags": [
      "朱刘算法",
      "有向图"
    ],
    "model": "最小树形图",
    "description": [
      "给定带权有向图和根 r，要选择 n-1 条有向边，使根能沿所选边到达每个顶点，且总权值最小。",
      "除根外每个顶点必须恰有一条入边。图可含重边、自环和负权；自环不能成为入边。不存在满足条件的树形图时输出 -1。"
    ],
    "input": "第一行 n、m、r；接下来 m 行 u、v、w 表示有向边。",
    "output": "输出最小树形图权值或 -1。",
    "constraints": [
      "1 ≤ n ≤ 500",
      "0 ≤ m ≤ 20000",
      "|w| ≤ 10^9"
    ],
    "sampleExplanation": "选择 1→2、2→3、3→4，总权值 3。",
    "hint": "每轮为非根顶点选最小入边；若形成环，累加入边权并缩点，跨环边减去目标点已选入边权。",
    "targetComplexity": "时间 O(nm)，空间 O(n+m)。",
    "difficultyReason": "省选难度对应 Edmonds/朱刘算法的选入边、找环、缩点与权值重标定。",
    "tests": [
      [
        "4 6 1\n1 2 1\n1 3 5\n2 3 1\n2 4 4\n3 4 1\n4 2 1\n",
        "3\n"
      ],
      [
        "3 1 1\n1 2 7\n",
        "-1\n"
      ],
      [
        "4 6 1\n1 2 10\n1 3 10\n2 3 1\n3 2 1\n2 4 2\n3 4 2\n",
        "13\n"
      ]
    ]
  },
  {
    "id": "A0934",
    "title": "只增标记最近点",
    "seriesId": "S09",
    "difficulty": "省选",
    "tags": [
      "点分治",
      "树上距离"
    ],
    "model": "点分治动态最近标记",
    "description": [
      "给定一棵树，顶点 1 初始被标记。操作 MARK x 把顶点 x 永久标记，ASK x 查询 x 到任意已标记顶点的最短边数。",
      "重复标记无影响，标记不会删除。树边均为单位长度，操作在线执行，不能提前按询问终点排序。"
    ],
    "input": "第一行 n、q，接下来 n-1 行边，再接 q 行操作。",
    "output": "每个 ASK 输出一行最近距离。",
    "constraints": [
      "1 ≤ n,q ≤ 200000"
    ],
    "sampleExplanation": "标记 5 后，4 到最近标记 5 的距离为 2；再标记 3 后，2 的最近距离为 1。",
    "hint": "建立点分树，预存每个点到其所有点分祖先的距离；标记更新祖先最优值，查询取距离和最小值。",
    "targetComplexity": "预处理 O(n log n)，每次操作 O(log n)，空间 O(n log n)。",
    "difficultyReason": "省选难度来自点分治层次、原树距离记录与在线只增最近点维护。",
    "tests": [
      [
        "5 6\n1 2\n2 3\n3 4\n3 5\nASK 4\nMARK 5\nASK 4\nMARK 3\nASK 2\nASK 5\n",
        "3\n2\n1\n0\n"
      ],
      [
        "1 3\nASK 1\nMARK 1\nASK 1\n",
        "0\n0\n"
      ],
      [
        "6 3\n1 2\n2 3\n3 4\n4 5\n5 6\nASK 6\nMARK 4\nASK 6\n",
        "5\n2\n"
      ]
    ]
  },
  {
    "id": "A1032",
    "title": "模平方根查询",
    "seriesId": "S10",
    "difficulty": "省选",
    "tags": [
      "Tonelli-Shanks",
      "二次剩余"
    ],
    "model": "Tonelli-Shanks 模平方根",
    "description": [
      "给定奇质数 p，多次求 x²≡n (mod p) 的解。若有解，输出所有非负解中较小的一个；若无解输出 -1。",
      "n 先对 p 取模。n=0 的答案为 0；非零二次剩余通常有互补的两个根 x 与 p-x，需要按较小者输出。"
    ],
    "input": "第一行质数 p 和询问数 q；接下来 q 行每行 n。",
    "output": "每个询问输出较小模平方根或 -1。",
    "constraints": [
      "3 ≤ p < 2^63，p 为奇质数",
      "1 ≤ q ≤ 20000",
      "0 ≤ n < 2^64"
    ],
    "sampleExplanation": "模 13 下 6²≡10，且另一根为 7，因此 10 的答案是 6；2 是非二次剩余。",
    "hint": "先用 Euler 判别检查二次剩余；p mod 4=3 可快速求根，否则用 Tonelli-Shanks 分解 p-1=q·2^s。",
    "targetComplexity": "每次 O(log²p)，空间 O(1)。",
    "difficultyReason": "省选难度来自二次剩余判定、Tonelli-Shanks 循环与 128 位模乘防溢出。",
    "tests": [
      [
        "13 4\n10\n3\n0\n2\n",
        "6\n4\n0\n-1\n"
      ],
      [
        "3 2\n0\n1\n",
        "0\n1\n"
      ],
      [
        "17 4\n1\n4\n16\n8\n",
        "1\n2\n4\n5\n"
      ]
    ]
  },
  {
    "id": "A1033",
    "title": "欧几里得整除和",
    "seriesId": "S10",
    "difficulty": "提高",
    "tags": [
      "类欧几里得",
      "整除分块"
    ],
    "model": "floor_sum 类欧几里得",
    "description": [
      "每个询问给出 n、m、a、b，计算 S=Σ(i=0…n-1) floor((a·i+b)/m)。参数均为非负整数。",
      "答案可能超过 64 位，需要完整十进制输出。不能逐项累加；应先抽出 a、b 中整除 m 的部分，再交换几何区域的横纵角色递归缩小。"
    ],
    "input": "第一行 q，接下来 q 行 n、m、a、b。",
    "output": "每个询问输出对应整除和。",
    "constraints": [
      "1 ≤ q ≤ 200000",
      "0 ≤ n,a,b ≤ 10^18",
      "1 ≤ m ≤ 10^18",
      "答案小于 2^128"
    ],
    "sampleExplanation": "n=5,m=7,a=3,b=1 时五项为 0,0,1,1,1，总和 3。",
    "hint": "使用 floor_sum 的类欧几里得迭代：处理 a≥m、b≥m 后，令 y=a·n+b 并交换 a、m。",
    "targetComplexity": "每次询问 O(log m)，空间 O(1)。",
    "difficultyReason": "提高难度来自几何计数递推、128 位中间量和大批量询问。",
    "tests": [
      [
        "3\n5 7 3 1\n1 10 9 9\n10 6 4 3\n",
        "3\n0\n30\n"
      ],
      [
        "2\n0 7 3 1\n1 1 0 0\n",
        "0\n0\n"
      ],
      [
        "1\n1000000 999983 123456 789012\n",
        "61729276691\n"
      ]
    ]
  },
  {
    "id": "A1132",
    "title": "Lyndon 标准分解",
    "seriesId": "S11",
    "difficulty": "提高",
    "tags": [
      "Duval 算法",
      "字符串分解"
    ],
    "model": "Lyndon 分解",
    "description": [
      "把小写字符串唯一分解为若干 Lyndon 串，并要求这些因子按字典序非递增。Lyndon 串严格小于自身任何非空真后缀。",
      "需要输出 Duval 标准分解的因子数量及每个因子。相同因子可连续出现，空串不在输入范围内。"
    ],
    "input": "输入一个小写字符串 s。",
    "output": "第一行输出因子数，随后每行一个因子。",
    "constraints": [
      "1 ≤ |s| ≤ 1000000"
    ],
    "sampleExplanation": "banana 的标准分解为 b、an、an、a，依次非递增。",
    "hint": "维护 i、j、k：比较 s[k] 与 s[j] 找到最短 Lyndon 周期，再重复输出该周期直至越过 k。",
    "targetComplexity": "时间 O(|s|)，除输出外额外空间 O(1)。",
    "difficultyReason": "提高难度来自 Lyndon 定义、Duval 指针回退与重复周期输出。",
    "tests": [
      [
        "banana\n",
        "4\nb\nan\nan\na\n"
      ],
      [
        "aaaa\n",
        "4\na\na\na\na\n"
      ],
      [
        "cabaabb\n",
        "3\nc\nab\naabb\n"
      ]
    ]
  },
  {
    "id": "A1133",
    "title": "三现最长边界",
    "seriesId": "S11",
    "difficulty": "普及+/提高",
    "tags": [
      "KMP",
      "出现次数"
    ],
    "model": "前缀函数边界出现统计",
    "description": [
      "给定一个小写字符串，寻找最长非空字符串 t，使 t 同时是原串的前缀和后缀，并且作为子串在原串中至少出现三次。出现位置可以重叠，前缀与后缀也计入次数。",
      "若不存在输出 -1；否则输出 t 的长度和内容。只需考虑原串的边界链，不应为每个候选重新进行完整匹配。"
    ],
    "input": "输入一个小写字符串 s。",
    "output": "存在时输出长度和字符串，中间空格分隔；否则输出 -1。",
    "constraints": [
      "1 ≤ |s| ≤ 1000000"
    ],
    "sampleExplanation": "fix 在给定串的开头、中部和结尾各出现一次，且不存在更长满足条件的边界。",
    "hint": "用前缀函数统计每个前缀作为子串的出现次数，再沿完整串的 border 链向短回退。",
    "targetComplexity": "时间 O(|s|)，空间 O(|s|)。",
    "difficultyReason": "普及+/提高难度来自重叠出现统计、border 链和至少三次条件的结合。",
    "tests": [
      [
        "fixprefixsuffixfixprefixsuffixfix\n",
        "3 fix\n"
      ],
      [
        "aaaaa\n",
        "3 aaa\n"
      ],
      [
        "abcababcababcab\n",
        "5 abcab\n"
      ]
    ]
  }
]

export const algorithmBatch12Problems = rawDefinitions.map((definition, index) => {
  const { tests, model, difficultyReason, ...problem } = definition
  return {
    ...problem,
    series: seriesNames[problem.seriesId],
    type: '传统题',
    limitMs: ['省选', '挑战'].includes(problem.difficulty) ? 5000 : problem.difficulty === '提高' ? 3000 : 1800,
    memoryMb: 256,
    score: 100,
    status: '',
    passRate: Math.max(22, 76 - index),
    submissions: 48 + index * 5,
    coreModel: model,
    difficultyReason,
    referenceSolution: algorithmBatch12Solutions[problem.id],
    statement: {
      description: problem.description,
      input: problem.input,
      output: problem.output,
      constraints: problem.constraints,
      sampleExplanation: problem.sampleExplanation,
      hint: problem.hint,
      solutionOutline: problem.hint,
      targetComplexity: problem.targetComplexity,
      difficultyReason,
    },
    samples: [{ input: tests[0][0], output: tests[0][1] }],
  }
})

export function getAlgorithmBatch12Tests(problemId) {
  const definition = rawDefinitions.find((item) => item.id === problemId)
  if (!definition) return []
  const tests = definition.tests.map(([input, output]) => [input, output])
  if (generatedTestFactories[problemId]) tests[2] = generatedTestFactories[problemId]()
  return tests.map(([input, output], index) => ({ name: testNames[index], score: testScores[index], input, output }))
}
export function getAlgorithmBatch12Sample(problemId) {
  const tests = getAlgorithmBatch12Tests(problemId)
  return tests.length ? { input: tests[0].input, output: tests[0].output } : null
}
export const algorithmBatch12Models = rawDefinitions.map(({ id, seriesId, model }) => ({ id, seriesId, model }))
