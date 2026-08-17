"use client";

import { useMemo, useState } from "react";

type Exposure =
  | "direct"
  | "platform"
  | "upstream"
  | "early"
  | "demand"
  | "infrastructure";
type NodeKind = "root" | "driver" | "resource" | "company" | "upstream";
type Market = "US" | "ADR" | "Non-US" | "Private";
type Filter = "all" | "direct" | "upstream" | "high-growth" | "us";
type ScenarioId = "scale" | "reasoning" | "efficiency";

type Source = {
  label: string;
  href: string;
};

type TreeNode = {
  id: string;
  parent: string | null;
  label: string;
  ticker?: string;
  market: Market;
  layer: number;
  kind: NodeKind;
  exposure: Exposure;
  delta: string;
  summary: string;
  why: string;
  tags: string[];
  sources?: Source[];
};

type DeepSpec = Omit<TreeNode, "id" | "parent" | "layer" | "kind">;
type UpstreamSpec = DeepSpec & {
  id: string;
  deep?: DeepSpec[];
};
type DirectSpec = Omit<TreeNode, "id" | "parent"> & {
  id: string;
  parent: string;
  upstreams: UpstreamSpec[];
};

const sourceLinks = {
  scaling: {
    label: "Chinchilla scaling laws",
    href: "https://arxiv.org/abs/2203.15556",
  },
  reasoning: {
    label: "OpenAI reasoning compute",
    href: "https://openai.com/index/learning-to-reason-with-llms/",
  },
  nvidia: {
    label: "NVIDIA GB300 NVL72",
    href: "https://www.nvidia.com/en-gb/data-center/gb300-nvl72/",
  },
  micron: {
    label: "Micron HBM4 and PCIe 6 SSD",
    href: "https://investors.micron.com/news-releases/news-release-details/micron-high-volume-production-hbm4-designed-nvidia-vera-rubin",
  },
  broadcom: {
    label: "Broadcom Tomahawk 6 CPO",
    href: "https://investors.broadcom.com/news-releases/news-release-details/broadcom-announces-tomahawkr-6-davisson-industrys-first-1024",
  },
  marvell: {
    label: "Marvell 1.6T optical DSP",
    href: "https://www.marvell.com/solutions/data-center/optical-dsp.html",
  },
  tsmc: {
    label: "TSMC COUPE and CPO",
    href: "https://pr.tsmc.com/english/news/3302",
  },
  gf: {
    label: "GlobalFoundries silicon photonics",
    href: "https://gf.com/technologies/silicon-photonics/",
  },
  applied: {
    label: "Applied Materials HBM and packaging",
    href: "https://investors.appliedmaterials.com/news-releases/news-release-details/applied-materials-introduces-new-systems-accelerate-dram-and",
  },
  asml: {
    label: "ASML 2026 memory and logic outlook",
    href: "https://ourbrand.asml.com/asset/1fd3908a-0381-47b5-9b69-a3094f656651/2026_07_15-ASML-Transcript-investor-call-Q2-2026.pdf",
  },
  credo: {
    label: "Credo silicon photonics and 1.6T",
    href: "https://investors.credosemi.com/news-events/news/news-details/2026/Credo-Agrees-to-Acquire-DustPhotonics-Accelerating-Expansion-into-Silicon-Photonics-and-Next-Generation-Optical-Connectivity/default.aspx",
  },
  supermicro: {
    label: "Supermicro liquid-cooled AI racks",
    href: "https://www.supermicro.com/en/solutions/liquid-cooling",
  },
};

