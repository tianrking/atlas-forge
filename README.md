# Atlas Forge

**Agentic Equity Ecosystem Research**

Atlas Forge 是一个面向资本市场的 Agent 研究与可视化平台。它接收一个公司、技术、行业或投资问题，持续挖掘相关企业、供应商、客户、合作伙伴、竞争者、替代路线、应用场景和上市公司映射，并把研究结果组织成可验证、可扩展的关系网络。

当前仓库是 Atlas Forge 的第一个领域基线：**AI 基础设施与美股产业链地图**。它从“大语言模型能力提升”出发，向下展示 GPU、HBM、网络、硅光、先进封装、服务器、存储、电力和液冷等节点，并支持最多 L5 的上游下钻。

## 这个项目要解决什么问题

传统行业研究通常把信息分散在几个地方：

- 一份公司列表；
- 一张静态产业链图；
- 若干财报和新闻链接；
- 研究员脑中的上下游关系；
- 一份不会自动更新的投资逻辑。

Atlas Forge 希望把它们统一成一个研究对象：

```text
研究目标
  ↓
领域拆解
  ↓
企业 / 技术 / 产品 / 应用节点
  ↓
供应、客户、合作、竞争、替代和投资关系
  ↓
财务与市场映射
  ↓
证据、可信度和时间
  ↓
可视化网络
  ↓
发现缺口并继续调研
```

它不是只做“供应链树”。对于机器人、量子计算、AI、半导体、能源、储能或生物医药，真正重要的关系可能同时包括：

- 上游供应商和制造设备；
- 下游客户和应用场景；
- 联合研发、渠道和平台合作；
- 竞争路线和替代技术；
- 软件、云平台和生态绑定；
- 上市公司、ADR、私营公司和参考企业；
- 订单、产能、利润、现金流和估值传导。

## 当前版本已经实现什么

当前 baseline 是一个 React + vinext 的可运行研究界面：

- L0 根节点：大语言模型能力提升；
- L1：参数缩放、推理 / Agent、请求量、上下文、多模态、网络、电力和封装约束；
- L2：GPU、AI ASIC、HBM、CPU、CXL、SSD、交换机、NIC、硅光、服务器、数据中心、电源和液冷；
- L3：一级企业和平台型企业；
- L4：二级上游企业、设备、材料、封装和测试；
- L5：更深一层的制造设备、材料、光学、连接器和基础设施。

当前数据集包含 137 个节点，其中 98 个是上游节点。预置的美股和 ADR 映射包括 NVIDIA、AMD、Broadcom、Micron、TSMC、Marvell、Credo、Coherent、GlobalFoundries、Applied Optoelectronics、Arista、Super Micro、CoreWeave、Vertiv、KLA、Teradyne、Onto、ASML、Applied Materials、Lam Research、Cadence、Synopsys、Amkor、Kulicke & Soffa、Entegris、FormFactor、Corning、Amphenol、TE Connectivity、Quanta Services、GE Vernova 等。

当前界面提供：

- 节点点击自动展开；
- 右侧 `+ / −` 精确控制展开；
- “展开当前子树”递归打开全部下游；
- 搜索公司、股票代码、技术和上游环节；
- 直接 / 高弹性、上游设备、放大区间和美股可交易筛选；
- 更大模型、长思考 + Agent、算法效率提升三种研究情景；
- 节点检查器：产业链角色、市场属性、需求弹性、研究逻辑、下一层节点和公开资料；
- 137 节点数据可继续扩展为 `nodes + edges + evidence` 网络模型。

## Atlas Forge 的研究对象

Atlas Forge 将研究结果拆成四类对象。

### Node：节点

节点可以是公司、技术、产品、材料、设备、应用、市场或基础设施，不要求全部是上市公司。

```ts
type ResearchNode = {
  id: string;
  name: string;
  ticker?: string;
  market: "US" | "ADR" | "Non-US" | "Private";
  layer: 0 | 1 | 2 | 3 | 4 | 5;
  category: string;
  role: string;
  tags: string[];
  financials?: {
    revenue?: number;
    grossMargin?: number;
    operatingMargin?: number;
    freeCashFlow?: number;
  };
};
```

### Edge：关系

