import {make,C,Z,X,Y,box,disc,ring,sector,ball,beam,polyTube,gear,spiral,torus,prism,deg,TAU} from './solid-kit.mjs';

export function lensDefinition(){
 const k=make('lens','Photo lens','50 mm · Nine-leaf iris',{yaw:-1.05,pitch:.38});const {add,motion,assembly,screw}=k;
 motion('barrel',[0,0,-38]);motion('mount',[0,0,-66]);motion('front',[0,0,58],{liftField:'detail',lift:[85,0,30]});motion('focus',[0,0,20],{translateField:'focus',axis:[0,0,1]});motion('focus-ring',[0,0,42],{pivot:[0,0,0],rotateField:'focusAngle',rotateAxis:[0,0,1]});motion('iris',[0,0,10]);
 add('barrel','barrel','Cutaway barrel','A removed quarter exposes the optical groups, iris and focusing carriage.',[ring(Z(),0,66,33,30,20,290)],C.dark);
 add('rear-mount','mount','Bayonet mount','Three lugs lock the lens to a camera at a repeatable flange distance.',[ring(Z(),-5,0,32,23)],C.steel);
 for(let i=0;i<3;i++)add('bayonet-'+i,'mount','Bayonet lug '+(i+1),'Locks behind the matching camera mount flange.',[ring(Z(),-4,-2,35,30,i*120,i*120+35)],C.steel);
 add('front-rim','front','Filter thread rim','Provides a circular seat for a front filter and protects the front element.',[ring(Z(),64,69,34,29)],C.dark);
 add('focus-ring','focus-ring','Focus ring','Drives an axial helicoid; the demonstration changes carriage position.',[ring(Z(),37,51,35,33,20,290)],C.rubber,{action:'press'});
 for(let i=0;i<28;i++)add('grip-'+i,'focus-ring','Focus grip rib '+(i+1),'Gives the focusing ring a tactile grip.',[ring(Z(),38,50,35.7,35,20+i*9.6,23+i*9.6)],C.rubber);
 add('focus-carriage','focus','Focusing carriage','Moves the rear optical group axially while the barrel stays fixed.',[ring(Z(),6,23,27,24,20,290)],C.steel);
 add('helicoid','focus','Helicoid ridge','A screw-form guide converts ring rotation into axial lens travel.',polyTube(Array.from({length:121},(_,i)=>[27.6*Math.cos(i*TAU/120),27.6*Math.sin(i*TAU/120),8+i*15/120]),.35),C.steel);
 const elements=[[-2,3,23,'rear',.8],[9,5,23,'focus',1.8],[17,4,23,'focus',-1.2],[34,5,27,'front',1.8],[43,6,27,'front',-1.4],[57,7,29,'front',2.5]];
 for(let i=0;i<elements.length;i++){const [z,h,r,g,c]=elements[i];add('element-'+i,g,'Optical element '+(i+1),'A curved glass element refracts light; this teaching model shows surfaces, not a ray-traced prescription.',[{kind:'solid',F:Z(),profile:[[z,0],[z+.7,r*.55],[z+1.4,r],[z+h-1,r],[z+h-c, r*.5],[z+h,0]]}],C.glass,{outline:false});add('seat-'+i,g,'Element retaining seat '+(i+1),'Locates the optical element without loading its clear aperture.',[ring(Z(),z-.7,z-.1,r+1.2,r-.2)],C.steel)}
 // Fixed diagonal iris leaves overlap. A radial actuator moves the leaves
 // without changing their thickness; nine tangential pivots remain visible.
 for(let i=0;i<9;i++){const a=i*40,rr=deg(a),F=Z();motion('blade-'+i,[0,0,13+i*.65],{pivot:[27*Math.cos(rr),27*Math.sin(rr),0],rotateField:'irisAngle',rotateAxis:[0,0,1]});const pts=[[12.5,-10],[27.5,-9],[27.5,12],[12.5,28]].map(([x,y])=>[x*Math.cos(rr)-y*Math.sin(rr),x*Math.sin(rr)+y*Math.cos(rr)]);add('iris-blade-'+i,'blade-'+i,'Iris blade '+(i+1),'Overlaps its neighbours to vary the central aperture.',[prism(F,27+i*.13,27.1+i*.13,pts)],C.dark,{action:'press',requiresApart:true});add('iris-pivot-'+i,'iris','Iris pivot '+(i+1),'A fixed pin supports the rotating aperture leaf.',[disc(Z(27*Math.cos(rr),27*Math.sin(rr)),26.5,29, .7)],C.steel)}
 add('iris-carrier','iris','Iris carrier','Holds the nine aperture leaves in a compact plane.',[ring(Z(),26,26.8,29,25)],C.steel);
 add('aperture-lever','iris','Aperture actuator','A slotted actuator ring coordinates the nine pivoting iris leaves.',[ring(Z(),29,30,29,27,20,290)],C.steel);
 for(let i=0;i<5;i++){add('contact-'+i,'mount','Mount contact '+(i+1),'Carries electrical control signals between camera and lens.',[disc(Z(26*Math.cos(deg(35+i*8)),26*Math.sin(deg(35+i*8))),-5.3,-4.9,1)],C.copper);screw('mount-screw-'+i,'mount',29*Math.cos(deg(20+i*65)),29*Math.sin(deg(20+i*65)),-4,1,3)}
 assembly('optics','Optical group','element-4');assembly('focus','Focus carriage','focus-carriage');assembly('iris','Iris leaves','iris-blade-0');assembly('barrel','Barrel','barrel');assembly('mount','Mount','rear-mount');return k;
}

