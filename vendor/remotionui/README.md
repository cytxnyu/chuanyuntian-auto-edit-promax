# RemotionUI source integration

- Repository: https://github.com/riaz37/remotion-ui
- Pinned source revision: `b7e0e6becc3d22b8b03dfef72c064f72ff9fad1f`
- Source license: MIT, preserved in `LICENSE`.
- Callable entries: `remotionui/social-clip`, `remotionui/title-card`, `remotionui/quote-card`.
- The complete registry contains 254 entries, **including utility dependencies**. Only the three IDs above are registered for rendering; 251 other entries are indexed, not installed as callable components.

## Source and adaptation boundaries

`original/` contains 25 exact upstream file blobs covering the three entries and their recursive registry dependencies. `SOURCE_MANIFEST.json` records original SHA-256, source URL and upstream revision for each. `runtime/` copies those implementations, resolving registry aliases into relative imports and replacing the network Inter font loader with a scoped family variable. No layout, animation choreography, palette, transition or content hierarchy is recreated.

The thin provider in `packages/remotion-renderer/src/external/providers/remotionui.tsx` loads pinned local Inter and Noto Sans SC font files, passes source props, and resolves public asset URLs. It does not alter the native frame or video configuration; the parent integration hosts that context. Both font licenses are preserved beside the assets.

The font bridge acquires its render-blocking handle in `useLayoutEffect`, not during React render. It releases that handle after font loading or during cleanup, once only; a discarded Suspense render therefore leaves no orphan handle. Font loading remains deduplicated per browser page. `verification/font-host-lifecycle-check.mjs` exercises an original title card followed by a delayed lazy sibling; the lifecycle evidence is recorded in `verification/FONT_HOST_VERIFICATION.json`. This host-only change does not edit upstream scene design or timeline.

`upstream/` is the acquisition checkout only. Its agent instructions/skills are not installed into the active skill or executed. The sync command reads exact pinned Git blobs, not whatever is later edited in that checkout.

The published `ai-components.live.json` and `llms.live.txt` are informational snapshots; they may change independently of the pinned source. The authoritative source inventory is `cache/registry.pinned.json`.

## Native scene contracts

| ID | Native dimensions | FPS | Frames | Main editable text |
|---|---|---|---|---|
| title-card | 960 × 540 | 30 | 90 | title, subtitle, eyebrow, meta |
| quote-card | 960 × 540 | 30 | 113 | quote, emphasis, author, role, initials |
| social-clip | 1080 × 1920 | 30 | 216 | hookTitle, hookSubtitle, podcastTitle, captions, ctaTitle, ctaLabel, ctaUrl |

The complete social clip keeps the upstream hook/body/end timing and two 12-frame fades: `60 + 120 + 60 - 12 - 12 = 216`. Its source and registry agree; the README example at this revision instead lists 228.

Text defaults are explicitly synthetic implementation fixtures, not source-media facts. A real plan must replace them from the current source. Do not invent a quote attribution, logo, product claim, URL, metric or testimonial. Title cards support explicit newlines. Quote cards use upstream whitespace-delimited words; Chinese phrase spaces and `charsPerLine` are content props, and long text still requires visual review.

The bundled upstream `demo-loop.wav` is for synthetic waveform review. The scene analyzes it but does not play it. A real-media social clip must pass the approved source WAV via `audioSrc`; the surrounding source video's original audio remains the playback track. Its captions require real source time mapping into the 120-frame body scene. No automatic transcript or audio alignment is claimed by this adapter.

## Implementation QA commands

Run from the upgraded skill directory:

```powershell
node scripts/sources/remotionui-sync.mjs
node scripts/sources/remotionui-verify.mjs
node node_modules/typescript/bin/tsc --noEmit --jsx react-jsx --module esnext --moduleResolution bundler --esModuleInterop --strict --skipLibCheck --target es2022 packages/remotion-renderer/src/external/providers/remotionui.tsx
node scripts/sources/remotionui-render-check.mjs --video
```

The render check uses the real three imported source entries, renders seven native-size stills, repeats a frame per entry and compares SHA-256, and renders the entire social clip at half-resolution for internal decode checks. Files in `verification/` are synthetic implementation evidence only, not Gate A/D approval or a requested real-video delivery. Source catalog status remains `installed`; passing source-integrity checks alone never claims rendered visual quality.