关系比节点本身更重要。Atlas Forge 不只记录“这是一家设备公司”，还记录“什么需求通过什么关系传导到这家公司”。

```ts
type RelationType =
  | "supplier"
  | "customer"
  | "partner"
  | "application"
  | "competitor"
  | "substitute"
  | "manufacturing"
  | "investment"
  | "platform"
  | "technology";

type ResearchEdge = {
  id: string;
  from: string;
  to: string;
  relation: RelationType;
  impact: "high" | "medium" | "low";
  confidence: number;
  explanation: string;
  evidenceIds: string[];
};
```

计划中的网络图会把共享上游合并为一个节点。例如 TSMC、ASML、Applied Materials、KLA 和 Broadcom 可以同时被多条 AI、机器人或量子计算路径引用，而不必在树中重复出现。

### Evidence：证据

任何重要关系都应该能够回到来源，而不是只保留 Agent 的结论。

```ts
type Evidence = {
  id: string;
  title: string;
  url: string;
  sourceType: "filing" | "earnings" | "official" | "research";
  publishedAt: string;
  checkedAt: string;
  excerpt?: string;
};
```

后续节点和边都应当带有来源、核验时间、可信度和“事实 / 推断”标记。

### Research Run：一次研究运行

Agent 不应该直接改 React 页面代码。它应该生成一组有版本号的研究运行结果：

```text
research run
├── target
├── question
├── discovered nodes
├── discovered edges
├── evidence
├── unresolved questions
├── confidence changes
└── next actions
```

前端读取研究运行的快照或增量事件，实时更新网络图和检查器。

## DIVE-M 研究 SOP

Atlas Forge 的通用挖掘流程称为 **DIVE-M Protocol**：

1. **Define**：定义研究对象、投资问题、时间范围和边界。
2. **Identify**：发现企业、技术、产品、上下游、应用、合作与竞争节点。
3. **Verify**：用财报、公司公告、官网、论文、监管文件和可靠数据核验关系。
4. **Evaluate**：评估收入、利润、产能、竞争力、供给约束、估值和市场传导。
5. **Map & Iterate**：把结果映射成图，寻找证据缺口和关系缺口，再继续下一轮 Agent 调研。

每轮研究都应该回答四个问题：

- 新发现了哪些节点？
- 新建立了哪些关系？
- 哪些关系有直接证据，哪些只是推断？
- 下一轮最值得验证的未知点是什么？

## 可视化方向

当前版本是层级树，便于单条路径逐层下钻。下一阶段会增加网络图视图，并保留树视图作为精确研究模式。

### 网络图模式

- 按 L0-L5 横向分层；
- 共享上游节点只显示一次；
- 边显示供应、客户、合作、竞争、替代或技术依赖关系；
- 点击节点查看公司和证据；
- 点击边查看关系解释和来源；
- “只看这条路径”突出从研究目标到指定股票的传导链；
- “显示共享上游”突出被多条路径共同依赖的公司；
- 根据市场、行业、关系类型、影响强度和可信度过滤。

### 层级树模式

- 从指定节点逐层展开；
- 适合研究某一家公司的上游和下游；
- 适合在 Agent 发现新关系后逐条审阅；
- 作为网络图的路径细节面板。

最终产品不是“图替代树”，而是：

> 网络图负责发现关系，层级树负责验证路径，检查器负责阅读证据。

## 代码结构

当前目录：

```text
app/
├── page.tsx             # 当前领域数据、递归树和交互界面
├── globals.css          # Atlas Forge 视觉系统与响应式布局
├── layout.tsx           # 页面元数据和根布局
└── chatgpt-auth.ts      # starter 提供的可选登录辅助

tests/
└── rendered-html.test.mjs  # 生产构建后的 HTML 与数据回归测试

worker/
└── index.ts             # vinext / Cloudflare Worker 入口

db/
└── index.ts             # 可选 D1 / Drizzle 数据库入口
```

当前 `app/page.tsx` 使用类型化的内存数据和 `materializeNodes()` 生成 L3-L5 节点。它是第一个可运行基线，适合快速验证交互。下一步应当逐步拆出：

```text
data/
├── domains/
│   ├── ai-infrastructure/
│   ├── robotics/
│   └── quantum-computing/
├── nodes/
├── edges/
├── evidence/
└── research-runs/
```

