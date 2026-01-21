# Animus Mundi (Prototype) — Narrative Investigation RPG

Animus Mundi is a dark, narrative-driven investigation RPG prototype where the player hunts the **Four Horsemen’s influence** across the modern world by gathering evidence, identifying infernal lieutenants (the **72 Ars Goetia**), and ultimately sealing them away to protect **Gaia**.

This repo is built to be **solo-dev friendly**: the core game is a React UI backed by a small, deterministic “game engine” (pure state + effects). Content is data-driven, with optional tooling to generate content from writer-friendly input.

> **Tone:** modern day + ancient prophecy + folklore.  
> **Loop:** investigate → collect intel → form leads → identify → craft/seal → escalate.

---

## What this repo contains

### Game features (current)
- **Narrative Nodes**: scene text + choices that apply effects to game state
- **Intel System**
  - `intel_note`: logs readable evidence entries
  - `intelTags`: lightweight tag counters for inference/matching
- **Leads**
  - automatic “threads” (not quest markers)
  - can be added/resolved through effects
- **Grimoire**
  - entries require certain intel tags
  - identification is a *reveal* (name/description shown only after confirmation)
  - optional ritual cost (e.g. **Dragon’s Blood Ink**) per identification
- **Inventory & Crafting**
  - items live in `items.json`
  - recipes live in `recipes.json`
- **Currency (Obols)**
  - rare, limited sources
  - chance-roll outcomes can produce **success or failure toasts**
- **Toasts / Notifications**
  - intel gained, items acquired/consumed, obols gained/spent, leads added/resolved, roll failures
  - configurable dismissal duration
- **Anti-farming / One-time actions**
  - one-time investigations can be gated by flags and optionally hidden once used

### Planned (roadmap)
- **Travel screen** (locations, active leads per location)
- **Intel Log UI polish** (filters, search)
- **Yoroku** (Yokai Codex): discovery, capture, binding, task utility
- **Binding mechanics**: use yokai/shikigami to scout/assist at a cost to humanity
- **Malleus faction heat**: if your humanity drops too low, hunters appear
- **Shop UI**: occult stationer inventory (data-driven)
- **Demon sealing encounters** → **Horseman manifestations** (boss escalation)

---

## Tech stack

- **React + TypeScript**
- **Vite** (dev server + build)
- **Local JSON data** for prototype content
- Optional: **Firebase** (future persistence / cloud sync)

---

## Getting started

### Requirements
- Node.js (LTS recommended)
- npm

### Install
```bash
npm install
```

### Run the dev server
```bash
npm run dev
```

### Build
```bash
npm run build
```

---

## How the game works

### 1) State + Effects (the “engine”)
The game is a deterministic loop:

1. UI renders from `GameState`
2. Player clicks a choice
3. The choice applies a list of **effects**
4. The reducer returns a new `GameState`
5. The UI re-renders, and **toasts** are generated from state diffs

This makes debugging easier because:
- all changes are explicit
- effects are typed
- most logic is in one place (the reducer)

### 2) Narrative Nodes
Nodes are small chunks of story:

```json
{
  "id": "london_hub",
  "text": "You arrive near Westminster...",
  "choices": [
    {
      "label": "Trace the camera network",
      "next": "london_hub",
      "effects": [ ... ]
    }
  ]
}
```

Choices may include:
- `requires`: conditions that must be true
- `effects`: what happens when clicked

### 3) Intel
Two layers:
- **Intel Log**: readable entries the player can revisit (`intel_note`)
- **Intel Tags**: counters (e.g. `propaganda`, `surveillance`) used for matching/logic

### 4) Leads
Leads are “investigation threads”:
- added automatically as you encounter evidence
- resolved when a conclusion is reached

They’re meant to **support reasoning**, not tell the player what to click.

### 5) Grimoire identification
A grimoire entry defines:
- required intel tags
- how many matches needed to attempt naming (threshold)
- description revealed on confirmation

Identification can optionally require consuming a special resource (ink) to make it feel *ritualistic* and weighty.

---

## Project structure (high-level)

