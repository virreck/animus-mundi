import type { GameState } from "../engine/types";
import yokai from "../data/yokai.json";

const yokaiMap = yokai as Record<
    string,
    { id: string; name: string; category: string; rarity: string; lore: string }
>;

export function CodexView({ state }: { state: GameState }) {
    const all = Object.values(yokaiMap);

    return (
        <div style={{ border: "1px solid #333", background: "#111", padding: 14 }}>
            <h2 style={{ marginTop: 0 }}>Yokai Codex</h2>
            <div style={{ display: "grid", gap: 10 }}>
                {all.map((y) => {
                    const discovered = state.discoveredYokai[y.id] === true;
                    const bound = state.boundYokai.some((b) => b.speciesId === y.id);

                    return (
                        <div
                            key={y.id}
                            style={{
                                border: "1px solid #2b2b2b",
                                padding: 12,
                                background: "#0f0f0f"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                <strong>{discovered ? y.name : "Unknown"}</strong>
                                <span style={{ opacity: 0.8 }}>
                                    {bound ? "Bound" : discovered ? "Discovered" : "Undiscovered"}
                                </span>
                            </div>

                            <div style={{ opacity: 0.75, fontSize: 12, marginTop: 4 }}>
                                {discovered ? `${y.category} • ${y.rarity}` : "—"}
                            </div>

                            <p style={{ marginBottom: 0, opacity: discovered ? 0.9 : 0.5 }}>
                                {discovered ? y.lore : "A page remains blank, as if refusing your gaze."}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