const baseNodes: TreeNode[] = [
  {
    id: "root",
    parent: null,
    label: "大语言模型能力提升",
    ticker: "AI INFRA MAP",
    market: "US",
    layer: 0,
    kind: "root",
    exposure: "demand",
    delta: "需求起点",
    summary: "从模型能力、推理时间和用户规模出发，向下拆解五层基础设施供应链。",
    why: "同一个能力提升目标，可以由更大模型、更多推理Token、Agent工具调用或算法效率实现；不同路径对应完全不同的硬件弹性。",
    tags: ["五层下钻", "可交易映射", "研究框架"],
    sources: [sourceLinks.scaling, sourceLinks.reasoning],
  },
  {
    id: "scale-driver",
    parent: "root",
    label: "参数 / 数据缩放",
    market: "US",
    layer: 1,
    kind: "driver",
    exposure: "demand",
    delta: "训练算力 1.5–2×",
    summary: "更大参数、更多训练Token和更长训练周期。",
    why: "更大模型通常同时拉动GPU、HBM、先进封装和训练数据存储。",
    tags: ["训练", "Chinchilla", "参数"],
    sources: [sourceLinks.scaling],
  },
  {
    id: "reasoning-driver",
    parent: "root",
    label: "推理 / Agent",
    market: "US",
    layer: 1,
    kind: "driver",
    exposure: "demand",
    delta: "推理GPU 2–4×",
    summary: "更长思考链、多路径搜索、验证和工具调用。",
    why: "推理时计算会放大每次请求的Token、KV Cache、CPU编排和网络调用。",
    tags: ["推理", "Agent", "长思考"],
    sources: [sourceLinks.reasoning],
  },
  {
    id: "traffic-driver",
    parent: "root",
    label: "请求量 / 低延迟",
    market: "US",
    layer: 1,
    kind: "driver",
    exposure: "demand",
    delta: "集群规模 1.3–3×",
    summary: "更多用户、更高QPS、更低延迟和更多地域部署。",
    why: "模型能力商业化之后，硬件需求不仅由单次回答成本决定，也由并发和SLA决定。",
    tags: ["QPS", "SLA", "云厂商"],
  },
  {
    id: "memory-driver",
    parent: "root",
    label: "上下文 / 多模态数据",
    market: "US",
    layer: 1,
    kind: "driver",
    exposure: "demand",
    delta: "存储容量 1.3–5×",
    summary: "更长上下文、RAG、图片、视频、语音和Agent轨迹。",
    why: "数据规模扩大后，SSD吞吐、对象存储、向量数据库和数据搬运成为新瓶颈。",
    tags: ["RAG", "多模态", "数据湖"],
  },
  {
    id: "system-driver",
    parent: "root",
    label: "网络 / 电力 / 封装约束",
    market: "US",
    layer: 1,
    kind: "driver",
    exposure: "demand",
    delta: "系统带宽 1.5–4×",
    summary: "GPU之间、GPU与存储之间的数据搬运和机架功率密度上升。",
    why: "当GPU算力继续增加时，电互联、交换机、光模块、液冷和电网扩容会成为系统级约束。",
    tags: ["网络", "液冷", "CPO"],
  },
  {
    id: "train-gpu",
    parent: "scale-driver",
    label: "训练 GPU / AI ASIC",
    market: "US",
    layer: 2,
    kind: "resource",
    exposure: "direct",
    delta: "训练FLOPs 1.5–2×",
    summary: "模型参数和训练Token同步放大，形成训练集群需求。",
    why: "最直接的计算需求，但物理GPU数量会被新一代芯片的性能提升部分抵消。",
    tags: ["GPU", "ASIC", "训练"],
  },
  {
    id: "train-memory",
    parent: "scale-driver",
    label: "HBM / 训练数据 / Checkpoint",
    market: "US",
    layer: 2,
    kind: "resource",
    exposure: "direct",
    delta: "HBM与存储 1.3–2.5×",
    summary: "参数权重、梯度、优化器状态和Checkpoint同时增加。",
    why: "每颗GPU的HBM容量和带宽提升，往往比GPU数量更快成为瓶颈。",
    tags: ["HBM", "DDR", "Checkpoint"],
    sources: [sourceLinks.micron],
  },
  {
    id: "train-package",
    parent: "scale-driver",
    label: "先进封装 / Chiplet",
    market: "ADR",
    layer: 2,
    kind: "resource",
    exposure: "upstream",
    delta: "封装复杂度 1.5–3×",
    summary: "GPU、HBM、Chiplet和高速I/O被压缩进更大的封装。",
    why: "CoWoS、SoIC、2.5D和3D封装把算力和内存放得更近，但也放大封装设备和检测需求。",
    tags: ["CoWoS", "SoIC", "Chiplet"],
    sources: [sourceLinks.tsmc, sourceLinks.applied],
  },
  {
    id: "infer-gpu",
    parent: "reasoning-driver",
    label: "推理 GPU / 推理 ASIC",
    market: "US",
    layer: 2,
    kind: "resource",
    exposure: "direct",
    delta: "在线推理 1.5–4×",
    summary: "每个请求需要更多生成Token、候选路径或验证过程。",
    why: "推理时计算越多，GPU需求越接近请求量乘以每次思考预算，而不是只看参数量。",
    tags: ["Inference", "推理", "TPS"],
    sources: [sourceLinks.reasoning, sourceLinks.nvidia],
  },
  {
    id: "kv-cxl",
    parent: "reasoning-driver",
    label: "KV Cache / CXL / 内存扩展",
    market: "US",
    layer: 2,
    kind: "resource",
    exposure: "direct",
    delta: "容量 1.5–3×",
    summary: "长上下文和高并发会把KV Cache从GPU内存推向更大的内存层。",
    why: "这一层同时拉动HBM、DDR、CXL交换、PCIe Retimer和内存池化。",
    tags: ["KV Cache", "CXL", "PCIe"],
  },
  {
    id: "agent-cpu",
    parent: "reasoning-driver",
    label: "CPU / Agent工具调用",
    market: "US",
    layer: 2,
    kind: "resource",
    exposure: "platform",
    delta: "CPU 1.1–3×",
    summary: "调度、数据库、浏览器、代码执行和多Agent编排。",
    why: "纯GPU推理时CPU增速较慢，但Agent化会显著增加控制面工作量。",
    tags: ["CPU", "Agent", "调度"],
  },
  {
    id: "rag-storage",
    parent: "reasoning-driver",
    label: "RAG / SSD / 向量数据库",
    market: "US",
    layer: 2,
    kind: "resource",
    exposure: "direct",
    delta: "容量 2–5×",
    summary: "检索增强、企业知识库和Agent日志会放大SSD容量与IOPS。",
    why: "存储不仅是容量问题，还要用足够低的延迟把数据喂给GPU。",
    tags: ["RAG", "NVMe", "IOPS"],
  },
  {
    id: "switch-network",
    parent: "traffic-driver",
    label: "交换机 / NIC / DPU",
    market: "US",
    layer: 2,
    kind: "resource",
    exposure: "direct",
    delta: "集群带宽 1.5–3×",
    summary: "Scale-up和Scale-out都需要更高带宽、更低延迟和更稳定的链路。",
    why: "网络拥塞会降低GPU利用率，因此网络设备是算力集群的直接效率杠杆。",
    tags: ["Ethernet", "InfiniBand", "DPU"],
    sources: [sourceLinks.broadcom, sourceLinks.marvell],
  },
  {
    id: "server-fleet",
    parent: "traffic-driver",
    label: "AI服务器 / ODM / 机架",
    market: "US",
    layer: 2,
    kind: "resource",
    exposure: "platform",
    delta: "服务器 1.3–2.5×",
    summary: "GPU、HBM、NIC、SSD、电源、交换机和液冷系统被集成为机架级产品。",
    why: "机架级系统的价值量和复杂度上升，ODM和整机集成商的交付能力变得重要。",
    tags: ["服务器", "ODM", "AI机架"],
    sources: [sourceLinks.supermicro],
  },
  {
    id: "cloud-dc",
    parent: "traffic-driver",
    label: "云厂商 / 数据中心",
    market: "US",
    layer: 2,
    kind: "resource",
    exposure: "demand",
    delta: "机房与电力 1.3–3×",
    summary: "模型服务需要更多地域、容量、冗余和电力接入。",
    why: "云厂商是上游硬件需求的最终付款方，但自研芯片会改变供应商份额。",
    tags: ["Hyperscaler", "云", "数据中心"],
  },
  {
    id: "optics-cpo",
    parent: "system-driver",
    label: "800G / 1.6T / LPO / NPO / CPO",
    market: "US",
    layer: 2,
    kind: "resource",
    exposure: "direct",
    delta: "光互联内容 1.5–6×",
    summary: "单端口带宽从400G升级到800G和1.6T，电互联逐步向光互联迁移。",
    why: "光模块数量未必同比增长，但DSP、激光器、PIC、光引擎和封装价值量会提高。",
    tags: ["Silicon Photonics", "CPO", "1.6T"],
    sources: [sourceLinks.broadcom, sourceLinks.marvell, sourceLinks.credo, sourceLinks.gf],
  },
  {
    id: "test-reliability",
    parent: "system-driver",
    label: "检测 / 测试 / 良率",
    market: "US",
    layer: 2,
    kind: "resource",
    exposure: "upstream",
    delta: "测试复杂度 1.3–2.5×",
    summary: "HBM、Chiplet、CPO和高速SerDes带来更严格的检测和验证要求。",
    why: "先进封装的价值不仅在生产，还在于把良率和可靠性做上去。",
    tags: ["良率", "ATE", "量测"],
  },
  {
    id: "power-cooling",
    parent: "system-driver",
    label: "电源 / 液冷 / 电网",
    market: "US",
    layer: 2,
    kind: "resource",
    exposure: "infrastructure",
    delta: "机架功率 1.3–3×",
    summary: "高功率GPU和交换芯片推动UPS、配电、CDU、冷板和电网升级。",
    why: "液冷渗透率可能比AI服务器数量增长更快，单机架基础设施价值量明显提升。",
    tags: ["液冷", "UPS", "电网"],
  },
  {
    id: "data-lake",
    parent: "memory-driver",
    label: "数据湖 / 高容量存储",
    market: "US",
    layer: 2,
    kind: "resource",
    exposure: "direct",
    delta: "容量 1.3–5×",
    summary: "多模态数据、训练集、日志和推理轨迹形成更大的数据湖。",
    why: "容量型SSD和高容量HDD受益，但ASP下降可能抵消一部分收入增长。",
    tags: ["数据湖", "HDD", "多模态"],
  },
  {
    id: "multimodal-io",
    parent: "memory-driver",
    label: "光纤 / 连接器 / 多模态IO",
    market: "US",
    layer: 2,
    kind: "resource",
    exposure: "platform",
    delta: "数据搬运 1.5–4×",
    summary: "视频、图像、语音和实时数据让输入输出链路变得更重。",
    why: "光纤、连接器、PCB、光源和高速I/O会受益于更多数据搬运。",
    tags: ["光纤", "连接器", "高速IO"],
  },
];

