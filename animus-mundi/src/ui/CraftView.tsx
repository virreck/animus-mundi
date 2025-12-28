import type { GameState } from "../engine/types";
import recipes from "../data/recipes.json";
import items from "../data/items.json";
import { applyEffects } from "../engine/reducer";

const recipeMap = recipes as Record<
    string,
    { id: string; name: string; requires: Array<{ itemId: string; qty: number }>; produces: Array<{ itemId: string; qty: number }> }
>;

const itemMap = items as Record<string, { id: string; name: string; type: string }>;

export function CraftView(props: {
    state: GameState;
    setState: (s: GameState) => void;
}) {
    const { state, setState } = props;

    // For demo: only show crude fox seal when flag is true
    const canSee = state.flags["knows_crude_fox_seal"] === true;
    const recipe = recipeMap["crude_fox_seal"];

    function craft() {
        const next = applyEffects(state, [{ type: "craft", recipeId: recipe.id }]);
        setState(next);
    }

    if (!canSee) {
        return (
            <div style={{ border: "1px solid #333", background: "#111", padding: 14 }}>
                <h2 style={{ marginTop: 0 }}>Craft</h2>
                <div style={{ opacity: 0.7 }}>
                    You don’t know any recipes yet. (Hint: choose “Speak a binding vow”.)
                </div>
            </div>
        );
    }

    const hasAll = recipe.requires.every((r) => (state.inventory[r.itemId] ?? 0) >= r.qty);

    return (
        <div style={{ border: "1px solid #333", background: "#111", padding: 14 }}>
            <h2 style={{ marginTop: 0 }}>Craft</h2>

            <div style={{ border: "1px solid #2b2b2b", padding: 12, background: "#0f0f0f" }}>
                <strong>{recipe.name}</strong>

                <div style={{ marginTop: 8, opacity: 0.85 }}>
                    Requires:{" "}
                    {recipe.requires.map((r) => (
                        <span key={r.itemId} style={{ marginRight: 10 }}>
                            {itemMap[r.itemId]?.name ?? r.itemId} x{r.qty}
                        </span>
                    ))}
                </div>

                <div style={{ marginTop: 6, opacity: 0.85 }}>
                    Produces:{" "}
                    {recipe.produces.map((p) => (
                        <span key={p.itemId} style={{ marginRight: 10 }}>
                            {itemMap[p.itemId]?.name ?? p.itemId} x{p.qty}
                        </span>
                    ))}
                </div>

                <button
                    onClick={craft}
                    disabled={!hasAll}
                    style={{
                        marginTop: 12,
                        padding: "10px 12px",
                        border: "1px solid #333",
                        background: hasAll ? "#161616" : "#101010",
                        color: hasAll ? "#eee" : "#666",
                        cursor: hasAll ? "pointer" : "not-allowed"
                    }}
                >
                    Craft
                </button>

                {!hasAll && (
                    <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                        Not enough materials.
                    </div>
                )}
            </div>
        </div>
    );
}