export function engineDefinition(){
 const k=make('engine','Four-stroke engine','Single cylinder · 720° cycle',{yaw:-1.18,pitch:.25}),{add,motion,assembly,screw,bearing}=k;
 motion('block',[-65,0,0]);motion('head',[0,0,70]);motion('sump',[0,0,-50]);motion('crank',[0,0,-8],{pivot:[0,0,0],rotateField:'crank',rotateAxis:[0,1,0]});motion('piston',[0,0,40],{translateField:'piston',axis:[0,0,1]});motion('rod',[25,0,18],{pivot:[0,0,18],positionFields:['rodX',null,'rodZ'],rotateField:'rodAngle',rotateAxis:[0,-1,0]});motion('cam',[55,0,0],{pivot:[42,0,0],rotateField:'cam',rotateAxis:[0,1,0]});
 add('block','block','Cylinder cutaway','A quarter of the bore wall is removed to expose the sliding piston.',[ring(Z(),48,118,26,23,0,250),box(-34,-22,-25,68,44,5,5),box(-34,16,-20,68,6,68),box(-34,-22,-20,6,38,68)],C.shell);
 add('sump','sump','Oil sump','Collects lubricating oil below the rotating crankshaft.',[box(-35,-25,-31,70,50,5,5),box(-35,-25,-26,4,50,14),box(31,-25,-26,4,50,14),box(-31,21,-26,62,4,14)],C.dark);
 add('head','head','Cylinder head cutaway','Closes the combustion chamber and carries both valve seats.',[ring(Z(),118,128,28,20,0,250),box(-30,12,119,60,15,9,3)],C.steel);
 for(let i=0;i<7;i++)add('cooling-fin-'+i,'block','Cooling fin '+(i+1),'Adds exposed surface area to transfer heat to the air.',[ring(Z(),55+i*8,57+i*8,32,26,0,250)],C.steel);
 add('piston','piston','Piston cutaway','Moves through a 36 mm stroke; combustion pressure is transferred to the rod.',[ring(Z(),83,100,22.5,19,0,260),disc(Z(),100,104,22.5)],C.bright);
 for(let i=0;i<3;i++)add('piston-ring-'+i,'piston','Piston ring '+(i+1),i===2?'Controls the lubricating oil film.':'Seals combustion pressure against the cylinder wall.',[ring(Z(),97-i*3,98-i*3,22.9,22.3,0,350)],C.dark);
 add('wrist-pin','piston','Wrist pin','Joins the small end of the connecting rod to the piston.',[ring(Y(0,0,88),-20,20,5,3)],C.steel);
 add('rod','rod','Connecting rod','Its rotating big end and wrist-pin joint connect crank rotation to piston travel.',[ring(Y(0,0,18),-6,6,9,5),beam([0,0,25],[0,0,80],3.7),ring(Y(0,0,88),-5,5,6.5,5)],C.steel);
 add('rod-cap','rod','Big-end cap','Allows the connecting rod to be assembled around the crankpin.',[ring(Y(0,0,18),-6,6,10,9,180,360)],C.dark);
 add('crankshaft','crank','Crankshaft','An 18 mm crank radius generates the piston stroke.',[disc(Y(),-44,44,5),disc(Y(0,0,18),-13,13,5),beam([0,-12,0],[0,-12,18],6),beam([0,12,0],[0,12,18],6),sector(Y(),-15,-9,18,18,0,0,175,360),sector(Y(),9,15,18,18,0,0,175,360)],C.dark,{action:'press'});
 add('flywheel','crank','Flywheel','Stores rotational energy between successive power strokes.',[ring(Y(),28,36,33,26),disc(Y(),28,36,8),...Array.from({length:6},(_,i)=>beam([0,32,0],[29*Math.cos(deg(i*60)),32,29*Math.sin(deg(i*60))],2))],C.steel);
 add('timing-crank','crank','Crank timing gear','Drives the 40-tooth cam gear with a 20-tooth crank gear.',gear(Y(),-25,-21+25,20,1.4),C.steel);
 add('timing-cam','cam','Cam timing gear','Turns once for two crank revolutions to time the four-stroke cycle.',gear(Y(42,0,0),-25,4,40,1.4, false,4.5),C.steel);
 add('camshaft','cam','Camshaft','Carries the intake and exhaust lobes.',[disc(Y(42,0,0),-28,20,4)],C.dark);
 for(let i=0;i<2;i++){const x=i?11:-11,g='valve-'+i,field=i?'exhaust':'intake';motion(g,[x*.9,0,84],{translateField:field,axis:[0,0,-1]});add(field+'-valve',g,(i?'Exhaust':'Intake')+' valve',i?'Opens on the exhaust stroke to release burnt gases.':'Opens on the intake stroke as the piston descends.',[disc(Z(x,0),115,117,7.8),disc(Z(x,0),117,153,1.7)],C.steel);add(field+'-retainer',g,'Valve spring retainer','Captures the valve return spring on the stem.',[disc(Z(x,0),148,150,5)],C.dark);add(field+'-guide','head','Valve guide','Constrains the valve stem to axial motion.',[ring(Z(x,0),128,141,3.7,1.9)],C.steel);k.parts.push({id:field+'-spring',assembly:'head',title:'Valve return spring',description:'Closes the valve when the cam passes its lifting lobe.',material:{color:C.dark},spring:{origin:[x,0,0],axis:[0,0,1],start:131,end:148,turns:6,radius:3.8,wire:.6,fixed:'start',advanceField:field}});add(field+'-cam-lobe','cam',(i?'Exhaust':'Intake')+' cam lobe','An eccentric lobe lifts the follower once per cam revolution.',[disc(Y(42,0,i?-2:3),i?4:-6,i?9:-1,7)],C.dark);add(field+'-pushrod','block','Pushrod & follower','Transfers cam motion upward to the valve linkage.',[beam([42,i?6:-5,9],[x,6,144],1.6),box(x-8,3,145,16,6,3)],C.steel)}
 add('spark-plug','head','Spark plug','Ignites the charge near the compression-to-power transition.',[disc(Z(0,8),123,137,3),disc(Z(0,8),137,147,2),disc(Z(0,8),120,123,1)],C.bright,{activeField:'spark'});
 add('intake-port','head','Intake port','Connects the intake valve to the incoming charge.',[ring(X(-27,8,122),-14,0,6,4)],C.dark);add('exhaust-port','head','Exhaust port','Carries the burnt gases out of the cylinder head.',[ring(X(27,8,122),0,14,6,4)],C.dark);
 bearing('main-bearing','block',Y(),-20,-16,5,9,8);
 for(let i=0;i<4;i++)screw('head-bolt-'+i,'head',i%2?24:-24,i<2?17:-17,118,2,22);
 assembly('piston','Piston','piston');assembly('rod','Connecting rod','rod');assembly('crank','Crankshaft','crankshaft');assembly('valves','Valves','intake-valve');assembly('cam','Timing gears','timing-cam');assembly('spark','Spark plug','spark-plug');assembly('block','Cylinder','block');return k;
}

