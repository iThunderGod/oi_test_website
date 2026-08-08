import { algorithmBatch14Solutions } from './algorithmBatch14Solutions.mjs'
const seriesNames={"S01":"语言基础","S02":"模拟与枚举","S03":"排序与二分","S04":"贪心","S05":"前缀和与差分","S06":"搜索","S07":"动态规划","S08":"数据结构","S09":"图论","S10":"数学","S11":"字符串"}
const testNames=['Typical structure','Boundary conditions','Comprehensive trap']
const testScores=[30,30,40]
const rawDefinitions=[
  {
    "id": "A0136",
    "title": "七段屏故障画像",
    "seriesId": "S01",
    "difficulty": "普及",
    "tags": [
      "状态分类",
      "七段显示"
    ],
    "model": "永久故障一致性诊断",
    "description": [
      "质检台依次向一块七段数码屏发送若干已知数字，并记录 a 到 g 七根灯管的实际亮灭。每根灯管在整个检测过程中只可能处于正常、永久熄灭或永久点亮三种状态。",
      "所有记录必须由同一组故障状态解释。对每根灯管，若只有一种状态可行就输出 N、0 或 1；若多种状态都可行输出 ?。只要某根灯管没有任何可行状态，整组记录就是无效的。"
    ],
    "input": "第一行整数 q；随后 q 行给出数字 d 和长度为 7 的 01 串，位序依次为 a,b,c,d,e,f,g。",
    "output": "记录无解输出 INVALID；否则输出长度为 7 的故障画像。",
    "constraints": [
      "1 ≤ q ≤ 100000",
      "0 ≤ d ≤ 9",
      "观测串仅含 0 和 1"
    ],
    "sampleExplanation": "数字 1、2、3 让大部分灯管既出现过应亮也出现过应灭，因此可确定为正常；始终应亮或始终应灭的灯管仍可能与永久故障混淆。",
    "hint": "逐根灯管检查三种候选状态是否与全部记录一致。",
    "targetComplexity": "时间 O(7q)，空间 O(q)；也可流式压缩到 O(1) 空间。",
    "difficultyReason": "普及难度来自把跨记录不变的故障状态转化为三种一致性判定。",
    "tests": [
      [
        "3\n1 0110000\n2 1101101\n3 1111001\n",
        "N?NNN?N\n"
      ],
      [
        "1\n8 1111111\n",
        "???????\n"
      ],
      [
        "2\n1 0110000\n1 0010000\n",
        "INVALID\n"
      ]
    ]
  },
  {
    "id": "A0137",
    "title": "十进制定点偶舍入",
    "seriesId": "S01",
    "difficulty": "普及",
    "tags": [
      "高精度字符串",
      "银行家舍入"
    ],
    "model": "十进制字符串半偶舍入",
    "description": [
      "财务归档系统收到一个可能极长的十进制数，需要保留恰好 k 位小数。输入不能转换为浮点数，因为末位附近的微小误差会改变审计结果。",
      "采用 round-half-to-even：被舍弃部分大于一半时进位，小于一半时不进位；恰好等于一半时，仅当最后保留数字为奇数才进位。结果必须补足 k 位小数，数值为零时不保留负号。"
    ],
    "input": "输入一个带可选正负号的十进制字符串 s 和整数 k。",
    "output": "输出按半偶规则舍入后的规范定点表示。",
    "constraints": [
      "1 ≤ |s| ≤ 200000",
      "0 ≤ k ≤ 100000",
      "s 至少含一个数字，且格式合法"
    ],
    "sampleExplanation": "12.3450 舍弃部分恰为一半，最后保留数字 4 为偶数，因此结果为 12.34。",
    "hint": "拆分整数与小数部分，只观察首个被舍弃位、其后是否非零以及最后保留位奇偶。",
    "targetComplexity": "时间 O(|s|+k)，空间 O(|s|+k)。",
    "difficultyReason": "普及难度来自精确处理进位链、负零和半偶平局。",
    "tests": [
      [
        "12.3450 2\n",
        "12.34\n"
      ],
      [
        "-0.5 0\n",
        "0\n"
      ],
      [
        "999.9951 2\n",
        "1000.00\n"
      ]
    ]
  },
  {
    "id": "A0138",
    "title": "千位分数裁判",
    "seriesId": "S01",
    "difficulty": "基础",
    "tags": [
      "高精度整数",
      "交叉相乘"
    ],
    "model": "任意精度有理数比较",
    "description": [
      "数据交换协议用两个整数 p、q 表示分数 p/q。两个分子的位数可能远超 64 位，系统只需判断两个分数的大小，不需要输出小数近似。",
      "分母保证为正，分子可以为零或负数。比较时必须给出严格的 <、= 或 >；约分不是必需步骤，任何精度损失都不被接受。"
    ],
    "input": "一行给出十进制整数 p、q、r、s，分别表示 p/q 与 r/s。",
    "output": "输出一个字符 <、= 或 >。",
    "constraints": [
      "p 与 r 的绝对值不超过 10^1000",
      "1 ≤ q,s < 10^1000"
    ],
    "sampleExplanation": "第一组两个巨大分数交叉相乘后完全相等。",
    "hint": "由于分母为正，直接比较 p·s 与 r·q；乘积需要任意精度整数。",
    "targetComplexity": "设总位数为 L，时间取决于高精度乘法，空间 O(L)。",
    "difficultyReason": "基础难度的关键是避免浮点转换和有符号交叉乘法溢出。",
    "tests": [
      [
        "123456789012345678901234567890 7 17636684144620811271604938270 1\n",
        "=\n"
      ],
      [
        "0 999999999999999999999 1 999999999999999999999\n",
        "<\n"
      ],
      [
        "-500000000000000000000000000001 2 -750000000000000000000000000001 3\n",
        "<\n"
      ]
    ]
  },
  {
    "id": "A0236",
    "title": "货轨栈式出站",
    "seriesId": "S02",
    "difficulty": "普及",
    "tags": [
      "栈模拟",
      "排列验证"
    ],
    "model": "单栈排列在线判定",
    "description": [
      "编号 1 到 n 的货箱按升序驶入缓冲栈，入口只能把下一个编号压栈，出口只能弹出栈顶。调度员给出期望的完整出站顺序。",
      "处理每个期望编号时，可以连续压入尚未到达的货箱，随后必须立刻从栈顶取出该编号。若无法完成输出 NO；可完成时还要输出整个过程中栈内货箱数的最大值。"
    ],
    "input": "第一行整数 n，第二行给出 1 到 n 的一个排列。",
    "output": "不可实现输出 NO；否则输出 YES 和最大栈深度。",
    "constraints": [
      "1 ≤ n ≤ 500000",
      "目标序列是 1..n 的排列"
    ],
    "sampleExplanation": "为依次输出 1、2、5、4、3，前三个货箱先后被压入，最大栈深度为 3。",
    "hint": "维护下一个可入栈编号；若栈顶不是目标，就持续压栈直至找到目标或编号耗尽。",
    "targetComplexity": "时间 O(n)，空间 O(n)。",
    "difficultyReason": "普及难度来自严格模拟入栈许可与失败时刻。",
    "tests": [
      [
        "5\n1 2 5 4 3\n",
        "YES 3\n"
      ],
      [
        "1\n1\n",
        "YES 1\n"
      ],
      [
        "3\n3 1 2\n",
        "NO\n"
      ]
    ]
  },
  {
    "id": "A0237",
    "title": "时间片完工表",
    "seriesId": "S02",
    "difficulty": "普及+/提高",
    "tags": [
      "队列模拟",
      "时间片轮转"
    ],
    "model": "带到达时刻轮转调度",
    "description": [
      "单核处理器采用时间片轮转。任务按输入顺序到达，每次从就绪队首运行至完成或用满 q 个时间单位；运行期间到达的新任务依输入顺序进入队尾。",
      "若当前时间没有就绪任务，时钟直接跳到下一任务的到达时刻。一个未完成任务在本时间片结束时重新入队，但同一时刻刚到达的任务先于它进入队列；输出每个任务的绝对完成时刻。"
    ],
    "input": "第一行 n 和时间片 q；随后 n 行给出非递减到达时刻 a_i 与所需运行时间 t_i。",
    "output": "按任务输入顺序输出 n 个完成时刻。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "1 ≤ q,t_i ≤ 10^9",
      "0 ≤ a_i ≤ 10^18，且 a_i 非递减"
    ],
    "sampleExplanation": "任务 1 首次运行后剩 1 单位，任务 2、3 已排在其前，最终完成时刻为 6、8、5。",
    "hint": "队列中只保存任务编号；一次处理整段时间片，不逐时间单位推进。",
    "targetComplexity": "设实际时间片次数为 R，时间 O(n+R)，空间 O(n)。",
    "difficultyReason": "普及+/提高难度来自同一时刻到达与重新入队的先后语义。",
    "tests": [
      [
        "3 2\n0 3\n1 4\n2 1\n",
        "6 8 5\n"
      ],
      [
        "1 5\n10 3\n",
        "13\n"
      ],
      [
        "4 3\n0 5\n0 1\n4 2\n4 4\n",
        "6 4 8 12\n"
      ]
    ]
  },
  {
    "id": "A0238",
    "title": "同色链式消除",
    "seriesId": "S02",
    "difficulty": "普及",
    "tags": [
      "栈",
      "游程合并"
    ],
    "model": "游程栈级联消除",
    "description": [
      "传送带从左到右送来小写字母球。任意时刻，只要出现长度至少为 k 的同色连续段，该整段就立刻消失，左右两侧随后相邻并可能触发新的消除。",
      "每个新球加入后要把所有可能的级联消除处理完，再接收下一个球。最终输出剩余序列；若没有球，输出 EMPTY。"
    ],
    "input": "第一行整数 k，第二行一个小写字符串 s。",
    "output": "输出所有规则执行完后的剩余字符串或 EMPTY。",
    "constraints": [
      "2 ≤ k ≤ 200000",
      "1 ≤ |s| ≤ 1000000"
    ],
    "sampleExplanation": "abbba 中 bbb 先消失，两端的 a 合并为 aa，但未达到阈值 3。",
    "hint": "栈中保存当前相邻游程的字符与长度；达到 k 时弹出，下一游程会自然与栈顶合并。",
    "targetComplexity": "时间 O(|s|)，空间 O(|s|)。",
    "difficultyReason": "普及难度来自用游程栈表达消除后的跨段合并。",
    "tests": [
      [
        "3\nabbba\n",
        "aa\n"
      ],
      [
        "2\naa\n",
        "EMPTY\n"
      ],
      [
        "3\naabbbaccc\n",
        "EMPTY\n"
      ]
    ]
  },
  {
    "id": "A0336",
    "title": "有符号八趟基数排序",
    "seriesId": "S03",
    "difficulty": "普及",
    "tags": [
      "基数排序",
      "位运算"
    ],
    "model": "补码符号翻转基数排序",
    "description": [
      "日志系统要按数值升序整理 n 个 64 位有符号整数，但审计要求使用稳定的 LSD 基数排序，不允许调用比较排序完成核心步骤。",
      "每趟处理一个字节，从最低字节到最高字节共八趟。为使补码的无符号顺序对应有符号升序，排序键要把最高符号位翻转；重复值必须保持原相对次序。"
    ],
    "input": "第一行整数 n，第二行 n 个 int64 整数。",
    "output": "输出升序排列后的整数。",
    "constraints": [
      "1 ≤ n ≤ 500000",
      "-2^63 ≤ a_i < 2^63"
    ],
    "sampleExplanation": "翻转符号位后，最小负数排在最前，最大正数排在最后，两次出现的 -1 保持稳定。",
    "hint": "每趟用 256 个桶做稳定计数排序，键为 uint64(a_i) xor 2^63。",
    "targetComplexity": "时间 O(8n+8·256)，空间 O(n+256)。",
    "difficultyReason": "普及难度来自补码顺序修正与稳定回填。",
    "tests": [
      [
        "8\n5 -1 0 -9223372036854775808 7 -1 9223372036854775807 -5\n",
        "-9223372036854775808 -5 -1 -1 0 5 7 9223372036854775807\n"
      ],
      [
        "1\n0\n",
        "0\n"
      ],
      [
        "6\n9 -9 9 3 -3 0\n",
        "-9 -3 0 3 9 9\n"
      ]
    ]
  },
  {
    "id": "A0337",
    "title": "稳定排序最少交换",
    "seriesId": "S03",
    "difficulty": "普及",
    "tags": [
      "置换环",
      "稳定排序"
    ],
    "model": "稳定目标置换环交换",
    "description": [
      "仓库要把数组按数值非递减整理，并规定相等元素必须保持原有先后顺序。因此目标位置由稳定排序唯一确定。",
      "一次操作可交换任意两个位置。求把原数组变成这个唯一稳定排序结果所需的最少交换次数；相等值不能任意互换来降低答案。"
    ],
    "input": "第一行整数 n，第二行 n 个整数。",
    "output": "输出最少交换次数。",
    "constraints": [
      "1 ≤ n ≤ 500000",
      "|a_i| ≤ 10^9"
    ],
    "sampleExplanation": "3、1、2 的稳定目标是 1、2、3，三个位置构成一个长度 3 的环，需要两次交换。",
    "hint": "给元素附上原下标做稳定排序，建立原位置到目标位置的置换，再累加每个环长度减一。",
    "targetComplexity": "时间 O(n log n)，空间 O(n)。",
    "difficultyReason": "普及难度来自把重复元素的稳定身份映射成唯一置换。",
    "tests": [
      [
        "3\n3 1 2\n",
        "2\n"
      ],
      [
        "4\n1 1 2 3\n",
        "0\n"
      ],
      [
        "4\n2 1 2 1\n",
        "3\n"
      ]
    ]
  },
  {
    "id": "A0338",
    "title": "逆序码还原排列",
    "seriesId": "S03",
    "difficulty": "普及+/提高",
    "tags": [
      "树状数组",
      "顺序统计"
    ],
    "model": "Lehmer 码顺序统计解码",
    "description": [
      "一个 1 到 n 的排列被编码为 d_1..d_n：第 i 位表示在尚未使用的数字中，有多少个数字严格小于 p_i。输入保证是一份合法编码。",
      "从左到右恢复排列时，第 i 位应选择剩余数字中的第 d_i+1 小，并永久删除它。需要在大规模下输出完整排列。"
    ],
    "input": "第一行整数 n，第二行 n 个整数 d_i。",
    "output": "输出解码得到的排列。",
    "constraints": [
      "1 ≤ n ≤ 500000",
      "0 ≤ d_i < n-i+1"
    ],
    "sampleExplanation": "编码 1、0、1、0 依次选择第 2、1、2、1 小，得到 2、1、4、3。",
    "hint": "树状数组维护每个数字是否仍可用，并用二进制倍增寻找第 k 个 1。",
    "targetComplexity": "时间 O(n log n)，空间 O(n)。",
    "difficultyReason": "普及+/提高难度来自树状数组上的第 k 小定位而非普通前缀查询。",
    "tests": [
      [
        "4\n1 0 1 0\n",
        "2 1 4 3\n"
      ],
      [
        "1\n0\n",
        "1\n"
      ],
      [
        "5\n4 0 2 1 0\n",
        "5 1 4 3 2\n"
      ]
    ]
  },
  {
    "id": "A0437",
    "title": "冷却字母排程",
    "seriesId": "S04",
    "difficulty": "普及",
    "tags": [
      "贪心",
      "优先队列"
    ],
    "model": "任务频次冷却下界构造",
    "description": [
      "处理器要执行 n 个单位时长的字母任务。相同字母的两次执行之间必须至少隔开 k 个完整时间单位，不同字母之间没有限制。",
      "每个时间单位可以执行一个当前可用任务，或在没有可用任务时空闲。任务次序可任意调整，求完成全部任务的最短总时间。"
    ],
    "input": "第一行 n、k，第二行给出 n 个大写字母任务。",
    "output": "输出最短完成时间。",
    "constraints": [
      "1 ≤ n ≤ 500000",
      "0 ≤ k ≤ 500000",
      "任务字母为 A 到 Z"
    ],
    "sampleExplanation": "AAABBB 且 k=2 时可排成 A B idle A B idle A B，共 8 个时间单位。",
    "hint": "设最高频次为 f，共有 c 种字母达到 f；紧凑骨架长度为 (f-1)(k+1)+c，答案再与 n 取最大。",
    "targetComplexity": "时间 O(n+26)，空间 O(26)。",
    "difficultyReason": "普及难度来自同时维护剩余频次与冷却解禁时刻。",
    "tests": [
      [
        "6 2\nA A A B B B\n",
        "8\n"
      ],
      [
        "3 0\nA A B\n",
        "3\n"
      ],
      [
        "7 2\nA A A A B C D\n",
        "10\n"
      ]
    ]
  },
  {
    "id": "A0438",
    "title": "砖梯远征",
    "seriesId": "S04",
    "difficulty": "普及",
    "tags": [
      "反悔贪心",
      "小根堆"
    ],
    "model": "有限替代资源反悔分配",
    "description": [
      "探险者按顺序经过 n 栋建筑。下降或平移不消耗资源；上升 d 层必须消耗 d 块砖，或使用一架梯子完全覆盖这次上升。",
      "砖和梯子都不可回收。求最多能到达的建筑编号，起点编号为 1。策略可以在看到后续高度后反悔此前哪次上升使用梯子。"
    ],
    "input": "第一行 n、砖块数 b、梯子数 l；第二行 n 个建筑高度。",
    "output": "输出最远可到达的 1 开始建筑编号。",
    "constraints": [
      "1 ≤ n ≤ 500000",
      "0 ≤ b ≤ 10^18",
      "0 ≤ l ≤ n",
      "0 ≤ h_i ≤ 10^18"
    ],
    "sampleExplanation": "把唯一梯子留给较大的 5 层上升，砖仍不足以越过从 9 到 14 的上升，所以最远到达第 5 栋。",
    "hint": "把所有正上升放入小根堆，默认梯子覆盖最大的 l 次；多出的最小上升改用砖。",
    "targetComplexity": "时间 O(n log n)，空间 O(n)。",
    "difficultyReason": "普及难度来自用堆完成资源选择的在线反悔。",
    "tests": [
      [
        "7 5 1\n4 2 7 6 9 14 12\n",
        "5\n"
      ],
      [
        "1 0 0\n8\n",
        "1\n"
      ],
      [
        "7 4 1\n1 5 1 2 3 4 100\n",
        "6\n"
      ]
    ]
  },
  {
    "id": "A0537",
    "title": "目标和子矩形计数",
    "seriesId": "S05",
    "difficulty": "提高",
    "tags": [
      "二维降维",
      "前缀和哈希"
    ],
    "model": "行对压缩子矩形计数",
    "description": [
      "观测矩阵包含正数、负数和零。需要统计有多少个非空、边界与网格线对齐的连续子矩形，其元素总和恰好等于目标值 T。",
      "相同坐标范围只计一次，允许不同子矩形具有相同元素序列。答案可能超过 32 位，不能使用只适用于非负数的双指针。"
    ],
    "input": "第一行 n、m、T；随后 n 行每行 m 个整数。",
    "output": "输出目标和子矩形数量。",
    "constraints": [
      "1 ≤ n,m ≤ 200",
      "|a_ij|,|T| ≤ 10^9"
    ],
    "sampleExplanation": "2×2 矩阵中，第一行、第二行以及单独的左下角元素的和都为 3，共三个子矩形。",
    "hint": "枚举较短维度上的上下边界，把列压成一维后用前缀和频次统计和为 T 的子数组。",
    "targetComplexity": "时间 O(min(n,m)^2·max(n,m))，空间 O(max(n,m))。",
    "difficultyReason": "提高难度来自二维降维、负数前缀和计数与维度转置优化。",
    "tests": [
      [
        "2 2 3\n1 2\n3 0\n",
        "3\n"
      ],
      [
        "1 1 0\n0\n",
        "1\n"
      ],
      [
        "3 3 0\n0 0 0\n0 0 0\n0 0 0\n",
        "36\n"
      ]
    ]
  },
  {
    "id": "A0538",
    "title": "斐波那契区间铺色",
    "seriesId": "S05",
    "difficulty": "提高",
    "tags": [
      "差分",
      "斐波那契"
    ],
    "model": "线性递推序列差分叠加",
    "description": [
      "长度 n 的画布初始全为 0。一次操作 [l,r] 会依次给 a_l..a_r 加上 F_1,F_2,...,F_{r-l+1}，其中 F_1=F_2=1。",
      "所有操作相互叠加，最后每个位置对 1,000,000,007 取模。需要批量处理大量长区间，不能逐点展开每次斐波那契序列。"
    ],
    "input": "第一行 n、q；随后 q 行给出 l、r。",
    "output": "输出操作完成后的 n 个值。",
    "constraints": [
      "1 ≤ n,q ≤ 500000",
      "1 ≤ l ≤ r ≤ n"
    ],
    "sampleExplanation": "[1,3] 加入 1,1,2，[2,5] 加入 1,1,2,3，叠加得到 1,2,3,2,3。",
    "hint": "维护满足同一二阶递推的差分数组；在 l 注入首项，并在 r+1、r+2 消去越界延伸。",
    "targetComplexity": "时间 O(n+q)，空间 O(n)。",
    "difficultyReason": "提高难度来自为二阶递推构造两个右端点修正量。",
    "tests": [
      [
        "5 2\n1 3\n2 5\n",
        "1 2 3 2 3\n"
      ],
      [
        "1 1\n1 1\n",
        "1\n"
      ],
      [
        "6 3\n1 6\n3 5\n2 2\n",
        "1 2 3 4 7 8\n"
      ]
    ]
  },
  {
    "id": "A0637",
    "title": "最短加法链",
    "seriesId": "S06",
    "difficulty": "省选",
    "tags": [
      "迭代加深",
      "剪枝搜索"
    ],
    "model": "加法链迭代加深搜索",
    "description": [
      "从数字 1 开始构造严格递增序列。每个新数字必须等于序列中两个已出现数字之和，这两个数字允许相同；目标是让序列最后出现给定整数 n。",
      "链长定义为新增数字的次数，不计初始的 1。只需输出最短链长；不同构造具有相同长度时无需输出具体链。"
    ],
    "input": "输入一个整数 n。",
    "output": "输出得到 n 的最短加法链长度。",
    "constraints": [
      "1 ≤ n ≤ 1000"
    ],
    "sampleExplanation": "15 可由 1,2,3,6,12,15 得到，使用 5 次加法，且不存在更短方案。",
    "hint": "按深度从小到大做 DFS；若当前最大值连续翻倍也达不到 n 就剪枝，并按候选和从大到小搜索。",
    "targetComplexity": "指数级但由迭代加深与翻倍上界强力剪枝；空间 O(log n)。",
    "difficultyReason": "省选难度对应 NP 风格状态空间中的可证最短性、上下界与去重剪枝。",
    "tests": [
      [
        "15\n",
        "5\n"
      ],
      [
        "1\n",
        "0\n"
      ],
      [
        "31\n",
        "7\n"
      ]
    ]
  },
  {
    "id": "A0638",
    "title": "字典树拼字板",
    "seriesId": "S06",
    "difficulty": "提高",
    "tags": [
      "Trie",
      "回溯搜索"
    ],
    "model": "多模式共享前缀网格回溯",
    "description": [
      "给定一个小写字母网格和一批询问单词。一个单词存在，当且仅当可以从任意格出发，上下左右移动形成全部字符，且同一次路径中每个格最多使用一次。",
      "每个单词独立判断，网格在询问间恢复。为避免对大量公共前缀单词重复搜索，应把所有询问放进同一棵字典树，并在网格 DFS 中共享前缀。"
    ],
    "input": "第一行 h、w，随后 h 行网格；再输入 q 和 q 个小写单词。",
    "output": "按输入顺序对每个单词输出 YES 或 NO。",
    "constraints": [
      "1 ≤ h,w ≤ 8",
      "1 ≤ q ≤ 500",
      "单词长度不超过 12，总长度不超过 5000"
    ],
    "sampleExplanation": "abe、cfi、fed 都能通过相邻格形成；aei 只沿对角线，不满足移动规则。",
    "hint": "DFS 状态为网格位置和 Trie 节点，路径访问标记在回溯时撤销。",
    "targetComplexity": "最坏与有效 Trie 前缀路径数相关，空间 O(询问总长度+h·w)。",
    "difficultyReason": "提高难度来自多模式前缀共享、路径不重复约束和回溯恢复。",
    "tests": [
      [
        "3 3\nabc\ndef\nghi\n4\nabe\ncfi\naei\nfed\n",
        "YES\nYES\nNO\nYES\n"
      ],
      [
        "1 1\na\n2\na\naa\n",
        "YES\nNO\n"
      ],
      [
        "2 2\naa\naa\n2\naaaa\naaaaa\n",
        "YES\nNO\n"
      ]
    ]
  },
  {
    "id": "A0769",
    "title": "抗摔探测次数",
    "seriesId": "S07",
    "difficulty": "提高",
    "tags": [
      "动态规划",
      "覆盖层数"
    ],
    "model": "鸡蛋掉落按步数反向 DP",
    "description": [
      "实验楼有 1 到 F 层以及已知安全的 0 层，存在未知临界层 C：不高于 C 投放仪器不会损坏，高于 C 会损坏。你有 E 台相同仪器，损坏的仪器不能再用。",
      "每次可选择任意尚未确定的楼层试验，后续策略可以依赖结果。求保证确定 C 所需的最少最坏试验次数；F 可以很大，不能按楼层建立二维表。"
    ],
    "input": "输入仪器数 E 和楼层数 F。",
    "output": "输出最少最坏试验次数。",
    "constraints": [
      "1 ≤ E ≤ 60",
      "0 ≤ F ≤ 10^18"
    ],
    "sampleExplanation": "两台仪器、100 层时，14 次可以覆盖 105 层，而 13 次只能覆盖 91 层。",
    "hint": "令 dp[e] 表示用当前次数和 e 台仪器可覆盖的最大楼层数，递推 dp[e]=dp[e]+dp[e-1]+1。",
    "targetComplexity": "时间 O(E·答案)，空间 O(E)。",
    "difficultyReason": "提高难度来自交换 DP 维度，把巨大楼层状态变为按步数增长的覆盖能力。",
    "tests": [
      [
        "2 100\n",
        "14\n"
      ],
      [
        "1 0\n",
        "0\n"
      ],
      [
        "3 1000\n",
        "19\n"
      ]
    ]
  },
  {
    "id": "A0770",
    "title": "仿射缺口序列对齐",
    "seriesId": "S07",
    "difficulty": "提高",
    "tags": [
      "序列 DP",
      "仿射缺口"
    ],
    "model": "三状态仿射缺口全局比对",
    "description": [
      "比较两条基因序列时，相同字符得 2 分，不同字符得 -1 分。连续缺口的第一格罚 2 分，之后每延长一格再罚 1 分，因此一个长度 L 的缺口总罚分为 L+1。",
      "允许在任意一条序列中插入缺口，但不能把缺口与缺口对齐。求覆盖两条完整序列的全局比对最高得分；输入用单个减号 - 表示空串。"
    ],
    "input": "两行分别给出只含大写英文字母的序列，空串用 - 表示。",
    "output": "输出最高全局比对得分。",
    "constraints": [
      "0 ≤ |A|,|B| ≤ 3000"
    ],
    "sampleExplanation": "GATT 与 GCTT 可逐位对齐，得到 2-1+2+2=5，插入缺口不会更优。",
    "hint": "分别维护最后一列是字符配对、A 中缺口、B 中缺口的三个状态。",
    "targetComplexity": "时间 O(|A||B|)，空间 O(|B|)。",
    "difficultyReason": "提高难度来自区分缺口开启与延伸、空串边界和三状态滚动。",
    "tests": [
      [
        "GATT\nGCTT\n",
        "5\n"
      ],
      [
        "-\nAAA\n",
        "-4\n"
      ],
      [
        "AAAA\nAA\n",
        "1\n"
      ]
    ]
  },
  {
    "id": "A0771",
    "title": "集合并卷积",
    "seriesId": "S07",
    "difficulty": "省选",
    "tags": [
      "子集卷积",
      "Zeta 变换"
    ],
    "model": "按集合大小分层子集卷积",
    "description": [
      "对全集 {0..n-1} 的每个子集 S 给定 f[S] 与 g[S]。定义 h[S] 为所有有序拆分 A∪B=S、A∩B=∅ 的 f[A]·g[B] 之和。",
      "所有运算对 998244353 取模。朴素枚举 S 的全部子集总计需要 3^n，数据范围要求利用按集合大小分层的子集 Zeta 变换。"
    ],
    "input": "第一行 n；第二、三行各有 2^n 个整数，按掩码从 0 到 2^n-1 给出 f、g。",
    "output": "按掩码顺序输出 2^n 个 h[S]。",
    "constraints": [
      "0 ≤ n ≤ 20",
      "0 ≤ f[S],g[S] < 998244353"
    ],
    "sampleExplanation": "S={0,1} 的四个有序拆分贡献为 1·8+2·4+3·2+4·1=26。",
    "hint": "按 popcount 把函数分层，对每层做子集 Zeta；同一掩码上卷积层数，再做 Möbius 逆变换。",
    "targetComplexity": "时间 O(n^2·2^n)，空间 O(n·2^n)。",
    "difficultyReason": "省选难度来自把互不相交拆分约束转化为分层变换与逆变换。",
    "tests": [
      [
        "2\n1 2 3 4\n1 2 4 8\n",
        "1 4 7 26\n"
      ],
      [
        "0\n5\n7\n",
        "35\n"
      ],
      [
        "3\n1 1 1 1 1 1 1 1\n1 1 1 1 1 1 1 1\n",
        "1 2 2 4 2 4 4 8\n"
      ]
    ]
  },
  {
    "id": "A0838",
    "title": "稀疏棋盘点加矩形和",
    "seriesId": "S08",
    "difficulty": "普及+/提高",
    "tags": [
      "二维树状数组",
      "在线查询"
    ],
    "model": "二维 Fenwick 点更矩形和",
    "description": [
      "n×m 棋盘初始全零。系统在线接收两类操作：给一个格子增加整数 v，或查询闭合矩形内所有格子的当前总和。",
      "增加操作可重复作用于同一格，也允许负数；查询顺序与更新顺序相关，不能离线重排。矩形端点保证已按左上、右下给出。"
    ],
    "input": "第一行 n、m、q；随后 q 行为 A x y v 或 Q x1 y1 x2 y2。",
    "output": "每个 Q 操作输出一行矩形和。",
    "constraints": [
      "1 ≤ n,m ≤ 2000",
      "1 ≤ q ≤ 500000",
      "|v| ≤ 10^9"
    ],
    "sampleExplanation": "两次点加后整个棋盘和为 7，右下 2×2 只包含值 2。",
    "hint": "二维 Fenwick 支持点加和原点前缀和，矩形用四个前缀容斥。",
    "targetComplexity": "每次操作 O(log n log m)，空间 O(nm)。",
    "difficultyReason": "普及+/提高难度来自二维索引推进与四项容斥边界。",
    "tests": [
      [
        "3 3 4\nA 1 1 5\nA 2 3 2\nQ 1 1 3 3\nQ 2 2 3 3\n",
        "7\n2\n"
      ],
      [
        "1 1 2\nQ 1 1 1 1\nA 1 1 -3\n",
        "0\n"
      ],
      [
        "4 4 5\nA 4 4 10\nA 1 4 7\nA 4 1 -2\nQ 1 1 4 4\nQ 2 2 4 4\n",
        "15\n10\n"
      ]
    ]
  },
  {
    "id": "A0839",
    "title": "区间封顶与总和",
    "seriesId": "S08",
    "difficulty": "省选",
    "tags": [
      "Segment Tree Beats",
      "区间最值"
    ],
    "model": "Segment Tree Beats 区间 chmin",
    "description": [
      "维护一个整数数组。封顶操作 C l r x 把区间内每个 a_i 改为 min(a_i,x)；查询 S l r 返回区间总和。",
      "操作在线执行，x 可以比区间所有值都大或都小。普通懒标记无法直接表示只修改一部分最大值，需要利用区间最大值、严格次大值和最大值个数。"
    ],
    "input": "第一行 n、q；第二行初始数组；随后 q 行操作 C l r x 或 S l r。",
    "output": "每个 S 操作输出一行答案。",
    "constraints": [
      "1 ≤ n,q ≤ 300000",
      "|a_i|,|x| ≤ 10^9"
    ],
    "sampleExplanation": "先把 [1,4] 中大于 4 的 5、7 封到 4，总和为 11；再把 [2,3] 封到 2，总和变为 9。",
    "hint": "当 x 严格大于节点次大值时，只需一次性修改所有最大值；否则下推递归。",
    "targetComplexity": "均摊时间 O((n+q)log n)，空间 O(n)。",
    "difficultyReason": "省选难度来自 Beats 的可停条件、不变量维护和均摊分析。",
    "tests": [
      [
        "4 4\n5 1 7 2\nC 1 4 4\nS 1 4\nC 2 3 2\nS 1 4\n",
        "11\n9\n"
      ],
      [
        "1 2\n-5\nC 1 1 -6\nS 1 1\n",
        "-6\n"
      ],
      [
        "5 4\n10 9 8 7 6\nC 1 5 8\nC 2 4 5\nS 1 5\nS 3 3\n",
        "29\n5\n"
      ]
    ]
  },
  {
    "id": "A0840",
    "title": "区间最大异或值",
    "seriesId": "S08",
    "difficulty": "提高",
    "tags": [
      "可持久化 Trie",
      "异或贪心"
    ],
    "model": "前缀持久化二进制字典树",
    "description": [
      "给定不可修改的非负整数数组。每个询问给出 l、r、x，要在下标区间 [l,r] 中选择一个元素 y，使 x xor y 最大，并输出这个最大异或值。",
      "不同询问独立，若有多个 y 达到同一最大值无需输出其位置。数据在线给出，但数组静态，可为每个前缀保存一棵共享节点的二进制字典树。"
    ],
    "input": "第一行 n、q；第二行数组；随后 q 行给出 l、r、x。",
    "output": "每个询问输出一行最大异或值。",
    "constraints": [
      "1 ≤ n,q ≤ 300000",
      "0 ≤ a_i,x < 2^31"
    ],
    "sampleExplanation": "区间 [2,4] 为 2、7、4，与 6 异或的最大值由 2 取得，为 4。",
    "hint": "用 root[r] 与 root[l-1] 的节点计数差判断某条相反位分支在区间内是否存在。",
    "targetComplexity": "预处理 O(31n)，每次查询 O(31)，空间 O(31n)。",
    "difficultyReason": "提高难度来自可持久化路径复制和两棵前缀树的计数差。",
    "tests": [
      [
        "5 3\n1 2 7 4 8\n2 4 6\n1 5 0\n5 5 7\n",
        "4\n8\n15\n"
      ],
      [
        "1 1\n0\n1 1 0\n",
        "0\n"
      ],
      [
        "4 2\n2147483647 0 5 10\n1 2 1073741824\n3 4 7\n",
        "1073741824\n13\n"
      ]
    ]
  },
  {
    "id": "A0938",
    "title": "开关约束可行性",
    "seriesId": "S09",
    "difficulty": "普及+/提高",
    "tags": [
      "2-SAT",
      "强连通分量"
    ],
    "model": "蕴含图 2-SAT 判定",
    "description": [
      "有 n 个布尔开关。每条规则写成两个文字 a、b，表示 a 或 b 至少一个为真；正整数 i 表示开关 i 打开，负整数 -i 表示开关 i 关闭。",
      "只需判断是否存在同时满足全部规则的开关状态，不要求输出方案。重复规则和自反规则都按普通析取处理。"
    ],
    "input": "第一行 n、m；随后 m 行给出非零整数 a、b，绝对值不超过 n。",
    "output": "可满足输出 YES，否则输出 NO。",
    "constraints": [
      "1 ≤ n,m ≤ 500000"
    ],
    "sampleExplanation": "第一组规则允许令 x1=true、x2=false；第二组同时强制 x1 与非 x1，因而无解。",
    "hint": "把 (a∨b) 转为 ¬a→b 和 ¬b→a；变量与其否定同属一个 SCC 时无解。",
    "targetComplexity": "时间 O(n+m)，空间 O(n+m)。",
    "difficultyReason": "普及+/提高难度来自文字编号、蕴含边构造和 SCC 矛盾判定。",
    "tests": [
      [
        "2 3\n1 2\n-1 2\n1 -2\n",
        "YES\n"
      ],
      [
        "1 2\n1 1\n-1 -1\n",
        "NO\n"
      ],
      [
        "3 4\n1 2\n-1 3\n-2 -3\n2 3\n",
        "YES\n"
      ]
    ]
  },
  {
    "id": "A0939",
    "title": "边的在线生灭连通性",
    "seriesId": "S09",
    "difficulty": "省选",
    "tags": [
      "线段树分治",
      "可撤销并查集"
    ],
    "model": "时间线分治动态连通性",
    "description": [
      "无向图初始没有边，依次执行加边、删边和连通询问。每条无向边在同一时刻最多存在一份，删除操作保证对应边当前存在。",
      "询问必须按发生时刻回答。普通并查集不能撤销删除；需要先确定每条边的存活时间区间，再在时间线线段树上分治，并在离开节点时撤销合并。"
    ],
    "input": "第一行 n、q；随后 q 行为 + u v、- u v 或 ? u v。",
    "output": "每个 ? 操作输出 YES 或 NO。",
    "constraints": [
      "1 ≤ n,q ≤ 300000"
    ],
    "sampleExplanation": "1-2 与 2-3 同时存在时 1、3 连通；删除 1-2 后它们不再连通。",
    "hint": "把边的活跃区间加入时间线段树，DFS 节点时合并，回溯时恢复到进入前的并查集快照。",
    "targetComplexity": "时间 O(q log q log n)，空间 O(q log q+n)。",
    "difficultyReason": "省选难度来自把删除转为时间区间、回滚并查集和递归时序不变量。",
    "tests": [
      [
        "3 5\n+ 1 2\n+ 2 3\n? 1 3\n- 1 2\n? 1 3\n",
        "YES\nNO\n"
      ],
      [
        "2 1\n? 1 1\n",
        "YES\n"
      ],
      [
        "4 8\n+ 1 2\n+ 3 4\n? 1 4\n+ 2 3\n? 1 4\n- 2 3\n? 1 4\n? 3 4\n",
        "NO\nYES\nNO\nYES\n"
      ]
    ]
  },
  {
    "id": "A0940",
    "title": "街区邮差最短巡检",
    "seriesId": "S09",
    "difficulty": "提高",
    "tags": [
      "中国邮差",
      "状态压缩"
    ],
    "model": "无向中国邮差奇点配对",
    "description": [
      "巡检员从任意起点出发，沿无向连通带权图的边行走，要求每条边至少经过一次并最终回到起点。边可以重复经过，求最短总路程。",
      "直接走完所有边可行当且仅当所有顶点度数为偶数。否则必须额外重复若干最短路径，使所有奇度顶点两两配对；起点不影响最优闭合路程。"
    ],
    "input": "第一行 n、m；随后 m 行给出 u、v、正权 w。",
    "output": "输出最短闭合巡检路程。",
    "constraints": [
      "1 ≤ n ≤ 20",
      "1 ≤ m ≤ 200",
      "图连通，1 ≤ w ≤ 10^9"
    ],
    "sampleExplanation": "路径 1-2-3 的边权和为 7，奇点 1、3 之间必须额外走一次长度 7 的路径，总路程 14。",
    "hint": "Floyd 求奇点间最短路，对奇点集合做状态压缩最小完美匹配，再加原边权和。",
    "targetComplexity": "时间 O(n^3+3^k)，空间 O(n^2+2^k)，k 为奇点数。",
    "difficultyReason": "提高难度来自欧拉化建模、奇点最短路闭包与子集配对 DP。",
    "tests": [
      [
        "3 2\n1 2 3\n2 3 4\n",
        "14\n"
      ],
      [
        "3 3\n1 2 1\n2 3 1\n3 1 1\n",
        "3\n"
      ],
      [
        "4 4\n1 2 2\n2 3 2\n3 4 2\n4 1 10\n",
        "16\n"
      ]
    ]
  },
  {
    "id": "A1037",
    "title": "线性基第 k 个异或值",
    "seriesId": "S10",
    "difficulty": "提高",
    "tags": [
      "线性基",
      "异或"
    ],
    "model": "约化线性基有序枚举",
    "description": [
      "给定 n 个非负整数，从中选择任意子集并计算异或和。只考虑所有不同结果，把它们按从小到大排序并从 0 开始编号。",
      "输入 k 保证小于不同异或结果的数量。空子集产生 0；若原数线性相关，不同子集产生的相同异或值只保留一次。"
    ],
    "input": "第一行 n、k，第二行 n 个非负整数。",
    "output": "输出第 k 小的不同子集异或值。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "0 ≤ a_i < 2^63",
      "0 ≤ k < 2^rank"
    ],
    "sampleExplanation": "1、2、4 线性独立，能产生 0 到 7，编号 5 对应值 5。",
    "hint": "构造线性基后消去每个基向量的所有低位和高位主元影响，使按主元从低到高选取的系数二进制正好对应数值顺序。",
    "targetComplexity": "时间 O(63n+63^2)，空间 O(63)。",
    "difficultyReason": "提高难度来自把普通最大异或线性基约化成可按序枚举的规范基。",
    "tests": [
      [
        "3 5\n1 2 4\n",
        "5\n"
      ],
      [
        "2 0\n7 7\n",
        "0\n"
      ],
      [
        "3 3\n3 5 6\n",
        "6\n"
      ]
    ]
  },
  {
    "id": "A1038",
    "title": "超大欧拉函数前缀",
    "seriesId": "S10",
    "difficulty": "省选",
    "tags": [
      "杜教筛",
      "欧拉函数"
    ],
    "model": "杜教筛欧拉函数和",
    "description": [
      "定义 Φ(n)=φ(1)+φ(2)+...+φ(n)，其中 φ 是欧拉函数，φ(1)=1。给定很大的 n，求 Φ(n) 对 1,000,000,007 取模。",
      "n 远超线性筛范围。需要利用恒等式 sum_{i=1..n} φ(i)·floor(n/i)=n(n+1)/2，并把相同 floor(n/i) 的区间合并递归。"
    ],
    "input": "输入一个整数 n。",
    "output": "输出 Φ(n) mod 1,000,000,007。",
    "constraints": [
      "1 ≤ n ≤ 10^11"
    ],
    "sampleExplanation": "φ(1..10) 为 1,1,2,2,4,2,6,4,6,4，总和 32。",
    "hint": "预筛一段前缀；对大 n 记忆化 S(n)，按 n/l 相同的整除分块区间扣除 S(n/l)。",
    "targetComplexity": "典型时间 O(n^(2/3))，空间 O(n^(2/3))。",
    "difficultyReason": "省选难度来自狄利克雷卷积恒等式、整除分块和记忆化边界。",
    "tests": [
      [
        "10\n",
        "32\n"
      ],
      [
        "1\n",
        "1\n"
      ],
      [
        "100000\n",
        "39650733\n"
      ]
    ]
  },
  {
    "id": "A1039",
    "title": "本原直角三角形计数",
    "seriesId": "S10",
    "difficulty": "普及+/提高",
    "tags": [
      "欧几里得公式",
      "互质枚举"
    ],
    "model": "本原勾股数组参数化",
    "description": [
      "本原直角三角形的三条边为正整数，满足 a²+b²=c² 且 gcd(a,b,c)=1。给定周长上限 N，统计不区分两条直角边顺序、周长不超过 N 的本原三角形数量。",
      "只统计本原三元组，它们的整数倍不计。每个本原三元组必须恰好统计一次。"
    ],
    "input": "输入整数 N。",
    "output": "输出满足条件的本原三角形数量。",
    "constraints": [
      "1 ≤ N ≤ 10^8"
    ],
    "sampleExplanation": "周长不超过 100 的本原三元组为 (3,4,5)、(5,12,13)、(8,15,17)、(7,24,25)、(20,21,29)、(12,35,37)、(9,40,41)，共 7 个。",
    "hint": "唯一参数化为 m>n、gcd(m,n)=1、奇偶性不同，周长等于 2m(m+n)。",
    "targetComplexity": "枚举满足周长界的 O(N) 量级参数对，空间 O(1)。",
    "difficultyReason": "普及+/提高难度来自唯一参数化条件和 64 位周长剪枝。",
    "tests": [
      [
        "100\n",
        "7\n"
      ],
      [
        "11\n",
        "0\n"
      ],
      [
        "1000\n",
        "70\n"
      ]
    ]
  },
  {
    "id": "A1137",
    "title": "线性空间公共子序列",
    "seriesId": "S11",
    "difficulty": "提高",
    "tags": [
      "Hirschberg",
      "LCS"
    ],
    "model": "Hirschberg 线性空间构造",
    "description": [
      "给定两个字符串，输出任意一个最长公共子序列。子序列可以跳过字符但不能改变相对顺序；若最长长度为 0，输出空行。",
      "普通 LCS 表可以恢复答案但需要 O(nm) 空间。这里长度乘积仍允许二次时间，却要求只使用与较短串长度同阶的辅助内存。"
    ],
    "input": "两行给出由大小写英文字母组成的字符串，可为空。",
    "output": "输出任意一个最长公共子序列。",
    "constraints": [
      "0 ≤ |A|,|B| ≤ 5000",
      "|A|·|B| ≤ 25000000"
    ],
    "sampleExplanation": "BDAB 同时是 ABCBDAB 与 BDCABA 的子序列，长度 4，达到最优。",
    "hint": "Hirschberg 将 A 对半，用正向和反向两行 DP 找到 B 的最优切分，再递归构造两半。",
    "targetComplexity": "时间 O(|A||B|)，辅助空间 O(|B|+递归深度)。",
    "difficultyReason": "提高难度来自在丢弃完整 DP 表后仍能确定恢复路径的分治切分。",
    "tests": [
      [
        "ABCBDAB\nBDCABA\n",
        "BDAB\n"
      ],
      [
        "\nABC\n",
        "\n"
      ],
      [
        "ABCDEF\nACE\n",
        "ACE\n"
      ]
    ]
  },
  {
    "id": "A1138",
    "title": "唯一前缀长度",
    "seriesId": "S11",
    "difficulty": "普及",
    "tags": [
      "字典序排序",
      "最长公共前缀"
    ],
    "model": "排序邻居唯一前缀",
    "description": [
      "词典含 n 个两两不同的小写单词。对每个单词，要找最短的非空前缀，使它不再是任何其他单词的前缀；输入保证不存在一个单词是另一个单词的前缀。",
      "答案按原输入顺序输出。一个单词与所有其他单词的最大公共前缀只可能由字典序相邻单词取得，因此无需逐对比较。"
    ],
    "input": "第一行 n，随后 n 行各一个小写单词。",
    "output": "每个单词输出一行最短唯一前缀长度。",
    "constraints": [
      "1 ≤ n ≤ 500000",
      "所有单词总长度 ≤ 2000000",
      "不存在前缀包含关系"
    ],
    "sampleExplanation": "dog 与 dove 的公共前缀为 do，因此它们都至少需要 3 个字符；duck 首字符后的 du 已唯一。",
    "hint": "排序后只比较每个单词与前驱、后继的 LCP，答案为最大值加一。",
    "targetComplexity": "时间 O(总长度·log n) 的排序比较开销，额外空间 O(n)。",
    "difficultyReason": "普及难度来自证明最大公共前缀只需查看字典序邻居。",
    "tests": [
      [
        "3\ndog\ndove\nduck\n",
        "3\n3\n2\n"
      ],
      [
        "1\ncat\n",
        "1\n"
      ],
      [
        "4\nalpha\nalpine\nbeta\nbetter\n",
        "4\n4\n4\n4\n"
      ]
    ]
  },
  {
    "id": "A1139",
    "title": "相邻交换变换串",
    "seriesId": "S11",
    "difficulty": "提高",
    "tags": [
      "树状数组",
      "逆序对"
    ],
    "model": "重复字符稳定匹配逆序计数",
    "description": [
      "一次操作可以交换字符串中相邻的两个字符。给定等长字符串 s 和 t，求把 s 变为 t 的最少操作次数；若字符多重集合不同，输出 -1。",
      "重复字符必须妥善匹配。为了最小化交叉，应把 s 中每个字符的第 j 次出现对应到 t 中同一字符的第 j 次出现，随后问题变为目标位置序列的逆序对数。"
    ],
    "input": "第一行字符串 s，第二行字符串 t，字符来自可见 ASCII 且不含空格。",
    "output": "输出最少相邻交换次数，无法变换输出 -1。",
    "constraints": [
      "1 ≤ |s|,|t| ≤ 500000"
    ],
    "sampleExplanation": "aabb 的四次出现稳定对应到 bbaa 的位置 3、4、1、2，该序列有 4 个逆序对。",
    "hint": "为 t 中每个字符保存位置队列，构造 s 的目标位置序列，再用树状数组从右向左数逆序对。",
    "targetComplexity": "时间 O(n log n)，空间 O(n)。",
    "difficultyReason": "提高难度来自重复字符的最优稳定配对证明与 64 位逆序计数。",
    "tests": [
      [
        "aabb\nbbaa\n",
        "4\n"
      ],
      [
        "x\nx\n",
        "0\n"
      ],
      [
        "abca\naacb\n",
        "3\n"
      ]
    ]
  }
]
export const algorithmBatch14Problems=rawDefinitions.map((definition,index)=>{const{tests,model,difficultyReason,...problem}=definition;return{...problem,series:seriesNames[problem.seriesId],type:'传统题',limitMs:['省选','挑战'].includes(problem.difficulty)?5000:problem.difficulty==='提高'?3000:1800,memoryMb:256,score:100,status:'',passRate:Math.max(20,74-index),submissions:36+index*4,coreModel:model,difficultyReason,referenceSolution:algorithmBatch14Solutions[problem.id],statement:{description:problem.description,input:problem.input,output:problem.output,constraints:problem.constraints,sampleExplanation:problem.sampleExplanation,hint:problem.hint,solutionOutline:problem.hint,targetComplexity:problem.targetComplexity,difficultyReason},samples:[{input:tests[0][0],output:tests[0][1]}]}})
export function getAlgorithmBatch14Tests(problemId){const definition=rawDefinitions.find(item=>item.id===problemId);if(!definition)return[];return definition.tests.map(([input,output],index)=>({name:testNames[index],score:testScores[index],input,output}))}
export function getAlgorithmBatch14Sample(problemId){const tests=getAlgorithmBatch14Tests(problemId);return tests.length?{input:tests[0].input,output:tests[0].output}:null}
export const algorithmBatch14Models=rawDefinitions.map(({id,seriesId,model})=>({id,seriesId,model}))