前端组件只负责展示和交互，研究数据由 JSON、API 或数据库提供。这样 Agent 可以更新研究数据，而不需要重写 UI。

## 本地开发

要求 Node.js `>=22.13.0`。

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

打开：

```text
http://localhost:3000/
```

生产构建：

```bash
npm run build
```

运行完整验证：

```bash
npm test
npm run lint
```

其中 `npm test` 会先执行生产构建，再验证服务端 HTML、Atlas Forge 品牌、L5 递归限制、关键美股代码和交互数据是否仍然存在。

## 推荐开发方式

### 1. 先定义研究问题

不要一开始就添加一堆股票代码。先定义：

```text
目标：量子计算
问题：量子计算商业化首先会增加哪些设备和材料需求？
范围：美股上市公司，允许保留非上市关键节点
时间：未来三到五年
输出：关系图、重点公司、证据和待验证问题
```

### 2. Agent 先发现，证据层再确认

Agent 可以提出候选节点和关系，但不能把推断直接当成事实。每条高影响关系都应当有：

- 来源链接；
- 来源类型；
- 发布时间和核验时间；
- 关系解释；
- 可信度；
- 是否为直接披露或研究推断。

### 3. 一次只扩展一层或一跳

研究网络很容易变成无法阅读的“毛线团”。默认只展开直接邻居，用户点击后再增加下一跳，并保留当前路径和研究运行记录。

### 4. 财务数据和关系数据分开

供应关系、合作关系和财务指标变化速度不同。关系数据应当保留时间和证据，财务数据应当保留报告期、币种、口径和数据来源，不能把它们混成一个静态描述字段。

### 5. 先做研究可追溯，再做自动化

自动加入新节点很容易，自动保证关系正确很难。优先保证每次 Agent 调研都能回放、比较、撤销和重新验证，再逐步提高自动化程度。

## Git 开发流程

主分支保存可运行 baseline。新功能建议使用短分支：

```bash
git switch -c agent/graph-view
```

每次提交前运行：

```bash
git diff --check
npm test
npm run lint
```

提交信息使用简洁的 Conventional Commits 风格，例如：

```text
feat: add network graph view
feat: add evidence-backed research runs
fix: preserve selected path during filtering
docs: explain DIVE-M research workflow
```

不要把 API key、Cookie、登录信息、私有数据或未脱敏的研究材料提交到仓库。财务和市场数据应标记数据时间，不能把当前快照伪装成永久事实。

## 路线图

### Phase 0：当前 baseline

- React + vinext 可运行页面；
- AI 基础设施五层树；
- 美股与 ADR 产业链节点；
- 情景切换、搜索、筛选和证据链接；
- 生产构建、HTML 回归测试和 lint。

### Phase 1：通用图谱模型

- 把 `TreeNode` 拆成 `ResearchNode`、`ResearchEdge` 和 `Evidence`；
- 增加网络图 / 层级树切换；
- 合并共享上游节点；
- 支持供应、客户、合作、竞争、替代和应用关系；
- 支持按路径、行业、市场和可信度过滤。

### Phase 2：Agent 研究运行

- 目标和问题输入；
- Agent 分层检索和关系发现；
- 企业实体去重和股票代码标准化；
- 证据抽取、时间标记和可信度评分；
- 研究缺口自动生成下一轮任务；
- 页面实时显示增量研究结果。

### Phase 3：投研数据层

- 收入、毛利率、经营利润、现金流和估值快照；
- 产能、订单、客户集中度和库存变化；
- 关系强度与公司业绩之间的传导假设；
- 情景分析、风险节点和替代路线；
- AI、机器人、量子计算、半导体、能源和其他领域模板。

## 研究边界

Atlas Forge 输出的是带来源的研究框架和投资线索，不是自动化荐股系统。节点出现不代表一定受益，关系强度不等于收入增速，资源需求倍数也不等于股价涨幅。正式投资判断仍然需要独立核验公司公告、财报、订单、客户集中度、库存、毛利率、现金流、估值和监管信息。

## Project status

当前仓库已经固定了第一个可运行版本：

```text
4af0f7f feat: establish interactive AI supply chain map
```

下一步开发目标是把当前 AI 基础设施领域从“可展开的树”升级成“可持续迭代的投资生态网络”。
