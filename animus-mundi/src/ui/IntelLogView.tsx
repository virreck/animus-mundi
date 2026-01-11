import type { GameState } from "../engine/types";

function formatTime(ms: number) {
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return "";
  }
}

export function IntelLogView(props: { state: GameState }) {
  const { state } = props;

  const entries = [...(state.intelLog ?? [])].reverse();

  return (
    <div style={{ border: "1px solid #333", background: "#111", padding: 14 }}>
      <h2 style={{ marginTop: 0 }}>Intel Log</h2>

      {entries.length === 0 ? (
        <div style={{ opacity: 0.7 }}>
          No intel recorded yet. Investigate something to create your first entry.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {entries.map((e) => (
            <div
              key={e.id}
              style={{
                border: "1px solid #2b2b2b",
                padding: 12,
                background: "#0f0f0f"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <strong>{e.title}</strong>
                <span style={{ opacity: 0.75, fontSize: 12 }}>{formatTime(e.createdAt)}</span>
              </div>

              <div style={{ marginTop: 6, opacity: 0.8, fontSize: 12 }}>
                {e.source ? `Source: ${e.source} • ` : ""}
                Reliability: {e.reliability}
              </div>

              <p style={{ marginTop: 8, marginBottom: 8, opacity: 0.9 }}>{e.body}</p>

              {e.tags?.length > 0 && (
                <div style={{ opacity: 0.75, fontSize: 12 }}>
                  Tags: {e.tags.join(", ")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}