export function motorDefinition(){
 const k=make('motor','DC motor','Brushed · Three-pole armature',{yaw:-1.1,pitch:.52}),{add,motion,assembly,screw,bearing}=k;
 motion('shell',[0,0,-30]);motion('rotor',[0,0,18],{rotateField:'rotor',rotateAxis:[0,0,1]});motion('rear',[0,0,-52]);motion('front',[0,0,52]);motion('brushes',[0,0,-14]);
 add('motor-shell','shell','Motor can cutaway','The steel shell carries permanent magnets around the armature.',[ring(Z(),0,42,18,16,15,280)],C.shell);
 for(let i=0;i<2;i++)add('magnet-'+i,'shell',i?'South pole magnet':'North pole magnet','Creates the stationary magnetic field across the rotating windings.',[ring(Z(),5,35,16,13,25+i*180,135+i*180)],i?C.rubber:C.steel);
 add('shaft','rotor','Rotor shaft','Transfers the armature torque to the external load.',[disc(Z(),-13,59,2)],C.steel,{action:'press'});
 for(let i=0;i<3;i++){const a=i*120,r=deg(a),rotate=([rr,t])=>[rr*Math.cos(r)-t*Math.sin(r),rr*Math.sin(r)+t*Math.cos(r)],core=[[3,-2],[9,-2],[9,2],[3,2]].map(rotate);add('armature-'+i,'rotor','Armature pole '+(i+1),'A laminated iron pole concentrates the winding field.',[sector(Z(),8,32,11,11,9.5,9.5,a-28,a+28),prism(Z(),9,31,core)],C.dark);const pts=[];for(let turn=0;turn<9;turn++){const rr=3.4+turn*.65;pts.push(...[[-2.7,7.5],[-2.7,32.5],[2.7,32.5],[2.7,7.5],[-2.7,7.5]].map(([t,z])=>[...rotate([rr,t]),z]))}add('winding-'+i,'rotor','Armature winding '+(i+1),'Current through this copper coil creates a magnetic pole.',polyTube(pts,.27),C.copper,{outline:false});add('insulator-'+i,'rotor','Slot insulation '+(i+1),'Separates the copper winding from the conductive iron core.',[prism(Z(),8.1,8.8,core),prism(Z(),31.2,31.9,core)],C.bright);add('commutator-'+i,'rotor','Commutator segment '+(i+1),'Changes which winding receives current as the shaft turns.',[ring(Z(),-4,3,5.2,3,a+1,a+119)],C.copper,{activeField:'comm'+i});add('winding-lead-'+i,'rotor','Winding lead '+(i+1),'Joins a rotating winding to its copper commutator segment.',[beam([5*Math.cos(r),5*Math.sin(r),7.5],[4*Math.cos(r),4*Math.sin(r),1],.25)],C.copper)}
 add('armature-hub','rotor','Laminated armature hub','Joins the three poles to the rotor shaft.',[ring(Z(),8,32,3,2)],C.dark);add('commutator-insulator','rotor','Commutator insulation','Insulates all copper segments from the steel shaft.',[ring(Z(),-4,3,3,2)],C.bright);
 for(let i=0;i<2;i++){const x=i?5.15:-8.15;add('brush-'+i,'brushes','Carbon brush '+(i+1),'Slides on the commutator to feed current into the rotating windings.',[box(x,-1.8,-2,3,3.6,4)],C.dark);add('brush-holder-'+i,'brushes','Brush holder '+(i+1),'Guides the brush and keeps it aligned with the commutator.',[box(i?9:-13,-3,-3,4,6,6)],C.steel);add('brush-leaf-'+i,'rear','Brush spring '+(i+1),'Maintains light contact pressure as the brush wears.',[beam([i?12:-12,0,0],[i?8:-8,0,0],.35)],C.copper);add('terminal-'+i,'rear','Supply terminal '+(i+1),'Connects the fixed brush to the DC supply.',[box(i?9:-11,-1,-13,2,2,8)],C.copper)}
 add('rear-cap','rear','Rear end cap','Carries the brush holders and rear shaft bearing.',[ring(Z(),-8,-4,17.5,6)],C.dark);
 add('front-cap','front','Front bearing plate','Closes the front of the can around the output shaft.',[ring(Z(),42,46,18,4)],C.steel);
 bearing('front-bearing','front',Z(),42,46,2,4,8);bearing('rear-bearing','rear',Z(),-8,-4,2,4,8);
 for(let i=0;i<3;i++)screw('endcap-screw-'+i,'front',15*Math.cos(deg(i*120)),15*Math.sin(deg(i*120)),40,1,6);
 add('thrust-washer','rotor','Thrust washer','Controls axial play without rubbing the rotor poles on the end caps.',[ring(Z(),38,39,5,2.1)],C.steel);
 assembly('rotor','Armature','armature-0');assembly('winding','Copper windings','winding-0');assembly('commutator','Commutator','commutator-0');assembly('brush','Brushes','brush-0');assembly('magnet','Magnets','magnet-0');assembly('case','Housing','motor-shell');return k;
}

export function speakerDefinition(){
 const k=make('speaker','Loudspeaker','Moving coil · 160 mm driver',{yaw:-1.12,pitch:.64}),{add,motion,assembly,screw}=k;
 motion('basket',[0,0,-30]);motion('magnet',[0,0,-80]);motion('cone',[0,0,55],{translateField:'cone',axis:[0,0,1]});motion('suspension',[0,0,24]);
 add('frame-rim','basket','Basket rim','Mounts the driver to an enclosure and anchors the outer suspension.',[ring(Z(),45,49,80,72)],C.steel);
 add('magnet','magnet','Ferrite ring magnet','Creates a strong field in the narrow annular gap around the voice coil.',[ring(Z(),-17,-3,35,15)],C.dark);
 add('back-plate','magnet','Back plate & pole piece','Returns the magnetic flux through the centre pole.',[disc(Z(),-22,-17,36),disc(Z(),-17,9,11.5)],C.steel);
 add('top-plate','magnet','Top plate cutaway','Concentrates flux across the voice-coil gap; a quarter is removed.',[ring(Z(),-3,5,36,14,0,270)],C.steel);
 add('coil-former','cone','Voice-coil former','A light cylindrical former carries the winding and joins the cone.',[ring(Z(),-5,23,13.1,12.5)],C.copper,{activeField:'coilActive'});
 for(let i=0;i<12;i++)add('coil-turn-'+i,'cone','Voice-coil turn '+(i+1),'Current in the radial magnetic field produces axial force on the coil.',[torus(Z(),-3+i*.55,13.4,.22)],C.copper,{outline:false,activeField:'coilActive'});
 add('cone','cone','Paper cone cutaway','The moving diaphragm displaces air; one sector is removed to expose the motor.',[sector(Z(),20,46,14,71,13,70,0,285)],C.shell,{action:'press'});
 add('dust-cap','cone','Dust cap cutaway','Protects the coil gap from dust while moving with the diaphragm.',[{kind:'solid',F:Z(),profile:[[22,0],[26,6],[27,10],[24,14],[22,14],[25,10],[24,6],[22,0]]}],C.rubber);
 for(let i=0;i<8;i++){const a=i*45;add('basket-spoke-'+i,'basket','Basket spoke '+(i+1),'Supports the magnetic assembly behind the cone while leaving air passages.',[sector(Z(),5,45,38,74,34,70,a,a+10)],C.dark);screw('mount-screw-'+i,'basket',76*Math.cos(deg(a+20)),76*Math.sin(deg(a+20)),44,1.8,5)}
 add('surround','suspension','Rolled surround','Centres the outer cone edge and permits axial excursion.',[torus(Z(),46,72.5,3.2)],C.rubber,{flex:{field:'cone',center:[0,0],inner:71,outer:75.7}});
 for(let i=0;i<5;i++)add('spider-roll-'+i,'suspension','Spider corrugation '+(i+1),'The corrugated suspension centres the coil in the gap.',[torus(Z(),18+(i%2)*.6,15+i*4,.65)],C.copper,{flex:{field:'cone',center:[0,0],inner:13.2,outer:33}});
 add('spider-web','suspension','Spider web cutaway','A thin radial web links the corrugations and supplies restoring stiffness.',[ring(Z(),17.6,18.1,33,13.2,0,285)],C.copper,{flex:{field:'cone',center:[0,0],inner:13.2,outer:33}});add('spider-seat','basket','Spider mounting seat','Anchors the outer spider while its inner edge follows the coil.',[ring(Z(),17.2,17.6,49,33,0,285)],C.steel);
 for(let i=0;i<2;i++){add('terminal-'+i,'basket','Terminal '+(i+1),'Connects the speaker to an amplifier.',[box(34,i?10:-13,8,8,3,8)],C.copper);add('tinsel-'+i,'cone','Flexible tinsel lead '+(i+1),'Flexes as the cone moves while carrying current to the coil.',polyTube([[37,i?11:-11,14],[29,i?13:-13,23],[16,i?5:-5,22]],.65),C.copper);add('gasket-'+i,'basket','Mounting gasket sector '+(i+1),'Seals the driver rim against the enclosure.',[ring(Z(),49,50,80,74,i*180,i*180+178)],C.rubber)}
 assembly('cone','Diaphragm','cone');assembly('coil','Voice coil','coil-turn-5');assembly('motor','Magnetic gap','top-plate');assembly('surround','Surround','surround');assembly('spider','Spider','spider-web');assembly('basket','Basket','frame-rim');return k;
}

