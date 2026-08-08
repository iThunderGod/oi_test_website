# Algo Arena

面向 OI / ACM 学习者的一站式算法训练平台。当前已经完成前端主流程、算法 AI 代理和本地 Online Judge 第一版。

## 已完成

- 学习概览：训练数据、推荐题目、专题进度与继续学习
- Online Judge：483 道原创算法题，覆盖 11 个系列，并按题号和难度排序
- 题目工作台：动态题面、样例、自定义输入、运行样例、完整提交评测、测试点结果和本题提交记录
- 本地评测服务：C++17 编译运行、逐测试点判定、按测试点计分、CE/WA/TLE/RE/AC 状态
- 算法 AI：真实流式对话、历史会话、停止/重试/复制、图片附件和代码片段模式
- 字体与可读性：已把原来过小的页面文字系统性放大

## ACM 模拟竞赛

已新增独立模块“ACM 模拟竞赛”，首套为 **北陆区域赛模拟 2026**：共 10 题（A–J），以真实区域赛的推进节奏编排，而非按 OI 专题分散出题。A、B 为签到与热身，C–G 覆盖时间依赖最短路、区间 DP、折半搜索、双人路径 DP、树形 DP，H–J 为 SCC 缩点、后缀自动机与费用流压轴。每题均有完整中文赛题式背景、规则、约束、样例解释、复杂度目标、独立 C++17 参考解，以及 30 / 30 / 40 的三组评测点。

## Codeforces 本地评测数据

Codeforces 题目只有在本地测试包通过质量门禁后才开放完整提交：每题固定 20 个测试点、每点 5 分、总分 100 分，其中至少 10 个为接近约束上限的大数据点。公开样例仅用于“运行样例”，不会再被当作完整评测数据。以后同步或新增比赛时，题目元数据可以先展示，但必须补齐独立标准解和符合上述规则的测试包后才能标记为 `localJudgeReady`。可运行 `npm run validate:codeforces` 单独检查，生产构建也会自动执行该门禁。

比赛同步完成并缓存题面后，服务会在后台自动运行测试包生成器：先生成并编译 C++17 标准解、核对官方样例，再设计 20 点输入并由标准解计算输出；构造题可携带专用 checker。生成失败会记录状态并在后续同步时重试，未通过门禁的题目不会开放本地提交。也可调用 `POST /api/codeforces/generate-tests` 手动触发缺失题包生成。

## 本地运行

```bash
npm install
npm run dev
```

`npm run dev` 会同时启动：

- 前端开发服务器：`http://127.0.0.1:5173`
- 本地 API / AI / OJ 服务：`http://127.0.0.1:3001`

打开网页：

```text
http://127.0.0.1:5173
```

## AI 配置

AI 密钥只应放在项目根目录的 `.env.local`，不要写入 React 源码，也不要提交到 Git。可以复制 `.env.example` 后填写：

```bash
AI_API_BASE_URL=https://api.openai.com/v1
AI_API_KEY=你的网关密钥
AI_MODEL=gpt-5.5
AI_API_PORT=3001
```

浏览器只请求本地的 `/api/ai/chat`，Vite 会将 `/api` 转发给本地服务，因此密钥不会暴露给前端。

## 本机 OJ 评测环境（已配置）

项目内已安装独立的 `w64devkit` 工具链，位置为 `tools/w64devkit`，包含 GCC 16.1.0，可使用 C++17。它不会改动系统 PATH；服务端会自动优先使用它，并在编译、链接和运行阶段注入其所需的局部 PATH。