const directSpecs: DirectSpec[] = [
  {
    id: "nvda-train",
    parent: "train-gpu",
    label: "NVIDIA",
    ticker: "NVDA",
    market: "US",
    layer: 3,
    kind: "company",
    exposure: "direct",
    delta: "绝对需求最高",
    summary: "GPU、Grace CPU、DPU、NVLink、InfiniBand和整机架AI工厂。",
    why: "覆盖算力、网络和软件生态，受益面最广，但也最容易被估值和客户集中度重估。",
    tags: ["核心", "平台", "GPU"],
    sources: [sourceLinks.nvidia],
    upstreams: [
      {
        id: "tsm-for-nvda",
        label: "TSMC先进制程",
        ticker: "TSM",
        market: "ADR",
        exposure: "upstream",
        delta: "先进晶圆与封装",
        summary: "先进逻辑、CoWoS和SoIC承接GPU与HBM集成。",
        why: "GPU放量会把需求传导到晶圆和先进封装产能。",
        tags: ["代工", "CoWoS"],
        sources: [sourceLinks.tsmc],
        deep: [
          { label: "ASML", ticker: "ASML", market: "ADR", exposure: "upstream", delta: "光刻设备", summary: "先进节点光刻设备。", why: "制程越先进，光刻复杂度越高。", tags: ["EUV"] },
          { label: "Applied Materials", ticker: "AMAT", market: "US", exposure: "upstream", delta: "沉积 / CMP", summary: "晶圆和封装材料工程设备。", why: "AI芯片带动先进逻辑和封装设备。", tags: ["设备"] },
          { label: "Lam Research", ticker: "LRCX", market: "US", exposure: "upstream", delta: "刻蚀 / 封装", summary: "刻蚀和先进封装设备。", why: "高密度结构增加工艺步骤。", tags: ["设备"] },
        ],
      },
      {
        id: "mu-for-nvda",
        label: "Micron HBM",
        ticker: "MU",
        market: "US",
        exposure: "upstream",
        delta: "HBM位数提升",
        summary: "HBM3E、HBM4和高速SSD。",
        why: "每颗GPU携带的高带宽内存越多，HBM内容量越高。",
        tags: ["HBM", "内存"],
        sources: [sourceLinks.micron],
        deep: [
          { label: "KLA", ticker: "KLAC", market: "US", exposure: "upstream", delta: "缺陷检测", summary: "晶圆和先进封装检测。", why: "HBM堆叠对良率极其敏感。", tags: ["量测"] },
          { label: "Entegris", ticker: "ENTG", market: "US", exposure: "upstream", delta: "材料与过滤", summary: "高纯材料和晶圆过滤。", why: "先进节点对污染控制更敏感。", tags: ["材料"] },
        ],
      },
    ],
  },
  {
    id: "amd-train",
    parent: "train-gpu",
    label: "AMD",
    ticker: "AMD",
    market: "US",
    layer: 3,
    kind: "company",
    exposure: "direct",
    delta: "GPU + CPU双重暴露",
    summary: "Instinct GPU、EPYC CPU和数据中心平台。",
    why: "GPU替代份额提升时有弹性，同时服务器CPU能分享Agent和主机控制面增长。",
    tags: ["GPU", "CPU", "竞争份额"],
    upstreams: [
      {
        id: "tsm-for-amd",
        label: "TSMC先进制程",
        ticker: "TSM",
        market: "ADR",
        exposure: "upstream",
        delta: "先进晶圆",
        summary: "承接高端CPU/GPU芯片制造。",
        why: "芯片设计公司依赖先进代工和封装产能。",
        tags: ["代工"],
        deep: [
          { label: "ASML", ticker: "ASML", market: "ADR", exposure: "upstream", delta: "EUV / DUV", summary: "先进制程光刻。", why: "先进晶圆扩产的设备端受益者。", tags: ["EUV"] },
          { label: "Cadence", ticker: "CDNS", market: "US", exposure: "upstream", delta: "芯片设计", summary: "EDA、封装和系统设计工具。", why: "Chiplet和HBM集成提高设计复杂度。", tags: ["EDA"] },
        ],
      },
      {
        id: "amkr-for-amd",
        label: "Amkor先进封装",
        ticker: "AMKR",
        market: "US",
        exposure: "upstream",
        delta: "封装外包",
        summary: "先进封装与测试服务。",
        why: "Chiplet、HBM和高性能计算需要更复杂的封装与测试。",
        tags: ["封装", "测试"],
        deep: [
          { label: "Teradyne", ticker: "TER", market: "US", exposure: "upstream", delta: "测试", summary: "芯片和系统测试设备。", why: "复杂封装需要更多测试覆盖。", tags: ["ATE"] },
          { label: "Onto Innovation", ticker: "ONTO", market: "US", exposure: "upstream", delta: "先进量测", summary: "封装和晶圆检测。", why: "提高封装良率。", tags: ["量测"] },
        ],
      },
    ],
  },
  {
    id: "broadcom-train",
    parent: "train-gpu",
    label: "Broadcom",
    ticker: "AVGO",
    market: "US",
    layer: 3,
    kind: "company",
    exposure: "platform",
    delta: "定制ASIC + 网络",
    summary: "定制AI ASIC、交换芯片、NIC、SerDes和CPO。",
    why: "当超大云厂商从通用GPU转向自研加速器时，Broadcom更像“定制算力加网络”的平台。",
    tags: ["ASIC", "交换", "CPO"],
    sources: [sourceLinks.broadcom],
    upstreams: [
      {
        id: "tsm-for-avgo",
        label: "TSMC / 先进封装",
        ticker: "TSM",
        market: "ADR",
        exposure: "upstream",
        delta: "高端ASIC制造",
        summary: "先进制程、封装和光引擎集成。",
        why: "定制ASIC和交换芯片对先进制程、SerDes和封装要求高。",
        tags: ["代工", "封装"],
        deep: [
          { label: "Synopsys", ticker: "SNPS", market: "US", exposure: "upstream", delta: "EDA / IP", summary: "AI芯片和高速接口IP。", why: "定制芯片设计依赖EDA和接口IP。", tags: ["EDA"] },
          { label: "KLA", ticker: "KLAC", market: "US", exposure: "upstream", delta: "检测", summary: "晶圆和封装良率管理。", why: "大芯片和先进封装对缺陷更敏感。", tags: ["量测"] },
        ],
      },
      {
        id: "gf-for-avgo",
        label: "GlobalFoundries硅光",
        ticker: "GFS",
        market: "US",
        exposure: "upstream",
        delta: "CPO平台",
        summary: "GF Fotonix硅光工艺和光电封装。",
        why: "Broadcom的光引擎和CPO生态需要硅光工艺、PIC和封装伙伴。",
        tags: ["硅光", "CPO"],
        sources: [sourceLinks.gf],
        deep: [
          { label: "Corning", ticker: "GLW", market: "US", exposure: "upstream", delta: "玻璃波导", summary: "玻璃波导和光纤连接。", why: "CPO需要低损耗、可维护的光纤连接。", tags: ["光学材料"] },
          { label: "Amphenol", ticker: "APH", market: "US", exposure: "upstream", delta: "高速连接", summary: "光电连接器和高速线缆。", why: "高速端口需要可靠的机械连接。", tags: ["连接器"] },
        ],
      },
    ],
  },
  {
    id: "mu-memory",
    parent: "train-memory",
    label: "Micron",
    ticker: "MU",
    market: "US",
    layer: 3,
    kind: "company",
    exposure: "direct",
    delta: "HBM + SSD双重受益",
    summary: "HBM4、DDR、SOCAMM2、PCIe 6.0 SSD和高容量SSD。",
    why: "同时覆盖AI最紧缺的HBM和AI数据湖所需的高速、容量型存储。",
    tags: ["HBM", "SSD", "存储"],
    sources: [sourceLinks.micron],
    upstreams: [
      {
        id: "amat-for-mu",
        label: "Applied Materials设备",
        ticker: "AMAT",
        market: "US",
        exposure: "upstream",
        delta: "HBM工艺设备",
        summary: "DRAM、沉积、CMP、先进封装设备。",
        why: "HBM层数和封装复杂度提高会增加设备和工艺步骤。",
        tags: ["HBM设备"],
        sources: [sourceLinks.applied],
        deep: [
          { label: "Linde", ticker: "LIN", market: "US", exposure: "upstream", delta: "特种气体", summary: "半导体特种气体。", why: "晶圆制造需要高纯气体和供应系统。", tags: ["材料"] },
          { label: "MKS Instruments", ticker: "MKSI", market: "US", exposure: "upstream", delta: "真空 / 过程控制", summary: "真空、气体和工艺控制。", why: "先进DRAM和封装工艺需要精细过程控制。", tags: ["设备"] },
        ],
      },
      {
        id: "lrcx-for-mu",
        label: "Lam Research设备",
        ticker: "LRCX",
        market: "US",
        exposure: "upstream",
        delta: "刻蚀 / 先进封装",
        summary: "刻蚀、沉积和封装相关设备。",
        why: "HBM堆叠和高密度互连带来更多工艺复杂度。",
        tags: ["刻蚀", "封装"],
        deep: [
          { label: "KLA", ticker: "KLAC", market: "US", exposure: "upstream", delta: "检测", summary: "晶圆缺陷和封装量测。", why: "HBM良率对检测要求高。", tags: ["量测"] },
          { label: "FormFactor", ticker: "FORM", market: "US", exposure: "upstream", delta: "探针与测试", summary: "晶圆探针卡和测试接口。", why: "高层数HBM需要更复杂的测试。", tags: ["测试"] },
        ],
      },
    ],
  },
  {
    id: "tsm-package",
    parent: "train-package",
    label: "TSMC",
    ticker: "TSM",
    market: "ADR",
    layer: 3,
    kind: "company",
    exposure: "upstream",
    delta: "先进制程 + CoWoS",
    summary: "逻辑芯片、CoWoS、SoIC和COUPE硅光封装。",
    why: "几乎所有高端AI芯片都要经过先进制程和先进封装供应链。",
    tags: ["代工", "CoWoS", "CPO"],
    sources: [sourceLinks.tsmc],
    upstreams: [
      {
        id: "asml-for-tsm",
        label: "ASML光刻机",
        ticker: "ASML",
        market: "ADR",
        exposure: "upstream",
        delta: "EUV / DUV",
        summary: "先进逻辑和DRAM光刻设备。",
        why: "先进节点和HBM扩产提高光刻强度。",
        tags: ["EUV", "设备"],
        sources: [sourceLinks.asml],
        deep: [
          { label: "Zeiss", ticker: "非美股", market: "Non-US", exposure: "upstream", delta: "光学系统", summary: "EUV光学组件。", why: "光刻机依赖高精度光学系统。", tags: ["光学"] },
          { label: "TRUMPF", ticker: "非美股", market: "Non-US", exposure: "upstream", delta: "EUV光源", summary: "EUV激光和光源系统。", why: "EUV光源是光刻机核心部件。", tags: ["光源"] },
        ],
      },
      {
        id: "cdns-for-tsm",
        label: "Cadence / Synopsys EDA",
        ticker: "CDNS / SNPS",
        market: "US",
        exposure: "upstream",
        delta: "光电协同设计",
        summary: "芯片、封装、PCB和硅光设计工具。",
        why: "CPO和Chiplet需要电、光、热、封装联合仿真。",
        tags: ["EDA", "Chiplet"],
        deep: [
          { label: "Ansys", ticker: "已并入SNPS", market: "US", exposure: "upstream", delta: "热 / 光 / 电仿真", summary: "多物理场仿真能力。", why: "AI封装需要同时看信号完整性和散热。", tags: ["仿真"] },
        ],
      },
    ],
  },
  {
    id: "infer-nvda",
    parent: "infer-gpu",
    label: "NVIDIA推理平台",
    ticker: "NVDA",
    market: "US",
    layer: 3,
    kind: "company",
    exposure: "direct",
    delta: "推理时计算弹性",
    summary: "面向长思考、多Agent和高并发推理的GPU、Grace和网络平台。",
    why: "推理Token越多、并发越高，GPU和HBM利用率越成为瓶颈。",
    tags: ["推理", "Agent", "平台"],
    sources: [sourceLinks.nvidia, sourceLinks.reasoning],
    upstreams: [
      {
        id: "hbm-infer-nvda",
        label: "HBM4与先进内存",
        ticker: "MU / SK hynix",
        market: "Non-US",
        exposure: "upstream",
        delta: "KV Cache容量",
        summary: "更大的HBM和更高带宽支撑长上下文。",
        why: "推理时内存访问和KV Cache会随着上下文和Batch增长。",
        tags: ["HBM", "KV Cache"],
        deep: [
          { label: "Applied Materials", ticker: "AMAT", market: "US", exposure: "upstream", delta: "HBM设备", summary: "HBM和先进封装设备。", why: "高带宽内存扩产需要更多设备。", tags: ["设备"] },
          { label: "KLA", ticker: "KLAC", market: "US", exposure: "upstream", delta: "良率", summary: "HBM和封装检测。", why: "堆叠越高，检测和良率控制越关键。", tags: ["量测"] },
        ],
      },
      {
        id: "network-infer-nvda",
        label: "NVLink / InfiniBand生态",
        ticker: "NVDA",
        market: "US",
        exposure: "upstream",
        delta: "GPU间带宽",
        summary: "NVLink、NVSwitch、ConnectX和InfiniBand。",
        why: "多路径推理和大Batch会增加GPU之间的数据交换。",
        tags: ["NVLink", "IB"],
        deep: [
          { label: "Broadcom", ticker: "AVGO", market: "US", exposure: "platform", delta: "替代网络", summary: "开放Ethernet和CPO网络。", why: "部分客户会在规模化部署中采用开放网络。", tags: ["Ethernet", "CPO"] },
          { label: "Credo", ticker: "CRDO", market: "US", exposure: "upstream", delta: "高速互联", summary: "AEC、DSP和Retimer。", why: "GPU机架需要更低功耗的高速链路。", tags: ["SerDes"] },
        ],
      },
    ],
  },
  {
    id: "intel-cpu",
    parent: "agent-cpu",
    label: "Intel Xeon",
    ticker: "INTC",
    market: "US",
    layer: 3,
    kind: "company",
    exposure: "platform",
    delta: "Agent控制面",
    summary: "服务器CPU、以太网、数据移动和Agent控制面。",
    why: "Agent系统把一部分瓶颈从矩阵乘法转移到调度、并发和数据移动。",
    tags: ["CPU", "Agent", "Ethernet"],
    upstreams: [
      {
        id: "intel-foundry",
        label: "Intel Foundry",
        ticker: "INTC",
        market: "US",
        exposure: "upstream",
        delta: "自有制造",
        summary: "先进逻辑、封装和芯片制造。",
        why: "Intel同时是CPU供应商和制造/封装路线参与者。",
        tags: ["Foundry", "封装"],
        deep: [
          { label: "Synopsys", ticker: "SNPS", market: "US", exposure: "upstream", delta: "EDA", summary: "Intel先进工艺EDA和IP生态。", why: "工艺节点和设计工具共同演进。", tags: ["EDA"] },
          { label: "Applied Materials", ticker: "AMAT", market: "US", exposure: "upstream", delta: "设备", summary: "逻辑和封装制造设备。", why: "先进制造需要更复杂的材料工程。", tags: ["设备"] },
        ],
      },
      {
        id: "alab-for-intel",
        label: "Astera Labs连接芯片",
        ticker: "ALAB",
        market: "US",
        exposure: "upstream",
        delta: "PCIe / CXL",
        summary: "PCIe、CXL和内存/加速器互联。",
        why: "Agent和RAG负载增加后，CPU、GPU、内存、SSD之间需要更灵活的连接。",
        tags: ["CXL", "PCIe"],
        deep: [
          { label: "TSMC", ticker: "TSM", market: "ADR", exposure: "upstream", delta: "先进制程", summary: "连接芯片代工。", why: "高速SerDes芯片依赖先进工艺。", tags: ["代工"] },
          { label: "Amkor", ticker: "AMKR", market: "US", exposure: "upstream", delta: "封装测试", summary: "高速连接芯片封装。", why: "高速I/O对封装和信号完整性敏感。", tags: ["封装"] },
        ],
      },
    ],
  },
  {
    id: "marvell-network",
    parent: "switch-network",
    label: "Marvell",
    ticker: "MRVL",
    market: "US",
    layer: 3,
    kind: "company",
    exposure: "platform",
    delta: "1.6T / CPO平台",
    summary: "光DSP、SerDes、定制芯片、交换和CPO/NPO。",
    why: "同时受益于AI网络带宽提升和云厂商定制芯片趋势。",
    tags: ["DSP", "SerDes", "CPO"],
    sources: [sourceLinks.marvell],
    upstreams: [
      {
        id: "tsm-for-marvell",
        label: "TSMC 3nm / 2nm",
        ticker: "TSM",
        market: "ADR",
        exposure: "upstream",
        delta: "高速芯片制程",
        summary: "1.6T光DSP和定制芯片的先进代工。",
        why: "更高SerDes速率需要更先进的功耗和信号性能。",
        tags: ["3nm", "高速I/O"],
        deep: [
          { label: "Cadence", ticker: "CDNS", market: "US", exposure: "upstream", delta: "SerDes / EDA", summary: "高速接口和系统设计工具。", why: "高频信号完整性需要更复杂的仿真。", tags: ["EDA"] },
          { label: "KLA", ticker: "KLAC", market: "US", exposure: "upstream", delta: "良率控制", summary: "高端芯片过程控制。", why: "先进节点对缺陷和良率更敏感。", tags: ["量测"] },
        ],
      },
      {
        id: "gf-for-marvell",
        label: "GlobalFoundries硅光PIC",
        ticker: "GFS",
        market: "US",
        exposure: "upstream",
        delta: "硅光 / CPO",
        summary: "GF Fotonix硅光工艺和光电封装。",
        why: "光DSP之外，CPO需要PIC、激光器和光纤连接共同落地。",
        tags: ["SiPh", "PIC"],
        sources: [sourceLinks.gf],
        deep: [
          { label: "Corning", ticker: "GLW", market: "US", exposure: "upstream", delta: "玻璃波导", summary: "光纤和玻璃波导。", why: "光引擎与机架外部光纤需要低损耗连接。", tags: ["光学材料"] },
          { label: "Amphenol", ticker: "APH", market: "US", exposure: "upstream", delta: "高速连接", summary: "连接器和线缆。", why: "800G/1.6T端口需要高可靠机械连接。", tags: ["连接器"] },
        ],
      },
    ],
  },
  {
    id: "credo-optics",
    parent: "optics-cpo",
    label: "Credo",
    ticker: "CRDO",
    market: "US",
    layer: 3,
    kind: "company",
    exposure: "direct",
    delta: "800G / 1.6T / 3.2T",
    summary: "AEC、Retimer、光DSP和硅光PIC，覆盖NPO/CPO。",
    why: "是从电互联、SerDes到光互联过渡的较直接标的。",
    tags: ["硅光", "DSP", "AEC"],
    sources: [sourceLinks.credo],
    upstreams: [
      {
        id: "dust-for-credo",
        label: "DustPhotonics硅光PIC",
        ticker: "已被CRDO收购",
        market: "US",
        exposure: "upstream",
        delta: "PIC垂直整合",
        summary: "400G、800G、1.6T和3.2T硅光PIC。",
        why: "收购把Credo从电互联芯片进一步推向硅光器件和CPO。",
        tags: ["PIC", "收购"],
        deep: [
          { label: "GlobalFoundries", ticker: "GFS", market: "US", exposure: "upstream", delta: "硅光代工", summary: "硅光和先进光电封装平台。", why: "PIC需要稳定的量产工艺和PDK。", tags: ["代工"] },
          { label: "TSMC", ticker: "TSM", market: "ADR", exposure: "upstream", delta: "先进CMOS", summary: "DSP和高速电芯片代工。", why: "3nm DSP需要先进CMOS和封装。", tags: ["代工"] },
        ],
      },
      {
        id: "amkr-for-credo",
        label: "Amkor / ASE光电封装",
        ticker: "AMKR / ASX",
        market: "US",
        exposure: "upstream",
        delta: "光电组装测试",
        summary: "PIC、DSP、激光器和光纤的封装测试。",
        why: "CPO落地不仅是芯片设计，还依赖光电组装、耦合和可靠性。",
        tags: ["封装", "光电"],
        deep: [
          { label: "Kulicke & Soffa", ticker: "KLIC", market: "US", exposure: "upstream", delta: "键合设备", summary: "封装键合和互联设备。", why: "光电封装和Chiplet需要精密键合。", tags: ["封装设备"] },
          { label: "FormFactor", ticker: "FORM", market: "US", exposure: "upstream", delta: "测试接口", summary: "探针卡和测试接口。", why: "高速PIC和芯片需要专用测试。", tags: ["测试"] },
        ],
      },
    ],
  },
  {
    id: "coherent-optics",
    parent: "optics-cpo",
    label: "Coherent",
    ticker: "COHR",
    market: "US",
    layer: 3,
    kind: "company",
    exposure: "direct",
    delta: "CW / EML / 光模块",
    summary: "激光器、CW光源、EML、光通信器件和光模块。",
    why: "是“模型能力提高→网络速率提升→光源和光模块内容增加”中较直接的受益者。",
    tags: ["CW", "EML", "激光器"],
    upstreams: [
      {
        id: "gf-for-cohr",
        label: "GlobalFoundries硅光工艺",
        ticker: "GFS",
        market: "US",
        exposure: "upstream",
        delta: "PIC / CPO",
        summary: "硅光PIC、CPO和光电集成。",
        why: "Coherent的激光和光器件可以与硅光引擎、光模块结合。",
        tags: ["硅光", "CPO"],
        sources: [sourceLinks.gf],
        deep: [
          { label: "Applied Materials", ticker: "AMAT", market: "US", exposure: "upstream", delta: "光电材料工程", summary: "沉积、CMP和封装材料设备。", why: "硅光和先进封装增加工艺复杂度。", tags: ["设备"] },
          { label: "Entegris", ticker: "ENTG", market: "US", exposure: "upstream", delta: "高纯材料", summary: "过滤、化学品和晶圆保护。", why: "光电芯片同样要求高良率。", tags: ["材料"] },
        ],
      },
      {
        id: "glw-for-cohr",
        label: "Corning光纤与玻璃波导",
        ticker: "GLW",
        market: "US",
        exposure: "upstream",
        delta: "光纤内容量",
        summary: "光纤、玻璃波导和低损耗连接。",
        why: "光模块放量会带动光纤、连接器和耦合部件。",
        tags: ["光纤", "波导"],
        deep: [
          { label: "Amphenol", ticker: "APH", market: "US", exposure: "upstream", delta: "连接器", summary: "高速光电连接器。", why: "高密度端口需要更可靠的机械连接。", tags: ["连接器"] },
          { label: "TE Connectivity", ticker: "TEL", market: "US", exposure: "upstream", delta: "高速互联", summary: "高速连接、电源和线缆。", why: "光电模块和机架布线需要高速互联。", tags: ["连接器"] },
        ],
      },
    ],
  },
  {
    id: "gf-photonics",
    parent: "optics-cpo",
    label: "GlobalFoundries硅光",
    ticker: "GFS",
    market: "US",
    layer: 3,
    kind: "company",
    exposure: "platform",
    delta: "硅光收入有望翻倍",
    summary: "GF Fotonix、LPO、NPO、CPO和光电材料集成。",
    why: "是美股中少数直接具备硅光代工和CPO平台映射的公司，但业务基数相对小。",
    tags: ["SiPh", "CPO", "TFLN方向"],
    sources: [sourceLinks.gf],
    upstreams: [
      {
        id: "tfln-gf",
        label: "TFLN / BTO / 电光聚合物",
        ticker: "材料方向",
        market: "Non-US",
        exposure: "upstream",
        delta: "高Pockels系数",
        summary: "薄膜铌酸锂、BTO和电光聚合物集成方向。",
        why: "高带宽、低驱动电压材料可能提升硅光调制器性能。",
        tags: ["TFLN", "BTO", "材料"],
        deep: [
          { label: "TSMC COUPE", ticker: "TSM", market: "ADR", exposure: "upstream", delta: "光电封装", summary: "电芯片与光子芯片堆叠。", why: "CPO需要把光引擎直接集成进封装。", tags: ["COUPE"], sources: [sourceLinks.tsmc] },
          { label: "Cadence / Synopsys", ticker: "CDNS / SNPS", market: "US", exposure: "upstream", delta: "光电设计", summary: "硅光和光电协同EDA。", why: "材料、光路、电路和封装需要联合设计。", tags: ["EDA"] },
        ],
      },
      {
        id: "corning-gf",
        label: "Corning光纤连接",
        ticker: "GLW",
        market: "US",
        exposure: "upstream",
        delta: "CPO耦合",
        summary: "玻璃波导和可维护光纤连接方案。",
        why: "CPO要解决光纤耦合、维护和良率问题。",
        tags: ["波导", "连接"],
        deep: [
          { label: "Amphenol", ticker: "APH", market: "US", exposure: "upstream", delta: "机械连接", summary: "高速连接器。", why: "机架级光连接需要可插拔和高可靠设计。", tags: ["连接器"] },
        ],
      },
    ],
  },
  {
    id: "aaoi-optics",
    parent: "optics-cpo",
    label: "Applied Optoelectronics",
    ticker: "AAOI",
    market: "US",
    layer: 3,
    kind: "company",
    exposure: "early",
    delta: "数据中心收入高弹性",
    summary: "800G、1.6T光模块和垂直整合制造。",
    why: "订单和收入弹性大，但毛利率、现金流和客户集中度需要持续验证。",
    tags: ["800G", "1.6T", "高风险"],
    upstreams: [
      {
        id: "aaoi-laser",
        label: "激光器 / PIC / DSP生态",
        ticker: "COHR / LITE / CRDO",
        market: "US",
        exposure: "upstream",
        delta: "光模块BOM",
        summary: "激光器、PIC、DSP和驱动芯片。",
        why: "1.6T模块放量需要整个BOM同步放量。",
        tags: ["BOM", "光模块"],
        deep: [
          { label: "GlobalFoundries", ticker: "GFS", market: "US", exposure: "upstream", delta: "硅光代工", summary: "硅光PIC制造。", why: "硅光模块需要量产工艺和PDK。", tags: ["SiPh"] },
          { label: "MACOM", ticker: "MTSI", market: "US", exposure: "upstream", delta: "TIA / Driver", summary: "高速模拟光芯片。", why: "光模块需要TIA、Driver和DSP。", tags: ["模拟芯片"] },
        ],
      },
    ],
  },
  {
    id: "arista-network",
    parent: "switch-network",
    label: "Arista Networks",
    ticker: "ANET",
    market: "US",
    layer: 3,
    kind: "company",
    exposure: "direct",
    delta: "800G / 1.6T交换",
    summary: "AI Ethernet交换机、800G和1.6T网络平台。",
    why: "AI集群规模越大，开放Ethernet和高端交换机的价值越高。",
    tags: ["Ethernet", "交换机", "1.6T"],
    upstreams: [
      {
        id: "avgo-for-anet",
        label: "Broadcom交换芯片",
        ticker: "AVGO",
        market: "US",
        exposure: "upstream",
        delta: "交换芯片",
        summary: "高带宽交换芯片和SerDes。",
        why: "交换机厂商需要高端交换ASIC和高速接口。",
        tags: ["Switch ASIC"],
        deep: [
          { label: "TSMC", ticker: "TSM", market: "ADR", exposure: "upstream", delta: "先进代工", summary: "交换芯片制造。", why: "交换芯片带宽提升依赖先进工艺。", tags: ["代工"] },
          { label: "Credo", ticker: "CRDO", market: "US", exposure: "upstream", delta: "光电互联", summary: "DSP、AEC和光模块互联。", why: "交换机端口速率提高会增加高速互联BOM。", tags: ["DSP"] },
        ],
      },
      {
        id: "cohr-for-anet",
        label: "Coherent / Lumentum光器件",
        ticker: "COHR / LITE",
        market: "US",
        exposure: "upstream",
        delta: "光口升级",
        summary: "激光器、光源和高速光模块器件。",
        why: "800G和1.6T交换端口会提升光学内容量。",
        tags: ["光模块", "激光器"],
        deep: [
          { label: "Corning", ticker: "GLW", market: "US", exposure: "upstream", delta: "光纤", summary: "光纤和玻璃波导。", why: "高速光口依赖低损耗光纤。", tags: ["光纤"] },
          { label: "Amphenol", ticker: "APH", market: "US", exposure: "upstream", delta: "连接器", summary: "高速光电连接器。", why: "高密度交换机需要可靠连接。", tags: ["连接器"] },
        ],
      },
    ],
  },
  {
    id: "server-smci",
    parent: "server-fleet",
    label: "Super Micro Computer",
    ticker: "SMCI",
    market: "US",
    layer: 3,
    kind: "company",
    exposure: "platform",
    delta: "机架级交付",
    summary: "GPU服务器、液冷机架、CDU和整机集成。",
    why: "受益于AI服务器出货，但整机集成通常毛利率低于核心芯片和光器件。",
    tags: ["服务器", "液冷", "整机"],
    sources: [sourceLinks.supermicro],
    upstreams: [
      {
        id: "nvda-for-smci",
        label: "NVIDIA / AMD GPU平台",
        ticker: "NVDA / AMD",
        market: "US",
        exposure: "upstream",
        delta: "GPU供货",
        summary: "GPU、HGX、NVL72和AI计算节点。",
        why: "服务器厂商的收入和交付节奏受到GPU供货影响。",
        tags: ["GPU服务器"],
        deep: [
          { label: "Micron", ticker: "MU", market: "US", exposure: "upstream", delta: "HBM / DDR", summary: "服务器内存和HBM。", why: "每台服务器的内存价值量不断提高。", tags: ["内存"] },
          { label: "Amphenol", ticker: "APH", market: "US", exposure: "upstream", delta: "线缆 / 背板", summary: "高速连接和线缆。", why: "高密度机架需要更多高速连接。", tags: ["连接器"] },
        ],
      },
      {
        id: "vertiv-for-smci",
        label: "Vertiv液冷与配电",
        ticker: "VRT",
        market: "US",
        exposure: "upstream",
        delta: "液冷渗透率",
        summary: "CDU、冷板、UPS、配电和热管理。",
        why: "AI机架功率密度上升会带动液冷和电力基础设施。",
        tags: ["液冷", "UPS"],
        deep: [
          { label: "Eaton", ticker: "ETN", market: "US", exposure: "infrastructure", delta: "配电", summary: "UPS、配电和电源管理。", why: "高功率数据中心需要冗余配电。", tags: ["电力"] },
          { label: "Modine", ticker: "MOD", market: "US", exposure: "infrastructure", delta: "热管理", summary: "数据中心热管理。", why: "高密度机架对散热提出更高要求。", tags: ["散热"] },
        ],
      },
    ],
  },
  {
    id: "coreweave-cloud",
    parent: "cloud-dc",
    label: "CoreWeave",
    ticker: "CRWV",
    market: "US",
    layer: 3,
    kind: "company",
    exposure: "demand",
    delta: "GPU云需求",
    summary: "GPU云、AI训练和推理基础设施。",
    why: "它是硬件需求的直接承接方，资本开支和GPU租赁利用率是关键变量。",
    tags: ["GPU云", "资本开支"],
    upstreams: [
      {
        id: "nvda-for-crwv",
        label: "NVIDIA GPU云平台",
        ticker: "NVDA",
        market: "US",
        exposure: "upstream",
        delta: "GPU采购",
        summary: "GB200、GB300和NVL72等GPU集群。",
        why: "GPU云厂商的资本开支高度依赖GPU价格、交付和租赁需求。",
        tags: ["云", "GPU"],
        deep: [
          { label: "Dell / Supermicro", ticker: "DELL / SMCI", market: "US", exposure: "upstream", delta: "机架交付", summary: "GPU服务器和机架系统。", why: "GPU云需要快速完成机架级部署。", tags: ["服务器"] },
          { label: "Equinix / Digital Realty", ticker: "EQIX / DLR", market: "US", exposure: "infrastructure", delta: "机房与电力", summary: "托管机房、机柜和互联。", why: "GPU集群需要高功率数据中心空间。", tags: ["数据中心"] },
        ],
      },
    ],
  },
  {
    id: "ssd-memory",
    parent: "data-lake",
    label: "Micron / SanDisk / Seagate",
    ticker: "MU / SNDK / STX",
    market: "US",
    layer: 3,
    kind: "company",
    exposure: "direct",
    delta: "容量 + 吞吐双增长",
    summary: "企业SSD、NAND、高容量HDD和AI数据湖存储。",
    why: "多模态训练、Checkpoint、RAG和推理日志使存储容量与吞吐同步增长。",
    tags: ["SSD", "NAND", "HDD"],
    sources: [sourceLinks.micron],
    upstreams: [
      {
        id: "nand-equipment",
        label: "NAND / DRAM制造设备",
        ticker: "AMAT / LRCX / KLAC",
        market: "US",
        exposure: "upstream",
        delta: "存储产能",
        summary: "NAND、DRAM和存储检测设备。",
        why: "存储扩产会把需求传导到晶圆制造和检测设备。",
        tags: ["设备", "NAND"],
        deep: [
          { label: "ASML", ticker: "ASML", market: "ADR", exposure: "upstream", delta: "存储光刻", summary: "DRAM和NAND相关光刻。", why: "存储制程迁移提高设备强度。", tags: ["光刻"] },
          { label: "Entegris", ticker: "ENTG", market: "US", exposure: "upstream", delta: "化学品 / 过滤", summary: "存储制造材料。", why: "高密度存储需要更严格污染控制。", tags: ["材料"] },
        ],
      },
      {
        id: "storage-controllers",
        label: "PCIe / CXL控制器",
        ticker: "MRVL / ALAB",
        market: "US",
        exposure: "upstream",
        delta: "吞吐和延迟",
        summary: "SSD、PCIe和CXL连接控制。",
        why: "AI存储的价值不仅在容量，也在于低延迟把数据及时送到GPU。",
        tags: ["PCIe", "CXL"],
        deep: [
          { label: "Cadence", ticker: "CDNS", market: "US", exposure: "upstream", delta: "接口IP", summary: "PCIe、CXL和高速接口IP。", why: "高速互联依赖成熟IP和验证。", tags: ["IP"] },
          { label: "Amkor", ticker: "AMKR", market: "US", exposure: "upstream", delta: "封装", summary: "存储控制器封装。", why: "高速控制器需要先进封装和测试。", tags: ["封装"] },
        ],
      },
    ],
  },
  {
    id: "power-vertiv",
    parent: "power-cooling",
    label: "Vertiv",
    ticker: "VRT",
    market: "US",
    layer: 3,
    kind: "company",
    exposure: "infrastructure",
    delta: "液冷和电力高弹性",
    summary: "UPS、配电、CDU、冷板、液冷和数据中心热管理。",
    why: "AI机架功率密度上升时，电力和散热是不能绕开的物理约束。",
    tags: ["液冷", "电源", "数据中心"],
    sources: [sourceLinks.supermicro],
    upstreams: [
      {
        id: "eaton-for-vertiv",
        label: "Eaton / Hubbell电气系统",
        ticker: "ETN / HUBB",
        market: "US",
        exposure: "upstream",
        delta: "配电与连接",
        summary: "配电、UPS、电气保护和连接。",
        why: "AI数据中心需要更高功率和更强冗余。",
        tags: ["电力", "配电"],
        deep: [
          { label: "GE Vernova", ticker: "GEV", market: "US", exposure: "infrastructure", delta: "电网设备", summary: "发电、电网和电力设备。", why: "数据中心扩容最终受制于电力接入。", tags: ["电网"] },
          { label: "Quanta Services", ticker: "PWR", market: "US", exposure: "infrastructure", delta: "电力建设", summary: "电网和电力基础设施施工。", why: "新数据中心需要变电站和输电扩容。", tags: ["电网"] },
        ],
      },
      {
        id: "mpwr-for-vertiv",
        label: "电源半导体",
        ticker: "MPWR / ON / TXN",
        market: "US",
        exposure: "upstream",
        delta: "电源管理",
        summary: "电源管理、功率半导体和模拟芯片。",
        why: "GPU和交换芯片功率提高会增加VRM、PMIC和电源转换需求。",
        tags: ["PMIC", "功率半导体"],
        deep: [
          { label: "TSMC", ticker: "TSM", market: "ADR", exposure: "upstream", delta: "电源芯片代工", summary: "模拟和电源芯片制造。", why: "高性能电源管理需要成熟和先进工艺结合。", tags: ["代工"] },
          { label: "Amphenol", ticker: "APH", market: "US", exposure: "upstream", delta: "电源连接", summary: "高电流连接和线缆。", why: "高功率机架需要可靠的电源连接。", tags: ["连接器"] },
        ],
      },
    ],
  },
  {
    id: "test-kla",
    parent: "test-reliability",
    label: "KLA / Teradyne / Onto",
    ticker: "KLAC / TER / ONTO",
    market: "US",
    layer: 3,
    kind: "company",
    exposure: "upstream",
    delta: "良率与测试弹性",
    summary: "晶圆检测、先进封装量测、ATE和可靠性测试。",
    why: "AI芯片越大、HBM堆叠越高、CPO越复杂，测试和良率越重要。",
    tags: ["检测", "ATE", "良率"],
    upstreams: [
      {
        id: "eda-for-test",
        label: "Synopsys / Cadence",
        ticker: "SNPS / CDNS",
        market: "US",
        exposure: "upstream",
        delta: "设计验证",
        summary: "测试、封装和光电协同设计工具。",
        why: "芯片和封装验证越复杂，EDA工具价值量越高。",
        tags: ["EDA", "验证"],
        deep: [
          { label: "TSMC", ticker: "TSM", market: "ADR", exposure: "upstream", delta: "PDK / 工艺", summary: "代工工艺和设计规则。", why: "EDA工具与代工PDK共同决定流片效率。", tags: ["PDK"] },
          { label: "GlobalFoundries", ticker: "GFS", market: "US", exposure: "upstream", delta: "硅光PDK", summary: "硅光工艺和设计平台。", why: "光电产品需要专用PDK和量产流。", tags: ["硅光"] },
        ],
      },
    ],
  },
];