export function pumpDefinition(){
 const k=make('pump','Bicycle pump','Floor pump · One-way valves',{yaw:-1.05,pitch:.2,portraitRoll:0}),{add,motion,assembly,screw}=k;
 motion('body',[-35,0,0]);motion('base',[0,0,-45]);motion('piston',[0,0,55],{translateField:'piston',axis:[0,0,1]});motion('valves',[40,0,0]);motion('inlet',[45,0,0],{translateField:'inlet',axis:[0,0,1]});motion('outlet',[60,0,0],{translateField:'outlet',axis:[0,0,1]});motion('hose',[70,0,0]);
 add('tube','body','Cutaway pump barrel','A removed sector exposes the chamber below the sealed piston.',[ring(Z(),10,230,15,13,0,245)],C.shell);
 add('piston','piston','Piston head','Reduces chamber volume on the downstroke and draws air on the upstroke.',[disc(Z(),25,30,12.5),disc(Z(),28,265,2.4)],C.steel,{action:'press'});
 add('piston-seal','piston','Piston cup seal','Seals against the bore while sliding along the barrel.',[ring(Z(),26,31,12.95,11.5)],C.rubber);
 add('handle','piston','T handle','Transfers hand force to the piston rod.',[box(-43,-7,263,86,14,10,5),disc(Z(),256,267,4)],C.dark,{action:'press'});
 for(let side=0;side<2;side++)for(let i=0;i<6;i++)add('handle-rib-'+side+'-'+i,'piston','Handle grip rib '+(side*6+i+1),'Provides a secure grip during repeated pumping strokes.',[box((side?12:-38)+i*4,-7.4,265,1.4,14.8,7,.6)],C.rubber);
 add('top-guide','body','Rod guide & top cap','Keeps the rod aligned and closes the barrel top.',[ring(Z(),230,235,16,3)],C.dark);
 add('base','base','Foot plate','Supports the barrel and provides a stable footing.',[box(-43,-27,0,86,54,7,8)],C.dark);
 add('bottom-block','base','Valve manifold','Routes intake air and discharged air through separate one-way valves.',[box(-17,-17,7,45,34,8,3)],C.steel);
 for(let i=0;i<2;i++){const x=i?21:6,g=i?'outlet':'inlet';add(g+'-seat','valves',(i?'Outlet':'Inlet')+' valve seat','A circular seat closes when the pressure difference reverses.',[ring(Z(x,0),11,13,3,1.8)],C.steel);add(g+'-poppet',g,(i?'Outlet':'Inlet')+' poppet',i?'Opens only when chamber pressure exceeds the connected 2 bar gauge reservoir.':'Opens on the upstroke to admit ambient air into the chamber.',[disc(Z(x,0),13,14,2.5)],C.dark);add(g+'-cage','valves','Valve cage','Limits poppet travel and maintains alignment with its seat.',[ring(Z(x,0),14,18,3,2.7,0,270)],C.steel);k.parts.push({id:g+'-spring',assembly:'valves',title:'Check-valve spring',description:'Biases the poppet toward its closed seat.',material:{color:C.steel},spring:{origin:[x,0,0],axis:[0,0,1],start:14.3,end:17.5,turns:4,radius:1.5,wire:.16,segments:90,sides:8,fixed:'start',advanceField:g}})}
 const hosePoints=[[26,0,12],[46,0,12],[52,4,28],[54,10,70],[45,18,111],[29,24,133],[20,22,148]];
 add('hose','hose','Pressure hose','Carries discharged air from the outlet manifold to the tyre connector.',polyTube(hosePoints,2.5),C.rubber);
 add('connector','hose','Valve connector','Clamps and seals around the tyre valve.',[box(14,16,146,14,12,20,3),disc(Z(21,22),141,146,3)],C.dark);
 add('connector-lever','hose','Connector lever','Compresses the connector seal against the tyre valve.',[box(19,17,166,4,19,3,1)],C.steel);
 add('connector-seal','hose','Connector seal','Keeps pressure in the hose when attached to a tyre valve.',[ring(Z(21,22),145,149,3.1,1.6)],C.rubber);
 add('gauge-body','base','Pressure gauge housing','Holds the dial; the readout shows chamber pressure, not a simulated tyre filling.',[disc(Z(-24,0),7,12,13)],C.steel);
 add('gauge-face','base','Gauge face','Provides a visible pressure scale.',[disc(Z(-24,0),12,12.5,11.5)],C.bright);
 add('gauge-needle','base','Gauge needle','Indicates the reference outlet reservoir pressure.',[beam([-24,0,13],[-19,7,13],.4)],C.dark);
 for(let i=0;i<8;i++)add('gauge-tick-'+i,'base','Gauge scale mark '+(i+1),'Marks divisions around the pressure dial.',[beam([-24+9*Math.cos(deg(i*35)),9*Math.sin(deg(i*35)),13],[-24+10.8*Math.cos(deg(i*35)),10.8*Math.sin(deg(i*35)),13],.18)],C.dark);
 for(let i=0;i<4;i++)screw('base-bolt-'+i,'base',i%2?31:-31,i<2?16:-16,2,1.8,5);
 assembly('piston','Piston & handle','piston');assembly('barrel','Barrel','tube');assembly('inlet','Inlet valve','inlet-poppet');assembly('outlet','Outlet valve','outlet-poppet');assembly('hose','Hose & connector','hose');assembly('gauge','Gauge','gauge-body');return k;
}

