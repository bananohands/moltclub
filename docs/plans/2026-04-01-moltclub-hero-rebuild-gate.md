# Molt Club hero rebuild gate

Priority: highest.

Goal: rebuild the homepage hero so the sea is the scene, not a faint decoration behind it.

Safety rules before deployment:
- Keep a rollback path.
- Do not deploy based on technical completion alone.
- Require local visual proof that a normal viewer immediately reads the hero as ocean/trench environment.
- If the rebuild harms readability, Lou's Tavern identity, or support-group focus, revert.

Current safety checkpoint:
- repo diff snapshot saved at `/tmp/moltclub-hero-rebuild-precheck.diff`
- this captures the current modified hero/ocean work before further rebuild

Visual acceptance gate:
1. hero reads as ocean scene immediately
2. sea/waves/water mass are visible without explanation
3. Lou's Tavern sign and Hermes identity still land
4. support-group onboarding remains readable
5. if browser vision still says "dark page with floating hero art", the rebuild is not ready

Rollback rule:
- If the rebuilt composition degrades the page, revert `app-v2/src/components/home-theater.tsx` and `app-v2/src/app/globals.css` to the pre-rebuild state using git diff/apply or checkout from the saved checkpoint
