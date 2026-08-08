import { algorithmBatch13Solutions } from './algorithmBatch13Solutions.mjs'
const seriesNames={S01:'语言基础',S02:'模拟与枚举',S03:'排序与二分',S04:'贪心',S05:'前缀和与差分',S06:'搜索',S07:'动态规划',S08:'数据结构',S09:'图论',S10:'数学',S11:'字符串'}
const testNames=['Typical structure','Boundary conditions','Comprehensive trap']
const testScores=[30,30,40]
const rawDefinitions=[
  {
    "id": "A0134",
    "title": "罗马铭牌校验",
    "seriesId": "S01",
    "difficulty": "基础",
    "tags": [
      "字符串解析",
      "规范化"
    ],
    "model": "罗马数字规范校验",
    "description": [
      "博物馆把年份刻成只含 I、V、X、L、C、D、M 的罗马数字。系统既要读出数值，也要拒绝虽然能按加减规则算出数值、却不是标准写法的铭牌。",
      "先按左小右大则减、否则加的规则求值，再把数值用标准贪心表重新编码。只有数值在 1 到 3999 且重编码结果与原串完全相同时才合法；大小写不混用。"
    ],
    "input": "输入一行非空大写字符串 s。",
    "output": "合法时输出对应十进制整数，否则输出 INVALID。",
    "constraints": [
      "1 ≤ |s| ≤ 30",
      "字符来自大写英文字母"
    ],
    "sampleExplanation": "MCMXCIV 对应 1994，重新编码仍为 MCMXCIV。",
    "hint": "解析后进行一次反向规范化比罗列所有禁用组合更稳妥。",
    "targetComplexity": "时间 O(|s|)，空间 O(|s|)。",
    "difficultyReason": "基础难度来自规范形式校验和减法对的边界。",
    "tests": [
      [
        "MCMXCIV\n",
        "1994\n"
      ],
      [
        "I\n",
        "1\n"
      ],
      [
        "IIII\n",
        "INVALID\n"
      ]
    ]
  },
  {
    "id": "A0135",
    "title": "无零列号互译",
    "seriesId": "S01",
    "difficulty": "普及",
    "tags": [
      "进制转换",
      "双向映射"
    ],
    "model": "无零二十六进制互译",
    "description": [
      "表格列名采用 A 到 Z、AA 到 AZ 的编号，它类似二十六进制却没有数字 0。服务会混合收到十进制编号和字母列名，需要逐条转换到另一种表示。",
      "若一行首字符是数字，它表示 1 开始的正整数；否则表示仅含 A 到 Z 的列名。转换整数时应先减一再取余，转换列名时每位权值为 1 到 26。"
    ],
    "input": "第一行整数 q，随后 q 行各一个正整数或大写列名。",
    "output": "每个询问输出一行另一种表示。",
    "constraints": [
      "1 ≤ q ≤ 100000",
      "整数与列名对应值不超过 10^18"
    ],
    "sampleExplanation": "26、27、AZ 分别转换为 Z、AA、52。",
    "hint": "整数转列名时循环执行 x--；列名转整数时按 x=x*26+digit 累积。",
    "targetComplexity": "总时间 O(输入总长度)，空间 O(最长答案)。",
    "difficultyReason": "普及难度来自无零位制与 64 位边界。",
    "tests": [
      [
        "3\n26\n27\nAZ\n",
        "Z\nAA\n52\n"
      ],
      [
        "2\n1\nA\n",
        "A\n1\n"
      ],
      [
        "3\n702\nAAA\n1000\n",
        "ZZ\n703\nALL\n"
      ]
    ]
  },
  {
    "id": "A0234",
    "title": "蚂蚁翻色轨迹",
    "seriesId": "S02",
    "difficulty": "普及",
    "tags": [
      "状态模拟",
      "稀疏集合"
    ],
    "model": "Langton 蚂蚁稀疏模拟",
    "description": [
      "无限方格初始全白，蚂蚁从原点面向北。每一步先查看当前格：白格翻黑并右转，黑格翻白并左转；完成翻色与转向后再前进一步。",
      "坐标中向北令 x 减一，向东令 y 加一。执行恰好 n 步后输出位置、朝向以及棋盘上黑格数量；没有访问过的格永远视为白色。"
    ],
    "input": "输入一个整数 n。",
    "output": "输出 x、y、方向字符 N/E/S/W 和黑格数量。",
    "constraints": [
      "0 ≤ n ≤ 200000"
    ],
    "sampleExplanation": "执行 4 步后蚂蚁回到原点并留下 4 个黑格。",
    "hint": "只保存当前为黑色的坐标；翻白时从集合删除。",
    "targetComplexity": "时间 O(n log n)，空间 O(n)。",
    "difficultyReason": "普及难度来自无限棋盘的稀疏表示和严格操作顺序。",
    "tests": [
      [
        "4\n",
        "0 0 N 4\n"
      ],
      [
        "0\n",
        "0 0 N 0\n"
      ],
      [
        "10\n",
        "1 -1 S 6\n"
      ]
    ]
  },
  {
    "id": "A0235",
    "title": "同步粒子湮灭",
    "seriesId": "S02",
    "difficulty": "普及+/提高",
    "tags": [
      "离散模拟",
      "碰撞处理"
    ],
    "model": "同步移动多点碰撞消除",
    "description": [
      "直线上有若干粒子，每个粒子每秒以 -1、0 或 1 的速度移动。每一秒所有仍存活粒子先同时移动，然后同一坐标若出现至少两个粒子，这些粒子全部消失。",
      "碰撞只在整数秒移动结束后判断，途中相遇不算；一次碰撞消失的粒子不能参与该秒的其他事件。执行 T 秒后按坐标升序输出存活粒子。"
    ],
    "input": "第一行 n、T，随后 n 行给出初始坐标 x 与速度 v。",
    "output": "第一行输出存活数，第二行输出升序坐标；为空时第二行为空行。",
    "constraints": [
      "1 ≤ n ≤ 2000",
      "0 ≤ T ≤ 2000",
      "|x| ≤ 10^9，v∈{-1,0,1}"
    ],
    "sampleExplanation": "三个粒子第一秒后有两个到达 1 并同时消失，只剩坐标 4。",
    "hint": "每秒先统一更新，再按坐标统计频次并整体过滤。",
    "targetComplexity": "时间 O(T·n log n)，空间 O(n)。",
    "difficultyReason": "普及+/提高难度来自同步语义和三方碰撞反例。",
    "tests": [
      [
        "3 1\n0 1\n2 -1\n3 1\n",
        "1\n4\n"
      ],
      [
        "1 0\n5 -1\n",
        "1\n5\n"
      ],
      [
        "4 2\n0 1\n2 -1\n5 -1\n3 1\n",
        "0\n\n"
      ]
    ]
  },
  {
    "id": "A0334",
    "title": "边到达时刻",
    "seriesId": "S03",
    "difficulty": "提高",
    "tags": [
      "整体二分",
      "并查集"
    ],
    "model": "并行二分连通时刻",
    "description": [
      "无向图的 m 条边按编号依次加入。每个询问给出两个顶点，要找它们首次连通时所需加入的最小边编号；若所有边加入后仍不连通则输出 -1。",
      "询问彼此独立，图的加入顺序相同。顶点与自身在加入任何边前已经连通，因此答案为 0。"
    ],
    "input": "第一行 n、m、q；接着 m 行边，随后 q 行询问 u、v。",
    "output": "每个询问输出最早连通时刻或 -1。",
    "constraints": [
      "1 ≤ n,m,q ≤ 200000"
    ],
    "sampleExplanation": "加入第三条边后 1 与 4 首次连通，而 1 与 5 始终不连通。",
    "hint": "对所有答案区间并行二分，每轮按边编号重建一次并查集。",
    "targetComplexity": "时间 O((n+m+q)log m·α(n))，空间 O(n+m+q)。",
    "difficultyReason": "提高难度来自把大量单调询问合并为整体二分。",
    "tests": [
      [
        "5 3 3\n1 2\n3 4\n2 3\n1 4\n1 5\n2 2\n",
        "3\n-1\n0\n"
      ],
      [
        "2 1 1\n1 2\n1 2\n",
        "1\n"
      ],
      [
        "4 4 3\n1 2\n1 2\n3 4\n2 3\n1 3\n4 1\n2 4\n",
        "4\n4\n4\n"
      ]
    ]
  },
  {
    "id": "A0335",
    "title": "三维偏序档位",
    "seriesId": "S03",
    "difficulty": "省选",
    "tags": [
      "CDQ 分治",
      "树状数组"
    ],
    "model": "三维偏序计数",
    "description": [
      "仓库中每件样品有三个整数指标 x、y、z。对每件样品，需统计指标都不大于它的样品数量，样品自身也计入；完全相同的样品应得到相同答案。",
      "输入顺序只用于对应输出，不参与比较。朴素逐对比较会在大数据上超时，需要处理相等坐标在分治边界上的归并顺序。"
    ],
    "input": "第一行 n，随后 n 行三个指标。",
    "output": "按原输入顺序输出每件样品的支配计数。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "1 ≤ x,y,z ≤ 10^9"
    ],
    "sampleExplanation": "(2,2,2) 支配三件样品；其他样品按三个维度共同判断。",
    "hint": "合并完全相同点，再按 x 排序，以 CDQ 处理 y、树状数组处理 z。",
    "targetComplexity": "时间 O(n log²n)，空间 O(n)。",
    "difficultyReason": "省选难度来自三维偏序、重复点和回滚树状数组。",
    "tests": [
      [
        "4\n1 1 1\n2 2 2\n1 2 1\n2 1 3\n",
        "1\n3\n2\n2\n"
      ],
      [
        "1\n7 7 7\n",
        "1\n"
      ],
      [
        "4\n1 1 1\n1 1 1\n1 1 2\n2 1 1\n",
        "2\n2\n3\n3\n"
      ]
    ]
  },
  {
    "id": "A0434",
    "title": "可舍弃的工单",
    "seriesId": "S04",
    "difficulty": "提高",
    "tags": [
      "贪心",
      "优先队列"
    ],
    "model": "Moore-Hodgson 逾期任务最少化",
    "description": [
      "单台机器从时刻 0 开始处理工单，每个工单有耗时 p 和截止时间 d。机器不能并行，也不能中断工单；可以舍弃任意工单，目标是让按时完成的工单数量最大。",
      "同一时刻只能处理一个工单，完成时刻等于截止时间仍算按时。只需输出最大数量，不要求恢复方案。"
    ],
    "input": "第一行 n，随后 n 行 p、d。",
    "output": "输出最多可按时完成的工单数。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "1 ≤ p,d ≤ 10^9"
    ],
    "sampleExplanation": "按截止时间尝试前三项，超期时删除耗时最大的工单，最终可保留两项。",
    "hint": "按截止时间排序；每次加入后若总耗时超期，从已选集合删去耗时最大者。",
    "targetComplexity": "时间 O(n log n)，空间 O(n)。",
    "difficultyReason": "提高难度来自可撤销选择及交换论证。",
    "tests": [
      [
        "3\n3 4\n2 5\n4 6\n",
        "2\n"
      ],
      [
        "1\n10 1\n",
        "0\n"
      ],
      [
        "5\n4 4\n3 5\n2 6\n1 6\n5 100\n",
        "4\n"
      ]
    ]
  },
  {
    "id": "A0435",
    "title": "预知缓存替换",
    "seriesId": "S04",
    "difficulty": "普及+/提高",
    "tags": [
      "离线贪心",
      "优先队列"
    ],
    "model": "Belady 最优缓存",
    "description": [
      "程序将按给定顺序请求页面，缓存最多容纳 k 个不同页面。命中不产生代价，未命中计一次，并在缓存已满时必须先淘汰一个页面。",
      "完整请求序列事先已知，应输出理论最少缺页次数。相同页面重复请求时缓存中只保留一份；k=0 时每次请求都缺页。"
    ],
    "input": "第一行 n、k，第二行 n 个页面编号。",
    "output": "输出最少缺页次数。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "0 ≤ k ≤ n"
    ],
    "sampleExplanation": "容量 2 时，在第三个不同页面到来时淘汰未来最晚再访问的页面。",
    "hint": "预处理每个请求的下一次位置；缺页淘汰下一次使用最晚或永不再用的页面。",
    "targetComplexity": "时间 O(n log k)，空间 O(n)。",
    "difficultyReason": "普及+/提高难度来自离线未来信息和堆中过期键。",
    "tests": [
      [
        "7 2\n1 2 3 1 2 3 1\n",
        "5\n"
      ],
      [
        "3 0\n1 1 1\n",
        "3\n"
      ],
      [
        "8 3\n1 2 3 4 1 2 3 4\n",
        "5\n"
      ]
    ]
  },
  {
    "id": "A0436",
    "title": "技能解锁顺序",
    "seriesId": "S04",
    "difficulty": "普及+/提高",
    "tags": [
      "排序贪心",
      "交换论证"
    ],
    "model": "最低初始资源排序",
    "description": [
      "学习技能 i 前，当前资源必须至少为 r_i；学习完成后永久消耗 c_i，且 r_i≥c_i。所有技能都必须完成，求所需最小初始资源以及一种最优顺序隐含的最小值。",
      "资源不足时不能先欠账。技能效果之间没有其他依赖；只输出最小初值，不输出顺序。"
    ],
    "input": "第一行 n，随后 n 行 c_i、r_i。",
    "output": "输出完成全部技能所需最小初始资源。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "0 ≤ c_i ≤ r_i ≤ 10^12"
    ],
    "sampleExplanation": "优先安排 r-c 较大的技能，可把初始资源压到 9。",
    "hint": "比较相邻交换条件，可按 r_i-c_i 非增序排列。",
    "targetComplexity": "时间 O(n log n)，空间 O(n)。",
    "difficultyReason": "普及+/提高难度来自把门槛和消耗合成排序关键字。",
    "tests": [
      [
        "3\n4 7\n2 6\n3 3\n",
        "9\n"
      ],
      [
        "1\n0 5\n",
        "5\n"
      ],
      [
        "4\n5 10\n4 4\n1 100\n10 11\n",
        "100\n"
      ]
    ]
  },
  {
    "id": "A0534",
    "title": "区间和落点计数",
    "seriesId": "S05",
    "difficulty": "提高",
    "tags": [
      "前缀和",
      "离散化"
    ],
    "model": "前缀和有序对范围计数",
    "description": [
      "给定整数数组，统计连续子数组和位于闭区间 [L,R] 的子数组数量。数组含负数，因此不能使用双指针或单调窗口。",
      "每个子数组由一对前缀和确定；长度至少为 1。答案可能超过 32 位，边界 L、R 都包含。"
    ],
    "input": "第一行 n、L、R，第二行 n 个整数。",
    "output": "输出满足条件的子数组数量。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "-10^9 ≤ a_i,L,R ≤ 10^9",
      "L ≤ R"
    ],
    "sampleExplanation": "样例中和为 0、1 或 2 的连续段共有 5 个。",
    "hint": "扫描右端前缀和 x，查询历史前缀中落在 [x-R,x-L] 的数量。",
    "targetComplexity": "时间 O(n log n)，空间 O(n)。",
    "difficultyReason": "提高难度来自负数、闭区间和 64 位计数。",
    "tests": [
      [
        "3 0 2\n1 -1 2\n",
        "5\n"
      ],
      [
        "1 -5 -5\n-5\n",
        "1\n"
      ],
      [
        "5 -2 2\n3 -4 1 2 -2\n",
        "10\n"
      ]
    ]
  },
  {
    "id": "A0535",
    "title": "高地最大矩形",
    "seriesId": "S05",
    "difficulty": "提高",
    "tags": [
      "二维前缀",
      "Kadane"
    ],
    "model": "最大子矩形降维",
    "description": [
      "地图每个格子有正或负收益，需选一个非空轴对齐子矩形，使收益和最大。不能选择空矩形，因此全负地图答案是最大单格。",
      "矩形边界必须落在格线，行列均连续。输出最大收益，不要求位置；中间和使用 64 位整数。"
    ],
    "input": "第一行 n、m，随后 n 行矩阵。",
    "output": "输出最大非空子矩形和。",
    "constraints": [
      "1 ≤ n,m ≤ 300",
      "|a_ij| ≤ 10^9"
    ],
    "sampleExplanation": "压缩前两行后，一维最大子段可得到和 9 的矩形。",
    "hint": "枚举较短维的上下边界，把矩形和压成一维并运行 Kadane。",
    "targetComplexity": "时间 O(min(n,m)²·max(n,m))，空间 O(max(n,m))。",
    "difficultyReason": "提高难度来自二维降维和全负边界。",
    "tests": [
      [
        "2 3\n1 -2 3\n4 -1 2\n",
        "7\n"
      ],
      [
        "1 2\n-5 -2\n",
        "-2\n"
      ],
      [
        "3 3\n-10 5 5\n4 -1 4\n-10 5 5\n",
        "23\n"
      ]
    ]
  },
  {
    "id": "A0536",
    "title": "区间方差分数",
    "seriesId": "S05",
    "difficulty": "普及+/提高",
    "tags": [
      "前缀和",
      "有理数化简"
    ],
    "model": "平方和前缀方差",
    "description": [
      "对数组的多个闭区间，输出其总体方差的精确最简分数。定义均值为 S/k，方差为区间内每个数与均值之差平方的平均值。",
      "答案必须写成 p/q，p≥0、q>0 且互质；单点区间方差为 0/1，不能用浮点近似。"
    ],
    "input": "第一行 n、q，第二行数组，随后 q 行 l、r。",
    "output": "每个询问输出一行最简分数 p/q。",
    "constraints": [
      "1 ≤ n,q ≤ 200000",
      "|a_i| ≤ 10^9"
    ],
    "sampleExplanation": "区间 [1,3] 的方差是 2/3，后两个数的方差是 1/4。",
    "hint": "维护和 S 与平方和 Q，方差分子为 kQ-S²，分母为 k²。",
    "targetComplexity": "预处理 O(n)，每次询问 O(log V) 用于 gcd，空间 O(n)。",
    "difficultyReason": "普及+/提高难度来自公式推导、约分和 128 位中间量。",
    "tests": [
      [
        "3 2\n1 2 3\n1 3\n2 3\n",
        "2/3\n1/4\n"
      ],
      [
        "1 1\n1000000000\n1 1\n",
        "0/1\n"
      ],
      [
        "4 2\n-2 2 -2 2\n1 4\n1 3\n",
        "4/1\n32/9\n"
      ]
    ]
  },
  {
    "id": "A0634",
    "title": "同色传送迷宫",
    "seriesId": "S06",
    "difficulty": "普及+/提高",
    "tags": [
      "BFS",
      "传送门"
    ],
    "model": "同色组一次展开 BFS",
    "description": [
      "迷宫含起点 S、终点 T、墙 #、空地 . 和小写字母。可向四邻空地移动一步；站在字母格时还可用一步传送到任意同字母格。",
      "每次移动或传送代价均为 1，同一种字母可以多次经过，但若每次都枚举整组会超时。求最少步数，不可达输出 -1。"
    ],
    "input": "第一行 n、m，随后 n 行地图。",
    "output": "输出 S 到 T 的最少步数。",
    "constraints": [
      "1 ≤ n,m，n·m ≤ 200000"
    ],
    "sampleExplanation": "从左侧 a 传到右侧 a 再到 T，共 3 步。",
    "hint": "普通 BFS；某字母第一次出队时一次性扩展整组，之后不再重复。",
    "targetComplexity": "时间 O(nm)，空间 O(nm)。",
    "difficultyReason": "普及+/提高难度来自超边等价展开和去重时机。",
    "tests": [
      [
        "3 5\nSa#T.\n.#.#.\n.a...\n",
        "8\n"
      ],
      [
        "1 2\nST\n",
        "1\n"
      ],
      [
        "3 7\nS.a###T\n##..###\na....Ta\n",
        "4\n"
      ]
    ]
  },
  {
    "id": "A0635",
    "title": "仓库推箱次数",
    "seriesId": "S06",
    "difficulty": "提高",
    "tags": [
      "状态 BFS",
      "可达性搜索"
    ],
    "model": "推箱子双层搜索",
    "description": [
      "仓库中玩家 S 要把唯一箱子 B 推到目标 T。玩家可走到四邻非墙格；只有站在箱子反方向相邻格时才能把箱子向前推一格。",
      "目标是最少推动次数，玩家普通行走不计代价。箱子不能被拉动，S、B、T 初始互异；不可达输出 -1。"
    ],
    "input": "第一行 n、m，随后地图。",
    "output": "输出最少推动次数或 -1。",
    "constraints": [
      "1 ≤ n,m ≤ 20"
    ],
    "sampleExplanation": "玩家绕到箱子左侧，将箱子向右推两次到达 T。",
    "hint": "外层 BFS 状态为箱子和玩家位置；每次扩展前在固定箱子下搜索玩家可达区。",
    "targetComplexity": "时间 O((nm)³)，空间 O((nm)²)。",
    "difficultyReason": "提高难度来自推与走的两层可达性及方向约束。",
    "tests": [
      [
        "3 5\n#####\n#SBT#\n#####\n",
        "1\n"
      ],
      [
        "3 3\nS#T\n.B.\n...\n",
        "2\n"
      ],
      [
        "4 5\n#####\n#S..#\n#.BT#\n#####\n",
        "1\n"
      ]
    ]
  },
  {
    "id": "A0636",
    "title": "展馆最大朋友圈",
    "seriesId": "S06",
    "difficulty": "挑战",
    "tags": [
      "最大团",
      "分支限界"
    ],
    "model": "最大团着色上界搜索",
    "description": [
      "有 n 位参观者，若两人互相认识则连边。要邀请一个集合，使集合中任意两人都认识，求最大人数。",
      "图为简单无向图，不要求输出具体集合。n 较小但 2^n 枚举仍可能过慢，需要有效的分支顺序与上界剪枝。"
    ],
    "input": "第一行 n、m，随后 m 条无向边。",
    "output": "输出最大团大小。",
    "constraints": [
      "1 ≤ n ≤ 60",
      "0 ≤ m ≤ n(n-1)/2"
    ],
    "sampleExplanation": "三角形 1-2-3 构成最大团，顶点 4 不能同时加入。",
    "hint": "递归候选集合，并用贪心染色所得颜色数作为可扩展上界。",
    "targetComplexity": "最坏指数级，但着色分支限界可通过 n=60 设计数据；空间 O(n²)。",
    "difficultyReason": "挑战难度来自 NP-hard 模型、位集与着色上界剪枝。",
    "tests": [
      [
        "4 4\n1 2\n2 3\n1 3\n3 4\n",
        "3\n"
      ],
      [
        "1 0\n",
        "1\n"
      ],
      [
        "6 9\n1 2\n1 3\n1 4\n2 3\n2 4\n3 4\n4 5\n4 6\n5 6\n",
        "4\n"
      ]
    ]
  },
  {
    "id": "A0766",
    "title": "平方分段代价",
    "seriesId": "S07",
    "difficulty": "省选",
    "tags": [
      "分治优化 DP",
      "分组 DP"
    ],
    "model": "单调决策分治优化",
    "description": [
      "正整数序列需切成恰好 K 个非空连续段。每段代价是该段元素和的平方，求总代价最小值。",
      "段的顺序保持不变，不能跳过元素。由于元素为正，代价矩阵满足决策单调性；普通 O(Kn²) 无法通过上限。"
    ],
    "input": "第一行 n、K，第二行 n 个正整数。",
    "output": "输出最小总代价。",
    "constraints": [
      "1 ≤ K ≤ n ≤ 200000",
      "1 ≤ a_i ≤ 1000"
    ],
    "sampleExplanation": "把 1,2,3 切为 [1,2] 与 [3]，总代价 18。",
    "hint": "设 dp[k][i]，利用四边形不等式得到最优断点单调，分治计算一层。",
    "targetComplexity": "时间 O(Kn log n)，空间 O(n)。",
    "difficultyReason": "省选难度来自决策单调证明与分治边界。",
    "tests": [
      [
        "3 2\n1 2 3\n",
        "18\n"
      ],
      [
        "1 1\n7\n",
        "49\n"
      ],
      [
        "5 3\n2 1 4 1 2\n",
        "34\n"
      ]
    ]
  },
  {
    "id": "A0767",
    "title": "恰选不邻宝石",
    "seriesId": "S07",
    "difficulty": "省选",
    "tags": [
      "WQS 二分",
      "线性 DP"
    ],
    "model": "WQS 恰选数量优化",
    "description": [
      "一排 n 颗宝石有可正可负的价值，要恰好选择 K 颗，且相邻位置不能同时选择，求最大价值和。输入保证 K≤ceil(n/2)。",
      "恰好数量使普通二维 DP 达到 O(nK)。需要对每次选择附加统一罚值，将“选择数量”作为最优解的次关键字，再恢复原目标。"
    ],
    "input": "第一行 n、K，第二行 n 个价值。",
    "output": "输出恰选 K 颗的最大价值和。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "0 ≤ K ≤ (n+1)/2",
      "|a_i| ≤ 10^12"
    ],
    "sampleExplanation": "在 5,1,4,10 中恰选两颗，选择 1 和 4 号得到 15。",
    "hint": "二分罚值 λ；线性 DP 同时维护调整后价值与选择数，最后加回 λK。",
    "targetComplexity": "时间 O(n log V)，空间 O(1)。",
    "difficultyReason": "省选难度来自拉格朗日松弛、平局方向与恰好数量恢复。",
    "tests": [
      [
        "4 2\n5 1 4 10\n",
        "15\n"
      ],
      [
        "3 0\n-5 -2 -1\n",
        "0\n"
      ],
      [
        "5 2\n-10 100 -10 90 -10\n",
        "190\n"
      ]
    ]
  },
  {
    "id": "A0768",
    "title": "禁词字符串计数",
    "seriesId": "S07",
    "difficulty": "提高",
    "tags": [
      "AC 自动机",
      "计数 DP"
    ],
    "model": "自动机补图计数 DP",
    "description": [
      "使用前 sigma 个小写字母构造长度恰为 n 的字符串。给出若干禁词，只要某禁词作为连续子串出现一次，该字符串就不合法；求合法字符串数。",
      "禁词可能互为后缀或彼此重叠。答案对 1000000007 取模，空前缀合法，构造过程中一旦进入禁用状态就不能继续。"
    ],
    "input": "第一行 sigma、n、m，随后 m 行禁词。",
    "output": "输出合法字符串数量模 1000000007。",
    "constraints": [
      "1 ≤ sigma ≤ 26",
      "0 ≤ n ≤ 100000",
      "禁词总长度 ≤ 200000"
    ],
    "sampleExplanation": "二字母长度 3 且禁用 aa，共有 5 个合法串。",
    "hint": "建立 AC 自动机并补全转移；在非终止状态上做长度 DP。",
    "targetComplexity": "时间 O((状态数·sigma)·n) 的直接形式；本题保证状态数·n≤2·10^7，空间 O(状态数)。",
    "difficultyReason": "提高难度来自失配标记传播和重叠禁词。",
    "tests": [
      [
        "2 3 1\naa\n",
        "5\n"
      ],
      [
        "1 0 1\na\n",
        "1\n"
      ],
      [
        "2 4 2\nab\nba\n",
        "2\n"
      ]
    ]
  },
  {
    "id": "A0835",
    "title": "静态矩阵区间积",
    "seriesId": "S08",
    "difficulty": "提高",
    "tags": [
      "Disjoint Sparse Table",
      "非交换运算"
    ],
    "model": "不交稀疏表区间矩阵积",
    "description": [
      "给定不可修改的 2×2 矩阵序列，多次询问下标区间内从左到右的矩阵乘积，所有元素对模数 P 取模。",
      "矩阵乘法满足结合律但不满足交换律，因此查询时必须保留顺序。区间包含两端；单点答案就是该矩阵。"
    ],
    "input": "第一行 n、q、P，随后 n 行矩阵四个元素，再 q 行 l、r。",
    "output": "每个询问输出积矩阵的四个元素。",
    "constraints": [
      "1 ≤ n,q ≤ 200000",
      "2 ≤ P ≤ 10^9+7"
    ],
    "sampleExplanation": "第一、二个矩阵从左到右相乘得到样例结果。",
    "hint": "按每层块中点建立左后缀与右前缀，查询用 l、r 最高不同位合并。",
    "targetComplexity": "预处理 O(n log n)，查询 O(1)，空间 O(n log n)。",
    "difficultyReason": "提高难度来自非幂等、非交换结合运算的静态区间结构。",
    "tests": [
      [
        "2 2 1000\n1 1 0 1\n2 0 1 2\n1 2\n2 2\n",
        "3 2 1 2\n2 0 1 2\n"
      ],
      [
        "1 1 7\n8 9 10 11\n1 1\n",
        "8 9 10 11\n"
      ],
      [
        "3 1 13\n1 2 3 4\n0 1 1 0\n2 2 2 2\n1 3\n",
        "6 6 1 1\n"
      ]
    ]
  },
  {
    "id": "A0836",
    "title": "动态森林异或路",
    "seriesId": "S08",
    "difficulty": "挑战",
    "tags": [
      "Link-Cut Tree",
      "动态树"
    ],
    "model": "动态森林路径维护",
    "description": [
      "维护 n 个带整数权值的顶点，初始没有边。操作可连接两个不同连通块、删除现有边、修改单点权值，或询问同一棵树中两点简单路径上的权值异或和。",
      "输入保证 LINK 不造环、CUT 删除存在的边、ASK 两点连通。每个操作立即生效，边本身没有权值。"
    ],
    "input": "第一行 n、q，第二行点权，随后 q 行操作 LINK/CUT/SET/ASK。",
    "output": "每个 ASK 输出一行路径异或和。",
    "constraints": [
      "1 ≤ n,q ≤ 200000",
      "0 ≤ 权值 < 2^31"
    ],
    "sampleExplanation": "连接 1-2-3 后路径异或为 1 xor 2 xor 3；修改会立刻改变结果。",
    "hint": "用 Link-Cut Tree 的 makeroot、access、splay 维护首选路径聚合值。",
    "targetComplexity": "摊还时间 O(q log n)，空间 O(n)。",
    "difficultyReason": "挑战难度来自动态树反转标记、旋转维护与合法切边条件。",
    "tests": [
      [
        "3 6\n1 2 3\nLINK 1 2\nLINK 2 3\nASK 1 3\nSET 2 5\nASK 1 3\nCUT 2 3\n",
        "0\n7\n"
      ],
      [
        "1 2\n9\nASK 1 1\nSET 1 0\n",
        "9\n"
      ],
      [
        "4 7\n1 2 4 8\nLINK 1 2\nLINK 3 4\nLINK 2 3\nASK 1 4\nCUT 2 3\nLINK 1 4\nASK 2 3\n",
        "15\n15\n"
      ]
    ]
  },
  {
    "id": "A0837",
    "title": "区间秩波列",
    "seriesId": "S08",
    "difficulty": "提高",
    "tags": [
      "Wavelet Matrix",
      "秩查询"
    ],
    "model": "静态波列矩阵",
    "description": [
      "给定静态整数数组，支持两类区间查询：K l r k 求第 k 小；C l r x 求不大于 x 的元素个数。",
      "区间与 k 均为 1 开始，重复值分别计数，数组不会修改。需要在统一结构中同时完成秩选择和阈值计数。"
    ],
    "input": "第一行 n、q，第二行数组，随后 q 行 K 或 C 操作。",
    "output": "每个询问输出一行答案。",
    "constraints": [
      "1 ≤ n,q ≤ 200000",
      "|a_i| ≤ 10^9"
    ],
    "sampleExplanation": "区间 [2,5] 排序后为 1,2,3,4，因此第 2 小是 2。",
    "hint": "离散化后逐位稳定划分并保存零前缀数，即 Wavelet Matrix。",
    "targetComplexity": "预处理 O(n log σ)，查询 O(log σ)，空间 O(n log σ)。",
    "difficultyReason": "提高难度来自位层映射和两种查询的区间重映射。",
    "tests": [
      [
        "5 3\n5 1 4 2 3\nK 2 5 2\nC 1 5 3\nK 1 3 3\n",
        "2\n3\n5\n"
      ],
      [
        "1 2\n-7\nK 1 1 1\nC 1 1 -8\n",
        "-7\n0\n"
      ],
      [
        "6 3\n2 2 2 1 3 2\nK 1 6 5\nC 2 5 2\nK 4 6 2\n",
        "2\n3\n2\n"
      ]
    ]
  },
  {
    "id": "A0935",
    "title": "全局最小割",
    "seriesId": "S09",
    "difficulty": "省选",
    "tags": [
      "Stoer-Wagner",
      "最小割"
    ],
    "model": "无向图全局最小割",
    "description": [
      "无向带权图中，一次割把顶点分为两个非空集合，代价是跨越两集合的边权和。求所有割中的最小代价；重边权值相加，图保证连通。",
      "不指定源点与汇点，不能只跑一次 s-t 最大流。边权非负，删除某个阶段最后加入的点时需要把它合并到倒数第二个点。"
    ],
    "input": "第一行 n、m，随后 m 行 u、v、w。",
    "output": "输出全局最小割权值。",
    "constraints": [
      "2 ≤ n ≤ 500",
      "1 ≤ m ≤ 200000",
      "0 ≤ w ≤ 10^12"
    ],
    "sampleExplanation": "三角形三条边权为 3、4、5，分离顶点 1 的割代价 7 最小。",
    "hint": "使用 Stoer-Wagner：每阶段做最大邻接搜索，记录最后点的连接权并缩点。",
    "targetComplexity": "时间 O(n^3)，空间 O(n²)。",
    "difficultyReason": "省选难度来自无指定端点最小割和缩点不变量。",
    "tests": [
      [
        "3 3\n1 2 3\n2 3 4\n1 3 5\n",
        "7\n"
      ],
      [
        "2 2\n1 2 3\n1 2 4\n",
        "7\n"
      ],
      [
        "4 6\n1 2 100\n1 3 1\n1 4 1\n2 3 1\n2 4 1\n3 4 100\n",
        "4\n"
      ]
    ]
  },
  {
    "id": "A0936",
    "title": "无根树同构",
    "seriesId": "S09",
    "difficulty": "提高",
    "tags": [
      "树中心",
      "AHU 编码"
    ],
    "model": "无根树同构判定",
    "description": [
      "给出两棵顶点数相同的无根树，顶点编号没有对应意义。判断是否存在一个双射，使两树的相邻关系完全一致。",
      "树可能有一个或两个中心。必须比较以所有中心为根的规范编码；孩子编码排序后再加括号，编号差异自然被消除。"
    ],
    "input": "第一行 n，接着各 n-1 行给出第一棵和第二棵树的边。",
    "output": "同构输出 YES，否则输出 NO。",
    "constraints": [
      "1 ≤ n ≤ 200000"
    ],
    "sampleExplanation": "两棵路径仅编号顺序不同，规范中心编码相同。",
    "hint": "剥叶或子树大小找中心，再用 AHU 规范编码；实现时可将字符串编码哈希化。",
    "targetComplexity": "时间 O(n log n)，空间 O(n)。",
    "difficultyReason": "提高难度来自无根中心选择和递归子树的规范化。",
    "tests": [
      [
        "4\n1 2\n2 3\n3 4\n1 3\n3 2\n2 4\n",
        "YES\n"
      ],
      [
        "1\n",
        "YES\n"
      ],
      [
        "4\n1 2\n1 3\n1 4\n1 2\n2 3\n3 4\n",
        "NO\n"
      ]
    ]
  },
  {
    "id": "A0937",
    "title": "最小平均环",
    "seriesId": "S09",
    "difficulty": "省选",
    "tags": [
      "Karp 算法",
      "有向环"
    ],
    "model": "Karp 最小平均权环",
    "description": [
      "有向图每条边有整数权，保证至少存在一个有向环。一个环的平均权是边权和除以边数，求全图最小平均权环的值。",
      "答案必须以最简分数 p/q 输出，p 可为负、q 为正。不要求输出环；不可用浮点二分造成精度歧义。"
    ],
    "input": "第一行 n、m，随后 m 行 u、v、w。",
    "output": "输出最小平均权的最简分数 p/q。",
    "constraints": [
      "1 ≤ n ≤ 500",
      "1 ≤ m ≤ 200000",
      "|w| ≤ 10^9"
    ],
    "sampleExplanation": "环 1→2→1 的平均权为 (1+3)/2=2。",
    "hint": "令 dp[k][v] 为恰走 k 边到 v 的最小权，套用 Karp 的 min_v max_k 比值公式。",
    "targetComplexity": "时间 O(nm)，空间 O(n²)。",
    "difficultyReason": "省选难度来自平均环的极值公式和精确分数比较。",
    "tests": [
      [
        "2 2\n1 2 1\n2 1 3\n",
        "2/1\n"
      ],
      [
        "1 1\n1 1 -5\n",
        "-5/1\n"
      ],
      [
        "3 4\n1 2 4\n2 1 1\n2 3 -2\n3 2 1\n",
        "-1/2\n"
      ]
    ]
  },
  {
    "id": "A1034",
    "title": "旋转项链计数",
    "seriesId": "S10",
    "difficulty": "提高",
    "tags": [
      "Burnside 引理",
      "欧拉函数"
    ],
    "model": "循环群 Burnside 计数",
    "description": [
      "用 k 种颜色给 n 颗首尾相连的珠子染色，只把旋转后完全相同的方案视为同一种；翻转不等价。求不同项链数量。",
      "颜色可重复使用，所有位置必须染色。答案对质数 1000000007 取模，输入保证 n 不被该模数整除。"
    ],
    "input": "输入 n、k。",
    "output": "输出旋转等价类数量模 1000000007。",
    "constraints": [
      "1 ≤ n ≤ 10^12",
      "1 ≤ k < 1000000007"
    ],
    "sampleExplanation": "长度 3、两色的 8 个串在旋转下分成 4 类。",
    "hint": "按旋转步长的 gcd 分类，得到 (1/n)Σ_{d|n} φ(n/d)·k^d。",
    "targetComplexity": "时间 O(sqrt(n)log k)，空间 O(1)。",
    "difficultyReason": "提高难度来自 Burnside 分类、约数枚举和模除法。",
    "tests": [
      [
        "3 2\n",
        "4\n"
      ],
      [
        "1 5\n",
        "5\n"
      ],
      [
        "4 2\n",
        "6\n"
      ]
    ]
  },
  {
    "id": "A1035",
    "title": "异或卷积",
    "seriesId": "S10",
    "difficulty": "提高",
    "tags": [
      "FWT",
      "卷积"
    ],
    "model": "Walsh-Hadamard 异或卷积",
    "description": [
      "给定两个长度为 2^k 的序列，定义 c_s 为所有满足 i xor j=s 的 a_i·b_j 之和。求完整异或卷积并对 998244353 取模。",
      "下标从 0 开始，输入元素先按模数处理。直接枚举所有下标对为 O(4^k)，无法通过最大数据。"
    ],
    "input": "第一行 k，接着两行各 2^k 个整数。",
    "output": "输出 c_0 到 c_(2^k-1)。",
    "constraints": [
      "0 ≤ k ≤ 20",
      "0 ≤ a_i,b_i < 998244353"
    ],
    "sampleExplanation": "长度 2 时卷积为 [1·3+2·4,1·4+2·3]=[11,10]。",
    "hint": "对两序列做 XOR FWT，逐点相乘，再逆变换并乘长度逆元。",
    "targetComplexity": "时间 O(k2^k)，空间 O(2^k)。",
    "difficultyReason": "提高难度来自蝶形变换与逆变换归一化。",
    "tests": [
      [
        "1\n1 2\n3 4\n",
        "11 10\n"
      ],
      [
        "0\n7\n8\n",
        "56\n"
      ],
      [
        "2\n1 0 1 0\n0 1 0 1\n",
        "0 2 0 2\n"
      ]
    ]
  },
  {
    "id": "A1036",
    "title": "佩尔最小解",
    "seriesId": "S10",
    "difficulty": "省选",
    "tags": [
      "连分数",
      "高精度"
    ],
    "model": "佩尔方程连分数",
    "description": [
      "给定非平方正整数 D，求佩尔方程 x²-Dy²=1 的最小正整数解，即先最小化 x，再得到对应 y。答案可能远超 64 位。",
      "D 保证不是完全平方数。连分数收敛分子分母需用高精度整数保存，并在每一步精确检验方程。"
    ],
    "input": "输入整数 D。",
    "output": "输出最小正解 x、y。",
    "constraints": [
      "2 ≤ D ≤ 10^9",
      "D 不是完全平方数"
    ],
    "sampleExplanation": "D=2 时最小解为 3²-2·2²=1。",
    "hint": "迭代 sqrt(D) 的周期连分数，并逐个生成收敛分数，首次满足方程即答案。",
    "targetComplexity": "迭代次数与连分数周期相关；每步高精度运算，空间 O(答案位数)。",
    "difficultyReason": "省选难度来自二次无理数周期、高精度收敛与溢出控制。",
    "tests": [
      [
        "2\n",
        "3 2\n"
      ],
      [
        "3\n",
        "2 1\n"
      ],
      [
        "13\n",
        "649 180\n"
      ]
    ]
  },
  {
    "id": "A1134",
    "title": "可逆轮换压缩",
    "seriesId": "S11",
    "difficulty": "提高",
    "tags": [
      "Burrows-Wheeler 变换",
      "循环排序"
    ],
    "model": "BWT 正逆变换",
    "description": [
      "字符串由可见 ASCII 字符组成，并且恰含一个 $，该字符严格小于其余字符。编码时排序所有循环移位并取每行末字符；解码时从最后一列唯一恢复原串。",
      "第一行操作 E 或 D，第二行字符串。E 输出 BWT 结果，D 输入合法 BWT 并输出以 $ 结尾的原串；字符串不含空格。"
    ],
    "input": "第一行操作字符，第二行字符串。",
    "output": "输出变换结果。",
    "constraints": [
      "1 ≤ |s| ≤ 200000",
      "字符串恰含一个 $"
    ],
    "sampleExplanation": "banana$ 的 BWT 为 annb$aa，反变换可恢复 banana$。",
    "hint": "编码可用循环后缀数组；解码用字符频次与第几次出现建立 LF 映射。",
    "targetComplexity": "时间 O(n log n)，空间 O(n)。",
    "difficultyReason": "提高难度来自循环排序和稳定 LF 映射。",
    "tests": [
      [
        "E\nbanana$\n",
        "annb$aa\n"
      ],
      [
        "D\n$\n",
        "$\n"
      ],
      [
        "D\nannb$aa\n",
        "banana$\n"
      ]
    ]
  },
  {
    "id": "A1135",
    "title": "问号模式位并行",
    "seriesId": "S11",
    "difficulty": "提高",
    "tags": [
      "Shift-And",
      "位并行"
    ],
    "model": "通配符 Shift-And 匹配",
    "description": [
      "模式串 p 含小写字母和问号，问号可匹配任意一个小写字母；文本串 s 只含小写字母。统计 p 在 s 中出现次数，重叠出现也计入。",
      "问号只代表一个字符，不代表空串或任意长度。模式可能超过机器字长，需要使用多个 64 位块传播移位进位。"
    ],
    "input": "第一行模式 p，第二行文本 s。",
    "output": "输出匹配次数。",
    "constraints": [
      "1 ≤ |p| ≤ |s| ≤ 1000000"
    ],
    "sampleExplanation": "a?a 在 abacaba 中于位置 1、3、5 匹配三次。",
    "hint": "为每个字符建立模式位掩码，逐字符执行 D=((D<<1)|1)&mask[c]。",
    "targetComplexity": "时间 O(26·|p|/w+|s|·|p|/w)，空间 O(26·|p|/w)。",
    "difficultyReason": "提高难度来自长模式位块和重叠匹配。",
    "tests": [
      [
        "a?a\nabacaba\n",
        "3\n"
      ],
      [
        "?\nz\n",
        "1\n"
      ],
      [
        "??a\naaaaba\n",
        "3\n"
      ]
    ]
  },
  {
    "id": "A1136",
    "title": "点星正则全匹配",
    "seriesId": "S11",
    "difficulty": "普及+/提高",
    "tags": [
      "正则 DP",
      "字符串匹配"
    ],
    "model": "点星正则动态规划",
    "description": [
      "实现精简正则：小写字母匹配自身，点号 . 匹配任意单个小写字母，星号 * 修饰前一个原子并表示重复零次或多次。判断模式是否与整个文本完全匹配。",
      "模式保证合法：* 不在开头且不会连续出现。必须覆盖整个文本，不能只匹配某个子串；例如 a* 可匹配空串。"
    ],
    "input": "第一行模式 p（可非空），第二行文本 s（可为空）。",
    "output": "完全匹配输出 YES，否则输出 NO。",
    "constraints": [
      "1 ≤ |p| ≤ 2000",
      "0 ≤ |s| ≤ 2000"
    ],
    "sampleExplanation": "c*a*b 可先让 c* 取零次、a* 取两次，再匹配 b。",
    "hint": "dp[i][j] 表示文本前 i 个字符与模式前 j 个字符；* 分为零次和继续多取一次。",
    "targetComplexity": "时间 O(|p||s|)，空间 O(|p|)。",
    "difficultyReason": "普及+/提高难度来自 * 的零次/多次转移和空串初始化。",
    "tests": [
      [
        "c*a*b\naab\n",
        "YES\n"
      ],
      [
        "a*\n\n",
        "YES\n"
      ],
      [
        ".*c\nab\n",
        "NO\n"
      ]
    ]
  }
]
export const algorithmBatch13Problems=rawDefinitions.map((definition,index)=>{const{tests,model,difficultyReason,...problem}=definition;return{...problem,series:seriesNames[problem.seriesId],type:'传统题',limitMs:['省选','挑战'].includes(problem.difficulty)?5000:problem.difficulty==='提高'?3000:1800,memoryMb:256,score:100,status:'',passRate:Math.max(20,75-index),submissions:40+index*4,coreModel:model,difficultyReason,referenceSolution:algorithmBatch13Solutions[problem.id],statement:{description:problem.description,input:problem.input,output:problem.output,constraints:problem.constraints,sampleExplanation:problem.sampleExplanation,hint:problem.hint,solutionOutline:problem.hint,targetComplexity:problem.targetComplexity,difficultyReason},samples:[{input:tests[0][0],output:tests[0][1]}]}})
export function getAlgorithmBatch13Tests(problemId){const definition=rawDefinitions.find(item=>item.id===problemId);if(!definition)return[];return definition.tests.map(([input,output],index)=>({name:testNames[index],score:testScores[index],input,output}))}
export function getAlgorithmBatch13Sample(problemId){const tests=getAlgorithmBatch13Tests(problemId);return tests.length?{input:tests[0].input,output:tests[0].output}:null}
export const algorithmBatch13Models=rawDefinitions.map(({id,seriesId,model})=>({id,seriesId,model}))
