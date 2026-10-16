# Anatomy v2 · local gallery review

All twelve objects use white four-tone solids, thin visible outlines and five labelled functional colour families. The lens was upgraded first; the remaining eight then used the same contract. This is an offline local review build. No deployment or social publication was performed.

## Nine-object rollout

| Object | Geometry and structure | Causal sequence / experiment | Explicit simplification |
|---|---|---|---|
| Photo lens | Separate optical groups and seats; mating helicoid, guide key and rails; pierced iris leaves, fixed pivots, drive pins and actual slotted ring. | Optics → screw drive → axial guide → iris → bayonet. 15 mm lead, 4 mm travel; f/2–f/16 and an iris cycle. | Opaque optical sections; no ray-traced prescription or contact-force solution. |
| Gamepad | Hollow shaped shell, perpendicular gimbal stages, profiled buttons, cutaway domes, conductive pills, separate comb contacts, return springs. | Tilt → sense → close contacts → restore → eccentric feedback. Stick-X experiment. | Inputs are demonstrated synchronously. Spring/force and electrical circuits are illustrative. |
| Cylinder lock | Bevelled bitting, shaped entrance keyway, cleared inner channel, independently extracted springs and cam fixing. | Key heights → aligned pin joints → shear boundary → spring reset → rear cam. | Correct-key insertion lifts are interpolated; no continuous contact/friction solver. |
| Geared hub | Actual bored and pierced gears, hollow axle, open carrier arms, drilled flange holes and a second bearing. | Sprocket → fixed sun → spin/orbit → selector → shell. Three ratios: 0.75, 1 and 4/3. | Selector/clutch contact topology is representative; gear forces and freewheel dynamics are omitted. |
| Four-stroke engine | Bored timing wheels, moving pushrods, pivoted rockers and supports, valve seats, detailed plug. Existing piston/rod/crank linkage retained. | Intake → compression → ignition → output → half-speed timing. Held 720° phases. | Prescribed valve lift; no combustion, thermal model or cam-contact forces. |
| DC motor | Laminated pole edges, open brush holders, supply braids and output key; commutator segment gaps retained. | Supply → field → armature → switching → reversible output. | Rotation and positive-segment switching prescribed; torque, current and acceleration not solved. |
| Loudspeaker | Drilled mounting rim, vented pole, tinsel leads with fixed terminal ends; flexing spider/surround retained. | Current → magnetic gap → former → suspension → air motion. Tone and slowed phase controls. | Deformation is kinematic; no acoustic radiation, electrical impedance or force solution. |
| Bicycle pump | Rod wiper and seal retainer; corrected moving lower spring seats; labelled fixed outlet gauge. | Input → cup seal → inlet → compression → outlet. | Isothermal dead-volume chamber and fixed 3 bar absolute reservoir; no simulated tyre inflation. |
| Hard disk | Thin pierced arms and flexures clear platter slabs; supported pivot, bending flex connection, wider magnet arcs and four parking shelves. | Spindle → positioning torque → heads/tracks → electronics → parking. Seek/Park and target-track controls. | Flying gaps/tracks enlarged; no nanometre clearance, servo, recording, density or throughput simulation. |

Counts are inspection entities, including integral/repeated features, not manufacturing BOMs or quality scores. Original watch, pen and keyboard definitions remain the approved reference set; the viewer and common controls have regression checks.

## Shared interaction

Learn contains five causal chapters for each object. Next phase and the cycle slider hold real model states. Motion retains each object's settings: aperture, stick position, hub gear, motor polarity, speaker tone and HDD target/mode. On small/short screens Motion separates Playback from Settings. The full E dissection exits hidden study context so every part is present. Click pins a stable callout; Focus/Return restores camera, separation and study visibility.

Visible context removal is labelled. Roles use text labels as well as colour. Covers lead the staged dissection. A single renderer is reused across objects and idle scenes stop requesting frames. No measured hardware frame-rate claim is made.

## Source register

These primary references support component roles and principles. Our dimensions, gear counts, layouts, timings and simplified shapes are authored teaching parameters unless explicitly identified otherwise.

- Lens: [Nikon diaphragm explanation](https://nij.nikon.com/learn/phototech/manual/01/02.html), [NIKKOR glossary](https://imaging.nikon.com/imaging/lineup/lens/glossary/).
- Gamepad: [Microsoft controller inputs and four vibration motors](https://news.xbox.com/en-us/2013/06/06/xbox-one-controller-feature/).
- Lock: [Schlage rekeying component guide](https://www.schlage.com/content/dam/sch-us/documents/pdf/installation-manuals/P513-325.pdf).
- Hub: [NASA planetary transmission study](https://ntrs.nasa.gov/api/citations/20040073522/downloads/20040073522.pdf?attachment=true).
- Engine: [Briggs & Stratton four-stroke explanation](https://www.briggsandstratton.com/en-us/support/videos/4-stroke-theory).
- Motor: [maxon brush commutation](https://support.maxongroup.com/hc/en-us/articles/360004252074-Commutation-Graphite-brushes-GB-or-Precious-metal-brushes-EB).
- Speaker: [Visaton full-range driver construction](https://www.visaton.de/index.php/en/products/drivers/fullrange-systems/b-200-6-ohm). Its product dimensions are not attributed to our representative driver.
- Pump: [Topeak check-valve component](https://www.topeak.com/global/en/product/449-CHECK-VALVE). The isothermal chamber/pressure parameters are our model, not Topeak specifications.
- HDD: [Seagate drive assembly/actuator manual](https://www.seagate.com/support/disc/manuals/ata/1621pma.pdf), [Seagate voice coil, ramp and filtering manual](https://www.seagate.com/www-content/support-content/samsung/internal-products/spinpoint-m-series/en-us/docs/100772113c.pdf).

## Reproducibility and evidence

- `node build.mjs` creates index.html and twelve direct-entry HTML files. No runtime network is required.
- `npm run audit` checks the three reference models, nine upgraded models and actual geometry constraints.
- `node review/verify-rollout.mjs` checks the nine-object browser matrix; `node review/verify-studies.mjs` checks the original references and shared controls.
- `node review/render-thumbnails.mjs` refreshes twelve clean rendered previews; rebuild to embed them.
- `node review/gallery-entry-check.mjs` checks physical input/settings, direct entries, reduced motion and WebGL fallback.
- `node review/gallery-hub-check.mjs` checks all twelve clean embedded thumbnails, paginated reachability and the visible header after focus/resize at four viewport sizes. The fixed application uses overflow clipping; programmatic card focus preserves scroll position.
- `node review/check-build.mjs` checks deterministic standalone output; `review/quality-review.json` and `review/source-manifest.json` seal the verified artifacts.

The tests establish their listed invariants. They are not exhaustive triangle-collision certification, optical/force simulation, a numerical visual-fidelity score, or educational user testing.
