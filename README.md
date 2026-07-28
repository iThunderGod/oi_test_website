# Algo Arena

面向 OI / ACM 学习者的一站式算法训练平台。当前已经完成前端主流程、算法 AI 代理和本地 Online Judge 第一版。

## 已完成

- 学习概览：训练数据、推荐题目、专题进度与继续学习
- Online Judge：33 道原创算法题，覆盖 11 个系列，并按题号和难度排序
- 题目工作台：动态题面、样例、自定义输入、运行样例、完整提交评测、测试点结果和本题提交记录
- 本地评测服务：C++17 编译运行、逐测试点判定、按测试点计分、CE/WA/TLE/RE/AC 状态
- 算法 AI：真实流式对话、历史会话、停止/重试/复制、图片附件和代码片段模式
- 字体与可读性：已把原来过小的页面文字系统性放大

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
AI_API_BASE_URL=https://aigw.sotatts.online/v1
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
