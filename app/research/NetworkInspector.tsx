"use client";

import type { ResearchDataset, ResearchEdge, ResearchNode } from "./types";

type NetworkInspectorProps = {
  dataset: ResearchDataset;
  node: ResearchNode | undefined;
  onSelect: (node: ResearchNode) => void;
};

const relationLabels: Record<ResearchEdge["relation"], string> = {
  supplier: "供应商",
  customer: "客户",
  partner: "合作伙伴",
  application: "应用",
  competitor: "竞争",
  substitute: "替代 / 降需求",
  manufacturing: "制造",
  technology: "技术 / 需求传导",
  investment: "投资",
  platform: "平台",
};

export function NetworkInspector({ dataset, node, onSelect }: NetworkInspectorProps) {
  if (!node) {
    return (
      <aside className="inspector network-inspector">
        <span className="eyebrow">RESEARCH INSPECTOR</span>
        <h2>选择一个研究节点</h2>
        <p className="inspector-copy">
          网络中的每条边都携带关系类型、置信度和证据引用。当前导入数据仍处于 needs-review
          状态，先看结构，再逐项补齐公司与财务证据。
        </p>
      </aside>
    );
  }

  const incoming = dataset.edges.filter((edge) => edge.to === node.id);
  const outgoing = dataset.edges.filter((edge) => edge.from === node.id);
  const edgeRows = [...outgoing, ...incoming];
  const evidence = dataset.evidence.filter((item) => node.evidenceIds.includes(item.id));
  const run = dataset.runs[0];
  const displayNode = (id: string) => dataset.nodes.find((item) => item.id === id);

  return (
    <aside className="inspector network-inspector">
      <div className="inspector__topline">
        <span className="eyebrow">RESEARCH NODE / {node.id}</span>
        <span className="market-badge">{node.market}</span>
      </div>
      <div className="inspector-title-row">
        <div>
          <h2>{node.label}</h2>
          <p className="inspector-ticker">L{node.layer} · {node.section}</p>
        </div>
        <span className="exposure-badge exposure-badge--platform">{node.status}</span>
      </div>
      <div className="inspector-signal">
        <span>研究角色</span>
        <strong>{node.role}</strong>
      </div>
      <div className="inspector-copy">
        <p>{node.description}</p>
        <p className="inspector-copy__why">
          这是从 {node.category} 导入的通用 ResearchNode。公开市场 ticker、经营指标与关系断言需在后续
          DIVE 轮次中单独核验。
        </p>
      </div>

      <div className="tag-row">
        {node.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>

      <section className="inspector-section">
        <div className="inspector-section__heading">
          <span>关系边</span>
          <small>{edgeRows.length} 条 · provisional</small>
        </div>
        <div className="network-inspector__edges">
          {edgeRows.length === 0 ? <p className="empty-child">当前节点还没有导入关系。</p> : null}
          {edgeRows.map((edge) => {
            const otherId = edge.from === node.id ? edge.to : edge.from;
            const other = displayNode(otherId);
            if (!other) return null;
            return (
              <button
                className="network-inspector__edge"
                key={edge.id}
                onClick={() => onSelect(other)}
                type="button"
              >
                <span>
                  {edge.from === node.id ? "→" : "←"} {other.label}
                </span>
                <small>
                  {relationLabels[edge.relation]} · {Math.round(edge.confidence * 100)}% · {edge.impact}
                </small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="inspector-section">
        <div className="inspector-section__heading">
          <span>证据与边界</span>
          <small>{evidence.length} 项</small>
        </div>
        <div className="network-inspector__sources">
          {evidence.map((item) => (
            <div className="network-inspector__source" key={item.id}>
              <strong>{item.title}</strong>
              <code>{item.sourceUri}</code>
              {item.excerpt ? <p>{item.excerpt}</p> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="inspector-section">
        <div className="inspector-section__heading">
          <span>下一轮队列</span>
          <small>{run?.protocol ?? "DIVE-M"}</small>
        </div>
        <ul className="network-inspector__queue">
          {(run?.nextQueue ?? []).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
    </aside>
  );
}

