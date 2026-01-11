import type { GameState, Lead } from "../engine/types";

function sortNewest(a: Lead, b: Lead) {
  return (b.createdAt ?? 0) - (a.createdAt ?? 0);
}

export function LeadsView(props: { state: GameState }) {
  const { state } = props;

  const all = Object.values(state.leads ?? {});
  const active = all.filter((l) => l.status === "active").sort(sortNewest);
  const resolved = all.filter((l) => l.status === "resolved").sort(sortNewest);

  return (
    <div style={{ border: "1px solid #333", background: "#111", padding: 14 }}>
      <h2 style={{ marginTop: 0 }}>Leads</h2>

      <div style={{ opacity: 0.8, marginBottom: 12 }}>
        Threads worth pulling. Not instructions.
      </div>

      <h3 style={{ marginBottom: 8 }}>Active</h3>
      {active.length === 0 ? (
        <div style={{ opacity: 0.7 }}>No active leads.</div>
      ) : (
        <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
          {active.map((l) => (
            <div
              key={l.key}
              style={{ border: "1px solid #2b2b2b", padding: 12, background: "#0f0f0f" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <strong>{l.title}</strong>
                <span style={{ opacity: 0.7, fontSize: 12 }}>{l.location ?? ""}</span>
              </div>
              <div style={{ marginTop: 8, opacity: 0.9 }}>{l.body}</div>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ marginBottom: 8 }}>Resolved</h3>
      {resolved.length === 0 ? (
        <div style={{ opacity: 0.7 }}>None yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {resolved.map((l) => (
            <div
              key={l.key}
              style={{ border: "1px solid #2b2b2b", padding: 12, background: "#0f0f0f", opacity: 0.85 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <strong>{l.title}</strong>
                <span style={{ opacity: 0.7, fontSize: 12 }}>{l.location ?? ""}</span>
              </div>
              <div style={{ marginTop: 8, opacity: 0.9 }}>{l.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
