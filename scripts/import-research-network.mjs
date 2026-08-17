import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const sourcePath = resolve(
  projectRoot,
  "data/research/sources/ai-infrastructure-expanded-network.mmd",
);
const outputPath = resolve(projectRoot, "app/research/ai-infrastructure-import.json");

const layerBySection = {
  ROOT: 0,
  DEMAND: 1,
  STORAGE: 2,
  SYSTEM: 2,
  PKG: 3,
  WFE: 4,
  MAT: 5,
  FABUTIL: 4,
  POWER: 3,
  COOL: 3,
  EPC: 4,
  RAW: 5,
};

const categoryBySection = {
  ROOT: "Research target",
  DEMAND: "Demand and compute platforms",
  STORAGE: "Storage components and media",
  SYSTEM: "Servers, networking, and optical interconnect",
  PKG: "Advanced packaging and substrate",
  WFE: "Wafer fabrication, metrology, and test equipment",
  MAT: "Wafer, chemical, gas, and filter materials",
  FABUTIL: "Fab utilities, cleanroom, and water",
  POWER: "Power conversion and data-center electrical architecture",
  COOL: "Cooling, heat rejection, and water loop",
  EPC: "Cables, construction, and grid build-out",
  RAW: "Further upstream: commodities, materials, and generation",
};

const checkedAt = "2026-08-17";
const networkEvidenceId = "gei-w-network-v76";

function parseQuotedLabel(line) {
  const match = line.match(/^[\s\t]*([A-Za-z0-9_]+)\s*\[\"(.*)\"\]\s*$/);
  return match ? { id: match[1], label: match[2] } : null;
}

function splitLabel(label) {
  const [first, ...rest] = label.split(":");
  return {
    title: first.trim() || label.trim(),
    description: rest.length > 0 ? rest.join(":").trim() : label.trim(),
  };
}

function sectionMeta(section) {
  const normalized = section || "ROOT";
  return {
    section: normalized,
    layer: layerBySection[normalized] ?? 5,
    category: categoryBySection[normalized] ?? normalized,
  };
}

function parseNetwork(markdown) {
  const nodes = new Map();
  const edges = [];
  const sectionStack = ["ROOT"];

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("%%") || line === "flowchart LR") {
      continue;
    }

    const subgraphMatch = line.match(/^subgraph\s+([A-Za-z0-9_]+)\[\"(.*)\"\]$/);
    if (subgraphMatch) {
      sectionStack.push(subgraphMatch[1]);
      continue;
    }

    if (line === "end") {
      if (sectionStack.length > 1) {
        sectionStack.pop();
      }
      continue;
    }

    const node = parseQuotedLabel(line);
    if (node) {
      nodes.set(node.id, { ...node, section: sectionStack.at(-1) ?? "ROOT" });
      continue;
    }

    const edgeMatch = line.match(
      /^([A-Za-z0-9_]+)\s+(-->|-\.->)\s+([A-Za-z0-9_]+)\s*$/,
    );
    if (edgeMatch) {
      edges.push({
        from: edgeMatch[1],
        operator: edgeMatch[2],
        to: edgeMatch[3],
      });
    }
  }

  return { nodes, edges };
}

function makeEvidence() {
  return [
    {
      id: networkEvidenceId,
      title: "AI infrastructure expanded network (Mermaid v76)",
      sourceUri: "data/research/sources/ai-infrastructure-expanded-network.mmd",
      sourceType: "research",
      checkedAt,
      excerpt:
        "Arrows encode demand/feed direction; dashed arrows encode substitution or demand reduction.",
    },
    {
      id: "gei-w-network-extended-v61",
      title: "AI 大模型基础设施供应链网络：向更上游扩展的研究版",
      sourceUri:
        "data/research/sources/ai-infrastructure-supply-chain-network-extended-zh.md",
      sourceType: "research",
      checkedAt,
    },
    {
      id: "gei-w-evidence-ledger-v61",
      title: "AI 基础设施供应链公司证据账本",
      sourceUri:
        "data/research/sources/ai-infrastructure-company-evidence-ledger-zh.md",
      sourceType: "research",
      checkedAt,
    },
  ];
}

function makeDataset(markdown) {
  const parsed = parseNetwork(markdown);
  const evidence = makeEvidence();

  const nodes = [...parsed.nodes.values()].map((node) => {
    const meta = sectionMeta(node.section);
    const split = splitLabel(node.label);
    return {
      id: node.id,
      label: split.title,
      description: node.label,
      section: meta.section,
      layer: meta.layer,
      market: "Mixed",
      category: meta.category,
      role: "Imported research node",
      tags: [meta.section, "gei-w-v76"],
      status: "imported",
      evidenceIds: [networkEvidenceId],
    };
  });

  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = parsed.edges
    .filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to))
    .map((edge, index) => {
      const isSubstitute = edge.operator === "-.->";
      return {
        id: `gei-w-edge-${String(index + 1).padStart(3, "0")}`,
        from: edge.from,
        to: edge.to,
        relation: isSubstitute ? "substitute" : "technology",
        impact: isSubstitute ? "low" : "medium",
        confidence: isSubstitute ? 0.45 : 0.55,
        explanation: isSubstitute
          ? "Imported dashed substitution/demand-reduction relation; verify scope against the evidence ledger."
          : "Imported from the Mermaid demand/feed direction; the specific supplier/customer relationship still requires evidence-ledger verification.",
        evidenceIds: [networkEvidenceId],
        status: "imported",
      };
    });

  const sourceEvidenceIds = evidence.map((item) => item.id);
  const run = {
    id: "gei-w-ai-infrastructure-v76",
    target: "AI infrastructure / public-equity ecosystem",
    question:
      "How does AI model demand propagate through computing, optical, packaging, power, cooling and upstream material layers?",
    protocol: "DIVE-M",
    status: "needs-review",
    startedAt: checkedAt,
    sourceEvidenceIds,
    importedNodeIds: nodes.map((node) => node.id),
    importedEdgeIds: edges.map((edge) => edge.id),
    nextQueue: [
      "Link imported nodes to listed tickers and public companies.",
      "Verify relation types from the evidence ledger.",
      "Ingest financial snapshots and reporting periods.",
      "Separate direct disclosure from analyst inference.",
    ],
    notes: [
      "This import is a reproducible research snapshot, not an automatic claim of supplier/customer status.",
      "The current importer preserves graph direction and marks normal feed edges as provisional technology relations.",
    ],
  };

  return { nodes, edges, evidence, runs: [run] };
}

const source = await readFile(sourcePath, "utf8");
const dataset = makeDataset(source);
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");

console.log(
  `Imported ${dataset.nodes.length} nodes, ${dataset.edges.length} edges, ${dataset.evidence.length} evidence records into ${outputPath}`,
);