function materializeNodes(): TreeNode[] {
  const materialized = [...baseNodes];

  for (const direct of directSpecs) {
    materialized.push({
      ...direct,
      parent: direct.parent,
      layer: 3,
      kind: "company",
    });

    for (const upstream of direct.upstreams) {
      const upstreamId = `${direct.id}-${upstream.id}`;
      materialized.push({
        ...upstream,
        id: upstreamId,
        parent: direct.id,
        layer: 4,
        kind: "upstream",
      });

      for (const deep of upstream.deep ?? []) {
        materialized.push({
          ...deep,
          id: `${upstreamId}-${deep.label.replaceAll(" ", "-")}`,
          parent: upstreamId,
          layer: 5,
          kind: "upstream",
        });
      }
    }
  }

  return materialized;
}

const allNodes = materializeNodes();
const nodeMap: Record<string, TreeNode> = Object.fromEntries(
  allNodes.map((node) => [node.id, node]),
);
const childrenMap: Record<string, string[]> = allNodes.reduce(
  (map, node) => {
    if (node.parent) {
      map[node.parent] = [...(map[node.parent] ?? []), node.id];
    }
    return map;
  },
  {} as Record<string, string[]>,
);

const scenarios: Array<{
  id: ScenarioId;
  label: string;
  short: string;
  gpu: string;
  memory: string;
  network: string;
  bestFor: string;
}> = [
  {
    id: "scale",
    label: "更大模型",
    short: "参数与训练数据同步变大",
    gpu: "1.3–2×",
    memory: "1.3–2.5×",
    network: "1.3–2×",
    bestFor: "GPU / HBM / 先进封装",
  },
  {
    id: "reasoning",
    label: "长思考 + Agent",
    short: "每次回答消耗更多推理Token",
    gpu: "2–4×",
    memory: "1.5–3×",
    network: "1.5–3×",
    bestFor: "推理GPU / CPU / SSD / 光互联",
  },
  {
    id: "efficiency",
    label: "算法效率提升",
    short: "量化、稀疏、蒸馏抵消硬件需求",
    gpu: "1.1–1.5×",
    memory: "1.0–1.3×",
    network: "1.1–1.8×",
    bestFor: "高端芯片单机价值量",
  },
];

