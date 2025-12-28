import type { GameState } from "../engine/types";
import grimoire from "../data/grimoire.json";

type GrimoireEntry = {
    id: string;
    name: string;
    horseman: string;
    intelRequired: string[];
    identifyAt: number;
    description: string;
};

const entries = Object.values(grimoire as Record<string, GrimoireEntry>);

function countMatches(state: GameState, required: string[]) {
    let matched = 0;
    for (const tag of required) {
        if ((state.intelTags[tag] ?? 0) > 0) matched += 1;
    }
    return matched;
}

export function GrimoireView({ state }: { state: GameState }) {
    return (
        <div style={{ border: "1px solid #333", background: "#111", padding: 14 }}>
            <h2 style={{ marginTop: 0 }}>Grimoire</h2>
            <div style={{ opacity: 0.8, marginBottom: 12 }}>
                Collected Intel:{" "}
                {Object.keys(state.intelTags).length === 0
                    ? "None"
                    : Object.entries(state.intelTags)
                        .map(([tag, qty]) => `${tag} x${qty}`)
                        .join(", ")}
            </div>

            <div style={{ display: "grid", gap: 10 }}>
                {entries.map((e) => {
                    const matched = countMatches(state, e.intelRequired);
                    const identified = matched >= e.identifyAt;

                    return (
                        <div
                            key={e.id}
                            style={{
                                border: "1px solid #2b2b2b",
                                padding: 12,
                                background: "#0f0f0f"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                <strong>{identified ? e.name : "Unknown Entity"}</strong>
                                <span style={{ opacity: 0.85 }}>
                                    {identified ? "IDENTIFIED" : `Clues: ${matched}/${e.identifyAt}`}
                                </span>
                            </div>

                            <div style={{ marginTop: 8, opacity: 0.8, fontSize: 13 }}>
                                Required Intel: {e.intelRequired.join(", ")}
                            </div>

                            <p style={{ marginBottom: 0, opacity: identified ? 0.9 : 0.5 }}>
                                {identified
                                    ? e.description
                                    : "Your notes are incomplete. The shape of the threat remains indistinct."}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}