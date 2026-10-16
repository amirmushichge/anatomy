# Anatomy scene foundation · 2.0 preview

All twelve objects now use the drawing-study contract. Watch, rotary-cam pen and mechanical keyboard are the approved reference set; nine upgraded models extend the same foundation. Open index.html or any object HTML offline. The earlier study workspaces and v1.1 Git tag retain the reference history. No constructor UI is included. Release v2.0.0 uses this shared scene contract. See GALLERY-V2.md for the nine-object changes and mechanism-specific limitations.

## Reusable implementation

| Layer | Source | Contract |
|---|---|---|
| Drawing language | study-core.mjs | Five colour tokens, white surface tones, thin outlines; drawingPart, role, stagedMotion, studyMarkup and validateStudy. |
| Solid geometry | geometry.mjs | Extruded plates with actual holes, hollow sections, closed springs, intentional cutaways. Dimensions in mm. |
| Mechanism truth | presets/*-model.mjs | Pure pose drives geometry, readouts, compression and contact state. |
| Part metadata | presets/*-scene.mjs | Stable id, assembly, title, causal description, geometry, functional role and optional action. |
| Assembly | motions | separate vector plus separateRange:[start,end] stagger extraction; input and separation compose. |
| Narrative | study-definitions.mjs | Chapters define system, causal title/text/fact, focus ids, camera, reveal amount, optional visibility only/hide. Roles are specific to each mechanism. |
| Nine-object catalogue | study-catalog.mjs / presets/gallery-upgrades.mjs | Five roles and five causal chapters per object; real geometry additions, structural context, extraction ranges and optional held model phases. Runtime resolves include prefixes against actual part ids. |
| Study lifecycle | study-ui.mjs / study-adapters.mjs | Navigation, held phase, playback, next phase, model-specific settings, hidden-context label, whole-object restoration and responsive copy. Motion splits Playback/Settings on small screens. Watch retains wind/beat experiments with shared markup. |
| Viewer | viewer-engine.mjs | One renderer; orbit/zoom/pan; depth-aware outlines; colours; visible-only picking; rooted leaf bending; spring compression. |
| View history | gallery-app.mjs | Pinned callout; Focus/Return saves camera, separation and chapter visibility. |

Tokens: orange #e6a568, cyan #71cbd8, pink #e39cbe, blue #829ee2, yellow #e3c65e. Assign colours to mechanism-specific roles. Structural context stays white. Selection uses the part's role colour. Every colour also has a text label.

## Next-object quality gate

1. Define the principal causal chain before cosmetic detail. Record representative dimensions and primary references; separate authored parameters from manufacturer specifications.
2. Build wall thickness, cavities, bores, seats and attachment points. Named integral marks are inspection entities, not a service BOM or quality score.
3. Use one mechanism model. Test endpoints, constraints, retained states, reversals and impossible inputs relevant to the mechanism.
4. Extract covers before internals. A study view may explicitly hide context; full dissection retains all parts. Hidden meshes cannot intercept picking.
5. Give each chapter one causal explanation, useful framing, matching highlight and demonstrative action. Use held phases for short events.
6. Review macro, five directions, assembly and dissection. Test actual input, phone/short landscape, pinned Focus/Return, reduced motion, fallback and no page/panel scroll.

## Pen

Representative 140 × 10.8 mm rotary-cam pen, 3 mm refill advance, 4.5 mm input stroke, six sleeve positions, three followers and 60° per click. Odd clicks catch ledges; even clicks return into deep slots. The button returns independently of the retained refill. The front spring seat stays fixed. A 0.7 mm ball is shown in its socket.

75 inspection entities including six integral button flutes. Barrel, refill, rotator and sleeve have actual cavities. Cut sectors and chapter-hidden walls explain the mechanism. Crown contact faces and two-stage turning are kinematic approximations; friction, spring force and full contact/collision dynamics are not solved. This is not a measured commercial pen.

Primary principle reference: [US5263786A, rotary-cam ball-point pen](https://patents.google.com/patent/US5263786A/en). Supports cam/guide/elastic return roles; our indexing, dimensions and simplified faces are authored parameters.

## Keyboard

Representative 61-key / 15u layout, 19.05 mm pitch, 4 mm linear stroke and 2 mm actuation. Hollow sculpted caps have real cross sockets. Each key has a separate stem and seated spring. Plate/foam have actual switch/stabilizer holes. Escape is a corner cutaway with a base, rails, upper shell, spring post and two contacts. The moving leaf bends from a fixed root; its contact meets the fixed contact at 2 mm, remains closed to bottom-out and opens on return.

Wide keys have two translating sliders, fixed wire bearings and a rotating crossbar with 6 mm crank arms: 6 sin(angle) = stem travel. Matching cap sockets attach the sliders. All 61 keys actuate; detailed leaf bending and the highlighted electrical path are shown on Escape. Matrix routing is representative. Scan/debounce timing, bounce, diode physics and USB packets are not simulated. Press/release use the same actuation threshold; exact hysteresis is not claimed.

279 inspection entities, including repeated switches/integral features. [CHERRY MX RED official description](https://www.cherry.de/en-us/product/mx2a-red) supports component roles, linear action, 2 mm pre-travel and 4 mm total travel. Our teaching geometry is not CHERRY CAD or a tolerance/force model.

## Verification

- qa/study-check.mjs → review/study-model-qa.json: three contracts, finite solids, 12,012 pen poses, 4,001 keyboard poses, triangulated plate holes, contact surfaces, stabilizer endpoint constraint, 1,001 separation samples and baseline comparison.
- qa/watch-check.mjs: retained train, beat, reserve and geometry checks.
- qa/new-model-check.mjs: nine mechanism invariants and geometry checks.
- qa/rollout-check.mjs → review/rollout-model-qa.json: 19,019 poses, nine changed geometries, 567 lens drive-slot rays, actual gear bores, bearing centres, spring seats and HDD parking/clearance constraints.
- review/verify-studies.mjs → review/browser-qa.json: actual input, study views, Focus/Return, five directions, responsive layouts, phase holds and reduced motion.
- review/verify-rollout.mjs → review/rollout-browser-qa.json: nine scenes, five chapters each, five dissection directions and four viewport sizes without page/panel scroll.
- review/gallery-entry-check.mjs → review/gallery-entry-qa.json: native settings, revised final views, all-nine reduced motion, real touch and all-twelve WebGL fallback. review/final-entry-check.mjs --verify-only retains the three-reference entry checks.

Numerical tests cover listed invariants, not exhaustive collision certification, fidelity scoring, educational user testing or hardware performance. Manual images in review/ retain visual evidence.

## Safe build

Use npm ci in a fresh checkout, then node build.mjs and npm run audit. Browser checks use the pinned Playwright dependency; install Chromium with npx playwright install chromium or set CHROME_PATH. Runtime needs no network. Edit generators, not generated JSON/HTML. presets/pen-baseline.json is immutable generator input. Repeated builds must be deterministic.
