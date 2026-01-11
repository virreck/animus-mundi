export type TabKey = "narrative" | "grimoire" | "intel" | "leads" | "codex" | "inventory" | "craft";

export type Reliability = "low" | "medium" | "high";

export type Condition =
  | { type: "has_item"; itemId: string; qty: number }
  | { type: "flag_true"; key: string }
  | { type: "flag_false"; key: string }
  | { type: "has_obols"; qty: number };

export type Effect =
  | { type: "humanity"; delta: number }
  | { type: "item_add"; itemId: string; qty: number }
  | { type: "item_remove"; itemId: string; qty: number }
  | { type: "flag_set"; key: string; value: boolean }
  | { type: "discover_yokai"; speciesId: string }
  | { type: "bind_yokai"; speciesId: string }
  | { type: "craft"; recipeId: string }
  | { type: "intel_add"; tag: string; qty?: number }
  | {
      type: "intel_note";
      title: string;
      body: string;
      tags: string[];
      source?: string;
      reliability?: Reliability;
    }
  | { type: "lead_add"; key: string; title: string; body: string; location?: string }
  | { type: "lead_resolve"; key: string }
  | { type: "obols_add"; qty: number }
  | { type: "obols_spend"; qty: number }
  | { type: "obols_add_chance"; qty: number; chance: number };

export type Choice = {
  label: string;
  next: string;
  requires?: Condition[];
  effects?: Effect[];
};

export type Node = {
  id: string;
  text: string;
  choices: Choice[];
};

export type YokaiInstance = {
  instanceId: string;
  speciesId: string;
  loyalty: number;
};

export type IntelEntry = {
  id: string;
  createdAt: number;
  title: string;
  body: string;
  source?: string;
  reliability: Reliability;
  tags: string[];
};

export type LeadStatus = "active" | "resolved";

export type Lead = {
  key: string;
  createdAt: number;
  resolvedAt?: number;
  title: string;
  body: string;
  location?: string;
  status: LeadStatus;
};

export type GameState = {
  currentNodeId: string;
  humanity: number;
  malleusHeat: number;

  obols: number;

  inventory: Record<string, number>;
  discoveredYokai: Record<string, boolean>;
  boundYokai: YokaiInstance[];
  flags: Record<string, boolean>;

  intelTags: Record<string, number>;
  intelLog: IntelEntry[];

  leads: Record<string, Lead>;
};

export const initialState: GameState = {
  currentNodeId: "intro",
  humanity: 50,
  malleusHeat: 0,
  obols: 0,
  inventory: {},
  discoveredYokai: {},
  boundYokai: [],
  flags: {},
  intelTags: {},
  intelLog: [],
  leads: {}
};