```
src/
  engine/
    types.ts        # GameState, Effect, Condition types
    reducer.ts      # applyEffects() state transition logic
    results.ts      # diff-to-toast results + special chance failures
  ui/
    AppShell.tsx    # tabs + layout
    NarrativeView.tsx
    IntelView.tsx
    LeadsView.tsx
    GrimoireView.tsx
    InventoryView.tsx
    CraftView.tsx
  data/
    nodes.json / nodes.generated.json
    items.json
    recipes.json
    grimoire.json
content/
  cases/            # optional writer-first case files (if using the compiler)
tools/
  compileCases.ts   # optional: generates nodes + merges missing items
```

> If you’re not using the content compiler, you can ignore `content/` and `tools/`.

---

## Common workflows

### Adjust toast duration
In `src/App.tsx`, find the toast cleanup timer:

```ts
setTimeout(() => {
  setToasts((prev) => prev.filter((t) => !newToasts.some((n) => n.id === t.id)));
}, 5000);
```

Change `5000` to your preferred milliseconds.

### Hide one-time investigations after use
Choices gated by `flag_false` can be hidden in `NarrativeView` by filtering visible choices. This supports anti-farming and reduces clutter.

---

## Data files

### `src/data/items.json`
Dictionary of items keyed by ID:

```json
{
  "dragons_blood_ink": { "id": "dragons_blood_ink", "name": "Dragon’s Blood Ink", "type": "material" }
}
```

### `src/data/recipes.json`
Crafting recipes define:
- required input items
- output items

### `src/data/grimoire.json`
Grimoire entries define:
- demon metadata
- required intel tags
- identify threshold
- revealed description

### `src/data/nodes*.json`
Narrative graph. Each node has `text` and `choices`.

---

## Design goals

- **Writer-first**: content should be easy to author without fear of breaking the game
- **Investigation over “quest markers”**: leads support logic, not directions
- **Anti-softlock**: required progression items must have dependable sources
- **Anti-farming**: repeat clicks shouldn’t inflate intel or currency indefinitely
- **Deterministic engine**: state transitions are predictable and testable

---

## Roadmap (suggested order)

1. **Travel screen** (locations + “active leads here” counters)
2. **Intel Log polish** (filter by tags, search, show sources/reliability)
3. **Yoroku (Yokai Codex)** basic shell (discover → view → bind)
4. **Task system** (use bound yokai for scouting/utility; costs humanity)
5. **Malleus heat** triggers (consequences for inhuman play)
6. **Shop UI** (stationers, black markets, ritual suppliers)
7. **Sealing encounters** and **Horseman escalation**

---

## License / Notes
This is a prototype under active development and content formats may change.

Last updated: 2026-01-21In `package.json`:

```json
"scripts": {
  "content:build": "ts-node tools/compileCases.ts"
}
```

### 6) Point the game at generated nodes
Update your node import (wherever you currently import nodes):

Before:

```ts
import nodes from "../data/nodes.json";
```

After:

```ts
import nodes from "../data/nodes.generated.json";
```

### 7) Write your first case file
Create:

- `content/cases/london.md`

Example starter:

```md
::node intro
London feels wrong. Not loud‑wrong—coordinated‑wrong. Posters appear overnight. Chants sync like metronomes.

+ Review reports and head into the city -> london_hub
  @lead_add london_unrest | Unrest, too coordinated to be human | London’s crowds move like a single organism. Identify what shapes the message and movement. | London

+ Stand down (end demo) -> end

::node london_hub
You arrive near Westminster. Police lines are calm. Too calm.

+ Listen to the speeches in Trafalgar Square -> london_hub
  @once intel_london_speeches
  @intel_note | Chants follow a shared script | Different groups, same phrasing… | Trafalgar Square | medium | propaganda,coordination

+ Trace the camera network and patrol routes -> london_hub
  @once intel_london_cameras
  @intel_note | Cameras behave like sentries | Cameras pivot in sequence… | Westminster | high | surveillance,coordination

+ Check the Grimoire and compare your notes -> hint_grimoire
```

### 8) Build content + run the game
```bash
npm run content:build
npm run dev
```

---

## The Writer‑First Case Format (the thing you write)

You will mostly write plain text with a few simple markers:

### Nodes (scenes)
```
::node node_id
Scene text goes here.
Can be multiple lines.
```

- `node_id` must be unique across all cases.
- Scene text becomes `node.text`.

### Choices (buttons)
```
+ Choice text -> next_node_id
```

- `Choice text` becomes the button label.
- `next_node_id` becomes the `next` field.

