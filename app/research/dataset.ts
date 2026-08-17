import importedDataset from "./ai-infrastructure-import.json";

import type { ResearchDataset } from "./types";

export const aiInfrastructureResearch = importedDataset as unknown as ResearchDataset;

export const activeResearchRun = aiInfrastructureResearch.runs[0];

