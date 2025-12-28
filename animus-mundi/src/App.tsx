import { useEffect, useMemo, useState } from "react";
import { AppShell } from "./ui/AppShell";
import { NarrativeView } from "./ui/NarrativeView";
import { GrimoireView } from "./ui/GrimoireView";
import { CodexView } from "./ui/CodexView";
import { InventoryView } from "./ui/InventoryView";
import { CraftView } from "./ui/CraftView";
import type { GameState, TabKey } from "./engine/types";
import { initialState } from "./engine/types";
import { loadState, resetState, saveState } from "./engine/storage";

function Bar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    return (
        <div style={{ width: 220 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.85 }}>
                <span>{label}</span>
                <span>{value}/{max}</span>
            </div>
            <div style={{ height: 10, border: "1px solid #333", background: "#111" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "#7a1f1f" }} />
            </div>
        </div>
    );
}

export default function App() {
    const [tab, setTab] = useState<TabKey>("narrative");
    const [state, setState] = useState<GameState>(() => loadState());

    useEffect(() => {
        saveState(state);
    }, [state]);

    const headerRight = useMemo(() => {
        return (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Bar label="Humanity" value={state.humanity} max={100} />
                <button
                    onClick={() => {
                        resetState();
                        setState(initialState);
                        setTab("narrative");
                    }}
                    style={{
                        padding: "10px 12px",
                        border: "1px solid #333",
                        background: "#111",
                        color: "#eee",
                        cursor: "pointer"
                    }}
                >
                    Reset Save
                </button>
            </div>
        );
    }, [state.humanity]);

    return (
        <AppShell activeTab={tab} onTab={setTab} headerRight={headerRight}>
            {tab === "narrative" && <NarrativeView state={state} setState={setState} />}
            {tab == "grimoire" && <GrimoireView state={state} />}
            {tab === "codex" && <CodexView state={state} />}
            {tab === "inventory" && <InventoryView state={state} />}
            {tab === "craft" && <CraftView state={state} setState={setState} />}
        </AppShell>
    );
}
