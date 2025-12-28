import type { GameState } from "./types";
import { initialState } from "./types";

const KEY = "animus_mundi_save_v1";

export function loadState(): GameState {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return initialState;
        return { ...initialState, ...JSON.parse(raw) };
    } catch {
        return initialState;
    }
}

export function saveState(state: GameState) {
    localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetState() {
    localStorage.removeItem(KEY);
}