const layerNames = ["模型需求", "能力驱动", "资源瓶颈", "一级企业", "二级上游", "五层深处"];

function nodeMatches(node: TreeNode, query: string, filter: Filter) {
  const haystack = [node.label, node.ticker, node.summary, node.why, ...node.tags]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const queryMatch = !query || haystack.includes(query.toLowerCase());
  const filterMatch =
    filter === "all" ||
    (filter === "direct" && (node.exposure === "direct" || node.exposure === "early")) ||
    (filter === "upstream" && (node.exposure === "upstream" || node.kind === "upstream")) ||
    (filter === "high-growth" && /[2-9]|×/.test(node.delta)) ||
    (filter === "us" && (node.market === "US" || node.market === "ADR"));
  return queryMatch && filterMatch;
}

function exposureLabel(exposure: Exposure) {
  const labels: Record<Exposure, string> = {
    direct: "一级直接",
    platform: "平台型",
    upstream: "上游",
    early: "早期高弹性",
    demand: "需求方",
    infrastructure: "基础设施",
  };
  return labels[exposure];
}

function marketLabel(market: Market) {
  if (market === "ADR") return "美股ADR";
  if (market === "Non-US") return "非美股参考";
  if (market === "Private") return "未上市参考";
  return "美股";
}

function TreeBranch({
  id,
  expanded,
  selectedId,
  onSelect,
  onToggle,
  shouldRender,
  forceExpand,
}: {
  id: string;
  expanded: Set<string>;
  selectedId: string;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  shouldRender: (id: string) => boolean;
  forceExpand: (id: string) => boolean;
}) {
  const node = nodeMap[id];
  const children = (childrenMap[id] ?? []).filter(shouldRender);
  const hasChildren = (childrenMap[id] ?? []).length > 0;
  const isExpanded = expanded.has(id) || forceExpand(id);

  if (!shouldRender(id)) return null;

  return (
    <div className={`tree-branch tree-branch--layer-${node.layer}`}>
      <div className={`tree-node-row ${selectedId === id ? "is-selected" : ""}`}>
        <button
          className={`tree-node tree-node--${node.kind} tree-node--${node.exposure}`}
          onClick={() => onSelect(id)}
          aria-current={selectedId === id ? "true" : undefined}
        >
          <span className="tree-node__layer">L{node.layer}</span>
          <span className="tree-node__body">
            <span className="tree-node__title">
              {node.label}
              {node.ticker && <span className="tree-node__ticker">{node.ticker}</span>}
            </span>
            <span className="tree-node__meta">
              <span>{exposureLabel(node.exposure)}</span>
              <span>{node.delta}</span>
            </span>
          </span>
          {hasChildren && <span className="tree-node__count">{childrenMap[id].length}</span>}
        </button>
        {hasChildren && node.layer < 5 && (
          <button
            className="tree-toggle"
            onClick={() => onToggle(id)}
            aria-label={`${isExpanded ? "收起" : "展开"}${node.label}`}
          >
            {isExpanded ? "−" : "+"}
          </button>
        )}
      </div>
      {isExpanded && children.length > 0 && (
        <div className="tree-children">
          {children.map((childId) => (
            <TreeBranch
              key={childId}
              id={childId}
              expanded={expanded}
              selectedId={selectedId}
              onSelect={onSelect}
              onToggle={onToggle}
              shouldRender={shouldRender}
              forceExpand={forceExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [selectedId, setSelectedId] = useState("root");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(["root"]));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [scenarioId, setScenarioId] = useState<ScenarioId>("reasoning");

  const selected = nodeMap[selectedId] ?? nodeMap.root;
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[1];

  const descendantMatch = useMemo(() => {
    const cache = new Map<string, boolean>();
    const hasMatch = (id: string): boolean => {
      if (cache.has(id)) return cache.get(id) ?? false;
      const match = nodeMatches(nodeMap[id], query, filter);
      const childMatch = (childrenMap[id] ?? []).some(hasMatch);
      const result = match || childMatch;
      cache.set(id, result);
      return result;
    };
    allNodes.forEach((node) => hasMatch(node.id));
    return cache;
  }, [filter, query]);

  const activeFilter = query.length > 0 || filter !== "all";
  const shouldRender = (id: string) => !activeFilter || descendantMatch.get(id) === true;
  const forceExpand = (id: string) => activeFilter && descendantMatch.get(id) === true;

  const path = useMemo(() => {
    const result: TreeNode[] = [];
    let cursor: TreeNode | undefined = selected;
    while (cursor) {
      result.unshift(cursor);
      cursor = cursor.parent ? nodeMap[cursor.parent] : undefined;
    }
    return result;
  }, [selected]);

  const toggle = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectNode = (id: string) => {
    setSelectedId(id);
    if ((childrenMap[id] ?? []).length > 0 && nodeMap[id].layer < 5) {
      setExpanded((current) => new Set(current).add(id));
    }
  };

  const expandSubtree = (id: string) => {
    const next = new Set(expanded);
    const walk = (currentId: string) => {
      if ((childrenMap[currentId] ?? []).length > 0) next.add(currentId);
      (childrenMap[currentId] ?? []).forEach(walk);
    };
    walk(id);
    setExpanded(next);
  };

  const resetTree = () => {
    setExpanded(new Set(["root"]));
    setSelectedId("root");
    setQuery("");
    setFilter("all");
  };

  const directCount = allNodes.filter(
    (node) => node.exposure === "direct" || node.exposure === "early",
  ).length;
  const upstreamCount = allNodes.filter((node) => node.kind === "upstream").length;

  return (
    <main className="site-shell">
      <header className="hero">
        <div className="hero__topline">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>AI SUPPLY CHAIN LAB</span>
            <span className="brand-lockup__muted">US EQUITIES / 2026</span>
          </div>
          <div className="hero__status">
            <span className="status-dot" />
            可展开至五层
          </div>
        </div>

        <div className="hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">MODEL CAPABILITY → PHYSICAL INFRASTRUCTURE</p>
            <h1>
              从模型能力提升，
              <br />
              一层层找到上游企业。
            </h1>
            <p className="hero__intro">
              点击任意节点逐层展开。每个公司节点都附带产业链角色、需求弹性、市场属性和下一层上游，最多下钻五层。
            </p>
          </div>

          <div className="hero__signal">
            <div className="signal-kicker">当前研究情景</div>
            <div className="signal-title">{scenario.label}</div>
            <div className="signal-copy">{scenario.short}</div>
            <div className="signal-grid">
              <div>
                <span>GPU</span>
                <strong>{scenario.gpu}</strong>
              </div>
              <div>
                <span>HBM</span>
                <strong>{scenario.memory}</strong>
              </div>
              <div>
                <span>网络</span>
                <strong>{scenario.network}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-card">
            <span>节点总量</span>
            <strong>{allNodes.length}</strong>
            <small>含企业、资源和上游环节</small>
          </div>
          <div className="metric-card">
            <span>直接 / 高弹性</span>
            <strong>{directCount}</strong>
            <small>GPU、HBM、光互联和基础设施</small>
          </div>
          <div className="metric-card">
            <span>上游节点</span>
            <strong>{upstreamCount}</strong>
            <small>最多向下延伸到L5</small>
          </div>
          <div className="metric-card metric-card--accent">
            <span>核心观察</span>
            <strong>带宽 / HBM / 液冷</strong>
            <small>不只是GPU数量</small>
          </div>
        </div>
      </header>

      <section className="scenario-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SCENARIO SWITCH</p>
            <h2>先选择能力提升的路径</h2>
          </div>
          <p className="section-note">
            “能力提高1”不是统一单位。切换情景后，右上角的资源弹性会同步变化。
          </p>
        </div>
        <div className="scenario-tabs">
          {scenarios.map((item) => (
            <button
              key={item.id}
              className={`scenario-tab ${scenarioId === item.id ? "is-active" : ""}`}
              onClick={() => setScenarioId(item.id)}
            >
              <span>{item.label}</span>
              <small>{item.short}</small>
            </button>
          ))}
        </div>
        <div className="scenario-footnote">
          <span className="footnote-mark">↳</span>
          <span>更适合研究：{scenario.bestFor}</span>
          <span className="footnote-divider" />
          <span>区间是资源需求敏感度，不等于公司收入增速或股价涨幅。</span>
        </div>
      </section>

      <section className="workspace">
        <div className="tree-panel panel-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">INTERACTIVE TREE / 01</p>
              <h2>五层供应链树</h2>
            </div>
            <div className="panel-header__actions">
              <button className="ghost-button" onClick={() => expandSubtree(selectedId)}>
                展开当前子树
              </button>
              <button className="ghost-button ghost-button--quiet" onClick={resetTree}>
                重置
              </button>
            </div>
          </div>

          <div className="tree-toolbar">
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索公司、代码、技术或上游…"
                aria-label="搜索产业链节点"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="清除搜索">
                  ×
                </button>
              )}
            </label>
            <div className="filter-row" role="group" aria-label="节点筛选">
              {(
                [
                  ["all", "全部"],
                  ["direct", "直接 / 高弹性"],
                  ["upstream", "上游设备"],
                  ["high-growth", "放大区间"],
                  ["us", "美股可交易"],
                ] as Array<[Filter, string]>
              ).map(([value, label]) => (
                <button
                  key={value}
                  className={`filter-chip ${filter === value ? "is-active" : ""}`}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="tree-legend">
            <span>
              <i className="legend-dot legend-dot--direct" />一级直接
            </span>
            <span>
              <i className="legend-dot legend-dot--platform" />平台型
            </span>
            <span>
              <i className="legend-dot legend-dot--upstream" />二级上游
            </span>
            <span>
              <i className="legend-dot legend-dot--early" />早期高弹性
            </span>
            <span className="tree-legend__hint">点击卡片查看详情，点击右侧＋/−展开</span>
          </div>

          <div className="layer-rail">
            {layerNames.map((name, index) => (
              <span key={name} className={`layer-pill layer-pill--${index}`}>
                L{index} · {name}
              </span>
            ))}
          </div>

          <div className="tree-scroll" aria-label="可展开的AI产业链树">
            <TreeBranch
              id="root"
              expanded={expanded}
              selectedId={selectedId}
              onSelect={selectNode}
              onToggle={toggle}
              shouldRender={shouldRender}
              forceExpand={forceExpand}
            />
          </div>
        </div>

        <aside className="inspector panel-card">
          <div className="inspector__topline">
            <span className={`exposure-badge exposure-badge--${selected.exposure}`}>
              {exposureLabel(selected.exposure)}
            </span>
            <span className="layer-label">L{selected.layer} / {layerNames[selected.layer]}</span>
          </div>

          <div className="breadcrumb">
            {path.map((item, index) => (
              <span key={item.id}>
                <button onClick={() => selectNode(item.id)}>{item.label}</button>
                {index < path.length - 1 && <b>›</b>}
              </span>
            ))}
          </div>

          <div className="inspector-title-row">
            <div>
              <h2>{selected.label}</h2>
              {selected.ticker && <p className="inspector-ticker">{selected.ticker}</p>}
            </div>
            <div className="market-badge">{marketLabel(selected.market)}</div>
          </div>

          <div className="inspector-signal">
            <span>需求弹性 / 研究信号</span>
            <strong>{selected.delta}</strong>
          </div>

          <div className="inspector-copy">
            <p>{selected.summary}</p>
            <p className="inspector-copy__why">{selected.why}</p>
          </div>

          <div className="tag-row">
            {selected.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <div className="inspector-section">
            <div className="inspector-section__heading">
              <span>下一级节点</span>
              <small>{(childrenMap[selected.id] ?? []).length} 个可展开</small>
            </div>
            <div className="child-list">
              {(childrenMap[selected.id] ?? []).map((childId) => {
                const child = nodeMap[childId];
                return (
                  <button key={childId} className="child-card" onClick={() => selectNode(childId)}>
                    <span className={`child-card__marker child-card__marker--${child.exposure}`} />
                    <span className="child-card__body">
                      <span className="child-card__title">
                        {child.label}
                        {child.ticker && <em>{child.ticker}</em>}
                      </span>
                      <span className="child-card__meta">L{child.layer} · {child.delta}</span>
                    </span>
                    <span className="child-card__arrow">→</span>
                  </button>
                );
              })}
              {(childrenMap[selected.id] ?? []).length === 0 && (
                <div className="empty-child">这是当前树的最深层，已到达L5。</div>
              )}
            </div>
          </div>

          {selected.sources && selected.sources.length > 0 && (
            <div className="source-block">
              <span className="source-block__label">公开资料</span>
              <div>
                {selected.sources.map((source) => (
                  <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
                    {source.label} ↗
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>

      <section className="reading-panel panel-card">
        <div className="reading-panel__intro">
          <p className="eyebrow">HOW TO READ THE MAP</p>
          <h2>真正需要跟踪的不是“GPU数量”，而是每个算力单元携带的系统价值量。</h2>
          <p>
            新一代GPU会提升单卡性能，但模型也会增加HBM、KV Cache、网络带宽、光互联和液冷需求。对上游企业而言，位数、带宽、封装复杂度和功率密度，往往比单纯的芯片数量更重要。
          </p>
        </div>
        <div className="reading-grid">
          <div className="reading-card">
            <span className="reading-card__number">01</span>
            <h3>看工作量路径</h3>
            <p>模型变大、长思考和Agent调用，分别对应不同的硬件弹性。</p>
          </div>
          <div className="reading-card">
            <span className="reading-card__number">02</span>
            <h3>看系统瓶颈</h3>
            <p>HBM、网络、液冷和先进封装可能比GPU数量更早出现供给约束。</p>
          </div>
          <div className="reading-card">
            <span className="reading-card__number">03</span>
            <h3>看收入兑现</h3>
            <p>订单、出货、毛利率、库存和现金流，决定主题能否转化成公司业绩。</p>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <span>研究框架 · 2026-08-17</span>
        <span>范围：模型算力、内存、网络、硅光、封装、服务器、电力和液冷</span>
        <span>资源倍数是情景区间，不构成投资建议</span>
      </footer>
    </main>
  );
}
