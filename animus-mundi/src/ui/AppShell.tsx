import type { TabKey } from "../engine/types";

export function AppShell(props: {
    activeTab: TabKey;
    onTab: (t: TabKey) => void;
    headerRight?: React.ReactNode;
    children: React.ReactNode;
}) {
    const { activeTab, onTab, children, headerRight } = props;

    const TabButton = ({ id, label }: { id: TabKey; label: string }) => (
        <button
            onClick={() => onTab(id)}
            style={{
                padding: "10px 12px",
                border: "1px solid #333",
                background: activeTab === id ? "#222" : "#111",
                color: "#eee",
                cursor: "pointer"
            }}
        >
            {label}
        </button>
    );

    return (
        <div style={{ minHeight: "100vh", background: "#0b0b0b", color: "#eee" }}>
            <header
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    borderBottom: "1px solid #333"
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontWeight: 800, letterSpacing: 0.5 }}>
                        Animus Mundi — Micro Build
                    </div>
                    <nav style={{ display: "flex", gap: 8 }}>
                        <TabButton id="narrative" label="Narrative" />
                        <TabButton id="grimoire" label="Grimoire" />
                        <TabButton id="codex" label="Codex" />
                        <TabButton id="inventory" label="Inventory" />
                        <TabButton id="craft" label="Craft" />
                    </nav>
                </div>
                <div>{headerRight}</div>
            </header>

            <main style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
                {children}
            </main>
        </div>
    );
}
