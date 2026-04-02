import fs from "node:fs";
import path from "node:path";

export interface ModelPrice {
  input: number;
  output: number;
}

export interface RawModel {
  name: string;
  id: string;
  api_id: string;
  released: string;
  status: string;
  type: string;
  context: string | null;
  max_output: string | null;
  vision: boolean;
  function_calling: boolean;
  pricing: ModelPrice | null;
  openrouter_pricing: ModelPrice | null;
  knowledge_cutoff: string | null;
  notes: string | null;
  description: string | null;
  deprecated_date: string | null;
  successor: string | null;
  predecessor: string | null;
}

export interface ModelRecord extends RawModel {
  provider: string;
  releaseTs: number;
  deprecatedTs: number | null;
  contextTokens: number | null;
  outputTokens: number | null;
  primaryPrice: ModelPrice | null;
  pricingSource: "provider" | "openrouter" | "none";
  totalPrice: number | null;
  inputPrice: number | null;
  outputPrice: number | null;
  lifecycleLabel: string;
  confidenceFlags: string[];
  searchText: string;
}

export interface FeaturedPick {
  key: string;
  title: string;
  subtitle: string;
  rationale: string;
  model: ModelRecord | null;
  alternatives: string[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  ts: number;
  type: "release" | "deprecation";
  title: string;
  summary: string;
  provider: string;
  model: ModelRecord;
}

export interface ModelsData {
  providers: string[];
  statuses: string[];
  types: string[];
  models: ModelRecord[];
  featured: FeaturedPick[];
  timeline: TimelineEvent[];
  stats: {
    totalModels: number;
    totalProviders: number;
    activeCount: number;
    upcomingDeprecations: number;
    pricedCount: number;
  };
}

const modelsDir = path.join(process.cwd(), "src/content/models");

const lifecycleWeight: Record<string, number> = {
  active: 4,
  preview: 3,
  legacy: 2,
  deprecated: 1,
};

const qualityWeight: Record<string, number> = {
  coding: 10,
  frontier: 9,
  reasoning: 8,
  multimodal: 7,
  balanced: 6,
  fast: 5,
  "open-weight": 4,
};

function parseTokenCount(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toUpperCase().replace(/,/g, "");
  const match = normalized.match(/^(\d+(?:\.\d+)?)([KM])?$/);
  if (!match) {
    return null;
  }

  const amount = Number(match[1]);
  const suffix = match[2];

  if (suffix === "M") {
    return Math.round(amount * 1_000_000);
  }

  if (suffix === "K") {
    return Math.round(amount * 1_000);
  }

  return Math.round(amount);
}

function normalizeModel(provider: string, model: RawModel): ModelRecord {
  const primaryPrice = model.pricing ?? model.openrouter_pricing ?? null;
  const pricingSource = model.pricing
    ? "provider"
    : model.openrouter_pricing
      ? "openrouter"
      : "none";
  const confidenceFlags: string[] = [];

  if (!model.context) {
    confidenceFlags.push("Context window not listed");
  }
  if (!model.max_output) {
    confidenceFlags.push("Max output not listed");
  }
  if (!primaryPrice) {
    confidenceFlags.push("Pricing not listed");
  } else if (pricingSource === "openrouter") {
    confidenceFlags.push("Pricing shown via OpenRouter, not first-party");
  }
  if (!model.knowledge_cutoff) {
    confidenceFlags.push("Knowledge cutoff not listed");
  }
  if (model.status === "preview") {
    confidenceFlags.push("Preview availability can change quickly");
  }

  return {
    ...model,
    provider,
    releaseTs: Date.parse(model.released),
    deprecatedTs: model.deprecated_date ? Date.parse(model.deprecated_date) : null,
    contextTokens: parseTokenCount(model.context),
    outputTokens: parseTokenCount(model.max_output),
    primaryPrice,
    pricingSource,
    totalPrice: primaryPrice ? primaryPrice.input + primaryPrice.output : null,
    inputPrice: primaryPrice?.input ?? null,
    outputPrice: primaryPrice?.output ?? null,
    lifecycleLabel: model.status === "preview" ? "preview" : model.status,
    confidenceFlags,
    searchText: [
      provider,
      model.name,
      model.id,
      model.api_id,
      model.status,
      model.type,
      model.description,
      model.notes,
      model.successor,
      model.predecessor,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  };
}

function compareRecency(a: ModelRecord, b: ModelRecord): number {
  return b.releaseTs - a.releaseTs;
}

function compareContext(a: ModelRecord, b: ModelRecord): number {
  return (b.contextTokens ?? -1) - (a.contextTokens ?? -1);
}

function compareOutput(a: ModelRecord, b: ModelRecord): number {
  return (b.outputTokens ?? -1) - (a.outputTokens ?? -1);
}

function comparePrice(a: ModelRecord, b: ModelRecord): number {
  return (a.totalPrice ?? Number.POSITIVE_INFINITY) - (b.totalPrice ?? Number.POSITIVE_INFINITY);
}

function compareInputPrice(a: ModelRecord, b: ModelRecord): number {
  return (a.inputPrice ?? Number.POSITIVE_INFINITY) - (b.inputPrice ?? Number.POSITIVE_INFINITY);
}

function comparePriority(a: ModelRecord, b: ModelRecord): number {
  return (
    (lifecycleWeight[b.status] ?? 0) - (lifecycleWeight[a.status] ?? 0) ||
    (qualityWeight[b.type] ?? 0) - (qualityWeight[a.type] ?? 0) ||
    compareContext(a, b) ||
    compareOutput(a, b) ||
    compareRecency(a, b)
  );
}

function shortlist(models: ModelRecord[], limit = 3): string[] {
  return models.slice(0, limit).map((model) => model.name);
}

function findBest(
  models: ModelRecord[],
  filter: (model: ModelRecord) => boolean,
  sorters: Array<(a: ModelRecord, b: ModelRecord) => number>,
): ModelRecord | null {
  const candidates = models.filter(filter);
  if (candidates.length === 0) {
    return null;
  }

  return [...candidates].sort((a, b) => {
    for (const sorter of sorters) {
      const result = sorter(a, b);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  })[0] ?? null;
}

function buildFeatured(models: ModelRecord[]): FeaturedPick[] {
  const liveModels = models.filter((model) => model.status === "active" || model.status === "preview");
  const liveWithTools = liveModels.filter((model) => model.function_calling);
  const liveVision = liveModels.filter((model) => model.vision);
  const liveOpen = liveModels.filter((model) => model.type === "open-weight");

  const codingPool = [...liveModels]
    .filter((model) => model.type === "coding")
    .sort((a, b) => comparePriority(a, b) || comparePrice(a, b));
  const cheapestUsefulPool = [...liveWithTools]
    .filter((model) => (model.contextTokens ?? 0) >= 128_000 && model.primaryPrice)
    .sort((a, b) => comparePrice(a, b) || compareContext(a, b) || comparePriority(a, b));
  const reasoningPool = [...liveModels]
    .filter((model) => model.type === "reasoning" || /reason/i.test(`${model.notes} ${model.description}`))
    .sort((a, b) => comparePriority(a, b) || compareOutput(a, b) || compareRecency(a, b));
  const multimodalPool = [...liveVision]
    .sort((a, b) => comparePriority(a, b) || compareContext(a, b) || compareOutput(a, b));
  const openWeightPool = [...liveOpen]
    .sort((a, b) => compareContext(a, b) || compareOutput(a, b) || comparePriority(a, b));
  const contextPool = [...liveModels]
    .filter((model) => model.contextTokens)
    .sort((a, b) => compareContext(a, b) || comparePriority(a, b));
  const fastPool = [...liveModels]
    .filter((model) => model.type === "fast" || /\bfast(est)?\b/i.test(`${model.notes} ${model.description}`))
    .sort((a, b) => compareInputPrice(a, b) || comparePriority(a, b) || compareContext(a, b));

  return [
    {
      key: "coding",
      title: "Best for coding",
      subtitle: "Heuristic pick from coding-specialized live models",
      rationale:
        "Prioritizes active coding models, then lifecycle quality, context, output room, and listed price. This is a structured best guess, not a standardized benchmark winner.",
      model: codingPool[0] ?? null,
      alternatives: shortlist(codingPool.slice(1)),
    },
    {
      key: "cheap",
      title: "Cheapest useful",
      subtitle: "Low-cost live models with tools and real context",
      rationale:
        "Looks for live models with function calling, at least 128K context, and listed pricing. Lowest combined input/output price wins, with richer context breaking ties.",
      model: cheapestUsefulPool[0] ?? null,
      alternatives: shortlist(cheapestUsefulPool.slice(1)),
    },
    {
      key: "reasoning",
      title: "Best reasoning",
      subtitle: "Reasoning-first live models",
      rationale:
        "Prioritizes reasoning-tagged models, then lifecycle priority, output headroom, and recency. Useful for deep planning, analysis, and multi-step tasks.",
      model: reasoningPool[0] ?? null,
      alternatives: shortlist(reasoningPool.slice(1)),
    },
    {
      key: "multimodal",
      title: "Best multimodal",
      subtitle: "Vision-capable live models with broad headroom",
      rationale:
        "Uses live vision support first, then prioritizes higher-end model types, larger context windows, and larger output limits. This favors broad multimodal headroom over lowest cost.",
      model: multimodalPool[0] ?? null,
      alternatives: shortlist(multimodalPool.slice(1)),
    },
    {
      key: "open-weight",
      title: "Best open-weight",
      subtitle: "Open models with the strongest available headroom",
      rationale:
        "Ranks active open-weight models by context, output size, and overall model priority. Good starting point when portability or self-hosting matters.",
      model: openWeightPool[0] ?? null,
      alternatives: shortlist(openWeightPool.slice(1)),
    },
    {
      key: "context",
      title: "Longest context",
      subtitle: "Biggest listed context window",
      rationale:
        "Purely sorts by listed context size, then uses output size and lifecycle priority to break ties. If a provider omits context, it will not win this slot.",
      model: contextPool[0] ?? null,
      alternatives: shortlist(contextPool.slice(1)),
    },
    {
      key: "fast",
      title: "Fastest",
      subtitle: "Latency-oriented live models",
      rationale:
        "Starts from models explicitly positioned as fast or fastest, then uses input price, lifecycle priority, and context as proxies. Speed claims are not benchmark-normalized here.",
      model: fastPool[0] ?? null,
      alternatives: shortlist(fastPool.slice(1)),
    },
  ];
}

function buildTimeline(models: ModelRecord[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const model of models) {
    events.push({
      id: `${model.id}-release`,
      date: model.released,
      ts: model.releaseTs,
      type: "release",
      title: `${model.name} released`,
      summary: model.description ?? model.notes ?? `${model.name} entered the directory.`,
      provider: model.provider,
      model,
    });

    if (model.deprecated_date && model.deprecatedTs) {
      events.push({
        id: `${model.id}-deprecation`,
        date: model.deprecated_date,
        ts: model.deprecatedTs,
        type: "deprecation",
        title: `${model.name} scheduled for retirement`,
        summary:
          model.successor
            ? `${model.name} is marked deprecated. Suggested successor: ${model.successor}.`
            : `${model.name} is marked deprecated.`,
        provider: model.provider,
        model,
      });
    }
  }

  return events.sort((a, b) => b.ts - a.ts || a.title.localeCompare(b.title));
}

export function providerSlug(provider: string): string {
  return provider.toLowerCase().replace(/\s+/g, "-");
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatPrice(price: number | null): string {
  if (price == null) {
    return "Unknown";
  }

  if (price < 1) {
    return `$${price.toFixed(2)}`;
  }

  return `$${price.toFixed(2)}`;
}

export function formatTokenCount(value: number | null): string {
  if (value == null) {
    return "Unknown";
  }

  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }

  return String(value);
}

export function loadModelsData(): ModelsData {
  const files = fs.readdirSync(modelsDir).filter((file) => file.endsWith(".json"));
  const providers = files
    .map((file) => JSON.parse(fs.readFileSync(path.join(modelsDir, file), "utf-8")) as { provider: string; models: RawModel[] })
    .sort((a, b) => a.provider.localeCompare(b.provider));

  const models = providers
    .flatMap((providerEntry) => providerEntry.models.map((model) => normalizeModel(providerEntry.provider, model)))
    .sort((a, b) => comparePriority(a, b) || a.name.localeCompare(b.name));

  const timeline = buildTimeline(models);

  return {
    providers: providers.map((entry) => entry.provider),
    statuses: ["active", "preview", "legacy", "deprecated"],
    types: [...new Set(models.map((model) => model.type))].sort((a, b) => a.localeCompare(b)),
    models,
    featured: buildFeatured(models),
    timeline,
    stats: {
      totalModels: models.length,
      totalProviders: providers.length,
      activeCount: models.filter((model) => model.status === "active" || model.status === "preview").length,
      upcomingDeprecations: models.filter((model) => model.deprecated_date).length,
      pricedCount: models.filter((model) => model.primaryPrice).length,
    },
  };
}
