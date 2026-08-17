"use client";

import { useMemo } from "react";

import type { ResearchDataset, ResearchLayer, ResearchNode } from "./types";

type NetworkGraphProps = {
  dataset: ResearchDataset;
  focusId: string;
  maxLayer: ResearchLayer;
  query: string;
  onDepthChange: (layer: ResearchLayer) => void;
  onSelect: (node: ResearchNode) => void;
};

const layerLabels: Record<ResearchLayer, string> = {
  0: "L0 研究目标",
  1: "L1 需求与平台",
  2: "L2 系统与器件",
  3: "L3 封装与基础设施",
  4: "L4 制造与公用工程",
  5: "L5 原材料与能源",
};

const nodeWidth = 232;
const columnWidth = 270;
const rowHeight = 88;

function matchesQuery(node: ResearchNode, query: string) {
  if (!query.trim()) return true;
  const haystack = [
    node.id,
    node.label,
    node.description,
    node.section,
    node.category,
    node.tags.join(" "),
  ]
    .join(" ")
    .toLocaleLowerCase();
  return haystack.includes(query.trim().toLocaleLowerCase());
}

function clampLayer(layer: number): ResearchLayer {
  return Math.max(0, Math.min(5, layer)) as ResearchLayer;
}

export function NetworkGraph({
  dataset,
  focusId,
  maxLayer,
  query,
  onDepthChange,
  onSelect,
}: NetworkGraphProps) {
  const layout = useMemo(() => {
    const depthNodes = dataset.nodes.filter((node) => node.layer <= maxLayer);
    const matches = new Set(
      depthNodes.filter((node) => matchesQuery(node, query)).map((node) => node.id),
    );
    const visibleIds = new Set(matches);

    if (query.trim()) {
      for (const edge of dataset.edges) {
        if (matches.has(edge.from)) visibleIds.add(edge.to);
        if (matches.has(edge.to)) visibleIds.add(edge.from);
      }
    }

    const visibleNodes = depthNodes.filter(
      (node) => !query.trim() || visibleIds.has(node.id),
    );
    const nodesByLayer = new Map<ResearchLayer, ResearchNode[]>();

    for (const node of visibleNodes) {
      const layerNodes = nodesByLayer.get(node.layer) ?? [];
      layerNodes.push(node);
      nodesByLayer.set(node.layer, layerNodes);
    }

    const positions = new Map<string, { x: number; y: number }>();
    for (const [layer, layerNodes] of nodesByLayer) {
      layerNodes.forEach((node, index) => {
        positions.set(node.id, {
          x: 24 + layer * columnWidth,
          y: 24 + index * rowHeight,
        });
      });
    }

    const visibleEdges = dataset.edges.filter(
      (edge) => positions.has(edge.from) && positions.has(edge.to),
    );
    const maxRows = Math.max(
      1,
      ...[...nodesByLayer.values()].map((layerNodes) => layerNodes.length),
    );

    return {
      nodes: visibleNodes,
      edges: visibleEdges,
      positions,
      width: Math.max(980, (maxLayer + 1) * columnWidth + 40),
      height: Math.max(500, maxRows * rowHeight + 50),
      matchedCount: matches.size,
    };
  }, [dataset.edges, dataset.nodes, maxLayer, query]);

  const nodeMap = useMemo(
    () => new Map(dataset.nodes.map((node) => [node.id, node])),
    [dataset.nodes],
  );

  return (
    <section className="network-shell" aria-label="Research relationship network">
      <div className="network-toolbar">
        <div className="network-toolbar__copy">
          <span className="eyebrow">NETWORK GRAPH / DIVE-M SNAPSHOT</span>
          <p>
            当前图保留研究材料中的方向，但普通实线关系暂标为 technology；supplier、customer
            等具体类型要在证据账本核验后升级。
          </p>
        </div>
        <div className="network-depth" aria-label="Network depth">
          <span>展开至</span>
          {(Object.keys(layerLabels) as unknown as ResearchLayer[]).map((layer) => (
            <button
              className={layer === maxLayer ? "is-active" : ""}
              key={layer}
              onClick={() => onDepthChange(clampLayer(layer))}
              type="button"
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      <div className="network-layer-labels" aria-hidden="true">
        {(Object.keys(layerLabels) as unknown as ResearchLayer[])
          .filter((layer) => layer <= maxLayer)
          .map((layer) => (
            <span key={layer} style={{ left: `${24 + layer * columnWidth}px` }}>
              {layerLabels[layer]}
            </span>
          ))}
      </div>

      <div className="network-viewport">
        <div
          className="network-canvas"
          style={{ minWidth: `${layout.width}px`, minHeight: `${layout.height}px` }}
        >
          {layout.edges.map((edge) => {
            const from = layout.positions.get(edge.from);
            const to = layout.positions.get(edge.to);
            if (!from || !to) return null;

            const sourceX = from.x + nodeWidth / 2;
            const sourceY = from.y + 31;
            const targetX = to.x + nodeWidth / 2;
            const targetY = to.y + 31;
            const deltaX = targetX - sourceX;
            const deltaY = targetY - sourceY;
            const length = Math.sqrt(deltaX ** 2 + deltaY ** 2);
            const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
            const isSubstitute = edge.relation === "substitute";

            return (
              <span
                aria-hidden="true"
                className={`network-edge${isSubstitute ? " network-edge--substitute" : ""}`}
                key={edge.id}
                style={{
                  left: `${sourceX}px`,
                  top: `${sourceY}px`,
                  transform: `rotate(${angle}deg)`,
                  width: `${Math.max(12, length)}px`,
                }}
              />
            );
          })}

          {layout.nodes.map((node) => {
            const position = layout.positions.get(node.id);
            if (!position) return null;
            const edgeCount = dataset.edges.filter(
              (edge) => edge.from === node.id || edge.to === node.id,
            ).length;
            const isMatched = !query.trim() || matchesQuery(node, query);

            return (
              <button
                aria-label={`Select ${node.label}`}
                className={`network-node network-node--layer-${node.layer}${
                  node.id === focusId ? " is-selected" : ""
                }${isMatched ? "" : " is-context"}`}
                key={node.id}
                onClick={() => onSelect(node)}
                style={{ left: `${position.x}px`, top: `${position.y}px` }}
                type="button"
              >
                <span className="network-node__layer">
                  L{node.layer} · {node.section}
                </span>
                <strong className="network-node__title">{node.label}</strong>
                <span className="network-node__description">{node.description}</span>
                <span className="network-node__meta">
                  {node.status} · {edgeCount} relations
                </span>
              </button>
            );
          })}

          {layout.nodes.length === 0 ? (
            <div className="network-empty">
              没有匹配节点。尝试缩短关键词，或把展开层级调高。
            </div>
          ) : null}
        </div>
      </div>

      <div className="network-footnote">
        <span>显示 {layout.nodes.length} / {dataset.nodes.length} 节点</span>
        <span>显示 {layout.edges.length} / {dataset.edges.length} 条边</span>
        {query.trim() ? <span>命中 {layout.matchedCount} 个节点并保留邻接节点</span> : null}
        <span>焦点：{nodeMap.get(focusId)?.label ?? focusId}</span>
      </div>
    </section>
  );
}