export function lockDefinition(){
 const k=make('lock','Cylinder lock','Five pins · Correct-key sequence',{yaw:-1.65,pitch:.42}),{add,motion,assembly,screw}=k;
 motion('body',[0,35,0]);motion('plug',[0,-24,0],{rotateField:'plug',rotateAxis:[1,0,0]});motion('key',[-50,0,0],{translateField:'key',axis:[1,0,0],rotateField:'plug',rotateAxis:[1,0,0]});motion('cap',[0,0,35]);
 add('lock-body','body','Cylinder housing cutaway','A longitudinal opening reveals the five pin chambers above the shear line.',[ring(X(),0,42,12,8.15,180,450)],C.shell);
 add('plug','plug','Rotating plug cutaway','Turns only after every key-pin and driver-pin joint reaches the shear line.',[ring(X(),0,42,8,3,180,450)],C.copper,{action:'press'});
 add('key','key','Matching key','Its five heights align the pin joints; withdrawal occurs after the plug returns.',[box(-22,-1.2,-5,60,2.4,3),ring(X(-22,0,0),-4,0,11,6)],C.steel,{action:'press'});
 const lifts=[2.5,1.4,3.2,2,2.8],lengths=lifts.map(h=>8-h+2);
 for(let i=0;i<5;i++){const x=6+i*6,h=lifts[i];motion('keypin-'+i,[0,-35,5+i*3],{positionFields:[null,'pinY'+i,'pinZ'+i],rotateField:'plug',rotateAxis:[1,0,0]});motion('driver-'+i,[0,0,22+i*3],{translateField:'pin'+i,axis:[0,0,1]});
 add('key-cut-'+i,'key','Key bitting '+(i+1),'Sets this key pin to the height required for a clear shear line.',[box(x-2.4,-1.2,-2,4.8,2.4,h)],C.steel);
 add('key-pin-'+i,'keypin-'+i,'Key pin '+(i+1),'Its length matches the corresponding cut on the key.',[{kind:'solid',F:Z(x,0),profile:[[-2,0],[-1.5,1.35],[8-h,1.35],[8-h,0]]}],C.copper);
 add('driver-pin-'+i,'driver-'+i,'Driver pin '+(i+1),'Blocks rotation by crossing the shear line when the key is absent.',[disc(Z(x,0),8-h,12-h,1.35)],C.steel);
 add('pin-chamber-'+i,'body','Pin chamber '+(i+1),'Guides both pins on a common axis; its front half is removed.',[ring(Z(x,0),8.2,15.5,2.3,1.5,0,180)],C.steel);
 k.parts.push({id:'pin-spring-'+i,assembly:'cap',title:'Pin spring '+(i+1),description:'Pushes the pin stack toward the keyway when the key is removed.',material:{color:C.dark},spring:{origin:[x,0,0],axis:[0,0,1],start:12-h,end:16.7,turns:5,radius:.95,wire:.14,segments:90,sides:8,advanceField:'pin'+i}});
 add('chamber-cap-'+i,'cap','Chamber cap '+(i+1),'Retains the return spring in its drilled chamber.',[disc(Z(x,0),16.8,17.3,1.8)],C.dark);
 add('shear-mark-'+i,'body','Shear-line reference '+(i+1),'Marks the boundary between the fixed housing and rotating plug.',[box(x-2.5,-3.25,7.9,5,.3,.25)],C.dark);
 }
 add('rear-cam','plug','Lock cam','Transfers plug rotation to the lock bolt or latch.',[disc(X(),42,45,6),box(42,-2,0,3,4,17)],C.steel);
 add('retaining-ring','plug','Plug retaining ring','Prevents the plug sliding out of the cylinder housing.',[ring(X(),40,41,9,8.2,0,320)],C.dark);
 add('front-face','body','Cylinder face','Locates the key at the front of the plug.',[ring(X(),-1.5,0,13,8.2)],C.steel);
 for(let i=0;i<3;i++)screw('housing-screw-'+i,'body',8+i*12,4,3,1,6);
 assembly('key','Matching key','key');assembly('pins','Key pins','key-pin-2');assembly('drivers','Driver pins','driver-pin-2');assembly('springs','Return springs','pin-spring-2');assembly('plug','Rotating plug','plug');assembly('body','Housing','lock-body');return k;
}

export function hubDefinition(){
 const k=make('hub','Geared bicycle hub','Three speeds · Planetary train',{yaw:-1.17,pitch:.65}),{add,motion,assembly,bearing,screw}=k;
 motion('axle',[0,0,-70]);motion('shell',[0,0,165],{rotateField:'output',rotateAxis:[0,0,1]});motion('ring',[0,0,35],{rotateField:'ring',rotateAxis:[0,0,1]});motion('carrier',[0,0,18],{rotateField:'carrier',rotateAxis:[0,0,1]});motion('input',[0,0,-40],{rotateField:'input',rotateAxis:[0,0,1]});motion('clutch',[0,0,-20],{translateField:'clutch',axis:[0,0,1]});
 add('axle','axle','Fixed axle & sun shaft','The axle fixes the sun gear while the hub shell turns around it.',[disc(Z(),-52,67,4.5)],C.dark);
 add('sun','axle','Sun gear · 24 teeth','The stationary central gear constrains the planet gear motion.',gear(Z(),8,8,24,1),C.steel);
 add('ring-gear','ring','Ring gear · 72 teeth','An internal gear meshes with all three 24-tooth planets.',gear(Z(),8,8,72,1,true),C.steel);
 add('carrier','carrier','Planet carrier','Holds the three planet shafts 24 mm from the axle.',[ring(Z(),3,6,29,8),ring(Z(),18,21,29,8)],C.dark);
 for(let i=0;i<3;i++){const a=deg(i*120),x=24*Math.cos(a),y=24*Math.sin(a);motion('planet-'+i,[0,0,26+i*13],{pivot:[x,y,0],positionFields:['planetX'+i,'planetY'+i,null],rotateField:'planet'+i,rotateAxis:[0,0,1]});add('planet-'+i,'planet-'+i,'Planet gear '+(i+1)+' · 24 teeth','Spins on its own shaft while orbiting the stationary sun.',gear(Z(x,y),8,8,24,1,false,7.5),C.copper);add('planet-pin-'+i,'carrier','Planet shaft '+(i+1),'Holds a planet gear on the rotating carrier.',[disc(Z(x,y),2,22,2.5)],C.steel);add('planet-bush-'+i,'planet-'+i,'Planet bushing '+(i+1),'Carries the planet load with a lubricated bearing surface.',[ring(Z(x,y),7,17,3.4,2.6)],C.dark)}
 add('hub-shell','shell','Hub shell cutaway','Receives the selected output and carries the wheel spokes.',[ring(Z(),-20,38,43,40,15,275),ring(Z(),-22,-19,50,8,20,290),ring(Z(),38,41,50,8,20,290)],C.shell);
 for(let i=0;i<12;i++)for(let side=0;side<2;side++){const angle=i*30+(side?15:0);if(angle<20||angle>290)continue;const a=deg(angle);add('spoke-seat-'+side+'-'+i,'shell','Spoke flange seat '+(side*12+i+1),'Reinforces a spoke attachment on the rotating flange.',[ring(Z(46*Math.cos(a),46*Math.sin(a)),side?38:-22,side?41:-19,2.4,1.1)],C.steel)}
 add('sprocket','input','Input sprocket','The bicycle chain drives the hub through this sprocket.',gear(Z(),-30,3,20,2),C.dark,{action:'press'});
 add('driver','input','Input driver','Carries chain torque into the selected planetary member.',[ring(Z(),-28,-5,13,5)],C.steel);
 add('clutch','clutch','Sliding selector clutch','Changes which members receive input and deliver output; the shift occurs at rest.',[ring(Z(),-9,-4,18,13),...Array.from({length:6},(_,i)=>ring(Z(),-4,0,18,15,i*60,i*60+15))],C.copper);
 add('shift-rod','axle','Shift rod','Moves axially inside the hollow axle to select a gear.',[disc(Z(),-63,-38,2)],C.steel);
 for(let i=0;i<3;i++)add('pawl-'+i,'input','Drive pawl '+(i+1),'Transmits driving torque while allowing freewheeling.',[ring(Z(),-5,0,19,16,i*120,i*120+18)],C.dark);
 bearing('hub-bearing','axle',Z(),-20,-15,4.5,8.5,8);
 add('left-locknut','axle','Axle locknut','Clamps the bearing adjustment on the fixed axle.',[ring(Z(),-44,-39,8,4.6)],C.steel);add('right-locknut','axle','Axle locknut','Clamps the second axle bearing adjustment.',[ring(Z(),53,58,8,4.6)],C.steel);
 assembly('sun','Fixed sun','sun');assembly('planets','Planet gears','planet-0');assembly('ring','Ring gear','ring-gear');assembly('carrier','Carrier','carrier');assembly('clutch','Selector clutch','clutch');assembly('shell','Hub shell','hub-shell');assembly('input','Input sprocket','sprocket');return k;
}

