import type { Condition, Effect, GameState } from "./types";
import recipes from "../data/recipes.json";

function getQty(inv: Record<string, number>, itemId: string) {
    return inv[itemId] ?? 0;
}

function addItem(state: GameState, itemId: string, qty: number) {
    const next = { ...state.inventory };
    next[itemId] = getQty(next, itemId) + qty;
    return { ...state, inventory: next };
}

function removeItem(state: GameState, itemId: string, qty: number) {
    const current = getQty(state.inventory, itemId);
    const nextQty = Math.max(0, current - qty);
    const next = { ...state.inventory };
    if (nextQty === 0) delete next[itemId];
    else next[itemId] = nextQty;
    return { ...state, inventory: next };
}

export function meetsConditions(state: GameState, requires?: Condition[]) {
    if (!requires || requires.length === 0) return true;

    return requires.every((cond) => {
        switch (cond.type) {
            case "has_item":
                return getQty(state.inventory, cond.itemId) >= cond.qty;
            case "flag_true":
                return state.flags[cond.key] === true;
            default:
                return false;
        }
    });
}

export function applyEffects(state: GameState, effects?: Effect[]) {
    let s = state;
    if (!effects) return s;

    for (const e of effects) {
        switch (e.type) {
            case "humanity":
                s = { ...s, humanity: Math.max(0, Math.min(100, s.humanity + e.delta)) };
                break;

            case "item_add":
                s = addItem(s, e.itemId, e.qty);
                break;

            case "item_remove":
                s = removeItem(s, e.itemId, e.qty);
                break;

            case "flag_set":
                s = { ...s, flags: { ...s.flags, [e.key]: e.value } };
                break;

            case "discover_yokai":
                s = {
                    ...s,
                    discoveredYokai: { ...s.discoveredYokai, [e.speciesId]: true }
                };
                break;

            case "bind_yokai": {
                const instanceId = crypto.randomUUID();
                s = {
                    ...s,
                    discoveredYokai: { ...s.discoveredYokai, [e.speciesId]: true },
                    boundYokai: [
                        ...s.boundYokai,
                        { instanceId, speciesId: e.speciesId, loyalty: 50 }
                    ]
                };
                break;
            }

            case "craft": {
                const rec = (recipes as any)[e.recipeId];
                if (!rec) break;

                const reqs = rec.requires ?? [];
                const canCraft = reqs.every(
                    (r: any) => getQty(s.inventory, r.itemId) >= r.qty
                );
                if (!canCraft) break;

                for (const r of reqs) {
                    s = removeItem(s, r.itemId, r.qty);
                }

                for (const p of rec.produces ?? []) {
                    s = addItem(s, p.itemId, p.qty);
                }
                break;
            }

            case "intel_add": {
                    const amount = e.qty ?? 1;
                    const next = { ...s.intelTags };
                    next[e.tag] = (next[e.tag] ?? 0) + amount;
                    s = { ...s, intelTags: next };
                    break;
            }

            default:
                break;
        }
    }

    return s;
}
