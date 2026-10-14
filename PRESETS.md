# Educational preset mechanics

All dimensions are in millimetres. These are generic teaching models, not measured reproductions of commercial products. Shapes are closed, opaque solids with intentional cutaways. Part counts include named integral features such as grip ribs, dial indices and illustrative tracks; they are inspection entities, not a manufacturing bill of materials. Tooth flanks are simplified trapezoids, and force, wear, friction, heat, optics and electronics are not numerically simulated.

| Preset | Named solids/features | Mechanism and controls |
|---|---:|---|
| Photo lens | 79 | Six optical elements, helicoid focusing carriage, nine pivoting iris leaves, barrel, mount and retaining seats. Focus cycle moves 4 mm; ring rotation follows a 15 mm/revolution lead. Aperture f/2–f/16 sets the incircle diameter to 50/N. **Iris** moves front optics aside without separating the leaves. |
| Mechanical watch | 62 | Mainspring barrel, compound wheel train, jewels, balance, deforming hairspring, pallet fork, escape wheel and three hands. Eight visible beats per cycle. Escape advances half a 15-tooth pitch per beat; train reductions are 16:1, 8:1 and 7.5:1. An 8:1 barrel reduction feeds the centre wheel. Minute/hour hands maintain 12:1. |
| Gamepad | 66 | Two stick modules and their potentiometers, gimbal, buttons, D-pad, trigger sensors, four eccentric motors, circuit board and battery cavity. One input demonstration tilts the left stick, moves the right trigger and presses buttons. Stick X changes the left tilt. |
| Cylinder lock | 44 | Five key pins, five drivers, springs, chamber caps, matching key, rotating plug and rear cam. Key insertion lifts all five joints to the 8 mm shear boundary. Rotation is interlocked with complete insertion; withdrawal waits for zero plug angle. |
| Geared bicycle hub | 51 | Fixed sun (24 teeth), three planets (24 each), ring (72), carrier, selector, driver, pawls, bearings and spoke flanges. Low uses ring input/carrier output (0.75×); direct takes input/output at the carrier (1×); high uses carrier input/ring output (4/3×). Shift at rest. |
| Four-stroke engine | 51 | Piston and rings, wrist pin, connecting rod, crank, flywheel, cylinder, sump, intake/exhaust valves, springs, spark plug and 20/40 timing gears. A 36 mm stroke uses an 18 mm crank and 70 mm rod. The exact slider-crank equation determines both rod joints and piston position across 720°. Intake, compression, power and exhaust occur in order. |
| DC motor | 55 | Three laminated poles and windings, segmented commutator, brushes, holders, terminals, magnets, shaft and bearings. One rotor revolution per cycle; reversing supply reverses rotation. The positive brush segment is selected by actual rotor angle. |
| Loudspeaker | 49 | Cutaway cone, dust cap, twelve coil turns, former, pole, magnet/yoke, basket, flexible leads, spider and surround. Two sinusoidal oscillations with ±1.8 mm excursion. Suspensions deform with anchored outer edges. Tone selects 40–200 Hz; scene time is slowed to make motion visible, with its scale shown. |
| Bicycle pump | 46 | Piston seal, rod, T handle, cutaway barrel, inlet/outlet poppets and springs, hose, connector, gauge and base. A 180 mm stroke drives an isothermal chamber, with 20 mm equivalent dead volume, into a fixed 3 bar absolute outlet reservoir. Inlet admits ambient air; outlet opens above reservoir pressure. Residual compressed air expands on the next upstroke. |
| HDD | 67 | Two platters/four surfaces, spindle, four arms/suspensions/sliders, rotary voice coil and magnet, parking ramp, filters, PCB and SATA connectors. Target track selects an actuator arc; the cycle seeks first and indicates read only after settling. Physical 7200 rpm is shown at slowed scene speed. |

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
- Watch: [ETA 7750 technical document](https://shopb2b.eta.ch/technicaldocuments/index/pdf/id/2081/) and [Breguet escapement components](https://www.breguet.com/en/breguet-house/1999-present/introduction-silicon-certain-watch-components).
- Gamepad: [Xbox controller anatomy and four motors](https://news.xbox.com/en-us/2013/06/06/xbox-one-controller-feature/) and [Microsoft input/vibration documentation](https://learn.microsoft.com/en-us/windows/uwp/gaming/gamepad-and-vibration).
- Lock: [Schlage pin-tumbler keying kit](https://www.schlage.com/content/dam/sch-us/documents/pdf/installation-manuals/P513-325.pdf).
- Hub: [Shimano internal-gear hub history](https://www.shimano.com/en/100th/history/products/65.html) and [NASA planetary transmission study](https://ntrs.nasa.gov/api/citations/20040073522/downloads/20040073522.pdf?attachment=true).
- Engine: [Briggs & Stratton four-stroke explanation](https://www.briggsandstratton.com/en-us/support/videos/4-stroke-theory).
- Motor: [maxon brush/commutator documentation](https://support.maxongroup.com/hc/en-us/articles/360004252074-Commutation-Graphite-brushes-GB-or-Precious-metal-brushes-EB).
- Speaker: [Visaton driver construction](https://www.visaton.de/index.php/en/products/drivers/fullrange-systems/b-200-6-ohm).
- Pump: [Topeak floor-pump check valve](https://www.topeak.com/global/en/product/449-CHECK-VALVE).
- HDD: [Seagate HDA and rotary actuator manual](https://www.seagate.com/support/disc/manuals/ata/1621pma.pdf) and [Seagate voice-coil and air-filtration manual](https://www.seagate.com/www-content/support-content/samsung/internal-products/spinpoint-m-series/en-us/docs/100772113c.pdf).

Sources establish component roles and mechanism principles; the illustrative dimensions, tooth counts and kinematic parameters above are the model's own design.
