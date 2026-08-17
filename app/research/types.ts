export type ResearchLayer = 0 | 1 | 2 | 3 | 4 | 5;

export type ResearchMarket = "US" | "ADR" | "Non-US" | "Private" | "Mixed";

export type ResearchNodeStatus = "imported" | "candidate" | "verified" | "rejected";

export type ResearchRelation =
  | "supplier"
  | "customer"
  | "partner"
  | "application"
  | "competitor"
  | "substitute"
  | "manufacturing"
  | "technology"
  | "investment"
  | "platform";

export type ResearchEvidenceType =
  | "official"
  | "filing"
  | "earnings"
  | "research"
  | "inference";

export type ResearchImpact = "high" | "medium" | "low" | "unknown";

export type Evidence = {
  id: string;
  title: string;
  sourceUri: string;
  sourceType: ResearchEvidenceType;
  publishedAt?: string;
  checkedAt: string;
  excerpt?: string;
};

export type ResearchNode = {
  id: string;
  label: string;
  description: string;
  section: string;
  layer: ResearchLayer;
  market: ResearchMarket;
  category: string;
  role: string;
  ticker?: string;
  tags: string[];
  status: ResearchNodeStatus;
  evidenceIds: string[];
  financials?: {
    revenue?: number;
    grossMargin?: number;
    operatingMargin?: number;
    freeCashFlow?: number;
  };
};

export type ResearchEdge = {
  id: string;
  from: string;
  to: string;
  relation: ResearchRelation;
  impact: ResearchImpact;
  confidence: number;
  explanation: string;
  evidenceIds: string[];
  status: "imported" | "candidate" | "verified";
};

export type ResearchRun = {
  id: string;
  target: string;
  question: string;
  protocol: "DIVE-M";
  status: "imported" | "running" | "complete" | "needs-review";
  startedAt: string;
  completedAt?: string;
  sourceEvidenceIds: string[];
  importedNodeIds: string[];
  importedEdgeIds: string[];
  nextQueue: string[];
  notes: string[];
};

export type ResearchDataset = {
  nodes: ResearchNode[];
  edges: ResearchEdge[];
  evidence: Evidence[];
  runs: ResearchRun[];
};