export function hddDefinition(){
 const k=make('hdd','Hard disk drive','3.5-inch · Voice-coil actuator',{yaw:-1.42,pitch:.82}),{add,motion,assembly,screw,bearing}=k;
 motion('base',[0,0,-25]);motion('cover',[0,0,55]);motion('spindle',[0,0,10],{pivot:[0,0,0],rotateField:'spindle',rotateAxis:[0,0,1]});motion('arm',[0,0,28],{pivot:[23,54,0],rotateField:'arm',rotateAxis:[0,0,1]});motion('magnet',[0,0,60]);motion('pcb',[0,0,-48]);
 add('base','base','Cast base','Rigidly locates the spindle and actuator within a sealed drive.',[box(-51,-52,-8,102,146,5,5),box(-51,-52,-3,3,146,22),box(48,-52,-3,3,146,22),box(-48,-52,-3,96,3,22),box(-48,91,-3,96,3,22)],C.steel);
 // A 20% cover sector remains; the open top exposes the operating parts.
 add('cover','cover','Cover cutaway','Seals the drive; most of the top is removed for this educational view.',[box(-50,73,20,100,21,1.5,3)],C.shell);
 add('cover-gasket','cover','Cover gasket','Keeps dust and moisture out at the base-cover joint.',[box(-48,90,19,96,1.2,1.2)],C.rubber);
 add('spindle-hub','spindle','Spindle hub','Holds the platter stack concentrically on the motor shaft.',[disc(Z(),-1,18,12)],C.steel,{action:'press'});
 for(let i=0;i<2;i++){add('platter-'+i,'spindle','Magnetic platter '+(i+1),'Stores magnetic data on both surfaces; visible arcs indicate illustrative tracks.',[ring(Z(),4+i*7,5+i*7,47.5,12.2)],C.bright,{action:'press'});for(let track=0;track<6;track++)add('track-'+i+'-'+track,'spindle','Track reference '+(track+1),'An illustrative concentric track, much wider than a real data track.',[ring(Z(),5.02+i*7,5.04+i*7,21+track*5,20.92+track*5)],C.steel,{outline:false});add('platter-spacer-'+i,'spindle','Platter spacer '+(i+1),'Controls the axial spacing between platter surfaces.',[ring(Z(),5+i*7,10+i*7,14,12.1)],C.steel)}
 add('platter-clamp','spindle','Platter clamp','Clamps the disk stack to the spindle hub.',[ring(Z(),17,18.2,18,3)],C.dark);
 for(let i=0;i<4;i++)screw('clamp-screw-'+i,'spindle',8*Math.cos(deg(i*90)),8*Math.sin(deg(i*90)),14, .8,4);
 const hx=23+47*Math.cos(deg(-150)),hy=54+47*Math.sin(deg(-150));
 add('actuator-hub','arm','Actuator pivot hub','Rotates the head stack over the platter surfaces.',[ring(Z(23,54),-1,18,7,3)],C.steel);
 for(let i=0;i<4;i++){const z=3.3+i*3.7;add('actuator-arm-'+i,'arm','Head arm '+(i+1),'Sweeps its suspension across one platter surface.',[beam([23,54,z],[hx+8,hy+4,z],2)],C.steel);add('suspension-'+i,'arm','Head suspension '+(i+1),'A compliant metal flexure carries the slider with a controlled preload.',[beam([hx+8,hy+4,z],[hx,hy,z],.45)],C.copper);add('head-'+i,'arm','Read/write slider '+(i+1),'Flies above the rotating surface on an air bearing; clearance is enlarged for visibility.',[box(hx-1,hy-.7,z-.2,2,1.4,.4)],C.dark,{activeField:'read'})}
 add('voice-coil','arm','Actuator voice coil','Current in a stationary magnetic field produces torque around the pivot.',[ring(Z(23,54),5,9,22,14,0,65)],C.copper);
 add('actuator-magnet','magnet','Actuator magnet cutaway','Provides the stationary field that drives the voice coil.',[ring(Z(23,54),11,16,24,12,0,65)],C.dark);
 add('magnet-yoke','base','Magnet return yoke','Closes the magnetic circuit around the actuator coil.',[ring(Z(23,54),0,3,24,12,0,65)],C.steel);
 add('flex-cable','arm','Head flex cable','Connects the moving head stack to the fixed preamplifier.',polyTube([[23,54,12],[42,53,12],[34,67,8],[25,67,5]],.65),C.copper);
 add('ramp','base','Head parking ramp','Supports the heads when parked beyond the platter edge.',[box(26,-2,0,8,9,15,2)],C.bright);
 add('filter','base','Recirculation filter','Collects fine particles from air circulating inside the drive.',[box(-44,67,0,15,20,10,2)],C.bright);
 add('pcb','pcb','Controller board','Controls spindle speed, head positioning and data transfer.',[box(-46,-45,-12,92,132,1.6,3)],C.rubber);
 for(let i=0;i<4;i++)add('controller-chip-'+i,'pcb',['Controller','DRAM buffer','Motor driver','Read channel'][i],'A packaged circuit handles this part of the drive electronics.',[box(-32+(i%2)*42,5+Math.floor(i/2)*43,-15,22,20,3,1)],C.dark);
 add('sata-data','pcb','SATA data connector','Provides the serial data connection to the host computer.',[box(-40,85,-14,24,9,4)],C.dark);add('sata-power','pcb','SATA power connector','Supplies electrical power to the drive electronics and motors.',[box(-10,85,-14,40,9,4)],C.dark);
 bearing('spindle-bearing','base',Z(),-3,1,3,7,8);
 for(let i=0;i<6;i++)screw('case-screw-'+i,'base',i%2?43:-43,-43+Math.floor(i/2)*63,14,1.6,6);
 assembly('platter','Platters','platter-1');assembly('head','Read/write heads','head-2');assembly('actuator','Actuator','actuator-arm-2');assembly('coil','Voice coil','voice-coil');assembly('motor','Spindle','spindle-hub');assembly('pcb','Electronics','pcb');assembly('filter','Air filter','filter');return k;
}

