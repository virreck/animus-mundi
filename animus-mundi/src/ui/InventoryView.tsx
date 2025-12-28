import type { GameState } from "../engine/types";
import items from "../data/items.json";

const itemMap = items as Record<string, { id: string; name: string; type: string }>;

export function InventoryView({ state }: { state: GameState }) {
    const entries = Object.entries(state.inventory);

    return (
        <div style={{ border: "1px solid #333", background: "#111", padding: 14 }}>
            <h2 style={{ marginTop: 0 }}>Inventory</h2>
            {entries.length === 0 && <div style={{ opacity: 0.7 }}>Empty.</div>}

            <ul style={{ margin: 0, paddingLeft: 18 }}>
                {entries.map(([itemId, qty]) => (
                    <li key={itemId}>
                        <strong>{itemMap[itemId]?.name ?? itemId}</strong> — x{qty}{" "}
                        <span style={{ opacity: 0.7 }}>({itemMap[itemId]?.type ?? "unknown"})</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