首次安装或以后需要重建时，在项目根目录执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-judge-env.ps1
```

健康检查：

```powershell
Invoke-RestMethod http://127.0.0.1:3001/api/judge/health
```

正常情况下会显示 `compilerAvailable: true`，且编译器路径指向 `tools\\w64devkit\\bin\\g++.exe`。也可在 `.env.local` 使用 `JUDGE_CXX` 指定另一套 C++17 编译器；服务端按该配置、项目内工具链、系统 `g++`/`clang++`/`cl` 的顺序寻找。

当前 Windows 方案会直接运行提交的 C++ 程序，仅适合个人本机开发，不具备强隔离沙箱能力。不要暴露给公网或执行不可信代码。

## 题库建设原则

题库采用“质量优先、分专题审核”的方式建设。每一道新增题必须具备独立的算法模型、完整中文题面、至少一份参考解思路和针对边界/复杂度/反例的测试设计；不以同一模板替换参数或编号来凑题数。

公开的竞赛题标签和难度分层可作为选题参考，但本站题面、数据构造和测试点均独立编写。每题支持样例运行、自定义输入、完整提交、CE/WA/TLE/RE/AC 判定和逐点计分。

当前已完成第一批高质量扩展：动态规划专题新增 `A0704` 至 `A0733` 共 30 题。题型覆盖线性 DP、网格 DP、完全/0-1/分组/多重背包、LCS、编辑距离、区间 DP、加权区间调度、环形 DP、数位 DP、状态压缩、树形/换根 DP、DAG DP、单调队列优化与计数 DP。每题都有独立中文题面和 3 个分别覆盖样例结构、边界情形、综合反例的测试点（30 / 30 / 40 分）。

第二批 `B002` 已新增 30 道跨专题题目，覆盖全部 11 个算法标签：进制/时间处理、周期与坐标模拟、逆序对与答案二分、Huffman/区间贪心/单调栈、二维差分与前缀异或、前缀和哈希、多源 BFS/0-1 BFS/回溯、字符串 DP、树状数组/并查集/Sparse Table、最小生成树/SCC/二分图匹配、欧拉函数/扩展欧几里得/组合数，以及 Z 函数/Manacher/字符串哈希。分配为 S01-S03 各 2 题，其余专题各 3 题；题号记录在 `judge/questionBankManifest.mjs`。

第四批 `B004` 已新增 30 道跨专题题目，覆盖全部 11 个算法专题：数字和/游程编码/循环数组、状态模拟/括号栈/矩阵边框、逆序对/单调栈/阈值统计、区间调度/分数背包/区间打点、前缀最大值/矩形点计数/差分恢复、网格连通块/图连通分量/多源 BFS、线性 DP/网格 DP/LIS、最小栈/队列/RMQ、二分图/Kruskal/Kosaraju、欧拉函数/模逆元/组合数，以及回文串/循环等价/异位词。分配为 S01-S06、S08-S09 各 3 题，S07、S10、S11 各 2 题；题号记录在 `judge/questionBankManifest.mjs`。

第六批 B006 已新增 30 道跨专题原创题，题库总数由 183 增至 213。轮换分配为 S01、S05-S11 各 3 题，S02-S04 各 2 题；覆盖高精度与位掩码、局部/轨迹模拟、排序相邻性质与双序列第 k 小、截止期调度与二人配对、线性差分/三维前缀/旋转坐标、双向 BFS/数独 MRV/IDA*、斜率优化、概率 DP 与子序列计数、动态排名/莫队/回滚并查集、最大流/费用流/DAG 路径恢复、Möbius/Miller-Rabin/NTT，以及 AC 自动机/后缀自动机/回文树。每题含独立 C++17 参考实现与 Typical structure、Boundary conditions、Comprehensive trap 三个 30/30/40 测试点；完整记录见 judge/questionBankManifest.mjs。

以后只需提出“新增 30 题”，题库会按 `AGENTS.md` 中的批次规范执行：30 题必须覆盖全部 11 个算法专题，按轮换策略分配 2 或 3 题；每题提供详细背景与规则、输入输出、约束、样例解释、建模提示、目标复杂度和 3 个评分测试点。批次记录保存在 `judge/questionBankManifest.mjs`，用于避免后续重复题型和专题失衡。

## 迁移到 Linux / Docker

已提供 `Dockerfile.judge` 和 `compose.judge.yml`。在安装 Docker 的 Linux 服务器上，把 `.env.local`（不要提交密钥）一并放入项目根目录后运行：

```bash
docker compose -f compose.judge.yml up -d --build
```

容器基于 Debian，安装 `g++` 并使用 `/usr/bin/g++` 编译 C++17；容器内服务以非 root 用户运行，并设置了基础的内存、CPU、进程数和提权限制。`.dockerignore` 会排除 `.env.local`，密钥只通过 `env_file` 在运行时注入。端口默认只绑定服务器本机 `127.0.0.1`，请通过 Nginx/Caddy 等反向代理提供 HTTPS 和访问控制。Docker 容器隔离优于当前本机方式；在开放给他人提交前，仍建议进一步配置网络隔离和专用判题沙箱。

## 当前 API

- `GET /api/health`：检查 AI 配置和 OJ 状态
- `GET /api/problems`：题库列表
- `GET /api/problems/:id`：题目详情
- `GET /api/judge/health`：本地 C++17 编译器和题库测试点状态
- `POST /api/judge/run`：运行样例或自定义输入
- `POST /api/judge/submissions`：创建完整评测提交
- `GET /api/judge/submissions?problemId=A0101`：查看提交记录
- `GET /api/judge/submissions/:id`：查看单次提交
- `POST /api/ai/chat`：AI 流式对话

提交记录保存在项目根目录 `.data/submissions.json`，该目录已加入 `.gitignore`。

## 构建生产版本

```bash
npm run build
npm run preview
```

生产文件输出至 `dist/`。

������ B005 ������ 30 ����ר����Ŀ�����ǽ��������ڡ�ģ�⡢������֡�̰�ġ���ά/һά�����ѯ����������̬�滮�����ݽṹ��ͼ�ۡ����ۺ��ַ����㷨����ż�ר������¼�� judge/questionBankManifest.mjs��


第七批 B007 已新增 30 道跨专题原创题，题库总数由 213 增至 243。轮换分配为 S01-S04、S08-S11 各 3 题，S05-S07 各 2 题；题目覆盖扫描统计、旋转模拟、三路划分、区间线段树、Bellman-Ford、整除分块、后缀数组等 30 个未重复核心模型。每题均含完整中文题面、独立 C++17 参考实现，以及 Typical structure、Boundary conditions、Comprehensive trap 三个 30/30/40 测试点。


第八批 B008 已新增 30 道跨专题题目，题库总数由 243 增至 273。轮换分配为 S01-S07、S11 各 3 题，S08-S10 各 2 题；覆盖状态机、子集枚举、快速选择、扫描线、差分、状态压缩搜索、区间 DP、线段树、LCA、欧拉回路、线性递推与通配符匹配等独立模型。


第九批 B009 已新增 30 道跨专题原创题，题库总数由 273 增至 303。轮换分配为 S01、S02、S11 各 2 题，S03-S10 各 3 题；覆盖分类计数、环形距离、区间翻转、单峰二分、二维前缀和、状态图最短路、Trie 异或、线段树赋值、传递闭包、Hungarian、Lucas、离散对数及 Boyer-Moore 等 30 个独立模型。每题包含完整中文规则、样例解释、独立 C++17 参考实现以及 Typical structure、Boundary conditions、Comprehensive trap 三个 30/30/40 测试点。


第十批 B010 已新增 30 道跨专题原创题，题库总数由 303 增至 333。轮换分配为 S01、S02、S06-S11 各 3 题，S03-S05 各 2 题；覆盖整除累计、时间拆分、位奇偶筛选、双端状态机、置换环、三分/旋转数组二分、预算聚拢、堆归并、等差差分、前后缀极值、八邻域 BFS、图着色、简单路径计数、区间 DP、子集变换、分组 DP、主席树、分块、线段树、Johnson、倍增、Kruskal 重构树、Pollard Rho、整数开方、阶乘数制、递归解码、分块翻转和回文分段等 30 个独立模型。每题含完整中文题面、独立 C++17 参考实现以及 Typical structure、Boundary conditions、Comprehensive trap 三个 30/30/40 测试点。


第十一批 B011 已新增 30 道跨专题原创题，题库总数由 333 增至 363。轮换分配为 S01-S05、S09-S11 各 3 题，S06-S08 各 2 题；覆盖进制校验、波动扫描、蛇形映射、矩阵边框、二分秩选、截止期贪心、扫描线、状态 BFS、数量 DP、可撤销栈、最短路计数、Kruskal、分段筛、拉格朗日插值及字符串窗口等 30 个独立模型。每题含完整中文题面、独立 C++17 参考实现和 Typical structure、Boundary conditions、Comprehensive trap 三个 30/30/40 测试点。

第十二批 B012 已新增 30 道跨专题原创题，题库总数由 363 增至 393。轮换分配为 S01-S08 各 3 题，S09-S11 各 2 题；覆盖十进制长除法、连分数高精度复原、平衡三进制、元胞自动机、煎饼排序、距离中位数、多类别覆盖、精确分数堆选、可行性贪心、离线不同值、周期门 BFS、折半搜索、精确覆盖、LCIS、双调旅行商、Steiner 树、隐式 Treap、Li Chao、DSU on tree、最小树形图、点分治、Tonelli-Shanks、floor_sum、Lyndon 分解等 30 个互不重复核心模型。每题含完整中文题面、独立 C++17 参考实现和 Typical structure、Boundary conditions、Comprehensive trap 三个 30/30/40 测试点。


第十三批 B013 已新增 30 道跨专题原创题，题库总数由 393 增至 423。轮换分配为 S01-S03 各 2 题，S04-S11 各 3 题；覆盖罗马数字规范化、无零列号、Langton 蚂蚁、整体二分、CDQ 三维偏序、Moore-Hodgson、Belady、前缀和范围计数、推箱搜索、最大团、分治优化 DP、WQS、Disjoint Sparse Table、Link-Cut Tree、Wavelet Matrix、Stoer-Wagner、Karp、Burnside、FWT、佩尔方程、BWT、Shift-And 与精简正则 DP 等 30 个互不重复核心模型。每题均含完整中文题面、独立 C++17 参考实现和 Typical structure、Boundary conditions、Comprehensive trap 三个 30/30/40 测试点。
第十四批 B014 已新增 30 道跨专题原创题，题库总数由 423 增至 453。轮换分配为 S01-S03、S07-S11 各 3 题，S04-S06 各 2 题；覆盖七段屏一致性诊断、十进制半偶舍入、轮转调度、级联消除、稳定基数排序、Lehmer 码解码、冷却排程、二维目标和计数、斐波那契差分、加法链、Trie 拼字搜索、鸡蛋掉落反向 DP、仿射缺口、子集卷积、二维 Fenwick、Segment Tree Beats、可持久化 Trie、2-SAT、动态连通性、中国邮差、线性基有序枚举、杜教筛、Hirschberg 与重复字符相邻交换等 30 个互不重复核心模型。每题均含完整中文题面、独立 C++17 参考实现和 Typical structure、Boundary conditions、Comprehensive trap 三个 30/30/40 测试点。
第十五批 B015 已新增 30 道跨专题原创题，题库总数由 453 增至 483。轮换分配为 S01-S06、S10-S11 各 3 题，S07-S09 各 2 题；覆盖格雷码逆变换、环形区间覆盖、二维压缩、仿射线段树、Kirchhoff 生成树、分拆递推、子序列自动机等 30 个独立核心模型。每题含完整中文题面、独立 C++17 参考实现和 Typical structure、Boundary conditions、Comprehensive trap 三个 30/30/40 测试点。