export function gamepadDefinition(){
 const k=make('gamepad','Gamepad','Analog inputs · Four vibration motors',{yaw:-1.42,pitch:.9}),{add,motion,assembly,screw}=k;
 motion('shell',[0,0,-35]);motion('top',[0,0,50]);motion('pcb',[0,0,12]);motion('buttons',[0,0,60],{translateField:'button',axis:[0,0,-1]});motion('trigger',[0,0,35],{pivot:[42,28,14],rotateField:'trigger',rotateAxis:[1,0,0]});motion('stick',[0,0,42],{pivot:[-33,4,13],rotationFields:['stickY','stickX',null]});motion('gimbal',[0,0,25],{pivot:[-33,4,13],rotateField:'stickY',rotateAxis:[1,0,0]});
 const hull=[box(-64,-20,2,128,65,3,16),box(-65,-59,2,30,60,3,12),box(35,-59,2,30,60,3,12),box(-65,-48,5,3,31,16,1),box(62,-48,5,3,31,16,1),box(-38,-48,5,3,31,16,1),box(35,-48,5,3,31,16,1)];
 add('lower-shell','shell','Lower shell cutaway','Supports the electronics and houses the two grip vibration motors.',hull,C.shell);
 add('top-rim','top','Top shell cutaway','Locates the buttons and sticks; most of the face is removed for inspection.',[box(-64,37,24,128,7,4,3),box(-64,-20,24,7,57,4,3),box(57,-20,24,7,57,4,3)],C.dark);
 add('pcb','pcb','Main circuit board','Reads buttons, stick potentiometers and trigger sensors.',[box(-53,-16,9,106,55,1.6,6)],C.rubber);
 add('controller','pcb','Controller IC','Digitises inputs and communicates with the host.',[box(-11,11,10.6,22,18,2,1)],C.dark);
 for(let i=0;i<2;i++){const x=i?24:-33,y=i?-8:4,g=i?'pcb':'stick';add('stick-base-'+i,'pcb','Thumbstick module '+(i+1),'Supports two perpendicular sensing axes and a press switch.',[box(x-8,y-8,11,16,16,5,1)],C.dark);add('stick-stem-'+i,g,'Thumbstick stem '+(i+1),'Tilts with the gimbal around the two sensing axes.',[disc(Z(x,y),13,29,2.5)],C.steel,{action:'press'});add('stick-cap-'+i,g,'Thumbstick cap '+(i+1),'Provides a concave thumb surface for analog control.',[disc(Z(x,y),28,33,10),ring(Z(x,y),32,34,10,8)],C.rubber,{action:'press'});for(let axis=0;axis<2;axis++){add('pot-'+i+'-'+axis,'pcb','Stick potentiometer '+(i+1)+' '+(axis?'Y':'X'),'Changes resistance with the corresponding gimbal angle.',[box(x+(axis?-6:8),y+(axis?8:-6),12,axis?12:3,axis?3:12,5,.6)],C.steel);add('pot-wiper-'+i+'-'+axis,i?'pcb':'gimbal','Potentiometer wiper','Sweeps a resistive track as the thumbstick tilts.',[disc(Z(x+(axis?0:9),y+(axis?9:0)),14,16,1.5)],C.copper)}add('stick-click-'+i,'pcb','Stick press switch','Detects a downward press of the thumbstick.',[box(x-2,y-2,10.7,4,4,.8,.5)],C.steel)}
 add('gimbal','gimbal','Inner gimbal','Allows one sensing axis to tilt inside the outer stick support.',[ring(Y(-33,4,13),-6,6,7,5,0,270)],C.steel);
 for(let i=0;i<4;i++){const x=43+10*Math.cos(deg(i*90)),y=16+10*Math.sin(deg(i*90)),labels=['B','Y','X','A'];add('button-'+i,'buttons',labels[i]+' button','Compresses a conductive elastomer dome against a PCB contact.',[disc(Z(x,y),19,28,4.2)],C.bright,{action:'press',label:{text:labels[i],at:[x,y,28.1],width:4.5,height:4}});add('dome-'+i,'pcb','Button elastomer dome '+labels[i],'Returns the button and bridges the underlying contact when pressed.',[disc(Z(x,y),11,17,4)],C.rubber);add('contact-'+i,'pcb','Button contact '+labels[i],'Two interleaved copper pads close through the conductive dome.',[disc(Z(x,y),10.65,10.75,3)],C.copper,{activeField:'rumbleOn'})}
 add('dpad','buttons','Directional pad','Rocks over four switches to report discrete directions.',[box(-40,-20,21,22,7,6,1),box(-32.5,-27.5,21,7,22,6,1)],C.dark,{action:'press'});
 for(let i=0;i<4;i++){add('dpad-contact-'+i,'pcb','D-pad contact '+(i+1),'Reads one of the four directional inputs.',[disc(Z(-29+7*Math.cos(deg(i*90)),-16.5+7*Math.sin(deg(i*90))),11,14,2.5)],C.rubber)}
 for(let i=0;i<2;i++){const x=i?42:-42,g=i?'trigger':'pcb';add('trigger-'+i,g,(i?'Right':'Left')+' trigger','Rotates over a spring-returned hinge for a proportional input.',[box(x-11,29,16,22,16,9,4)],C.dark,{action:'press'});add('trigger-hinge-'+i,'pcb','Trigger hinge','Locates the trigger rotation axis.',[disc(X(x-12,28,14),0,24,2)],C.steel);add('trigger-sensor-'+i,'pcb','Trigger sensor','Reads trigger position independently of the digital buttons.',[box(x-4,25,11,8,4,2,.5)],C.dark);add('bumper-'+i,'buttons','Shoulder bumper','Operates a separate digital shoulder switch.',[box(x-13,38,24,26,7,4,2)],C.steel)}
 for(let i=0;i<4;i++){const x=i%2?49:-49,y=i<2?-37:30,z=i<2?13:18,r=i<2?8:4;motion('rumble-'+i,[i%2?32:-32,0,12+i*6],{pivot:[x,y,z],rotateField:'rumble',rotateAxis:[0,1,0]});add('rumble-can-'+i,'shell',i<2?'Grip vibration motor':'Trigger vibration motor','A brushed motor spins an eccentric mass to generate vibration.',[disc(Y(x,y,z),-7,7,r)],C.steel);add('eccentric-'+i,'rumble-'+i,'Eccentric mass '+(i+1),'Its offset centre of mass creates a cyclic force as it rotates.',[sector(Y(x,y,z),8,12,r,r,1.2,1.2,0,150)],C.dark,{activeField:'rumbleOn'});add('rumble-shaft-'+i,'rumble-'+i,'Vibration motor shaft','Carries the eccentric mass outside the motor housing.',[disc(Y(x,y,z),7,13,1.1)],C.steel)}
 add('battery','shell','Battery compartment','Provides a removable power source behind the circuit board.',[box(-24,16,-8,48,23,8,2)],C.dark);
 add('usb','pcb','USB connector','Carries wired communication and power to the controller.',[box(-5,38,11,10,8,4,1)],C.steel);
 for(let i=0;i<6;i++)screw('case-screw-'+i,'shell',i%2?53:-53,-39+Math.floor(i/2)*35,3,1.2,10);
 assembly('stick','Analog stick','stick-cap-0');assembly('gimbal','Gimbal sensors','gimbal');assembly('trigger','Trigger','trigger-1');assembly('buttons','Buttons','button-3');assembly('vibration','Vibration motors','eccentric-0');assembly('pcb','Circuit board','pcb');assembly('shell','Shell','lower-shell');return k;
}