### Directives (effects/requirements)
Directives start with `@` and belong to the **choice above them**.

Example:

```md
+ Descend into the undercroft -> london_hub
  @once found_dbi_london
  @item_add dragons_blood_ink 1
```

---

## Supported directives (MVP)

### One‑time choice (anti‑farming)
```md
@once flag_key
```

Compiler expands this into:
- requires: `flag_false flag_key`
- effects: `flag_set flag_key true`

Result: the choice becomes unavailable after being used once.  
Your UI can hide “completed one‑time” choices.

---

### Requirements
```md
@requires has_obols 2
@requires has_item iron_ink 1
@requires flag_true some_flag
@requires flag_false some_flag
```

Maps to the game condition types:
- `has_obols`
- `has_item`
- `flag_true`
- `flag_false`

---

### Inventory effects
```md
@item_add item_id qty
@item_remove item_id qty
```

---

### Obols effects
```md
@obols_add 1
@obols_spend 2
@obols_add_chance 1 0.2
```

- `@obols_add_chance` is a roll. The game can toast success or failure.

---

### Humanity changes
```md
@humanity -1
@humanity 2
```

---

### Intel entries (evidence notebook + tag power)
```md
@intel_note | title | body | source | reliability | tag1,tag2,tag3
```

---

### Leads (automatic objectives)
```md
@lead_add key | title | body | location
@lead_resolve key
```

Leads should feel like **threads**, not instructions.

---

## Auto‑adding missing items (no more hand edits)

If your cases reference an item ID that does not exist in `src/data/items.json`, the compiler will:
- Add an entry safely (add‑only; it does not overwrite existing items)
- Guess a nice name from the ID (`dragons_blood_ink` → “Dragons Blood Ink”)

You can later edit names/types in `items.json` any time.

Recommended convention:
- Use **snake_case** for item ids.

---

## Where files are generated/written

### Generated
- `src/data/nodes.generated.json`  
  Rebuilt each time you run `npm run content:build`.

### Merged / updated (add‑only)
- `src/data/items.json`  
  Compiler adds missing items referenced in cases.

---

## Toast notifications

Toasts are produced from gameplay diffs:
- Intel gained
- Item acquired/consumed
- Obols gained/spent
- Chance roll failures (e.g. “No Obol found.”)
- Lead added/resolved

### Adjust toast dismiss time
In `src/App.tsx`, find the timeout and increase it (example 5000ms):

```ts
setTimeout(() => {
  setToasts((prev) => prev.filter((t) => !newToasts.some((n) => n.id === t.id)));
}, 5000);
```

---

## Grimoire identification: make it feel like a reveal

Recommended behavior:
- Before confirmation: show **Unknown Entity** even if threshold is met.
- Threshold met: show “PATTERN FORMED” — you can name it.
- Confirm: reveals name + description and triggers leads.

### Consuming “true‑name ink”
Consume one ink per identification.

Lore‑friendly option:
- **Dragon’s Blood Ink** (`dragons_blood_ink`)

---

## Troubleshooting

### “Cannot find module '../data/nodes.generated.json'”
Run the compiler once:

```bash
npm run content:build
```

### “Missing next node” warnings
Fix by:
- adding the missing `::node`
- correcting the `-> next_node_id`

### Items not appearing / missing in UI
- Ensure your case uses `@item_add item_id qty`
- Run `npm run content:build`
- Verify `items.json` contains the item entry after the run

### Nothing changes
- Make sure your game imports `nodes.generated.json`
- Restart dev server after content builds if hot reload doesn’t pick up JSON changes.

---

## Roadmap (recommended next steps)

### Content pipeline improvements
- Case namespacing (avoid node ID collisions)
- Override files (e.g., `content/items.overrides.json` for nice names/types)
- Better linting (duplicate flags, softlock detection, etc.)

### Game features (post‑pipeline)
- Travel screen (locations + active leads count)
- Yoroku (Yokai codex) + capture/binding loop
- Shop view (occult stationer inventory driven by data)
- Demon sealing encounters and Horseman escalations

---

## Solo‑dev principles
- Data‑driven: content changes shouldn’t require code changes.
- Writer‑first: you write cases; the tool generates structure.
- Anti‑softlock: required progression items must have guaranteed sources.
- Anti‑farming: one‑time investigations shouldn’t be spammable.

---

Last updated: 2026-01-21
