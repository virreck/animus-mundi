import type { Node, GameState } from "../engine/types";
import { applyEffects, meetsConditions } from "../engine/reducer";
import nodes from "../data/nodes.json";

const nodeMap = nodes as Record<string, Node>;

export function NarrativeView(props: {
    state: GameState;
    setState: (s: GameState) => void;
}) {
    const { state, setState } = props;
    const node = nodeMap[state.currentNodeId];

    if (!node) {
        return <div>Missing node: {state.currentNodeId}</div>;
    }

    {
        state.flags.last_binding && (
            <div style={{ marginTop: 8, opacity: 0.8, fontStyle: "italic" }}>
                Last binding outcome: {state.flags.last_binding}
            </div>
        )
    }

    function choose(choiceIndex: number) {
        const choice = node.choices[choiceIndex];
        if (!choice) return;

        if (!meetsConditions(state, choice.requires)) return;

        let nextState = applyEffects(state, choice.effects);
        nextState = { ...nextState, currentNodeId: choice.next };
        setState(nextState);
    }

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <div style={{ border: "1px solid #333", padding: 14, background: "#111" }}>
                <div style={{ opacity: 0.8, fontSize: 12 }}>Node: {node.id}</div>
                <p style={{ fontSize: 18, lineHeight: 1.5 }}>{node.text}</p>

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
                {node.choices.length === 0 && (
                    <div style={{ opacity: 0.7 }}>No choices here.</div>
                )}

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
