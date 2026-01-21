# Animus Mundi — Writer‑First Content Pipeline (Solo‑Dev Friendly)

This repo contains a **React/Vite** narrative RPG prototype where you investigate Horsemen influence, collect intel, and progress via **Leads**, **Intel Log**, **Grimoire identification**, crafting, inventory, and currency (Obols).

The big quality‑of‑life goal is:

✅ **Write cases as a writer** → run one command → the tool generates the JSON the game needs.

This README documents the **content compiler** workflow and the systems built so far.

---

## What you have right now

### Core gameplay systems (implemented)
- **Narrative nodes**: Scene text + choices (buttons).
- **Intel Log**: `intel_note` writes readable evidence entries and also powers matching tags.
- **Leads**: automatic threads (not quest markers) that appear/resolve based on actions.
- **Toasts**: notifications for intel gains, items, obols, lead changes, chance failures.
- **One‑time investigations**: choices can disappear after use (anti‑farming).
- **Inventory + crafting**: items, recipes, crafting results.
- **Obols currency**: rare coins; includes chance rolls with “fail” toasts.
- **Grimoire**: demon entries that become confirmable when intel threshold is met.
- **Ritual gating**: demon identification can require consuming a special ink (e.g., Dragon’s Blood Ink).

### The pain this solves
Hand‑editing `nodes.json`, flags, and item IDs is brittle and overwhelming.  
So we introduce a **writer‑first case format** + a **compiler** that generates:
- `src/data/nodes.generated.json`
- merges missing item IDs into `src/data/items.json` (safe, add‑only)

---

## Quick Start

### 1) Install dependencies
From repo root:

```bash
npm install
```

### 2) Install the compiler runner
We run the compiler using `ts-node`:

```bash
npm i -D ts-node
```

### 3) Add folders
Create these folders if they don’t exist:

```
content/
  cases/
tools/
```

### 4) Add the compiler script
Create:

- `tools/compileCases.ts`

…and paste the compiler code into it.

### 5) Add npm script
In `package.json`:

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
