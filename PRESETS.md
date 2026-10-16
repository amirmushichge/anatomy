# Educational preset mechanics

All dimensions are in millimetres. These are generic teaching models, not measured reproductions of commercial products. Shapes are closed, opaque solids with intentional cutaways. Part counts include named integral features such as grip ribs, dial indices and illustrative tracks; they are inspection entities, not a manufacturing bill of materials. Tooth flanks are simplified trapezoids, and force, wear, friction, heat, optics and electronics are not numerically simulated.

All twelve objects use white drawing materials, thin outlines, five functional colour families, five causal chapters and staged dissection. See GALLERY-V2.md for the nine new geometry upgrades and SCENE-STANDARD.md for the shared implementation.

| Preset | Named solids/features | Mechanism and controls |
|---|---:|---|
| Click pen | 75 | White drawing study; hollow cutaways, three cam followers, six sleeve positions, alternating lock/release, independent button return, 3 mm refill advance, held phases and five causal chapters. |
| Mechanical keyboard | 279 | White drawing study; 61 hollow caps and cross sockets, individual stems/springs, actual plate apertures, rooted leaf bending at 2 mm, 4 mm stroke, linked stabilizer sliders and five chapters. |
| Photo lens | 93 | Six optical groups/seats; mating helicoid and guide rails; nine pierced leaves with fixed pivots and drive pins in an actual slotted ring. Focus travels 4 mm at 15 mm/revolution. f/2–f/16 sets pupil incircle diameter to 50/N; Iris mode reveals the assembly and cycles actual aperture. |
| Mechanical watch | 124 | Watch study: hand-wound, 2.5 Hz / 18,000 beats per hour. White materials, thin outlines, five functional highlight colours. Hollow case, pierced bridges, detailed compound train, club-tooth escape wheel, pallet stones, balance/hairspring, motion work and small seconds. Actual pitch distances: centre/third/fourth ratios 8:1 × 7.5:1 × 10:1. Hands12:1. Staged dissection; wind, power reserve, run/pause, one-beat stepping, five causal chapters. |
| Gamepad | 78 | Hollow shaped shell, two stick modules with gimbal stages/potentiometers, profiled buttons, cutaway domes, conductive pills and separate comb contacts, D-pad, trigger sensors, four eccentric motors, board and battery cavity. A synchronous input cycle demonstrates tilt, trigger and button contact. Stick X changes left tilt. |
| Cylinder lock | 46 | Five key pins/drivers, springs, shaped keyway, bevelled matching bitting, rotating plug and rear cam. Key insertion lifts all five joints to the 8 mm shear boundary. Rotation is interlocked with complete insertion; withdrawal waits for zero plug angle. |
| Geared bicycle hub | 54 | Pierced/bored fixed sun (24 teeth), three planets (24 each), ring (72), open carrier, hollow axle, selector, driver, pawls, two bearings and drilled flanges. Low uses ring input/carrier output (0.75×); direct uses carrier input/output (1×); high uses carrier input/ring output (4/3×). Shift at rest. |
| Four-stroke engine | 57 | Piston/rings, wrist pin, rod, crank, flywheel, cutaway cylinder/sump, valves/seats, springs, moving pushrods, pivoted rockers, detailed plug and bored 20/40 timing gears. A 36 mm stroke uses an 18 mm crank and 70 mm rod. The slider-crank equation determines both rod joints/piston position across 720°. Four strokes occur in order. |
| DC motor | 58 | Three laminated poles and windings, segmented commutator, brushes/open holders, supply braids, terminals, magnets, keyed shaft and bearings. One rotor revolution per cycle; reversing supply reverses rotation. Only the positive brush segment is highlighted, selected by actual rotor angle. |
| Loudspeaker | 49 | Cutaway cone, dust cap, twelve coil turns, former, pole, magnet/yoke, basket, flexible leads, spider and surround. Two sinusoidal oscillations with ±1.8 mm excursion. Suspensions deform with anchored outer edges. Tone selects 40–200 Hz; scene time is slowed to make motion visible, with its scale shown. |
| Bicycle pump | 48 | Piston seal/retainer, rod/wiper, T handle, cutaway barrel, inlet/outlet poppets and correctly seated compressing springs, hose, connector, gauge and base. A 180 mm stroke drives an isothermal chamber, with 20 mm equivalent dead volume, into a fixed 3 bar absolute outlet reservoir. Inlet admits ambient air; outlet opens above reservoir pressure. Residual air expands on the next upstroke. |
| HDD | 69 | Two platters/four surfaces, spindle, thin pierced arms/flexures/sliders, supported actuator pivot, rotary voice coil and wide magnet arcs, four parking shelves, flexible connection, preamp, filters, PCB and SATA. Seek settles at the target before read; Park moves all four heads beyond the platters onto the ramp. Physical 7200 rpm is shown at slowed scene speed. |

