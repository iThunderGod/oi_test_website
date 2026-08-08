import { algorithmBatch15Solutions } from "./algorithmBatch15Solutions.mjs"
const seriesNames={"S01":"语言基础","S02":"模拟与枚举","S03":"排序与二分","S04":"贪心","S05":"前缀和与差分","S06":"搜索","S07":"动态规划","S08":"数据结构","S09":"图论","S10":"数学","S11":"字符串"}
const testNames=["Typical structure","Boundary conditions","Comprehensive trap"]
const testScores=[30,30,40]
const rawDefinitions=[
  {
    "id": "A0139",
    "title": "格雷灯码还原",
    "seriesId": "S01",
    "difficulty": "基础",
    "tags": [
      "位运算",
      "格雷码"
    ],
    "model": "格雷码逆变换",
    "description": [
      "仓库用格雷码记录连续编号，设备只保存相邻编号变化一位的编码。给出若干编码，要求还原每个编码对应的普通二进制编号。",
      "编码按无符号 32 位整数处理，输入顺序彼此独立；最高位前导零不影响数值，输出十进制编号。"
    ],
    "input": "第一行整数 n，随后 n 个非负 32 位整数 g。",
    "output": "输出 n 个还原后的整数，空格分隔。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "0 ≤ g < 2^32"
    ],
    "sampleExplanation": "格雷码 3 的二进制为 11，依次异或高位得到 2。",
    "hint": "从高位到低位做前缀异或，或使用 x ^= x>>1、x>>2…… 的并行写法。",
    "targetComplexity": "时间 O(n)，空间 O(1)。",
    "difficultyReason": "基础难度在于理解格雷码前缀异或关系并正确使用无符号位运算。",
    "tests": [
      [
        "3\n0 1 3\n",
        "0 1 2\n"
      ],
      [
        "1\n4294967295\n",
        "2863311530\n"
      ],
      [
        "5\n2 7 4 5 6\n",
        "3 5 7 6 4\n"
      ]
    ]
  },
  {
    "id": "A0140",
    "title": "分段邮资账单",
    "seriesId": "S01",
    "difficulty": "入门",
    "tags": [
      "分支",
      "分段计费"
    ],
    "model": "分段线性计费",
    "description": [
      "邮局按重量收取费用：首重 2 千克收费 8 元，超过部分的前 3 千克每千克 3 元，再超出的部分每千克 5 元。重量以整数千克计。",
      "账单必须按顺序应用各段价格，恰好落在分界点时不进入下一段；重量为零时费用为零。"
    ],
    "input": "输入一个整数 w，表示包裹重量（千克）。",
    "output": "输出应付费用整数。",
    "constraints": [
      "0 ≤ w ≤ 10^9"
    ],
    "sampleExplanation": "重量 6 千克时，前 2 千克 8 元，接着 3 千克 9 元，最后 1 千克 5 元，共 22 元。",
    "hint": "先扣除前 2 千克，再按剩余量分两段计算。",
    "targetComplexity": "时间 O(1)，空间 O(1)。",
    "difficultyReason": "入门题，重点是分段边界和零重量处理。",
    "tests": [
      [
        "6\n",
        "22\n"
      ],
      [
        "0\n",
        "0\n"
      ],
      [
        "5\n",
        "17\n"
      ]
    ]
  },
  {
    "id": "A0141",
    "title": "交替符号校验",
    "seriesId": "S01",
    "difficulty": "普及",
    "tags": [
      "前缀扫描",
      "模运算"
    ],
    "model": "交替权值校验和",
    "description": [
      "质检码由 n 个整数构成，第 1、3、5… 项记为正号，第 2、4、6… 项记为负号。系统需要得到交替和对模数的规范余数。",
      "输入数值可能为负，结果必须落在 0 到 MOD-1；所有项只参与一次相加或相减，不需要构造中间字符串。"
    ],
    "input": "第一行整数 n，第二行 n 个整数 a_i。",
    "output": "输出 (a_1-a_2+a_3-...) mod 1000000007 的非负结果。",
    "constraints": [
      "1 ≤ n ≤ 500000",
      "|a_i| ≤ 10^18"
    ],
    "sampleExplanation": "序列 5、8、2 的交替和为 -1，规范模 1000000007 后为 1000000006。",
    "hint": "用 64 位累加并在最后统一取模，注意负数加模。",
    "targetComplexity": "时间 O(n)，空间 O(1)。",
    "difficultyReason": "普及难度来自大整数范围和负模规范化。",
    "tests": [
      [
        "3\n5 8 2\n",
        "1000000006\n"
      ],
      [
        "1\n-1000000000000000000\n",
        "49\n"
      ],
      [
        "4\n1000000000000000000 -1000000000000000000 1000000000000000000 -1000000000000000000\n",
        "0\n"
      ]
    ]
  },
  {
    "id": "A0239",
    "title": "相位闸门追踪",
    "seriesId": "S02",
    "difficulty": "基础",
    "tags": [
      "状态机",
      "模拟"
    ],
    "model": "自定义转移表追踪",
    "description": [
      "控制台有 4 个相位 0、1、2、3。收到 U 指令相位加一，收到 D 指令相位减一，均按 4 取模；X 指令保持相位但记录一次告警。",
      "初始相位为给定值，所有指令按输入顺序执行。输出最终相位和告警次数，负数取模要回到 0…3。"
    ],
    "input": "第一行整数 p，第二行由 U、D、X 组成的指令串。",
    "output": "输出最终相位与告警次数。",
    "constraints": [
      "0 ≤ p ≤ 3",
      "1 ≤ |s| ≤ 1000000"
    ],
    "sampleExplanation": "从 2 出发执行 UDXU：3、告警、2、3，最终相位 3 且告警 1 次。",
    "hint": "维护一个相位变量，每步用 (p+4)%4 归一化。",
    "targetComplexity": "时间 O(|s|)，空间 O(1)。",
    "difficultyReason": "基础难度在于顺序模拟和环形取模边界。",
    "tests": [
      [
        "2\nUDXU\n",
        "3 1\n"
      ],
      [
        "0\nD\n",
        "3 0\n"
      ],
      [
        "1\nXXXX\n",
        "1 4\n"
      ]
    ]
  },
  {
    "id": "A0240",
    "title": "三开关灯塔",
    "seriesId": "S02",
    "difficulty": "普及",
    "tags": [
      "枚举",
      "位掩码"
    ],
    "model": "真值表子集枚举",
    "description": [
      "灯塔有 n 盏灯，按编号排列。一次操作可选择任意一个开关，令该灯及其相邻两盏灯同时翻转。",
      "要求恰好通过若干次操作使目标状态出现，每个开关最多按一次；不同操作顺序视为同一种方案。请统计方案数。"
    ],
    "input": "第一行整数 n，第二行长度为 n 的 01 串 start，第三行长度为 n 的 01 串 target。",
    "output": "输出满足条件的开关子集数量。",
    "constraints": [
      "1 ≤ n ≤ 20",
      "两个字符串仅含 0、1"
    ],
    "sampleExplanation": "n=3 时按下中间开关会同时翻转三盏灯，因此从 000 到 111 有 1 种方案。",
    "hint": "枚举 2^n 个子集，计算每个被选开关影响的位掩码。",
    "targetComplexity": "时间 O(n·2^n)，空间 O(1)。",
    "difficultyReason": "普及难度来自把局部翻转转成位掩码并避免重复计数。",
    "tests": [
      [
        "3\n000\n111\n",
        "1\n"
      ],
      [
        "1\n0\n0\n",
        "1\n"
      ],
      [
        "4\n0000\n0101\n",
        "2\n"
      ]
    ]
  },
  {
    "id": "A0241",
    "title": "禁邻位串计数",
    "seriesId": "S02",
    "difficulty": "普及",
    "tags": [
      "DFS",
      "组合枚举"
    ],
    "model": "位串合法枚举",
    "description": [
      "实验室排班用 0/1 表示休息与值班，相邻两天不能同时值班。给定长度 n，统计所有合法排班数量。",
      "第一个和最后一个位置不相邻，只有线性相邻约束；不要求输出具体排班，答案保证在 64 位无符号范围内。"
    ],
    "input": "输入整数 n。",
    "output": "输出合法 01 串数量。",
    "constraints": [
      "1 ≤ n ≤ 90"
    ],
    "sampleExplanation": "n=4 的合法数量为 8，递推为 f(n)=f(n-1)+f(n-2)。",
    "hint": "按最后一位是否为 0/1 分类，得到斐波那契型递推。",
    "targetComplexity": "时间 O(n)，空间 O(1)。",
    "difficultyReason": "普及难度来自将枚举约束压缩成两状态递推。",
    "tests": [
      [
        "4\n",
        "8\n"
      ],
      [
        "1\n",
        "2\n"
      ],
      [
        "8\n",
        "55\n"
      ]
    ]
  },
  {
    "id": "A0339",
    "title": "排序后的首个缺口",
    "seriesId": "S03",
    "difficulty": "基础",
    "tags": [
      "排序",
      "MEX"
    ],
    "model": "非负集合 MEX",
    "description": [
      "仪表盘收集了一组非负编号，编号可能重复且无序。需要找出从 0 开始第一个没有出现的编号，即 MEX。",
      "重复编号只算一次；输入保证所有编号不超过 n+1，因此可以在线性标记完成，排序仅用于强调无序输入。"
    ],
    "input": "第一行整数 n，第二行 n 个非负整数。",
    "output": "输出最小的未出现非负整数。",
    "constraints": [
      "1 ≤ n ≤ 500000",
      "0 ≤ a_i ≤ n+1"
    ],
    "sampleExplanation": "集合 {0,1,2,4} 的首个缺口是 3。",
    "hint": "建立 n+2 大小的标记数组，扫描从 0 开始寻找未标记位置。",
    "targetComplexity": "时间 O(n)，空间 O(n)。",
    "difficultyReason": "基础难度在于处理重复值和缺口可能为 n+1 的边界。",
    "tests": [
      [
        "5\n0 1 2 4 4\n",
        "3\n"
      ],
      [
        "3\n1 1 2\n",
        "0\n"
      ],
      [
        "4\n0 1 2 3\n",
        "4\n"
      ]
    ]
  },
  {
    "id": "A0340",
    "title": "三数最近值",
    "seriesId": "S03",
    "difficulty": "普及",
    "tags": [
      "排序",
      "双指针"
    ],
    "model": "三数和最接近",
    "description": [
      "给定 n 个整数和目标 T，选择三个不同下标，使三数之和与 T 的绝对差最小。若有多个和达到同样差值，输出其中数值较小的和。",
      "数组可含负数和重复值；只需输出最优和，不要求输出下标。"
    ],
    "input": "第一行 n、T，第二行 n 个整数。",
    "output": "输出最优三数之和。",
    "constraints": [
      "3 ≤ n ≤ 2000",
      "|a_i|,|T| ≤ 10^9"
    ],
    "sampleExplanation": "排序后固定一个数，左右指针移动即可在线性扫描剩余区间。",
    "hint": "排序后枚举 i，比较和与 T 的关系并移动左右指针。",
    "targetComplexity": "时间 O(n^2)，空间 O(1)（不计排序栈）。",
    "difficultyReason": "普及难度来自双指针移动和并列答案的确定性规则。",
    "tests": [
      [
        "4 1\n-1 2 1 4\n",
        "2\n"
      ],
      [
        "3 100\n1 2 3\n",
        "6\n"
      ],
      [
        "6 0\n-5 -2 0 1 3 8\n",
        "-1\n"
      ]
    ]
  },
  {
    "id": "A0341",
    "title": "绝对值稳定序",
    "seriesId": "S03",
    "difficulty": "基础",
    "tags": [
      "稳定排序",
      "自定义比较"
    ],
    "model": "绝对值稳定排序",
    "description": [
      "传感器希望按读数绝对值从小到大排列，绝对值相同的记录保持原输入顺序，便于追溯来源。",
      "读数可为负且可能达到 64 位边界，比较绝对值时不能直接对最小负数取有符号相反数；输出原始读数。"
    ],
    "input": "第一行 n，第二行 n 个 64 位有符号整数。",
    "output": "输出稳定按绝对值升序后的序列。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "-2^63 ≤ a_i < 2^63"
    ],
    "sampleExplanation": "-3 与 3 绝对值相同，-3 先出现所以仍排在 3 前。",
    "hint": "转为无符号后计算绝对值 key，再使用 stable_sort。",
    "targetComplexity": "时间 O(n log n)，空间 O(n)。",
    "difficultyReason": "基础难度在于稳定性和最小负数绝对值的安全处理。",
    "tests": [
      [
        "5\n-3 1 3 -2 0\n",
        "0 1 -2 -3 3\n"
      ],
      [
        "1\n-9223372036854775808\n",
        "-9223372036854775808\n"
      ],
      [
        "4\n2 -2 1 -1\n",
        "1 -1 2 -2\n"
      ]
    ]
  },
  {
    "id": "A0439",
    "title": "环带摄像头覆盖",
    "seriesId": "S04",
    "difficulty": "普及+/提高",
    "tags": [
      "贪心",
      "圆环区间"
    ],
    "model": "圆环区间最少覆盖",
    "description": [
      "一条长度为 L 的环形走廊上有若干摄像头覆盖区间 [l,r]，区间可能跨过 0 点。需要选择尽量少的摄像头覆盖整条环。",
      "覆盖端点视为包含，摄像头可以重复选择但重复没有意义；若无法覆盖整环输出 -1。"
    ],
    "input": "第一行 L、n，随后 n 行给出起点 l 和顺时针长度 len（0 < len ≤ L）。",
    "output": "输出最少摄像头数量或 -1。",
    "constraints": [
      "1 ≤ L ≤ 100000",
      "1 ≤ n ≤ 200000",
      "0 ≤ l < L"
    ],
    "sampleExplanation": "把跨 0 区间拆成线段后，枚举覆盖起点并用线性区间贪心。",
    "hint": "复制区间到 [0,2L)，枚举一个包含 0 的区间作为首段，再按最早结束贪心扩展。",
    "targetComplexity": "时间 O(n^2) 的直接枚举仅适合小数据；目标 O(n log n) 可排序后双指针。",
    "difficultyReason": "提高难度来自环形断点选择与区间覆盖贪心证明。",
    "tests": [
      [
        "10 3\n0 4\n4 4\n8 4\n",
        "3\n"
      ],
      [
        "10 2\n0 3\n5 3\n",
        "-1\n"
      ],
      [
        "12 4\n10 5\n3 4\n7 4\n0 2\n",
        "3\n"
      ]
    ]
  },
  {
    "id": "A0440",
    "title": "跳台最远可达",
    "seriesId": "S04",
    "difficulty": "基础",
    "tags": [
      "贪心",
      "区间可达"
    ],
    "model": "前缀可达区间",
    "description": [
      "台阶编号从 0 到 n-1，第 i 级写着最多可前进 jump[i] 级。站在 0 级，每次可跳到不超过 jump[i] 的后续台阶。",
      "只要某一层无法从已达区域进入，过程立即失败；判断是否能到达最后一级。"
    ],
    "input": "第一行 n，第二行 n 个非负整数 jump。",
    "output": "能到达输出 YES，否则输出 NO。",
    "constraints": [
      "1 ≤ n ≤ 500000",
      "0 ≤ jump[i] ≤ 10^9"
    ],
    "sampleExplanation": "扫描维护当前可达最右位置，若下标超过它则无法继续。",
    "hint": "贪心维护 reach=max(reach,i+jump[i])。",
    "targetComplexity": "时间 O(n)，空间 O(1)。",
    "difficultyReason": "基础难度在于识别可达前缀的单调性。",
    "tests": [
      [
        "5\n2 3 1 1 0\n",
        "YES\n"
      ],
      [
        "1\n0\n",
        "YES\n"
      ],
      [
        "5\n1 0 1 0 0\n",
        "NO\n"
      ]
    ]
  },
  {
    "id": "A0441",
    "title": "一次换位最大数",
    "seriesId": "S04",
    "difficulty": "普及",
    "tags": [
      "贪心",
      "字符串"
    ],
    "model": "首个提升位交换",
    "description": [
      "给定一个十进制数字串，最多交换一次任意两个位置，要求得到的数值最大。数字串首位不为 0，交换后仍按普通十进制比较。",
      "若最优结果有多种交换，输出结果即可；没有提升时原串就是答案。"
    ],
    "input": "输入一个长度为 n 的数字串 s。",
    "output": "输出最多交换一次后的最大数字串。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "s 仅含数字且首位非 0"
    ],
    "sampleExplanation": "2736 将首位 2 与末尾 7 交换得到 7236。",
    "hint": "从右向左记录每个数字最后出现位置，左到右找第一个可被更大数字替换的位置。",
    "targetComplexity": "时间 O(n+10)，空间 O(10)。",
    "difficultyReason": "普及难度来自一次交换的最优位置和重复数字最后位置处理。",
    "tests": [
      [
        "2736\n",
        "7236\n"
      ],
      [
        "1\n9\n",
        "9\n"
      ],
      [
        "98368\n",
        "98863\n"
      ]
    ]
  },
  {
    "id": "A0539",
    "title": "子矩形最大总和",
    "seriesId": "S05",
    "difficulty": "提高",
    "tags": [
      "二维前缀和",
      "Kadane"
    ],
    "model": "压缩行最大子矩形",
    "description": [
      "农田收益由 n×m 个整数给出，要选择一个非空连续子矩形，使其中收益总和最大。收益可以为负，仍必须选择至少一个格子。",
      "矩形边界与网格线对齐，允许只选一行或一列；输出最大总和，不要求给出矩形位置。"
    ],
    "input": "第一行 n、m，随后 n 行矩阵。",
    "output": "输出最大子矩形和。",
    "constraints": [
      "1 ≤ n,m ≤ 200",
      "|a_ij| ≤ 10^6"
    ],
    "sampleExplanation": "固定上下边界后把列压成一维，再用 Kadane 求最佳连续列段。",
    "hint": "枚举较小维度的边界并压缩另一维，注意全负矩阵时不能初始化为 0。",
    "targetComplexity": "时间 O(min(n,m)^2·max(n,m))，空间 O(max(n,m))。",
    "difficultyReason": "提高难度来自二维降维和全负边界。",
    "tests": [
      [
        "3 4\n-1 2 3 -2\n4 -5 6 1\n-3 2 -1 5\n",
        "13\n"
      ],
      [
        "1 3\n-5 -2 -7\n",
        "-2\n"
      ],
      [
        "2 2\n1000000 -1000000\n-1000000 1000000\n",
        "1000000\n"
      ]
    ]
  },
  {
    "id": "A0540",
    "title": "区间等差加法",
    "seriesId": "S05",
    "difficulty": "提高",
    "tags": [
      "差分",
      "等差数列"
    ],
    "model": "等差区间更新",
    "description": [
      "长度为 n 的数组初始为 0。一次操作选择 [l,r]，从位置 l 开始依次加上首项 a、公差 d 的等差数列。",
      "所有操作完成后输出数组；不同操作叠加，公差可为负。需要在线性时间恢复每个位置的总值。"
    ],
    "input": "第一行 n、m；随后 m 行 l、r、a、d。",
    "output": "输出最终 n 个整数。",
    "constraints": [
      "1 ≤ n,m ≤ 200000",
      "|a|,|d| ≤ 10^9"
    ],
    "sampleExplanation": "可用两条差分数组分别维护等差项的常数部分和斜率部分。",
    "hint": "对 b_i= a+d(i-l) 展开为 d·i+(a-dl)，分别对系数做区间差分。",
    "targetComplexity": "时间 O(n+m)，空间 O(n)。",
    "difficultyReason": "提高难度在于把区间等差更新拆成线性函数的两个差分。",
    "tests": [
      [
        "5 2\n1 3 2 1\n2 5 5 -1\n",
        "2 6 8 4 1\n"
      ],
      [
        "1 1\n1 1 -3 7\n",
        "-3\n"
      ],
      [
        "4 3\n1 4 1 2\n2 3 10 -5\n3 4 -2 0\n",
        "1 13 9 7\n"
      ]
    ]
  },
  {
    "id": "A0541",
    "title": "总和差最小切点",
    "seriesId": "S05",
    "difficulty": "基础",
    "tags": [
      "前缀和",
      "扫描"
    ],
    "model": "总和差平衡切分",
    "description": [
      "把数组在某个相邻位置切成左右两段，要求两段都非空。定义代价为左右段和之差的绝对值，寻找代价最小的切点。",
      "若多个切点代价相同，输出最小的切点位置（左段长度）。数组元素可为负。"
    ],
    "input": "第一行 n，第二行 n 个整数。",
    "output": "输出切点位置和最小代价。",
    "constraints": [
      "2 ≤ n ≤ 500000",
      "|a_i| ≤ 10^12"
    ],
    "sampleExplanation": "计算前缀和 pref，右段为 total-pref，在一次扫描中比较差值。",
    "hint": "切点从 1 到 n-1 扫描，使用 128 位临时值避免溢出。",
    "targetComplexity": "时间 O(n)，空间 O(1)。",
    "difficultyReason": "基础难度来自负数数组和并列切点的稳定选择。",
    "tests": [
      [
        "5\n1 2 3 4 5\n",
        "2 5\n"
      ],
      [
        "2\n-7 3\n",
        "1 10\n"
      ],
      [
        "4\n5 -5 5 -5\n",
        "1 0\n"
      ]
    ]
  },
  {
    "id": "A0639",
    "title": "网格单词寻路",
    "seriesId": "S06",
    "difficulty": "普及",
    "tags": [
      "DFS",
      "回溯"
    ],
    "model": "网格单词路径回溯",
    "description": [
      "字母网格中，从任意格子出发，每一步可上下左右移动，且同一格子在一条路径中最多使用一次。请判断能否拼出给定单词。",
      "路径必须按单词字符顺序匹配，不能斜走；找到一条即可停止，找不到输出 NO。"
    ],
    "input": "第一行 n、m，随后 n 行小写字母网格，最后一行目标单词 w。",
    "output": "存在路径输出 YES，否则输出 NO。",
    "constraints": [
      "1 ≤ n,m ≤ 12",
      "1 ≤ |w| ≤ 20"
    ],
    "sampleExplanation": "从首字符开始 DFS，并在递归返回时撤销 visited 标记。",
    "hint": "以每个匹配首字符为起点回溯，四方向尝试并剪枝剩余长度。",
    "targetComplexity": "最坏 O(nm·4^{|w|})，空间 O(nm+|w|)。",
    "difficultyReason": "普及难度来自回溯状态恢复和不能重复使用格子的约束。",
    "tests": [
      [
        "3 4\nabce\nsfcs\nadee\nsee\n",
        "YES\n"
      ],
      [
        "1 1\na\na\n",
        "YES\n"
      ],
      [
        "2 2\nab\ncd\nacb\n",
        "NO\n"
      ]
    ]
  },
  {
    "id": "A0640",
    "title": "旋管连通出口",
    "seriesId": "S06",
    "difficulty": "提高",
    "tags": [
      "BFS",
      "状态图"
    ],
    "model": "带方向管道连通搜索",
    "description": [
      "工厂地面由管道格组成，每格字符表示开口方向：I 上下、- 左右、L 左上、J 右上、7 右下、F 左下，. 表示空地。水从 S 出发，只能沿双方都有开口的相邻管道流动。",
      "S 和 T 视为四向全开口，水可经过任意管道格；求最少经过的格子步数，无法到达输出 -1。"
    ],
    "input": "第一行 n、m，随后 n 行字符网格，含 S、T、管道字符和 .。",
    "output": "输出 S 到 T 的最短移动步数。",
    "constraints": [
      "1 ≤ n,m ≤ 500",
      "网格中恰有一个 S 和一个 T"
    ],
    "sampleExplanation": "相邻两格必须互相开口，普通 BFS 即可在隐式状态图上求最短路。",
    "hint": "为每种管道预存四方向 bit，检查当前方向与邻格反向同时存在。",
    "targetComplexity": "时间 O(nm)，空间 O(nm)。",
    "difficultyReason": "提高难度来自方向兼容判定和隐式图建模。",
    "tests": [
      [
        "3 3\nS-I\n.7T\n...\n",
        "3\n"
      ],
      [
        "1 2\nST\n",
        "1\n"
      ],
      [
        "2 2\nS.\n.T\n",
        "-1\n"
      ]
    ]
  },
  {
    "id": "A0641",
    "title": "字母传送网格",
    "seriesId": "S06",
    "difficulty": "普及+/提高",
    "tags": [
      "BFS",
      "传送门"
    ],
    "model": "同标记一次扩展 BFS",
    "description": [
      "网格中小写字母相同的格子互为传送门。上下左右移动代价 1，第一次从某字母格触发传送可在代价 1 内到达所有同字母格；每个字母的传送列表只需展开一次。",
      "S、T 各出现一次，# 为墙。求最短代价，若不可达输出 -1。"
    ],
    "input": "第一行 n、m，随后 n 行网格，含 S、T、.、# 和小写字母。",
    "output": "输出最短代价。",
    "constraints": [
      "1 ≤ n,m ≤ 1000",
      "每个小写字母出现次数总计不超过 n·m"
    ],
    "sampleExplanation": "BFS 队列保存格子，首次遇到某字母时批量加入其全部位置并标记已展开。",
    "hint": "预先收集 26 个字母的位置，避免重复扫描造成平方复杂度。",
    "targetComplexity": "时间 O(nm)，空间 O(nm)。",
    "difficultyReason": "普及+/提高难度来自传送边的一次性展开优化。",
    "tests": [
      [
        "3 5\nS.a..\n###a#\n..a.T\n",
        "5\n"
      ],
      [
        "1 2\nST\n",
        "1\n"
      ],
      [
        "2 3\nS#T\naaa\n",
        "-1\n"
      ]
    ]
  },
  {
    "id": "A0772",
    "title": "最长交替子序列",
    "seriesId": "S07",
    "difficulty": "基础",
    "tags": [
      "动态规划",
      "序列"
    ],
    "model": "交替方向子序列 DP",
    "description": [
      "选择一个子序列，使相邻选中元素严格一升一降交替，长度尽可能大。子序列保持原顺序但可以跳过元素。",
      "长度为 1 的序列合法；相等元素不能作为上升或下降。只需输出最大长度。"
    ],
    "input": "第一行 n，第二行 n 个整数。",
    "output": "输出最长交替子序列长度。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "|a_i| ≤ 10^9"
    ],
    "sampleExplanation": "维护以最后一步上升或下降结尾的最佳长度，扫描时更新两个状态。",
    "hint": "up=max(up,down+1) 在 a_i>a_j 时成立，down 对称更新。",
    "targetComplexity": "时间 O(n)，空间 O(1)。",
    "difficultyReason": "基础难度在于两个方向状态的定义与相等值处理。",
    "tests": [
      [
        "7\n1 7 4 9 2 5 1\n",
        "6\n"
      ],
      [
        "1\n42\n",
        "1\n"
      ],
      [
        "5\n3 3 3 3 3\n",
        "1\n"
      ]
    ]
  },
  {
    "id": "A0773",
    "title": "恰好分段的最大和",
    "seriesId": "S07",
    "difficulty": "提高",
    "tags": [
      "动态规划",
      "分组分割"
    ],
    "model": "恰分段线性代价 DP",
    "description": [
      "把长度 n 的正整数数组切成恰好 k 个非空连续段，每段贡献该段元素和的平方。求总贡献最大值。",
      "切点顺序从左到右，段内元素不重排；若 k>n 无解，输出 -1。答案使用 64 位有符号整数范围。"
    ],
    "input": "第一行 n、k，第二行 n 个整数。",
    "output": "输出最大总贡献或 -1。",
    "constraints": [
      "1 ≤ k ≤ n ≤ 200",
      "1 ≤ a_i ≤ 10^6"
    ],
    "sampleExplanation": "前缀和可 O(1) 计算任意段和，状态 dp[g][i] 表示前 i 个元素分成 g 段的最大值。",
    "hint": "枚举最后一段起点 j，转移 dp[g][i]=max(dp[g-1][j-1]+(pref[i]-pref[j-1])²)。",
    "targetComplexity": "时间 O(k n²)，空间 O(kn)。",
    "difficultyReason": "提高难度来自恰好分段约束、负无穷初始化和平方溢出。",
    "tests": [
      [
        "4 2\n1 2 3 4\n",
        "52\n"
      ],
      [
        "3 3\n5 1 2\n",
        "30\n"
      ],
      [
        "5 2\n10 1 1 10 1\n",
        "244\n"
      ]
    ]
  },
  {
    "id": "A0841",
    "title": "区间仿射求和",
    "seriesId": "S08",
    "difficulty": "提高",
    "tags": [
      "线段树",
      "懒标记"
    ],
    "model": "仿射懒标记线段树",
    "description": [
      "数组支持三类操作：把区间每项乘 c、把区间每项加 d、查询区间和。所有运算对 1000000007 取模。",
      "操作按输入顺序执行，乘法和加法可以叠加；查询只输出当前值，不改变数组。"
    ],
    "input": "第一行 n、q，第二行初始数组；随后 q 行操作 1 l r c（乘）、2 l r d（加）或 3 l r（求和）。",
    "output": "每个查询操作输出一行区间和。",
    "constraints": [
      "1 ≤ n,q ≤ 200000",
      "0 ≤ 初始值,c,d < MOD"
    ],
    "sampleExplanation": "懒标记组合为 x→mul·x+add，先乘后加时更新 add 也要乘。",
    "hint": "线段树节点保存和，标记维护复合仿射函数。",
    "targetComplexity": "时间 O((n+q)log n)，空间 O(n)。",
    "difficultyReason": "提高难度来自乘加标记的复合顺序和模运算。",
    "tests": [
      [
        "3 4\n1 2 3\n3 1 3\n1 1 2 2\n2 2 3 5\n3 1 3\n",
        "6\n15\n"
      ],
      [
        "1 3\n7\n1 1 1 0\n2 1 1 4\n3 1 1\n",
        "4\n"
      ],
      [
        "4 3\n1 1 1 1\n2 1 4 1000000006\n1 2 3 1000000006\n3 1 4\n",
        "1000000003\n"
      ]
    ]
  },
  {
    "id": "A0842",
    "title": "分支版本栈",
    "seriesId": "S08",
    "difficulty": "普及",
    "tags": [
      "可持久化",
      "栈"
    ],
    "model": "可持久化栈分支",
    "description": [
      "每个版本是一份独立栈，初始版本 0 为空。新版本可从任意旧版本复制后执行一次 PUSH x、POP 或 TOP。",
      "POP 空栈输出 EMPTY 并生成仍为空的新版本；TOP 只查询不改变栈。版本编号按操作顺序递增，后续操作可引用任何已有版本。"
    ],
    "input": "第一行 q；随后每行 base op [x]，op 为 PUSH、POP 或 TOP。",
    "output": "对每个 TOP/空 POP 输出一行；每个操作都创建新版本。",
    "constraints": [
      "1 ≤ q ≤ 200000",
      "|x| ≤ 10^9"
    ],
    "sampleExplanation": "用持久化链表保存栈顶和父指针，复制版本只需记录一个指针。",
    "hint": "PUSH 新建节点指向 base 栈顶；POP 直接跳到父节点。",
    "targetComplexity": "时间 O(q)，空间 O(q)。",
    "difficultyReason": "普及难度来自版本分支语义和空栈操作的输出规则。",
    "tests": [
      [
        "5\n0 PUSH 3\n1 PUSH 5\n2 TOP\n1 TOP\n2 POP\n",
        "5\n3\n"
      ],
      [
        "2\n0 POP\n1 TOP\n",
        "EMPTY\nEMPTY\n"
      ],
      [
        "6\n0 PUSH 1\n1 PUSH 2\n2 POP\n3 TOP\n1 PUSH 9\n5 TOP\n",
        "1\n9\n"
      ]
    ]
  },
  {
    "id": "A0941",
    "title": "树上最远距离",
    "seriesId": "S09",
    "difficulty": "基础",
    "tags": [
      "树",
      "两次 BFS"
    ],
    "model": "树直径双扫描",
    "description": [
      "给定一棵无权树，定义任意两点间最短边数的最大值为树的直径。请输出直径长度。",
      "树保证连通且无重边；从任意点出发找到最远点，再从该点出发的最远距离就是直径。"
    ],
    "input": "第一行 n，随后 n-1 行无向边 u v。",
    "output": "输出树直径边数。",
    "constraints": [
      "1 ≤ n ≤ 200000",
      "1 ≤ u,v ≤ n"
    ],
    "sampleExplanation": "链 1-2-3-4 的两次 BFS 得到端点 1 与 4，距离为 3。",
    "hint": "两次 BFS/DFS，记录最远顶点及距离。",
    "targetComplexity": "时间 O(n)，空间 O(n)。",
    "difficultyReason": "基础难度在于树直径性质和大图遍历实现。",
    "tests": [
      [
        "4\n1 2\n2 3\n3 4\n",
        "3\n"
      ],
      [
        "1\n",
        "0\n"
      ],
      [
        "5\n1 2\n1 3\n1 4\n1 5\n",
        "2\n"
      ]
    ]
  },
  {
    "id": "A0942",
    "title": "模图生成树计数",
    "seriesId": "S09",
    "difficulty": "挑战",
    "tags": [
      "矩阵树定理",
      "高斯消元"
    ],
    "model": "Kirchhoff 生成树行列式",
    "description": [
      "给定一个无向多重图，询问其不同生成树数量。平行边视为不同边，生成树必须连接全部顶点且不含环。",
      "答案对质数 1000000007 取模；若图不连通则答案为 0。使用拉普拉斯矩阵删除任意一行一列后的行列式计算。"
    ],
    "input": "第一行 n、m，随后 m 行无向边 u v。",
    "output": "输出生成树数量模 MOD。",
    "constraints": [
      "1 ≤ n ≤ 120",
      "0 ≤ m ≤ 5000",
      "1 ≤ u,v ≤ n，u≠v"
    ],
    "sampleExplanation": "三角形有 3 棵生成树，删去第 n 行列后行列式为 3。",
    "hint": "构造度数对角减邻接的拉普拉斯矩阵，在模质数下做高斯消元求行列式。",
    "targetComplexity": "时间 O(n³)，空间 O(n²)。",
    "difficultyReason": "挑战难度对应矩阵树定理与模域消元的组合使用。",
    "tests": [
      [
        "3 3\n1 2\n2 3\n1 3\n",
        "3\n"
      ],
      [
        "1 0\n",
        "1\n"
      ],
      [
        "4 2\n1 2\n3 4\n",
        "0\n"
      ]
    ]
  },
  {
    "id": "A1040",
    "title": "五边形分拆数",
    "seriesId": "S10",
    "difficulty": "提高",
    "tags": [
      "数论",
      "递推"
    ],
    "model": "广义五边形分拆递推",
    "description": [
      "整数 n 的分拆是若干正整数之和，顺序不计。请计算 n 的分拆数量。",
      "采用欧拉广义五边形数递推并对 1000000007 取模，p(0)=1；负下标项视为 0。"
    ],
    "input": "输入整数 n。",
    "output": "输出 p(n) mod 1000000007。",
    "constraints": [
      "0 ≤ n ≤ 200000"
    ],
    "sampleExplanation": "5 的分拆共有 7 种。递推每次加入 k(3k±1)/2 的正负符号项。",
    "hint": "枚举 k=1,2…，对 n-g1、n-g2 加上或减去 dp 值。",
    "targetComplexity": "时间 O(n√n)，空间 O(n)。",
    "difficultyReason": "提高难度来自广义五边形数的符号分组和模负数处理。",
    "tests": [
      [
        "5\n",
        "7\n"
      ],
      [
        "0\n",
        "1\n"
      ],
      [
        "10\n",
        "42\n"
      ]
    ]
  },
  {
    "id": "A1041",
    "title": "快速倍增斐波那契",
    "seriesId": "S10",
    "difficulty": "普及",
    "tags": [
      "数论",
      "快速幂"
    ],
    "model": "斐波那契快速倍增",
    "description": [
      "定义 F0=0、F1=1、F(n)=F(n-1)+F(n-2)，求 F(n) 对 1000000007 的余数。",
      "n 可达 10^18，必须利用对数级递推；输入 0 时直接输出 0。"
    ],
    "input": "输入无符号整数 n。",
    "output": "输出 F(n) mod 1000000007。",
    "constraints": [
      "0 ≤ n ≤ 10^18"
    ],
    "sampleExplanation": "倍增公式同时计算 F(2k) 与 F(2k+1)，递归深度仅 O(log n)。",
    "hint": "使用 (F(k)*(2F(k+1)-F(k)), F(k)^2+F(k+1)^2) 公式。",
    "targetComplexity": "时间 O(log n)，空间 O(log n)。",
    "difficultyReason": "普及难度来自大下标和模意义下的倍增公式。",
    "tests": [
      [
        "10\n",
        "55\n"
      ],
      [
        "0\n",
        "0\n"
      ],
      [
        "1000000000000000000\n",
        "209783453\n"
      ]
    ]
  },
  {
    "id": "A1042",
    "title": "组合数质因子指数",
    "seriesId": "S10",
    "difficulty": "基础",
    "tags": [
      "数论",
      "阶乘分解"
    ],
    "model": "组合数素因子指数",
    "description": [
      "给定 n、k 和质数 p，求二项式系数 C(n,k) 中 p 的指数，即最大的 e 使 p^e 整除 C(n,k)。",
      "不需要计算组合数本身；k>n 时答案为 0。n 可很大但 p 至少为 2。"
    ],
    "input": "输入 n、k、p。",
    "output": "输出指数 e。",
    "constraints": [
      "0 ≤ k ≤ n ≤ 10^18",
      "p 为质数且 p ≤ 10^9"
    ],
    "sampleExplanation": "利用 Legendre 公式分别计算 n!、k!、(n-k)! 中 p 的指数并相减。",
    "hint": "v_p(n!)=⌊n/p⌋+⌊n/p²⌋+…，三次求和即可。",
    "targetComplexity": "时间 O(log_p n)，空间 O(1)。",
    "difficultyReason": "基础难度在于阶乘指数公式与 64 位整除循环。",
    "tests": [
      [
        "10 3 2\n",
        "3\n"
      ],
      [
        "5 0 7\n",
        "0\n"
      ],
      [
        "1000000000000 500000000000 3\n",
        "6\n"
      ]
    ]
  },
  {
    "id": "A1140",
    "title": "子序列自动机查询",
    "seriesId": "S11",
    "difficulty": "普及",
    "tags": [
      "字符串",
      "子序列"
    ],
    "model": "子序列自动机跳转",
    "description": [
      "给定文本串 s，多次询问模式串 t 是否能作为 s 的子序列出现。子序列允许跳过字符但保持顺序。",
      "每次查询彼此独立，空模式串视为 YES；字符仅含小写字母，需快速跳转到下一个出现位置。"
    ],
    "input": "第一行文本串 s，第二行整数 q，随后 q 行模式串 t。",
    "output": "每个查询输出 YES 或 NO。",
    "constraints": [
      "1 ≤ |s| ≤ 500000",
      "1 ≤ q ≤ 200000",
      "所有模式串总长度 ≤ 500000"
    ],
    "sampleExplanation": "预处理每个位置之后的下一个字符位置，查询时贪心跳转即可。",
    "hint": "建立 next[pos][26] 或位置表，沿模式串逐字符寻找下一个位置。",
    "targetComplexity": "预处理 O(26|s|)，查询总计 O(总长度)，空间 O(26|s|)。",
    "difficultyReason": "普及难度来自批量查询的预处理与边界位置处理。",
    "tests": [
      [
        "abcde\n3\nace\naec\n\n",
        "YES\nNO\nYES\n"
      ],
      [
        "a\n2\na\nb\n",
        "YES\nNO\n"
      ],
      [
        "abacaba\n2\naaab\nacab\n",
        "YES\nYES\n"
      ]
    ]
  },
  {
    "id": "A1141",
    "title": "最短缺失子串",
    "seriesId": "S11",
    "difficulty": "基础",
    "tags": [
      "字符串",
      "集合枚举"
    ],
    "model": "最短不存在子串",
    "description": [
      "给定只含 a、b 的字符串，寻找一个最短的、没有在原串中作为连续子串出现的非空字符串。",
      "若同长度有多个答案，输出字典序较小者；由于字母表很小，可按长度从 1 开始枚举所有候选。"
    ],
    "input": "输入字符串 s。",
    "output": "输出最短缺失子串。",
    "constraints": [
      "1 ≤ |s| ≤ 2000",
      "s 仅含 a、b"
    ],
    "sampleExplanation": "先检查 a、b 是否出现，再检查长度 2、3… 的候选集合。",
    "hint": "把所有长度 len 的窗口放入集合，按字典序扫描 2^len 个候选。",
    "targetComplexity": "最坏 O(n²)，空间 O(n)。",
    "difficultyReason": "基础难度在于枚举顺序、子串与子序列的区别。",
    "tests": [
      [
        "ab\n",
        "aa\n"
      ],
      [
        "a\n",
        "b\n"
      ],
      [
        "abab\n",
        "aaa\n"
      ]
    ]
  },
  {
    "id": "A1142",
    "title": "重复字符排列排名",
    "seriesId": "S11",
    "difficulty": "提高",
    "tags": [
      "组合数学",
      "树状数组"
    ],
    "model": "多重集排列字典序排名",
    "description": [
      "给定一个由小写字母组成的字符串 s，将其所有不同排列按字典序从 1 开始编号，求 s 本身的排名。",
      "重复字符只产生一个排列，排名对 1000000007 取模；每一步统计放置更小字符所能形成的排列数。"
    ],
    "input": "输入字符串 s。",
    "output": "输出字典序排名 mod MOD。",
    "constraints": [
      "1 ≤ |s| ≤ 200000",
      "s 仅含小写字母"
    ],
    "sampleExplanation": "用剩余字符计数和阶乘逆元计算每个位置之前的排列贡献。",
    "hint": "枚举当前位置可用的小字符，贡献为 (剩余长度-1)! / 各字符计数!，再消耗当前字符。",
    "targetComplexity": "时间 O(26n)，空间 O(n)。",
    "difficultyReason": "提高难度来自多重集合排列计数和模逆元预处理。",
    "tests": [
      [
        "aabb\n",
        "1\n"
      ],
      [
        "ba\n",
        "2\n"
      ],
      [
        "abc\n",
        "1\n"
      ]
    ]
  }
]
export const algorithmBatch15Problems=rawDefinitions.map(definition=>{const{tests,model,difficultyReason,...problem}=definition;return{...problem,series:seriesNames[problem.seriesId],type:"传统题",limitMs:["省选","挑战"].includes(problem.difficulty)?5000:problem.difficulty==="提高"?3000:1800,memoryMb:256,score:100,status:"",passRate:Math.max(20,74-rawDefinitions.indexOf(definition)),submissions:40+rawDefinitions.indexOf(definition)*3,coreModel:model,difficultyReason,referenceSolution:algorithmBatch15Solutions[problem.id],statement:{description:problem.description,input:problem.input,output:problem.output,constraints:problem.constraints,sampleExplanation:problem.sampleExplanation,hint:problem.hint,solutionOutline:problem.hint,targetComplexity:problem.targetComplexity,difficultyReason},samples:[{input:tests[0][0],output:tests[0][1]}]}})
export function getAlgorithmBatch15Tests(problemId){const d=rawDefinitions.find(x=>x.id===problemId);return d?d.tests.map(([input,output],i)=>({name:testNames[i],score:testScores[i],input,output})):[]}
export function getAlgorithmBatch15Sample(problemId){const t=getAlgorithmBatch15Tests(problemId);return t.length?{input:t[0].input,output:t[0].output}:null}
export const algorithmBatch15Models=rawDefinitions.map(({id,seriesId,model})=>({id,seriesId,model}))
