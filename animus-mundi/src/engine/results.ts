import type { Effect, GameState } from "./types";
import { applyEffects } from "./reducer";
import items from "../data/items.json";

export type ResultLine = {
  kind: "intel" | "item" | "obols" | "humanity" | "system";
  text: string;
};

const itemMap = items as Record<string, { id: string; name: string; type: string }>;

function itemName(itemId: string) {
  return itemMap[itemId]?.name ?? itemId;
}

function pushDiff(results: ResultLine[], prev: GameState, next: GameState) {
  // Humanity
  const humanityDelta = next.humanity - prev.humanity;
  if (humanityDelta !== 0) {
    const sign = humanityDelta > 0 ? "+" : "";
    results.push({ kind: "humanity", text: `Humanity ${sign}${humanityDelta}` });
  }

  // Obols
  const obolsDelta = (next.obols ?? 0) - (prev.obols ?? 0);
  if (obolsDelta !== 0) {
    const sign = obolsDelta > 0 ? "+" : "";
    results.push({ kind: "obols", text: `Obols ${sign}${obolsDelta}` });
  }

  // Intel tags
  const allIntelTags = new Set([
    ...Object.keys(prev.intelTags ?? {}),
    ...Object.keys(next.intelTags ?? {})
  ]);
  for (const tag of allIntelTags) {
    const d = (next.intelTags?.[tag] ?? 0) - (prev.intelTags?.[tag] ?? 0);
    if (d > 0) results.push({ kind: "intel", text: `Intel gained: ${tag}` });
  }

  // Inventory diffs
  const allItems = new Set([
    ...Object.keys(prev.inventory ?? {}),
    ...Object.keys(next.inventory ?? {})
  ]);
  for (const id of allItems) {
    const d = (next.inventory?.[id] ?? 0) - (prev.inventory?.[id] ?? 0);
    if (d > 0) results.push({ kind: "item", text: `Item acquired: ${itemName(id)} x${d}` });
    else if (d < 0) results.push({ kind: "item", text: `Item consumed: ${itemName(id)} x${Math.abs(d)}` });
  }

  // Leads: added + resolved
  const prevLeads = prev.leads ?? {};
  const nextLeads = next.leads ?? {};

  for (const key of Object.keys(nextLeads)) {
    if (!prevLeads[key]) {
      results.push({ kind: "system", text: `New Lead: ${nextLeads[key].title}` });
    }
  }
  for (const key of Object.keys(nextLeads)) {
    const before = prevLeads[key];
    const after = nextLeads[key];
    if (before && before.status !== "resolved" && after.status === "resolved") {
      results.push({ kind: "system", text: `Lead resolved: ${after.title}` });
    }
  }

  // Flag changes (optional)
  const allFlags = new Set([
    ...Object.keys(prev.flags ?? {}),
    ...Object.keys(next.flags ?? {})
  ]);
  for (const key of allFlags) {
    const before = prev.flags?.[key] ?? false;
    const after = next.flags?.[key] ?? false;
    if (!before && after) {
      if (key.startsWith("identified_"))
        results.push({ kind: "system", text: "Identification confirmed — new lead added." });
      if (key.startsWith("sealed_")) results.push({ kind: "system", text: "Sealed." });
    }
  }
}

export function applyEffectsWithResults(
  prev: GameState,
  effects?: Effect[]
): { next: GameState; results: ResultLine[] } {
  if (!effects || effects.length === 0) return { next: prev, results: [] };

  let s = prev;
  const results: ResultLine[] = [];

  for (const e of effects) {
    const before = s;
    const after = applyEffects(before, [e]);

    if (e.type === "obols_add_chance") {
      const delta = (after.obols ?? 0) - (before.obols ?? 0);
      if (delta === 0) results.push({ kind: "obols", text: "No Obol found." });
    }

    pushDiff(results, before, after);
    s = after;
  }

  return { next: s, results };
}