## Deliberate simplifications

- The lens has representative curved surfaces and a geometric pupil; no optical prescription, ray tracing, transmission or depth-of-field calculation is claimed. Its nine-leaf opening is a regular polygon, not a perfectly circular pupil.
- The watch shows a representative train with correct centre distances and ratios. Pallet impulses, mainspring unwinding and crown winding are explanatory; it is not an escapement contact, torque or timekeeping simulation.
- Gamepad sensor values follow prescribed input travel. Triggers and elastomer compliance are simplified; this does not connect to an actual controller or produce physical haptics.
- The lock teaches use of its matching key. Pin lifting during insertion is interpolated rather than computed as continuous contact with a moving key profile.
- The hub models one simple epicyclic train and its selected torque paths. It does not reproduce a particular Shimano hub's complete clutch/freewheel topology.
- The engine's primary crank/rod/piston linkage and valve sequence are constrained. Cam lobes, followers, combustion, fluid flow and lubrication are representative rather than full contact/dynamics simulations.
- The motor prescribes rotation and commutation. It does not calculate torque, current, back EMF or acceleration from the supply voltage.
- Speaker excursion is prescribed. Coil force, acoustic radiation, impedance and audible tone synthesis are omitted.
- The pump's pressure model assumes constant temperature and ideal check valves. The outlet is a fixed reservoir, not a tyre whose pressure increases with strokes; the gauge marks that reservoir while the digital readout shows chamber pressure.
- HDD tracks and flying clearances are enlarged enormously for legibility. Heads are not modelled at nanometre clearance; servo control, data density and throughput are omitted.

## Primary references

- Lens: [Nikon lens glossary](https://imaging.nikon.com/imaging/lineup/lens/glossary/) and [Nikon aperture structure](https://nij.nikon.com/learn/phototech/manual/01/02.html).
- Watch study: [Horopedia Swiss lever escapement](https://horopedia.org/distribution-mechanism-swiss-lever-escapement/), [counting/transmission](https://horopedia.org/counting-and-transmission-mechanism/) and [ETA6497-2](https://portal.eta.ch/fr/6497-2-6497-2-3.html) for movement scale only. Authored layout, not a replica; see WATCH-STANDARD.md.
- Gamepad: [Xbox controller anatomy and four motors](https://news.xbox.com/en-us/2013/06/06/xbox-one-controller-feature/) and [Microsoft input/vibration documentation](https://learn.microsoft.com/en-us/windows/uwp/gaming/gamepad-and-vibration).
- Lock: [Schlage pin-tumbler keying kit](https://www.schlage.com/content/dam/sch-us/documents/pdf/installation-manuals/P513-325.pdf).
- Hub: [Shimano internal-gear hub history](https://www.shimano.com/en/100th/history/products/65.html) and [NASA planetary transmission study](https://ntrs.nasa.gov/api/citations/20040073522/downloads/20040073522.pdf?attachment=true).
- Engine: [Briggs & Stratton four-stroke explanation](https://www.briggsandstratton.com/en-us/support/videos/4-stroke-theory).
- Motor: [maxon brush/commutator documentation](https://support.maxongroup.com/hc/en-us/articles/360004252074-Commutation-Graphite-brushes-GB-or-Precious-metal-brushes-EB).
- Speaker: [Visaton driver construction](https://www.visaton.de/index.php/en/products/drivers/fullrange-systems/b-200-6-ohm).
- Pump: [Topeak floor-pump check valve](https://www.topeak.com/global/en/product/449-CHECK-VALVE).
- HDD: [Seagate HDA and rotary actuator manual](https://www.seagate.com/support/disc/manuals/ata/1621pma.pdf) and [Seagate voice-coil and air-filtration manual](https://www.seagate.com/www-content/support-content/samsung/internal-products/spinpoint-m-series/en-us/docs/100772113c.pdf).

Sources establish component roles and mechanism principles; the illustrative dimensions, tooth counts and kinematic parameters above are the model's own design.
