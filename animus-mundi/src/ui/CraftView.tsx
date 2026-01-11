import type { GameState } from "../engine/types";
import recipes from "../data/recipes.json";
import items from "../data/items.json";
import { applyEffectsWithResults, type ResultLine } from "../engine/results";

type Recipe = {
  id: string;
  name: string;
  requires: Array<{ itemId: string; qty: number }>;
  produces: Array<{ itemId: string; qty: number }>;
};

const recipeMap = recipes as Record<string, Recipe>;
const itemMap = items as Record<string, { id: string; name: string; type: string }>;

function hasRequirements(state: GameState, recipe: Recipe) {
  return recipe.requires.every((r) => (state.inventory[r.itemId] ?? 0) >= r.qty);
}

export function CraftView(props: {
  state: GameState;
  setState: (s: GameState) => void;
  pushResults: (lines: ResultLine[]) => void;
}) {
  const { state, setState, pushResults } = props;

  const knowsCrude = state.flags["knows_crude_fox_seal"] === true;
  const demonIdentified = state.flags["identified_herald_of_conquest"] === true;

  const crudeRecipe = recipeMap["crude_fox_seal"];
  const demonRecipe = recipeMap["seal_of_the_herald"];

  function craft(recipeId: string) {
    const { next, results } = applyEffectsWithResults(state, [{ type: "craft", recipeId }]);
    setState(next);
    pushResults(results);
  }

  return (
    <div style={{ border: "1px solid #333", background: "#111", padding: 14 }}>
      <h2 style={{ marginTop: 0 }}>Craft</h2>

      {/* Crude seal */}
      {!knowsCrude ? (
        <div style={{ opacity: 0.7, marginBottom: 16 }}>
          You don't know any basic seal recipes yet. (Hint: choose "Speak a binding vow".)
        </div>
      ) : !crudeRecipe ? (
        <div style={{ opacity: 0.7, marginBottom: 16 }}>
          Missing recipe: crude_fox_seal (check recipes.json)
        </div>
      ) : (
        <div style={{ border: "1px solid #2b2b2b", padding: 12, background: "#0f0f0f" }}>
          <strong>{crudeRecipe.name}</strong>

          <div style={{ marginTop: 8, opacity: 0.85 }}>
            Requires:{" "}
            {crudeRecipe.requires.map((r) => (
              <span key={r.itemId} style={{ marginRight: 10 }}>
                {itemMap[r.itemId]?.name ?? r.itemId} x{r.qty}
              </span>
            ))}
          </div>

          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Produces:{" "}
            {crudeRecipe.produces.map((p) => (
              <span key={p.itemId} style={{ marginRight: 10 }}>
                {itemMap[p.itemId]?.name ?? p.itemId} x{p.qty}
              </span>
            ))}
          </div>

          {(() => {
            const ok = hasRequirements(state, crudeRecipe);
            return (
              <>
                <button
                  onClick={() => craft(crudeRecipe.id)}
                  disabled={!ok}
                  style={{
                    marginTop: 12,
                    padding: "10px 12px",
                    border: "1px solid #333",
                    background: ok ? "#161616" : "#101010",
                    color: ok ? "#eee" : "#666",
                    cursor: ok ? "pointer" : "not-allowed"
                  }}
                >
                  Craft
                </button>

                {!ok && (
                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                    Not enough materials.
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Demon seal */}
      {!demonIdentified ? (
        <div style={{ marginTop: 16, opacity: 0.7 }}>
          Demon seals are unavailable. Identify the entity in the Grimoire first.
        </div>
      ) : !demonRecipe ? (
        <div style={{ marginTop: 16, opacity: 0.7 }}>
          Missing recipe: seal_of_the_herald (check recipes.json)
        </div>
      ) : (
        <div
          style={{
            marginTop: 16,
            border: "1px solid #2b2b2b",
            padding: 12,
            background: "#0f0f0f"
          }}
        >
          <strong>{demonRecipe.name} (Demon Seal)</strong>

          <div style={{ marginTop: 8, opacity: 0.85 }}>
            Requires:{" "}
            {demonRecipe.requires.map((r) => (
              <span key={r.itemId} style={{ marginRight: 10 }}>
                {itemMap[r.itemId]?.name ?? r.itemId} x{r.qty}
              </span>
            ))}
          </div>

          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Produces:{" "}
            {demonRecipe.produces.map((p) => (
              <span key={p.itemId} style={{ marginRight: 10 }}>
                {itemMap[p.itemId]?.name ?? p.itemId} x{p.qty}
              </span>
            ))}
          </div>

          {(() => {
            const ok = hasRequirements(state, demonRecipe);
            return (
              <>
                <button
                  onClick={() => craft(demonRecipe.id)}
                  disabled={!ok}
                  style={{
                    marginTop: 12,
                    padding: "10px 12px",
                    border: "1px solid #333",
                    background: ok ? "#161616" : "#101010",
                    color: ok ? "#eee" : "#666",
                    cursor: ok ? "pointer" : "not-allowed"
                  }}
                >
                  Craft Demon Seal
                </button>

                {!ok && (
                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                    Not enough materials.
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}