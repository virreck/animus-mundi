import { useEffect, useMemo, useState } from "react";
import { AppShell } from "./ui/AppShell";
import { NarrativeView } from "./ui/NarrativeView";
import { CodexView } from "./ui/CodexView";
import { InventoryView } from "./ui/InventoryView";
import { CraftView } from "./ui/CraftView";
import { GrimoireView } from "./ui/GrimoireView";
import { ToastCenter, type Toast } from "./ui/ToastCenter";
import type { GameState, TabKey } from "./engine/types";
import { initialState } from "./engine/types";
import { loadState, resetState, saveState } from "./engine/storage";
import type { ResultLine } from "./engine/results";
import { IntelLogView } from "./ui/IntelLogView";

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

  const [toasts, setToasts] = useState<Toast[]>([]);

  function pushResults(lines: ResultLine[]) {
    if (!lines || lines.length === 0) return;

    const newToasts: Toast[] = lines.map((l) => ({
      id: crypto.randomUUID(),
      kind: l.kind,
      text: l.text
    }));

    setToasts((prev) => [...newToasts, ...prev]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => !newToasts.some((n) => n.id === t.id)));
    }, 2500);
  }

  useEffect(() => {
    saveState(state);
  }, [state]);

  const headerRight = useMemo(() => {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Bar label="Humanity" value={state.humanity} max={100} />
        <div style={{ opacity: 0.9 }}>Obols: {state.obols}</div>
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
  }, [state.humanity, state.obols]);

  return (
    <>
      <AppShell activeTab={tab} onTab={setTab} headerRight={headerRight}>
        {tab === "narrative" && (
          <NarrativeView state={state} setState={setState} pushResults={pushResults} />
        )}
        {tab === "grimoire" && <GrimoireView state={state} setState={setState} />}
        {tab === "codex" && <CodexView state={state} />}
        {tab === "inventory" && <InventoryView state={state} />}
        {tab === "craft" && (
          <CraftView state={state} setState={setState} pushResults={pushResults} />
        )}
        {tab === "intel" && <IntelLogView state={state} />}
      </AppShell>

      <ToastCenter toasts={toasts} />
    </>
  );
}