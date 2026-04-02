# Molt Club top section redesign

Goal: redesign the homepage top section so a normal viewer immediately reads it as a living ocean scene, while preserving Lou's Tavern, Hermes iconography, support-group framing, and onboarding utility.

Rules:
- no deploy until harsh local visual QA passes
- favor composition and readability over speed
- the sea must be the scene, not decoration
- keep the existing lower sections functional unless the redesign requires otherwise

Required visual outcome:
1. first glance says ocean / trench / water
2. Lou's Tavern sign still lands as focal identity
3. Hermes and tavern artifacts feel embedded in the ocean scene
4. support-group onboarding still reads clearly
5. no floating-art-on-dark-page look

Redesign approach:
- replace the current hero stack with one integrated scene container
- use a wide scene panel as the visible environment
- embed waves, fish, water mass, sea floor, and structures in one composition
- place Lou's Tavern sign within the scene rather than above a neutral void
- move helper cards / portrait-house affordances so they belong to the scene
- keep support-group intro below, but visually tied to the environment

Testing gate:
- local build must pass
- browser vision must say the page clearly reads as ocean scene
- if browser vision says dark page / floating art / decorative band, redesign again

Rollback:
- current diff snapshot remains at /tmp/moltclub-hero-rebuild-precheck.diff