export function watchDefinition(){
 const k=make('watch','Mechanical watch','Hand-wound · Lever escapement',{yaw:-1.25,pitch:.85}),{add,motion,assembly,screw}=k;
 motion('case',[0,0,-18]);motion('dial',[0,0,25]);motion('bridge',[0,0,15]);motion('barrel',[0,0,7],{pivot:[-4.32,0,0],rotateField:'barrel',rotateAxis:[0,0,1]});
 add('case','case','Watch case cutaway','Holds the movement and protects it from dust and moisture.',[ring(Z(),-2,8,20,17.5,0,275)],C.steel);
 add('mainplate','case','Mainplate cutaway','Locates the wheel pivots and supports the escapement.',[ring(Z(),0,1.2,17,3,0,290)],C.shell);
 add('barrel','barrel','Mainspring barrel cutaway','Contains the wound spring that supplies energy to the gear train.',[ring(Z(-4.32,0),1.4,4.8,3.7,3.4,0,285),disc(Z(-4.32,0),1.2,1.4,3.7)],C.steel);
 add('mainspring','barrel','Mainspring','A coiled steel strip stores winding energy and applies torque to the barrel.',spiral(Z(-4.32,0),2,1.2,4,.7,3.2,.1),C.dark,{outline:false});
 add('barrel-gear','barrel','Barrel wheel','Transmits mainspring torque to the centre wheel pinion.',gear(Z(-4.32,0),2,.5,64,.12),C.copper);
 // Compact representative train. Compound pinions carry the numerical ratios;
 // spatial layout is illustrative rather than a manufacturer movement plan.
 const wheels=[['center',0,0,60,.12,3.2,8,2],['third',3.6,1.92,64,.12,4.4,8,3.2],['fourth',7.2,-.468,80,.12,5.6,8,4.4],['escape',5,-5.071,15,.24,3.2,5,5.6]];
 for(const [id,x,y,n,m,z,pn,pz]of wheels){motion(id,[0,0,8+z*2],{pivot:[x,y,0],rotateField:id,rotateAxis:[0,0,1]});add(id+'-wheel',id,id==='escape'?'Escape wheel':'Train wheel · '+id,id==='escape'?'Alternately locks against the pallet jewels and releases one step per beat.':'A compound wheel and pinion reduce the barrel torque through the movement.',gear(Z(x,y),z,.45,n,m),C.copper);add(id+'-pinion',id,'Train pinion · '+id,'Shares the wheel arbor and meshes with the preceding train wheel.',gear(Z(x,y),pz,.45,pn,.12),C.steel);add(id+'-arbor',id,'Wheel arbor · '+id,'Carries the compound wheel between two jewelled bearings.',[disc(Z(x,y),.2,7.5,.35)],C.steel);for(let side=0;side<2;side++)add(id+'-jewel-'+side,side?'bridge':'case','Pivot jewel · '+id,'A hard, low-friction bearing supports the rotating arbor.',[ring(Z(x,y),side?7:1.2,side?7.5:1.6,.9,.38)],C.copper);add(id+'-bridge','bridge','Wheel bridge · '+id,'Captures the upper jewel and fixes its height over the mainplate.',[box(x-1.4,y-1.4,7.5,2.8,2.8,.5,.5),beam([x,y,7.8],[x-3,y+3,7.8],.55)],C.steel)}
 motion('balance',[0,0,18],{pivot:[-5,-9,0],rotateField:'balance',rotateAxis:[0,0,1]});motion('pallet',[0,0,14],{pivot:[0,-9,0],rotateField:'pallet',rotateAxis:[0,0,1]});
 add('balance','balance','Balance wheel','Oscillates as the hairspring supplies restoring torque; beats are shown in slow time.',[ring(Z(-5,-9),3.5,4.2,4.7,4.2),beam([-9.2,-9,3.8],[-.8,-9,3.8],.3),beam([-5,-13.2,3.8],[-5,-4.8,3.8],.3)],C.copper,{action:'press'});
 add('balance-staff','balance','Balance staff','Carries the oscillating balance through its upper and lower bearings.',[disc(Z(-5,-9),1,7,.3)],C.steel);
 add('hairspring','case','Balance hairspring','Its inner end follows the balance while the outer end stays fixed, supplying restoring torque.',spiral(Z(-5,-9),4.6,.12,3.6,.7,3.8,.08),C.dark,{outline:false,twist:{field:'balance',center:[-5,-9],inner:.7,outer:3.8}});
 add('spring-stud','bridge','Hairspring stud','Anchors the outer spring end to the stationary balance bridge.',[disc(Z(-1.2,-9),4.5,6,.35)],C.steel);
 add('impulse-jewel','balance','Impulse jewel','Couples the balance roller to the pallet fork.',[disc(Z(-4.3,-9),2.7,3.5,.2)],C.copper);
 add('pallet-fork','pallet','Pallet fork','Alternates between two locks, receiving impulses from the escape wheel.',[beam([-1.5,-9,3],[1.8,-9,3],.3),beam([-1.5,-9,3],[-2.5,-8.3,3],.25),beam([-1.5,-9,3],[-2.5,-9.7,3],.25)],C.steel);
 for(let i=0;i<2;i++)add('pallet-jewel-'+i,'pallet',i?'Exit pallet jewel':'Entry pallet jewel','Locks an escape-wheel tooth between successive balance beats.',[box(1.1,i?-10.3:-8.1,2.8,.6,.6,.5)],C.copper);
 add('balance-bridge','bridge','Balance bridge','Supports the upper balance bearing and the spring anchor.',[beam([-5,-9,7],[-11,-4,7],.7),ring(Z(-5,-9),6.7,7.3,1.1,.35)],C.steel);
 add('dial-ring','dial','Dial cutaway','A partial dial exposes the movement while retaining the hour markers.',[ring(Z(),9,9.5,17,14,0,300)],C.bright);
 for(let i=0;i<12;i++)add('hour-marker-'+i,'dial','Hour index '+(i+1),'Marks the twelve hour positions around the dial.',[beam([15*Math.sin(deg(i*30)),15*Math.cos(deg(i*30)),9.7],[16.5*Math.sin(deg(i*30)),16.5*Math.cos(deg(i*30)),9.7],.18)],C.dark);
 for(const [id,r,z]of [['seconds',14,10.7],['minutes',11,10.4],['hours',7.5,10.1]]){motion(id,[0,0,30+z],{rotateField:id,rotateAxis:[0,0,-1]});add(id+'-hand',id,id[0].toUpperCase()+id.slice(1)+' hand','The motion works reduce the minute-hand rotation by 12:1 for the hour hand.',[beam([0,-1.5,z],[0,r,z],id==='seconds'?.12:.26),disc(Z(),z-.1,z+.1,.7)],C.dark)}
 add('crown','case','Winding crown','The manual winding input tensions the mainspring; stored energy is represented rather than simulated.',[disc(X(18,0,4),0,5,2.8),disc(X(15,0,4),0,4,.6)],C.steel);
 add('ratchet','barrel','Winding ratchet','Holds the winding arbor against the spring torque.',gear(Z(-4.32,0),5.6,.4,18,.25),C.steel);
 add('click','case','Ratchet click','Prevents the winding ratchet from unwinding backwards.',[beam([-12,6,6],[-10,5,6],.3)],C.dark);
 for(let i=0;i<5;i++)screw('bridge-screw-'+i,'bridge',13*Math.cos(deg(i*65)),13*Math.sin(deg(i*65)),5,.65,3);
 assembly('balance','Balance & spring','balance');assembly('pallet','Pallet fork','pallet-fork');assembly('escape','Escape wheel','escape-wheel');assembly('barrel','Mainspring','mainspring');assembly('train','Gear train','third-wheel');assembly('hands','Hands','minutes-hand');assembly('case','Case','case');return k;
}

export const newPresets=()=>[lensDefinition(),watchDefinition(),gamepadDefinition(),lockDefinition(),hubDefinition(),engineDefinition(),motorDefinition(),speakerDefinition(),pumpDefinition(),hddDefinition()].map(({id,title,detail,definition})=>({id,title,detail,definition}));
