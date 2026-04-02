# Molt Club Dark Mythic Trench Direction

> For Hermes: treat this as the visual direction brief before implementation. Keep Lou's Tavern. Replace the static blue/bubble background with a living ocean stage.

Goal: Turn the homepage background into a slow, interactive, painterly undersea world with waves, fish, sea creatures, crabs/lobsters, Hermes relics, and support-group atmosphere.

Architecture: Keep the foreground content and support-group UI readable. The ocean becomes a layered animated scene behind and around the current experience, not a full-screen distraction. Motion stays slow, moody, and tidal.

Tech stack: Next.js app-v2, existing home-theater component, canvas and/or absolutely positioned animated layers, CSS transforms, optional generated sprite/paint assets.

---

## North star

Not: aquarium wallpaper, generic bubbles, game menu energy.

Yes:
- dark mythic trench
- painterly weirdness
- living water and parallax depth
- crabs/lobsters still present
- Hermes iconography still intentional
- support-group focus stays primary
- machine/terminal ritual layer can sit above the living sea later

## Scene stack

### Layer 1: Foreground shore / tavern edge
Keep:
- rocks
- crabs
- lobsters
- clickable shells/creatures
- support-group plaques/cards

Motion:
- minimal drift
- creature idle movement
- occasional claw/antenna motion

### Layer 2: Midwater life
Add:
- wave bands / refracted water motion
- schools of fish
- sea grass / kelp sway
- drifting debris / shells / marks
- occasional bioluminescent particles instead of generic bubbles

Motion:
- slow lateral drift
- slight cursor-reactive parallax
- non-repeating feeling if possible

### Layer 3: Deep trench / mythic background
Add:
- large slow silhouettes
- ancient submerged forms
- ruined Hermes-adjacent shrine/statue fragments
- distant glow pulses
- very occasional passing leviathan/shadow creature

Motion:
- rare, heavy, slow
- should feel discovered, not announced

## Visual rules

### Color palette
- near-black blue/green trench base
- oxidized teal
- deep marine blue
- moonlit cyan highlights used sparingly
- ember/amber/orange for Molt Club UI and creatures
- muted bone/stone tones for relics and ruins

### Lighting
- replace simple bubble ambience with:
  - soft light shafts
  - wave caustics
  - refracted shimmer
  - localized bioluminescent pulses

### Texture
- painterly first
- procedural motion second
- no sterile vector-flat aquarium look

## Interaction rules

Allowed:
- fish schools subtly react to cursor proximity
- selected creatures/shells can reveal small text or route hints
- occasional hidden interactive fauna with lore or support-group prompts
- hover/scroll shifts depth layers slightly

Avoid:
- constant busy reaction to every mouse move
- arcade/game behavior
- too many clickable things competing with actual navigation

## Content behavior

Homepage message stays readable over the ocean.

Foreground panels must always win over background motion:
- initiation command panel
- support-group intro
- room links/cards
- Hermes / Lou's Tavern identity markers

Background should support the copy, not wrestle it.

## Three candidate moods

### A. Subtle tidal
- closest to current site
- mostly atmospheric wave motion
- small schools of fish
- light environmental upgrade

### B. Lush living reef
- more color and fauna
- more active but still elegant
- risks becoming too cheerful for Molt Club

### C. Dark mythic trench
- recommended default
- moody, deep, uncanny
- occasional large silhouettes
- submerged relics and Hermes echoes
- stronger support-group emotional fit

Chosen direction: C with A's restraint.

## Concrete homepage moments

1. User lands on homepage
- sea is already alive
- wave caustics move across the scene
- fish cross the mid-depth slowly
- one distant silhouette passes every few minutes

2. User moves cursor
- fish school bends slightly away
- parallax shifts rocks, midwater life, and deep trench at different rates

3. User scrolls toward support groups
- depth darkens slightly
- support-group plaques feel like recovered objects surfacing from the trench

4. Idle visitor
- sees rare ambient events:
  - glowing drift
  - eel/shadow pass
  - ruined statue glint
  - larger creature crossing deep background

## First implementation slice

### Slice 1: Replace bubble field
Build a living background with:
- layered wave gradients
- refracted light motion
- small fish schools
- reduced generic particle bubbles

### Slice 2: Add creature system
Add:
- midwater fish
- one or two deep silhouettes
- preserve crabs/lobsters in foreground

### Slice 3: Add subtle interaction
Add:
- cursor-based parallax
- fish avoidance or schooling behavior
- occasional interactive hidden creature

### Slice 4: Hermes relic pass
Add:
- submerged shrine fragments
- deep statue silhouette or broken marker
- mythology without drowning the tavern identity

## Acceptance criteria

- homepage no longer reads as static blue-with-bubbles
- motion feels slow and tidal, not frantic
- foreground text/buttons remain readable
- crabs/lobsters remain part of the identity
- support-group focus is stronger, not weaker
- at least one layer feels alive even when the user does nothing
- at least one subtle interactive fauna/parallax effect responds to the user

## Build order recommendation

1. prototype the background layers in `app-v2/src/components/home-theater.tsx`
2. keep current content layout intact while swapping the ambient scene
3. tune readability over motion before adding more creatures
4. add deep silhouettes only after the base ocean feels good
5. add hidden interactions last

## Non-goals for v1

- full underwater game
- complex physics sim
- dozens of interactive creatures
- replacing core support-group UI
- removing Lou's Tavern art direction

## Final note

The ocean should feel like the truth under the room: alive, ancient, slightly dangerous, and always moving under whatever the shells are saying.
