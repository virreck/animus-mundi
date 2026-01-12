import type { GameState } from "../engine/types";
import grimoire from "../data/grimoire.json";
import { applyEffectsWithResults, type ResultLine } from "../engine/results";

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

export function GrimoireView(props: {
  state: GameState;
  setState: (s: GameState) => void;
  pushResults: (lines: ResultLine[]) => void;
}) {
  const { state, setState, pushResults } = props;

  function markIdentified(entryId: string, entryName: string) {
    const key = `identified_${entryId}`;

    const out = applyEffectsWithResults(state, [
      { type: "item_remove", itemId: "dragons_blood_ink", qty: 1 },

      { type: "flag_set", key, value: true },

      // Resolve the initial London lead (if it exists)
      { type: "lead_resolve", key: "london_unrest" },

      // Add the next thread: sealing preparation
      {
        type: "lead_add",
        key: `prepare_seal_${entryId}`,
        title: "A name has surfaced",
        body: `Prepare a seal appropriate for ${entryName}. The vessel will not hold what is unnamed and unbound.`,
        location: "London"
      }
    ]);

         const filtered = out.results.filter((r) => r.text !== "Identification confirmed.");
      pushResults([{ kind: "system", text: `Identification confirmed: ${entryName}` }, ...filtered]);  

  setState(out.next);
}

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
          const hasDBI = (state.inventory["dragons_blood_ink"] ?? 0) >= 1;
          const matched = countMatches(state, e.intelRequired);
          const meetsThreshold = matched >= e.identifyAt;

          const flagKey = `identified_${e.id}`;
          const confirmed = state.flags[flagKey] === true;

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
                <strong>{confirmed ? e.name : "Unknown Entity"}</strong>
                <span style={{ opacity: 0.85 }}>
                  {confirmed
                    ? "CONFIRMED"
                    : meetsThreshold
                    ? "PATTERN FORMED"
                    : `Clues: ${matched}/${e.identifyAt}`}
                </span>
                </div>

                <div style={{ marginTop: 8, opacity: 0.8, fontSize: 13 }}>
                  Required Intel: {e.intelRequired.join(", ")}
                </div>

                <p style={{ marginBottom: 10, opacity: confirmed ? 0.9 : 0.6 }}>
                  {confirmed
                    ? e.description
                    : meetsThreshold
                    ? "A pattern forms—close enough to name, if you're willing to commit it to ink."
                    : "Your notes are incomplete. The shape of the threat remains indistinct."}
                </p>


              {meetsThreshold && !confirmed && (
                <button
                  onClick={() => markIdentified(e.id, e.name)}
                  disabled={!hasDBI}
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #333",
                    background: hasDBI ? "#161616" : "#101010",
                    color: hasDBI ? "#eee" : "#666",
                    cursor: hasDBI ? "pointer" : "not-allowed"
                  }}
                >
                  Inscribe the Name (Dragon’s Blood Ink)
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}