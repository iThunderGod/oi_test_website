import { algorithmBatch6Solutions } from './algorithmBatch6Solutions.mjs'

const seriesNames = {
  "S01": "语言基础",
  "S02": "模拟与枚举",
  "S03": "排序与二分",
  "S04": "贪心",
  "S05": "前缀和与差分",
  "S06": "搜索",
  "S07": "动态规划",
  "S08": "数据结构",
  "S09": "图论",
  "S10": "数学",
  "S11": "字符串"
}
const testNames = ['Typical structure', 'Boundary conditions', 'Comprehensive trap']
const testScores = [30, 30, 40]
const rawDefinitions = [
  {
    "id": "A0114",
    "title": "档案编号相加",
    "seriesId": "S01",
    "difficulty": "基础",
    "tags": [
      "高精度加法",
      "字符串处理"
    ],
    "model": "十进制高精度加法",
    "description": [
      "档案馆把两个累计编号写成十进制字符串，它们可能长达二十万位，普通整数类型无法完整保存。现在需要合并两批档案，并得到两个编号表示的非负整数之和。",
      "从两个字符串的末位开始逐位相加，低位产生的进位必须传给下一高位。输入允许出现前导零；输出除数字 0 本身外不得保留前导零，且不能使用会截断精度的浮点数。"
    ],
    "input": "两行分别给出十进制字符串 a 和 b。",
    "output": "输出 a+b 的标准十进制表示。",
    "constraints": [
      "1 ≤ |a|,|b| ≤ 200000",
      "a、b 只含数字字符且表示非负整数"
    ],
    "sampleExplanation": "999 的个位与 1 相加后连续产生进位，因此结果多出一个最高位，得到 1000。",
    "hint": "反向扫描两个字符串，用一个整数保存当前进位，最后将答案反转。",
    "targetComplexity": "时间 O(|a|+|b|)，空间 O(max(|a|,|b|))。",
    "difficultyReason": "需要自行实现跨位进位并处理前导零，但状态仅有当前下标和进位。",
    "tests": [
      [
        "999\n1\n",
        "1000\n"
      ],
      [
        "0\n0000\n",
        "0\n"
      ],
      [
        "12345678901234567890\n98765432109876543210\n",
        "111111111011111111100\n"
      ]
    ]
  },
  {
    "id": "A0115",
    "title": "加权校验码",
    "seriesId": "S01",
    "difficulty": "基础",
    "tags": [
      "字符串",
      "模运算"
    ],
    "model": "位置加权校验",
    "description": [
      "仓库标签由若干数据位和一位校验字符组成。第 i 个数据位（从 1 开始）的数字乘以 i，所有乘积之和对 11 取模，所得余数就是期望校验值。",
      "余数 0 至 9 直接写成对应数字，余数 10 写成字符 X。最后一个字符只用于比较，不参与加权；输入长度至少为 2，必须严格区分数字和大写 X。"
    ],
    "input": "输入一个不含空格的标签字符串，最后一个字符为待验证校验位。",
    "output": "校验位正确输出 VALID，否则输出 INVALID。",
    "constraints": [
      "2 ≤ 标签长度 ≤ 200000",
      "除最后一位可为 X 外，其余字符均为数字"
    ],
    "sampleExplanation": "数据位 1、2、3、4、5 的加权和为 55，对 11 取模为 0，与末位 0 一致。",
    "hint": "边扫描边对 11 取模，可避免加权和溢出。",
    "targetComplexity": "时间 O(n)，额外空间 O(1)。",
    "difficultyReason": "核心是准确翻译位置权重和余数 10 的特殊表示。",
    "tests": [
      [
        "123450\n",
        "VALID\n"
      ],
      [
        "00\n",
        "VALID\n"
      ],
      [
        "24X\n",
        "VALID\n"
      ]
    ]
  },
  {
    "id": "A0116",
    "title": "权限位控制台",
    "seriesId": "S01",
    "difficulty": "普及",
    "tags": [
      "位运算",
      "状态维护"
    ],
    "model": "64 位位掩码状态机",
    "description": [
      "一台控制器用一个 64 位无符号掩码保存权限：第 x 位为 1 表示权限 x 已启用。系统按顺序执行授权、撤销、翻转、查询和计数操作。",
      "GRANT 与 REVOKE 都是幂等操作；TOGGLE 无条件翻转一位；CHECK 只输出当前状态而不修改它；COUNT 统计全部已启用权限。权限编号从 0 到 63，特别要避免对最高位使用有符号移位。"
    ],
    "input": "第一行整数 q。接下来 q 行为 GRANT x、REVOKE x、TOGGLE x、CHECK x 或 COUNT。",
    "output": "每个 CHECK 输出 YES 或 NO；每个 COUNT 输出已启用权限数量。",
    "constraints": [
      "1 ≤ q ≤ 200000",
      "0 ≤ x ≤ 63"
    ],
    "sampleExplanation": "权限 1 和 3 被启用后，翻转权限 1 会关闭它，最终撤销权限 3 后计数为 0。",
    "hint": "使用 unsigned long long 和 1ULL<<x 构造单个位。",
    "targetComplexity": "每次操作 O(1)，总时间 O(q)，空间 O(1)。",
    "difficultyReason": "需要掌握位设置、清除、异或与最高位边界。",
    "tests": [
      [
        "8\nGRANT 1\nGRANT 3\nCHECK 1\nTOGGLE 1\nCHECK 1\nCOUNT\nREVOKE 3\nCOUNT\n",
        "YES\nNO\n1\n0\n"
      ],
      [
        "5\nCHECK 0\nTOGGLE 63\nCHECK 63\nCOUNT\nREVOKE 63\n",
        "NO\nYES\n1\n"
      ],
      [
        "9\nGRANT 5\nGRANT 5\nCOUNT\nTOGGLE 5\nCHECK 5\nREVOKE 5\nCOUNT\nGRANT 0\nCOUNT\n",
        "1\nNO\n0\n1\n"
      ]
    ]
  },
  {
    "id": "A0215",
    "title": "八邻域雷区标注",
    "seriesId": "S02",
    "difficulty": "基础",
    "tags": [
      "网格模拟",
      "邻域枚举"
    ],
    "model": "二维八方向局部统计",
    "description": [
      "勘探图由雷区字符 * 和安全格 . 组成。为了给巡检员制作提示图，每个安全格要标出其周围八个相邻位置中雷区的数量。",
      "越出地图的位置不存在，不计入数量；雷区格仍输出 *。所有格子的标注都必须依据原始地图计算，不能让已经写出的数字影响后续格子。"
    ],
    "input": "第一行 n、m，接下来 n 行为长度 m 的地图字符串。",
    "output": "输出 n 行标注后的地图；安全格输出 0 至 8。",
    "constraints": [
      "1 ≤ n,m ≤ 1000",
      "地图只含 * 和 ."
    ],
    "sampleExplanation": "每个安全格独立枚举八个方向，雷区本身保持星号。",
    "hint": "为每个非雷格枚举 di,dj∈{-1,0,1}，并检查边界。",
    "targetComplexity": "时间 O(nm)，空间 O(nm)。",
    "difficultyReason": "实现直接，但需正确处理角落、边界和不可原地覆盖。",
    "tests": [
      [
        "3 4\n.*..\n...*\n**..\n",
        "1*21\n333*\n**21\n"
      ],
      [
        "1 1\n.\n",
        "0\n"
      ],
      [
        "2 3\n***\n***\n",
        "***\n***\n"
      ]
    ]
  },
  {
    "id": "A0216",
    "title": "镜面光束巡检",
    "seriesId": "S02",
    "difficulty": "普及+/提高",
    "tags": [
      "状态模拟",
      "环检测"
    ],
    "model": "位置方向联合状态模拟",
    "description": [
      "光束从字符 S 所在格向东出发，每一步先移动到相邻格，再根据到达格的内容决定结果。字符 / 与反斜杠会反射方向，X 表示接收器，# 表示吸收墙，. 与 S 不改变方向。",
      "若下一步越界，输出 EXIT；进入 X 输出 HIT；进入 # 输出 BLOCK。若光束在移动前再次处于相同的“行、列、方向”状态，则之后必然循环，输出 LOOP。步数只统计实际尝试的移动，发现重复状态本身不增加步数。"
    ],
    "input": "第一行 n、m，接下来 n 行给出地图，恰有一个 S。",
    "output": "输出终止类型和移动步数，中间用一个空格分隔。",
    "constraints": [
      "1 ≤ n,m ≤ 1000",
      "地图只含 S、.、/、反斜杠、X、#"
    ],
    "sampleExplanation": "样例中光束从 S 向东连续移动四次，第四次进入 X，因此输出 HIT 4。",
    "hint": "访问标记必须包含四种方向，只记录格子会把不同轨迹误判为环。",
    "targetComplexity": "时间与空间均为 O(nm)，因为联合状态最多 4nm 个。",
    "difficultyReason": "需要精确定义移动、反射和终止的先后顺序，并用联合状态检测循环。",
    "tests": [
      [
        "3 5\nS...X\n.....\n.....\n",
        "HIT 4\n"
      ],
      [
        "1 1\nS\n",
        "EXIT 1\n"
      ],
      [
        "2 3\nS#X\n...\n",
        "BLOCK 1\n"
      ]
    ]
  },
  {
    "id": "A0315",
    "title": "最近刻度对",
    "seriesId": "S03",
    "difficulty": "普及",
    "tags": [
      "排序",
      "相邻性质"
    ],
    "model": "排序后相邻最小差",
    "description": [
      "实验台记录了 n 个带原始编号的整数刻度，需要找出数值差绝对值最小的两个不同记录。数值可以相同，也可以为负数。",
      "先比较最小差值；若有多对达到同一差值，把每对编号按小到大写成 (i,j)，再选择字典序最小的一对。输出必须保留原输入编号，而不是排序后的位置。"
    ],
    "input": "第一行 n，第二行 n 个整数 a1…an。",
    "output": "输出最小绝对差以及选中记录的两个原编号 i、j。",
    "constraints": [
      "2 ≤ n ≤ 200000",
      "|ai| ≤ 10^18"
    ],
    "sampleExplanation": "编号 2 与 4 的刻度都为 3，差值为 0，已不可能更小。",
    "hint": "数值排序后，最小差一定出现在相邻元素之间；遇到同差时比较编号对。",
    "targetComplexity": "时间 O(n log n)，空间 O(n)。",
    "difficultyReason": "除排序相邻性质外，还需实现稳定且明确的二级字典序规则。",
    "tests": [
      [
        "5\n10 3 8 3 20\n",
        "0 2 4\n"
      ],
      [
        "2\n-5 7\n",
        "12 1 2\n"
      ],
      [
        "4\n0 10 20 30\n",
        "10 1 2\n"
      ]
    ]
  },
  {
    "id": "A0316",
    "title": "双库第 k 件",
    "seriesId": "S03",
    "difficulty": "提高",
    "tags": [
      "二分消除",
      "有序序列"
    ],
    "model": "两个有序数组第 k 小",
    "description": [
      "两个仓库分别按非降序保存货物编号。现在只需要合并后从小到大排列的第 k 个编号，完整合并会产生不必要的线性额外空间。",
      "相同编号按出现次数分别计数。任一仓库可以为空，但两者总长度至少为 1；k 从 1 开始。每轮可比较两个候选前缀末端，并整段排除不可能包含答案的一侧。"
    ],
    "input": "第一行 n、m、k。第二行给出 n 个整数，第三行给出 m 个整数；空序列对应空行。",
    "output": "输出合并多重序列中的第 k 小值。",
    "constraints": [
      "0 ≤ n,m ≤ 200000",
      "1 ≤ k ≤ n+m",
      "两个输入序列均非降序"
    ],
    "sampleExplanation": "合并次序为 1,2,3,4,8,9,10，第 5 个值为 8。",
    "hint": "令每次考察的前缀长度不超过 k/2，较小端点所在前缀可全部丢弃。",
    "targetComplexity": "时间 O(log k)，额外空间 O(1)。",
    "difficultyReason": "提高难度来自不实际合并数组，并正确处理耗尽、重复值和 k=1。",
    "tests": [
      [
        "3 4 5\n1 4 9\n2 3 8 10\n",
        "8\n"
      ],
      [
        "0 3 1\n\n-5 0 2\n",
        "-5\n"
      ],
      [
        "4 5 6\n1 2 2 100\n2 2 3 4 5\n",
        "3\n"
      ]
    ]
  },
  {
    "id": "A0415",
    "title": "截止日前的收益",
    "seriesId": "S04",
    "difficulty": "提高",
    "tags": [
      "贪心",
      "并查集"
    ],
    "model": "单位任务截止期调度",
    "description": [
      "有 n 个任务，每个任务执行恰好占用一个完整时隙，任务 i 必须安排在编号不超过 di 的空闲时隙才能获得收益 pi。一天从时隙 1 开始，同一时隙最多执行一个任务。",
      "可以放弃任意任务，非正收益任务没有安排价值。目标先最大化总收益；输出中同时给出被安排任务数。按收益从大到小考虑任务时，应为它寻找不超过截止日的最晚空闲时隙。"
    ],
    "input": "第一行 n，接下来 n 行给出 di、pi。",
    "output": "输出最大总收益和对应安排的任务数。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "1 ≤ di ≤ 200000",
      "|pi| ≤ 10^9"
    ],
    "sampleExplanation": "收益 50、40、30 的任务可分别放入时隙 2、3、1，总收益 120。",
    "hint": "排序后用并查集维护“某时隙及其之前最晚可用位置”。",
    "targetComplexity": "时间 O(n log n+n α(n))，空间 O(max di)。",
    "difficultyReason": "高收益优先的交换论证与并查集找前驱缺一不可，线性扫描空位会退化。",
    "tests": [
      [
        "5\n1 20\n2 50\n2 10\n3 40\n1 30\n",
        "120 3\n"
      ],
      [
        "3\n1 -5\n2 0\n1 7\n",
        "7 1\n"
      ],
      [
        "6\n4 70\n1 80\n1 30\n2 60\n2 50\n3 40\n",
        "250 4\n"
      ]
    ]
  },
  {
    "id": "A0416",
    "title": "结伴渡河",
    "seriesId": "S04",
    "difficulty": "普及",
    "tags": [
      "双指针",
      "贪心"
    ],
    "model": "容量二人配对",
    "description": [
      "救援艇一次最多载两人，总重量不能超过容量 C。所有人都必须过河，求最少需要多少艘艇。",
      "最重的人必须登上一艘艇；若最轻的人能与其同乘，配对不会让后续方案更差，否则最重者只能独乘。每个人恰好被安排一次。"
    ],
    "input": "第一行 n、C，第二行给出 n 个人的重量。",
    "output": "输出所需救援艇的最少数量。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "1 ≤ wi ≤ C ≤ 10^9"
    ],
    "sampleExplanation": "排序后可配成 (2,8)、(3,7)、(4,6)，恰好使用三艘。",
    "hint": "排序并维护最轻、最重两个指针，每轮一定移走最重者。",
    "targetComplexity": "时间 O(n log n)，额外空间 O(n) 或取决于排序实现。",
    "difficultyReason": "需要用交换论证确认“能配就与最轻者配”的局部选择。",
    "tests": [
      [
        "6 10\n2 3 7 8 4 6\n",
        "3\n"
      ],
      [
        "1 100\n99\n",
        "1\n"
      ],
      [
        "7 10\n6 6 6 4 4 4 4\n",
        "4\n"
      ]
    ]
  },
  {
    "id": "A0515",
    "title": "等差涂层叠加",
    "seriesId": "S05",
    "difficulty": "普及+/提高",
    "tags": [
      "差分",
      "等差数列"
    ],
    "model": "线性函数区间差分",
    "description": [
      "长度为 n 的轨道初值全为 0。一次涂层操作给出 l、r、a、d，并依次给位置 l,l+1,…,r 加上 a,a+d,…,a+(r-l)d。多次操作的贡献相互叠加。",
      "所有操作读取完后一次性输出最终数组。直接逐位置执行每次操作可能达到 O(nq)；应把每个等差贡献写成关于位置 i 的线性函数 d·i+(a-dl)，分别维护两个差分数组。"
    ],
    "input": "第一行 n、q，接下来 q 行给出 l、r、a、d。",
    "output": "输出 n 个整数，表示全部操作后的轨道值。",
    "constraints": [
      "1 ≤ n,q ≤ 200000",
      "|a|,|d| ≤ 10^9",
      "1 ≤ l ≤ r ≤ n"
    ],
    "sampleExplanation": "第一项操作贡献 2,4,6，第二项在 2 至 5 贡献 1,2,3,4，逐项叠加得到答案。",
    "hint": "对斜率和截距各做一次普通区间差分，最后前缀恢复。",
    "targetComplexity": "时间 O(n+q)，空间 O(n)。",
    "difficultyReason": "需把等差序列转换为位置的一次函数，避免按区间长度展开。",
    "tests": [
      [
        "5 2\n1 3 2 2\n2 5 1 1\n",
        "2 5 8 3 4\n"
      ],
      [
        "1 1\n1 1 -5 7\n",
        "-5\n"
      ],
      [
        "6 3\n1 6 1 1\n2 4 10 -2\n4 6 -3 1\n",
        "1 12 11 7 3 5\n"
      ]
    ]
  },
  {
    "id": "A0516",
    "title": "立体仓格统计",
    "seriesId": "S05",
    "difficulty": "提高",
    "tags": [
      "三维前缀和",
      "容斥"
    ],
    "model": "三维正交前缀和",
    "description": [
      "冷库被划分为 n×m×k 个仓格，每格有一个可能为负的库存变化量。系统要回答多个轴对齐长方体区域内所有仓格的总和。",
      "查询端点均包含在区域内，且满足 x1≤x2、y1≤y2、z1≤z2。三维容斥共有八项，正负号由被减去的下界维数决定；答案可能超过 32 位整数。"
    ],
    "input": "第一行 n、m、k、q；随后按 x、y、z 顺序给出 nmk 个整数；接下来 q 行给出 x1 y1 z1 x2 y2 z2。",
    "output": "每个查询输出一行区域总和。",
    "constraints": [
      "1 ≤ n,m,k ≤ 100，且 nmk ≤ 10^6",
      "1 ≤ q ≤ 200000",
      "仓格值绝对值不超过 10^9"
    ],
    "sampleExplanation": "第一个查询覆盖整个 2×2×2 立方体，总和为 36；第二个查询只覆盖 x=2 的四格，总和为 26。",
    "hint": "令 P[x][y][z] 表示从 (1,1,1) 到该点的和，再按三维容斥查询。",
    "targetComplexity": "预处理 O(nmk)，每次查询 O(1)，空间 O(nmk)。",
    "difficultyReason": "提高难度来自三维存储索引和八项容斥的符号准确性。",
    "tests": [
      [
        "2 2 2 2\n1 2 3 4 5 6 7 8\n1 1 1 2 2 2\n2 1 1 2 2 2\n",
        "36\n26\n"
      ],
      [
        "1 1 1 1\n-7\n1 1 1 1 1 1\n",
        "-7\n"
      ],
      [
        "2 2 3 2\n1 -1 2 3 0 4 5 6 -2 1 7 8\n1 2 1 2 2 3\n2 1 2 2 2 3\n",
        "23\n19\n"
      ]
    ]
  },
  {
    "id": "A0517",
    "title": "菱形信号覆盖",
    "seriesId": "S05",
    "difficulty": "提高",
    "tags": [
      "坐标变换",
      "二维前缀和"
    ],
    "model": "曼哈顿菱形旋转前缀",
    "description": [
      "城市是 n×m 网格，每个站点有一个信号权值。询问以 (x,y) 为中心、曼哈顿距离不超过 d 的所有站点权值之和。超出城市边界的坐标自然忽略。",
      "在原坐标中查询区域是菱形。作 u=x+y、v=x-y+m 变换后，条件变成 u 与 v 各自落在长度 2d 的轴对齐区间内；变换平面中的空洞位置权值视为 0。"
    ],
    "input": "第一行 n、m、q；接下来 n 行为权值矩阵；接下来 q 行给出 x、y、d。",
    "output": "每个询问输出一行覆盖权值总和。",
    "constraints": [
      "1 ≤ n,m ≤ 1000，且 n+m ≤ 2000",
      "1 ≤ q ≤ 200000",
      "|权值| ≤ 10^9",
      "0 ≤ d ≤ n+m"
    ],
    "sampleExplanation": "中心 (2,2)、半径 1 覆盖十字形五格，权值和为 25。",
    "hint": "在旋转坐标平面放置原格点，再建立普通二维前缀和。",
    "targetComplexity": "预处理 O((n+m)^2)，每次查询 O(1)，空间 O((n+m)^2)。",
    "difficultyReason": "需要识别曼哈顿球到矩形的坐标变换，并正确平移可能为负的 v。",
    "tests": [
      [
        "3 3 2\n1 2 3\n4 5 6\n7 8 9\n2 2 1\n1 1 2\n",
        "25\n22\n"
      ],
      [
        "1 1 1\n-5\n1 1 0\n",
        "-5\n"
      ],
      [
        "2 4 2\n1 10 1 10\n10 1 10 1\n1 3 1\n2 1 5\n",
        "31\n44\n"
      ]
    ]
  },
  {
    "id": "A0615",
    "title": "四轮密码锁",
    "seriesId": "S06",
    "difficulty": "提高",
    "tags": [
      "双向 BFS",
      "状态压缩"
    ],
    "model": "双向广度优先搜索",
    "description": [
      "密码锁有四个十进制转轮。一次操作可选一个转轮向前或向后拨一格，9 向前变 0，0 向后变 9。部分四位状态被安全系统永久禁用，不能进入。",
      "给定起点和终点，求最少操作数。起点或终点若被禁用则直接无解；允许起点等于终点。状态总数虽只有 10000，但本题要求使用从两端扩展较小前沿的双向 BFS，以形成可迁移的搜索模型。"
    ],
    "input": "第一行起点字符串，第二行终点字符串，第三行禁用数 f，接下来 f 行各一个四位字符串。",
    "output": "输出最少操作数；不可达输出 -1。",
    "constraints": [
      "0 ≤ f ≤ 9998",
      "所有状态均恰有四个数字，可含前导零"
    ],
    "sampleExplanation": "0000 到 0009 只需把最后一轮向后拨一次。",
    "hint": "分别维护两侧距离映射，每次完整扩展节点数较少的一层；新状态若已被另一侧访问即可合并距离。",
    "targetComplexity": "最坏时间和空间 O(10^4)。",
    "difficultyReason": "要求正确实现双端访问、环形数字邻居、禁用状态和前沿相遇。",
    "tests": [
      [
        "0000\n0009\n0\n",
        "1\n"
      ],
      [
        "1234\n1234\n0\n",
        "0\n"
      ],
      [
        "0000\n0002\n2\n0001\n0009\n",
        "4\n"
      ]
    ]
  },
  {
    "id": "A0616",
    "title": "唯一数独补全",
    "seriesId": "S06",
    "difficulty": "提高",
    "tags": [
      "回溯",
      "位掩码"
    ],
    "model": "MRV 数独约束搜索",
    "description": [
      "给定一个保证有唯一解的 9×9 数独。数字 1 至 9 在每行、每列和每个 3×3 宫中都恰好出现一次，字符 . 表示空格。",
      "需要输出完整解。搜索时每次应选择候选数字最少的空格；若候选集合为空，当前分支立即失败。行、列、宫的已用数字可各用九位掩码维护，避免反复扫描。"
    ],
    "input": "输入 9 行，每行 9 个字符。",
    "output": "输出唯一完成后的 9 行数字。",
    "constraints": [
      "输入盘面合法且有唯一解",
      "空格数不超过 60"
    ],
    "sampleExplanation": "样例是标准唯一解盘面，按行列宫约束依次填入后得到所示完整棋盘。",
    "hint": "MRV（最少剩余值）能显著压缩搜索树；尝试一位时同步修改三类掩码，回溯时恢复。",
    "targetComplexity": "最坏指数级；本数据借助 MRV 与位运算可在时限内完成，空间 O(空格数)。",
    "difficultyReason": "高难来自组合搜索、启发式选点和严格的状态撤销。",
    "tests": [
      [
        "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79\n",
        "534678912\n672195348\n198342567\n859761423\n426853791\n713924856\n961537284\n287419635\n345286179\n"
      ],
      [
        "534678912\n672195348\n198342567\n859761423\n426853791\n713924856\n961537284\n287419635\n34528617.\n",
        "534678912\n672195348\n198342567\n859761423\n426853791\n713924856\n961537284\n287419635\n345286179\n"
      ],
      [
        "..3.2.6..\n9..3.5..1\n..18.64..\n..81.29..\n7.......8\n..67.82..\n..26.95..\n8..2.3..9\n..5.1.3..\n",
        "483921657\n967345821\n251876493\n548132976\n729564138\n136798245\n372689514\n814253769\n695417382\n"
      ]
    ]
  },
  {
    "id": "A0617",
    "title": "八数码最短复原",
    "seriesId": "S06",
    "difficulty": "省选",
    "tags": [
      "IDA*",
      "启发式搜索"
    ],
    "model": "IDA* 曼哈顿估价",
    "description": [
      "3×3 棋盘上有数字 1 至 8 和一个空格 0。一次操作可把空格与上下左右相邻数字交换，目标状态按行排列为 1 2 3 / 4 5 6 / 7 8 0。",
      "输出最少移动次数。若非零数字排列的逆序对数为奇数，则该状态不可达，应直接输出 -1。可达时使用 IDA*：逐步增加深度界，估价函数取各数字到目标位置曼哈顿距离之和，并禁止立即走回上一步。"
    ],
    "input": "输入 9 个整数，按行描述初始棋盘。",
    "output": "输出最少移动次数，或 -1。",
    "constraints": [
      "0 至 8 每个数字恰出现一次"
    ],
    "sampleExplanation": "空格向右交换一次即可把 7 0 8 变为 7 8 0，所以最短距离为 1。",
    "hint": "曼哈顿距离从不超过实际剩余步数，可作为可采纳估价；3×3 可达性由逆序奇偶性决定。",
    "targetComplexity": "指数级搜索，但 IDA*、估价剪枝和反向步剪枝可通过本题；空间 O(最优深度)。",
    "difficultyReason": "省选难度对应实质性的最优搜索、可达性判定和启发函数门槛，普通 BFS 需要维护大量状态。",
    "tests": [
      [
        "1 2 3 4 5 6 7 0 8\n",
        "1\n"
      ],
      [
        "1 2 3 4 5 6 8 7 0\n",
        "-1\n"
      ],
      [
        "1 3 6 5 0 2 4 7 8\n",
        "8\n"
      ]
    ]
  },
  {
    "id": "A0746",
    "title": "单调站点建设",
    "seriesId": "S07",
    "difficulty": "省选",
    "tags": [
      "斜率优化 DP",
      "单调队列"
    ],
    "model": "单调斜率优化平方转移",
    "description": [
      "沿一条直线有 n 个严格递增站点 x1…xn，起点记为 x0=0。到达站点 i 时，可从任意更早站点 j 转移，代价为 dp[j]+(xi-xj)^2+C，求到达 xn 的最小总代价。",
      "直接枚举 j 是 O(n²)。展开平方后，每个 j 对当前 xi 提供一条斜率 -2xj、截距 dp[j]+xj² 的直线；查询值再加 xi²+C。由于插入斜率和查询横坐标都单调，可用双端队列维护下凸包。"
    ],
    "input": "第一行 n、C，第二行 n 个严格递增非负整数 x1…xn。",
    "output": "输出 dp[n]。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "0 < x1 < … < xn ≤ 10^6",
      "0 ≤ C ≤ 10^12"
    ],
    "sampleExplanation": "可从 0 直接到 1，再由 1 到 3：5+4+5=14，比直接跨到 3 的 13 略大，因此最优为 13。",
    "hint": "比较相邻直线在当前 x 的取值弹出队首；用交点顺序或乘法比较弹出队尾。",
    "targetComplexity": "时间 O(n)，空间 O(n)。",
    "difficultyReason": "省选标签由 O(n²) 到 O(n) 的凸包优化门槛和溢出处理共同支撑。",
    "tests": [
      [
        "3 4\n1 3 6\n",
        "26\n"
      ],
      [
        "1 0\n5\n",
        "25\n"
      ],
      [
        "5 10\n2 3 7 8 20\n",
        "208\n"
      ]
    ]
  },
  {
    "id": "A0747",
    "title": "共同子序列计数",
    "seriesId": "S07",
    "difficulty": "提高",
    "tags": [
      "动态规划",
      "前缀累加"
    ],
    "model": "不同下标对公共子序列计数",
    "description": [
      "给定两个整数序列 A 和 B，统计所有非空“共同子序列下标对”的数量。一次方案由 A 中严格递增的一组下标和 B 中严格递增的一组下标组成，两个位置序列取出的值必须逐项相等。",
      "即使取出的值序列相同，只要任一侧下标选择不同，就视为不同方案。答案对 1000000007 取模；空子序列不计入最终答案。"
    ],
    "input": "第一行 n、m；第二行 A；第三行 B。",
    "output": "输出共同子序列下标对数量模 1000000007。",
    "constraints": [
      "1 ≤ n,m ≤ 2000",
      "序列元素绝对值不超过 10^9"
    ],
    "sampleExplanation": "A=[1,2]、B=[1,2] 的非空公共方案为 [1]、[2]、[1,2]，共 3 个。",
    "hint": "处理 A[i] 时，用前缀和累计旧 dp[j]；若 A[i]=B[j]，就把所有可接到此前位置的方案加入以 B[j] 结尾的计数。",
    "targetComplexity": "时间 O(nm)，空间 O(m)。",
    "difficultyReason": "难点是明确按下标对计数，并用滚动状态避免重复或漏计。",
    "tests": [
      [
        "2 2\n1 2\n1 2\n",
        "3\n"
      ],
      [
        "1 3\n5\n5 5 5\n",
        "3\n"
      ],
      [
        "3 3\n1 1 2\n1 2 1\n",
        "8\n"
      ]
    ]
  },
  {
    "id": "A0749",
    "title": "随机跃迁期望",
    "seriesId": "S07",
    "difficulty": "提高",
    "tags": [
      "概率 DP",
      "滑动窗口"
    ],
    "model": "有限马尔可夫链期望 DP",
    "description": [
      "棋子从位置 0 出发，位置 n 为终点。每次独立等概率选择 1 至 k 中的一个整数 r，并移动到 min(n,当前位置+r)。到达 n 后停止，求停止前执行移动的期望次数。",
      "答案按模 1000000007 输出。由于 k<1000000007，可把除以 k 解释为乘 k 的模逆元。设 E[i] 为从 i 出发的期望，则 E[n]=0，且 E[i]=1+(E[i+1]+…+E[min(n,i+k)])/k；越过 n 的选择对应直接结束，额外期望为 0。"
    ],
    "input": "输入两个整数 n、k。",
    "output": "输出期望次数在模 1000000007 意义下的值。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "1 ≤ k < 1000000007"
    ],
    "sampleExplanation": "n=5、k=2 时按期望递推并乘 2 的模逆元，得到 62500004。",
    "hint": "从 n-1 倒序计算 E[i]，用一个长度至多 k 的滑动窗口维护后继期望之和。",
    "targetComplexity": "时间 O(n log MOD)（逆元一次快速幂，DP O(n)），空间 O(n)。",
    "difficultyReason": "提高难度来自期望方程、越界转移的零贡献和模意义除法，并需用滑动窗口避免 O(nk)。",
    "tests": [
      [
        "5 2\n",
        "62500004\n"
      ],
      [
        "1 100\n",
        "1\n"
      ],
      [
        "10 4\n",
        "94532018\n"
      ]
    ]
  },
  {
    "id": "A0816",
    "title": "动态排名仓",
    "seriesId": "S08",
    "difficulty": "提高",
    "tags": [
      "树状数组",
      "离线离散化"
    ],
    "model": "可重复有序多重集秩查询",
    "description": [
      "维护一个允许重复整数的动态仓库。I x 插入一个 x；D x 删除一个 x（不存在则忽略）；C x 查询严格小于 x 的元素个数；K k 查询当前第 k 小元素。",
      "所有操作需按输入顺序生效，K 的 k 从 1 开始；若 k 超过当前元素总数输出 INVALID。可以先读取全部操作，将出现的数值离散化，再用频率树状数组维护前缀数量并二进制定位第 k 小。"
    ],
    "input": "第一行 q，接下来 q 行为 I x、D x、C x 或 K k。",
    "output": "每个 C 或 K 操作输出一行。",
    "constraints": [
      "1 ≤ q ≤ 200000",
      "|x| ≤ 10^9",
      "1 ≤ k ≤ 200000"
    ],
    "sampleExplanation": "插入 5、1、5 后，小于 5 的只有 1；第 2 小为 5，删除一个 5 后第 2 小仍为 5。",
    "hint": "K 查询可在树状数组上按二进制倍增寻找最小前缀和达到 k 的位置。",
    "targetComplexity": "离散化 O(q log q)，每次操作 O(log q)，空间 O(q)。",
    "difficultyReason": "提高难度来自重复计数、无效删除和树状数组上的顺序统计。",
    "tests": [
      [
        "8\nI 5\nI 1\nI 5\nC 5\nK 2\nD 5\nK 2\nC 6\n",
        "1\n5\n5\n2\n"
      ],
      [
        "5\nK 1\nD 7\nI -3\nC -3\nK 1\n",
        "INVALID\n0\n-3\n"
      ],
      [
        "9\nI 10\nI -5\nI 10\nI 7\nD 10\nC 10\nK 3\nD -5\nK 1\n",
        "2\n10\n7\n"
      ]
    ]
  },
  {
    "id": "A0817",
    "title": "离线区间色数",
    "seriesId": "S08",
    "difficulty": "提高",
    "tags": [
      "莫队算法",
      "离线查询"
    ],
    "model": "莫队维护区间不同值",
    "description": [
      "给定一个不会修改的颜色序列，多次询问区间 [l,r] 中出现了多少种不同颜色。查询顺序可以重排，但输出必须恢复原顺序。",
      "先离散化颜色，再按左端点块号和右端点的奇偶蛇形次序排序查询。移动当前区间的四个边界时，用频率数组维护颜色出现次数，并在频率从 0 到 1 或 1 到 0 时更新不同颜色数。"
    ],
    "input": "第一行 n、q，第二行 n 个颜色整数，接下来 q 行给出 l、r。",
    "output": "按原询问顺序每行输出不同颜色数。",
    "constraints": [
      "1 ≤ n,q ≤ 200000",
      "颜色值在 32 位有符号整数范围内"
    ],
    "sampleExplanation": "区间 [2,6] 为 2,1,3,2,2，出现颜色 1、2、3，共 3 种。",
    "hint": "块长可取约 sqrt(n)；奇偶块反转右端点顺序能减少指针回摆。",
    "targetComplexity": "约 O((n+q)√n)，空间 O(n+q)。",
    "difficultyReason": "提高难度来自离线重排、四类增删操作以及结果顺序还原。",
    "tests": [
      [
        "7 3\n1 2 1 3 2 2 4\n1 3\n2 6\n4 7\n",
        "2\n3\n3\n"
      ],
      [
        "1 2\n9\n1 1\n1 1\n",
        "1\n1\n"
      ],
      [
        "8 4\n5 5 4 3 4 2 3 1\n1 8\n2 7\n3 5\n6 8\n",
        "5\n4\n2\n3\n"
      ]
    ]
  },
  {
    "id": "A0818",
    "title": "可撤销连通实验",
    "seriesId": "S08",
    "difficulty": "省选",
    "tags": [
      "回滚并查集",
      "栈"
    ],
    "model": "并查集历史回滚",
    "description": [
      "实验图最初有 n 个孤立点。ADD u v 加入一条无向边；ASK u v 查询当前是否连通；UNDO k 撤销最近 k 次尚未撤销的 ADD 操作。每个 ADD 都占一个历史版本，即使它连接的两点原本已经连通。",
      "UNDO 只影响加边操作，不撤销 ASK 或更早已撤销的记录。为支持精确回滚，并查集不能使用路径压缩；按大小合并，并在栈中记录被改父节点、接收根的旧大小，冗余合并也要放一个占位记录。"
    ],
    "input": "第一行 n、q，接下来 q 行为 ADD u v、ASK u v 或 UNDO k。",
    "output": "每个 ASK 输出 YES 或 NO。",
    "constraints": [
      "1 ≤ n,q ≤ 200000",
      "UNDO 的 k 不超过当前有效 ADD 数"
    ],
    "sampleExplanation": "加入 1-2、2-3 后 1 与 3 连通；撤销最近一次加边后它们不再连通。",
    "hint": "为每个 ADD 保存操作前的修改栈长度，UNDO 时回退到该检查点。",
    "targetComplexity": "每次合并/回滚 O(log n) 摊还（按大小合并树高），查询 O(log n)，空间 O(n+q)。",
    "difficultyReason": "省选难度来自持久历史语义、禁止路径压缩和对无效合并的版本对齐。",
    "tests": [
      [
        "4 7\nADD 1 2\nADD 2 3\nASK 1 3\nUNDO 1\nASK 1 3\nADD 3 4\nASK 1 4\n",
        "YES\nNO\nNO\n"
      ],
      [
        "2 4\nASK 1 2\nADD 1 2\nUNDO 1\nASK 1 2\n",
        "NO\nNO\n"
      ],
      [
        "5 9\nADD 1 2\nADD 2 3\nADD 1 3\nUNDO 1\nASK 1 3\nUNDO 1\nASK 1 3\nADD 4 5\nASK 4 5\n",
        "YES\nNO\nYES\n"
      ]
    ]
  },
  {
    "id": "A0916",
    "title": "管网最大输送",
    "seriesId": "S09",
    "difficulty": "提高",
    "tags": [
      "最大流",
      "Dinic"
    ],
    "model": "Dinic 最大流",
    "description": [
      "有向管网中，边 u→v 每单位时间最多输送 c 单位物资。除源点 s 和汇点 t 外，每个节点流入量必须等于流出量；同一对节点可有多条边。求从 s 到 t 的最大总输送量。",
      "流量只能沿给定方向，容量为 0 的边允许出现。应构造残量网络：每条正向边配一条初始容量 0 的反向边；Dinic 每轮用 BFS 建层次图，再用当前弧 DFS 发送阻塞流。"
    ],
    "input": "第一行 n、m、s、t，接下来 m 行给出 u、v、c。",
    "output": "输出最大流量。",
    "constraints": [
      "2 ≤ n ≤ 500",
      "0 ≤ m ≤ 20000",
      "0 ≤ c ≤ 10^12"
    ],
    "sampleExplanation": "源点可向 2、3 分别输送，汇点总入口容量允许达到 5，且存在相应路径，因此最大流为 5。",
    "hint": "边结构保存终点、反向边下标和剩余容量；容量与答案使用 64 位整数。",
    "targetComplexity": "Dinic 在一般图上最坏 O(V²E)，本数据规模适合；空间 O(V+E)。",
    "difficultyReason": "提高难度来自残量边、层次图和阻塞流的完整实现。",
    "tests": [
      [
        "4 5 1 4\n1 2 3\n1 3 2\n2 3 1\n2 4 2\n3 4 4\n",
        "5\n"
      ],
      [
        "2 1 1 2\n1 2 0\n",
        "0\n"
      ],
      [
        "5 7 1 5\n1 2 10\n1 3 5\n2 3 15\n2 4 10\n3 4 10\n3 5 5\n4 5 10\n",
        "15\n"
      ]
    ]
  },
  {
    "id": "A0917",
    "title": "最低费用满运",
    "seriesId": "S09",
    "difficulty": "省选",
    "tags": [
      "费用流",
      "残量网络"
    ],
    "model": "最小费用最大流",
    "description": [
      "有向运输网每条边有容量 c 和单位费用 w，费用可以为负，但保证不存在可从源点到达且能无限降低费用的负环。目标先使 s 到 t 的总流量最大，再在所有最大流中最小化总费用。",
      "每次在残量网络中寻找一条费用最短的 s-t 增广路，沿路推送可行的最大流量，并添加反向边，反向边费用为 -w。找不到增广路时，当前流量已经最大。"
    ],
    "input": "第一行 n、m、s、t，接下来 m 行给出 u、v、c、w。",
    "output": "输出最大流量和对应最小费用。",
    "constraints": [
      "2 ≤ n ≤ 300",
      "0 ≤ m ≤ 5000",
      "0 ≤ c ≤ 10^9",
      "|w| ≤ 10^6"
    ],
    "sampleExplanation": "两单位可走 1-2-4，另两单位走 1-3-4，总费用为 2×2+2×4=12。",
    "hint": "可用 SPFA 在每轮残量图上求最短路；保存前驱边以回溯瓶颈容量。",
    "targetComplexity": "设最大增广轮数为 F，时间约 O(FVE)，空间 O(V+E)；测试容量设计保证可通过。",
    "difficultyReason": "省选难度对应最大流与最短路耦合、反向费用和“先最大流后最小费”的双目标。",
    "tests": [
      [
        "4 4 1 4\n1 2 2 1\n1 3 2 2\n2 4 2 1\n3 4 2 2\n",
        "4 12\n"
      ],
      [
        "2 0 1 2\n",
        "0 0\n"
      ],
      [
        "4 5 1 4\n1 2 3 0\n1 3 2 2\n2 3 2 -1\n2 4 2 3\n3 4 3 1\n",
        "5 12\n"
      ]
    ]
  },
  {
    "id": "A0918",
    "title": "关键链路输出",
    "seriesId": "S09",
    "difficulty": "提高",
    "tags": [
      "DAG",
      "路径恢复"
    ],
    "model": "DAG 最长链与前驱恢复",
    "description": [
      "项目依赖图是一个有向无环图。每条边 u→v 表示任务 u 完成后才能进入 v，链路长度按边数计算。请找出一条边数最多的有向路径。",
      "若有多条最长路径，允许输出任意一条。孤立点本身是一条长度 0 的路径。通过拓扑序做动态规划，并在松弛成功时记录前驱，最后从最大 dp 节点反向恢复路径。"
    ],
    "input": "第一行 n、m，接下来 m 行给出有向边 u、v；保证图为 DAG。",
    "output": "第一行输出最长路径边数，第二行输出该路径的所有顶点编号。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "0 ≤ m ≤ 300000"
    ],
    "sampleExplanation": "路径 1→2→4→5 含 3 条边，已达到最长。",
    "hint": "入度归零队列生成拓扑序；dp[v]<dp[u]+1 时更新并记录 pre[v]=u。",
    "targetComplexity": "时间 O(n+m)，空间 O(n+m)。",
    "difficultyReason": "除 DAG DP 外还要求保存并正确逆序恢复一个最优解。",
    "tests": [
      [
        "5 5\n1 2\n1 3\n2 4\n3 4\n4 5\n",
        "3\n1 2 4 5\n"
      ],
      [
        "1 0\n",
        "0\n1\n"
      ],
      [
        "6 5\n1 2\n2 3\n3 6\n4 5\n5 6\n",
        "3\n1 2 3 6\n"
      ]
    ]
  },
  {
    "id": "A1015",
    "title": "Möbius 前缀查询",
    "seriesId": "S10",
    "difficulty": "提高",
    "tags": [
      "线性筛",
      "Möbius 函数"
    ],
    "model": "线性筛 Möbius 前缀",
    "description": [
      "定义 Möbius 函数 μ(1)=1。若正整数含某个质数的平方因子，则 μ(n)=0；否则若它由 k 个不同质数相乘，μ(n)=(-1)^k。系统需要回答多个 M(x)=Σ(i=1..x) μ(i)。",
      "对每次询问单独分解 1..x 会非常慢。应一次线性筛出不超过最大 n 的 μ 值：遇到最小质因子重复时置 0，否则符号取反，再建立前缀和。"
    ],
    "input": "第一行上界 n 和询问数 q，接下来 q 行各给一个 x。",
    "output": "每个询问输出 M(x)。",
    "constraints": [
      "1 ≤ n,q ≤ 10^6",
      "1 ≤ x ≤ n"
    ],
    "sampleExplanation": "μ(1..5)=1,-1,-1,0,-1，前缀和为 -2。",
    "hint": "在线性筛的 i×p 转移中，若 i 能被 p 整除则 μ[i×p]=0 并停止枚举更大质数。",
    "targetComplexity": "预处理 O(n)，每次查询 O(1)，空间 O(n)。",
    "difficultyReason": "提高难度来自 Möbius 定义到欧拉线性筛转移的推导。",
    "tests": [
      [
        "10 3\n1\n5\n10\n",
        "1\n-2\n-1\n"
      ],
      [
        "1 1\n1\n",
        "1\n"
      ],
      [
        "20 4\n6\n12\n16\n20\n",
        "-1\n-2\n-1\n-3\n"
      ]
    ]
  },
  {
    "id": "A1016",
    "title": "64 位素数鉴定",
    "seriesId": "S10",
    "difficulty": "省选",
    "tags": [
      "Miller-Rabin",
      "快速乘幂"
    ],
    "model": "确定性 Miller-Rabin",
    "description": [
      "给出若干 0≤n<2^64 的整数，判断每个数是否为素数。试除到平方根在大整数上不可行。",
      "使用 Miller-Rabin 强伪素数测试，并采用对 64 位整数完备的固定底数集合。模乘必须用无符号 __int128 防止乘法溢出；n<2 不是素数，先用若干小质数过滤。"
    ],
    "input": "第一行 q，接下来 q 行各一个无符号 64 位整数 n。",
    "output": "每行输出 PRIME 或 COMPOSITE。",
    "constraints": [
      "1 ≤ q ≤ 200000",
      "0 ≤ n < 2^64"
    ],
    "sampleExplanation": "2 与 97 为素数，1 按定义不是素数。",
    "hint": "将 n-1 写成 d·2^s（d 为奇数），检查 a^d 及随后平方是否到达 n-1。",
    "targetComplexity": "每个数 O(k log n) 次 128 位模运算，k 为固定底数个数；空间 O(1)。",
    "difficultyReason": "省选难度由 64 位完备底数、强伪素数判定和安全模乘共同支撑。",
    "tests": [
      [
        "3\n2\n97\n1\n",
        "PRIME\nPRIME\nCOMPOSITE\n"
      ],
      [
        "4\n0\n3\n4\n18446744073709551557\n",
        "COMPOSITE\nPRIME\nCOMPOSITE\nPRIME\n"
      ],
      [
        "4\n341550071728321\n2305843009213693951\n18446744073709551615\n1000000007\n",
        "COMPOSITE\nPRIME\nCOMPOSITE\nPRIME\n"
      ]
    ]
  },
  {
    "id": "A1017",
    "title": "模多项式乘法",
    "seriesId": "S10",
    "difficulty": "省选",
    "tags": [
      "NTT",
      "多项式"
    ],
    "model": "数论变换卷积",
    "description": [
      "给定两个系数模 998244353 的多项式 A(x)、B(x)，求乘积 C(x)=A(x)B(x) 的全部系数。输入次数分别为 n、m，因此答案次数不超过 n+m。",
      "朴素双循环是 O(nm)。998244353=119·2^23+1，原根可取 3，适合做 NTT。把长度补到至少 n+m+1 的二次幂，正变换后逐点相乘，再做逆变换并乘长度逆元。"
    ],
    "input": "第一行 n、m；第二行 n+1 个 A 系数；第三行 m+1 个 B 系数。",
    "output": "输出 n+m+1 个乘积系数，均在 [0,998244353) 内。",
    "constraints": [
      "0 ≤ n,m，且 n+m ≤ 500000",
      "0 ≤ 系数 < 998244353"
    ],
    "sampleExplanation": "(1+2x)(3+4x)=3+10x+8x²。",
    "hint": "迭代 NTT 先做位逆序置换，每层使用对应长度的单位根；逆变换使用根的逆元。",
    "targetComplexity": "时间 O((n+m)log(n+m))，空间 O(n+m)。",
    "difficultyReason": "省选难度对应完整 NTT、模根选择、位逆序和逆变换归一化。",
    "tests": [
      [
        "1 1\n1 2\n3 4\n",
        "3 10 8\n"
      ],
      [
        "0 0\n998244352\n998244352\n",
        "1\n"
      ],
      [
        "2 3\n1 0 1\n1 2 3 4\n",
        "1 2 4 6 3 4\n"
      ]
    ]
  },
  {
    "id": "A1115",
    "title": "多模式告警统计",
    "seriesId": "S11",
    "difficulty": "提高",
    "tags": [
      "AC 自动机",
      "失配树"
    ],
    "model": "AC 自动机总匹配数",
    "description": [
      "监控系统保存 n 个小写告警模式，并接收一段文本。需要统计所有模式在文本中的出现次数总和；模式可以重复，匹配可以重叠。",
      "例如同一模式输入两次，它在文本中的每次出现要贡献两次。构建 AC 自动机后沿文本转移并记录各状态被访问次数，再按 fail 深度从深到浅把次数累加给失配父节点，最终乘各终止节点的模式重数。"
    ],
    "input": "第一行 n，接下来 n 行为模式串，最后一行为文本串。",
    "output": "输出所有模式出现次数之和。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "模式总长度与文本长度均不超过 10^6",
      "字符均为小写英文字母"
    ],
    "sampleExplanation": "he、she、hers、his 各出现 1 次，总数为 4。",
    "hint": "BFS 建 fail 时补齐自动机转移；匹配后在 fail 树上反向汇总访问量。",
    "targetComplexity": "时间 O(模式总长+文本长+状态数×字母表)，空间 O(状态数×26)。",
    "difficultyReason": "提高难度来自多模式重叠匹配、重复模式权重和失配树反向统计。",
    "tests": [
      [
        "4\nhe\nshe\nhers\nhis\nahishers\n",
        "4\n"
      ],
      [
        "2\na\na\naaa\n",
        "6\n"
      ],
      [
        "3\naa\naaa\nba\naaaaa\n",
        "7\n"
      ]
    ]
  },
  {
    "id": "A1116",
    "title": "双串最长共同片段",
    "seriesId": "S11",
    "difficulty": "提高",
    "tags": [
      "后缀自动机",
      "最长公共子串"
    ],
    "model": "后缀自动机在线匹配",
    "description": [
      "给定两个小写字符串 A、B，求它们最长公共连续子串的长度。子串必须连续，但可以在两串的任意位置出现。",
      "为 A 建后缀自动机，再顺序扫描 B。当前字符无转移时沿 suffix link 回退，并把当前匹配长度缩短到回退状态的最大长度；若存在转移则进入下一状态并增加长度，维护扫描过程中的最大值。"
    ],
    "input": "第一行字符串 A，第二行字符串 B。",
    "output": "输出最长公共子串长度。",
    "constraints": [
      "1 ≤ |A|,|B| ≤ 10^6",
      "字符均为小写英文字母"
    ],
    "sampleExplanation": "ababc 与 babca 的最长公共连续片段可取 babc，长度为 4。",
    "hint": "SAM 每个状态表示一组 endpos 等价子串，suffix link 提供失配后仍可能匹配的最长后缀。",
    "targetComplexity": "时间 O(|A|+|B|)，空间 O(|A|×字母表)。",
    "difficultyReason": "提高难度来自 SAM 克隆状态构造和扫描时匹配长度的正确回退。",
    "tests": [
      [
        "ababc\nbabca\n",
        "4\n"
      ],
      [
        "a\nz\n",
        "0\n"
      ],
      [
        "aaaaab\nbaaaac\n",
        "4\n"
      ]
    ]
  },
  {
    "id": "A1117",
    "title": "回文种类与总量",
    "seriesId": "S11",
    "difficulty": "省选",
    "tags": [
      "回文树",
      "出现次数"
    ],
    "model": "Eertree 回文统计",
    "description": [
      "给定一个小写字符串，需要同时统计三项：不同回文子串种类数、最长回文子串长度，以及所有回文子串出现次数之和。相同内容在不同位置出现时，只增加总次数，不增加种类数。",
      "逐字符建立回文树（Eertree）。两个根节点长度分别为 -1 和 0；每加入字符找到最长可扩展回文后建立或复用节点，并增加该节点计数。最后按长度从大到小沿 suffix link 汇总出现次数。"
    ],
    "input": "输入一个小写字符串 s。",
    "output": "输出三个整数：不同回文子串数、最长长度、回文子串出现总次数。",
    "constraints": [
      "1 ≤ |s| ≤ 10^6"
    ],
    "sampleExplanation": "ababa 的不同回文为 a,b,aba,bab,ababa，共 5 种；最长长度 5；按位置计算共有 9 个回文子串。",
    "hint": "节点代表一种回文内容，link 指向其最长真回文后缀；出现次数必须在建树后反向传播。",
    "targetComplexity": "时间 O(|s|×字母表初始化代价)，空间 O(|s|×26)。",
    "difficultyReason": "省选难度对应专用回文数据结构、双根边界和出现次数沿后缀链接聚合。",
    "tests": [
      [
        "ababa\n",
        "5 5 9\n"
      ],
      [
        "z\n",
        "1 1 1\n"
      ],
      [
        "aaaa\n",
        "4 4 10\n"
      ]
    ]
  }
]

export const algorithmBatch6Problems = rawDefinitions.map((definition, index) => {
  const { tests, model, difficultyReason, ...problem } = definition
  return {
    ...problem,
    series: seriesNames[problem.seriesId],
    type: '传统题',
    limitMs: ['省选', '挑战'].includes(problem.difficulty) ? 4000 : problem.difficulty === '提高' ? 2500 : 1500,
    memoryMb: 256,
    score: 100,
    status: '',
    passRate: Math.max(24, 79 - index),
    submissions: 80 + index * 7,
    coreModel: model,
    difficultyReason,
    referenceSolution: algorithmBatch6Solutions[problem.id],
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

export function getAlgorithmBatch6Tests(problemId) {
  const definition = rawDefinitions.find((item) => item.id === problemId)
  if (!definition) return []
  return definition.tests.map(([input, output], index) => ({
    name: testNames[index],
    score: testScores[index],
    input,
    output,
  }))
}

export function getAlgorithmBatch6Sample(problemId) {
  const tests = getAlgorithmBatch6Tests(problemId)
  return tests.length ? { input: tests[0].input, output: tests[0].output } : null
}

export const algorithmBatch6Models = rawDefinitions.map(({ id, seriesId, model }) => ({ id, seriesId, model }))
