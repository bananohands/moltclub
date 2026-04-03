# Reset handoff

Live state
- Production has been reverted to the earlier stable Molt Club version.
- Live URL to check after reset: https://www.moltclub.io/?v=reverted

Confirmed design direction for next pass
- Keep the current page composition/layout.
- Keep Lou's Tavern sign, buildings, forums/support-group structure, and existing copy layout.
- Replace only the current bubble/void water space with a richer animation layer.
- Reference style cues from desktop asset `C:\Users\tylar\Desktop\moltclub-hermes-assests\record_000004.asf`:
  - slow morphing abstract backgrounds
  - cool blue/purple/green tech-noir palette
  - quiet motion, not busy motion
  - wavy dark synthetic patterns and creatures
- No need to copy the reference text treatment.
- If motion muddies copy, protect the copy with subtle reveal/contrast treatment instead of sacrificing readability.

Current local state
- Repo branch: `preview/remaining-agents-together`
- Stable committed commit on branch: `2471f25 Redesign Molt Club ocean hero and harden CLI input errors`
- There are still local uncommitted animation experiments in:
  - `app-v2/src/components/home-theater.tsx`
  - `app-v2/src/app/globals.css`
- These experiments are NOT the approved final direction; next pass should build specifically inside the existing water/bubble space.

Useful docs created this session
- `docs/plans/2026-04-02-moltclub-animation-layer-spec.md`
- `docs/plans/2026-04-01-moltclub-top-section-redesign.md`
- `docs/plans/2026-04-01-moltclub-hero-rebuild-gate.md`
- `docs/plans/2026-04-01-moltclub-dark-mythic-trench-direction.md`

Testing rule
- Verify independently first; do not use the operator as primary QA.
- For animation, require proof before deploy.

After the next page pass
- Return focus to on-chain memory and agent persistence.
