import type { Node, GameState } from "../engine/types";
import { meetsConditions } from "../engine/reducer";
import { applyEffectsWithResults, type ResultLine } from "../engine/results";
import nodes from "../data/nodes.json";

const nodeMap = nodes as Record<string, Node>;

export function NarrativeView(props: {
  state: GameState;
  setState: (s: GameState) => void;
  pushResults: (lines: ResultLine[]) => void;
}) {
  const { state, setState, pushResults } = props;
  const node = nodeMap[state.currentNodeId];

  if (!node) return <div>Missing node: {state.currentNodeId}</div>;

  function choose(choiceIndex: number) {
    const choice = node.choices[choiceIndex];
    if (!choice) return;
    if (!meetsConditions(state, choice.requires)) return;

    const { next, results } = applyEffectsWithResults(state, choice.effects);
    setState({ ...next, currentNodeId: choice.next });
    pushResults(results);
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ border: "1px solid #333", padding: 14, background: "#111" }}>
        <div style={{ opacity: 0.8, fontSize: 12 }}>Node: {node.id}</div>
        <p style={{ fontSize: 18, lineHeight: 1.5 }}>{node.text}</p>

        {/* Optional: show intel for debugging (remove later) */}
        <div style={{ marginTop: 10, opacity: 0.85, fontSize: 13 }}>
          <strong>Intel:</strong>{" "}
          {Object.keys(state.intelTags).length === 0
            ? "None"
            : Object.entries(state.intelTags)
                .map(([tag, qty]) => `${tag} x${qty}`)
                .join(", ")}
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {node.choices.length === 0 && <div style={{ opacity: 0.7 }}>No choices here.</div>}

        {node.choices.map((c, i) => {
          const ok = meetsConditions(state, c.requires);
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={!ok}
              style={{
                textAlign: "left",
                padding: "12px 14px",
                border: "1px solid #333",
                background: ok ? "#161616" : "#101010",
                color: ok ? "#eee" : "#666",
                cursor: ok ? "pointer" : "not-allowed"
              }}
            >
              {c.label}
              {!ok && <span style={{ marginLeft: 8, fontSize: 12 }}>(unavailable)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}