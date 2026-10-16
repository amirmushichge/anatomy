import {drawingPart,DRAWING} from '../study-core.mjs';
import {make,Z,X,Y,box,disc,ring,beam,spiral,torus,deg,TAU} from './solid-kit.mjs';
import {WATCH_SYSTEMS,WHEEL_SPECS,ESCAPE,BALANCE,PALLET,BARREL} from './watch-model.mjs';
const WHITE=DRAWING.white,SOFT=DRAWING.soft,INK=0x84898c;
const circ=(x,y,r,n=96)=>Array.from({length:n},(_,i)=>[x+r*Math.cos(i*TAU/n),y+r*Math.sin(i*TAU/n)]);
const plate=(contour,z,h,holes=[],bevel=.045)=>({kind:'plate',contour,holes,z,h,bevel});
const disk=(x,y,z,h,r,holes=[],bevel=.045)=>plate(circ(x,y,r),z,h,holes,bevel);
const shapeGear=(x,y,z,h,n,m,{spokes=4,hub=.55,rim=.45,phase=0,club=false}={})=>{
 const pitch=n*m/2,root=pitch-1.2*m,tip=pitch+.85*m,contour=[],holes=[];
 for(let i=0;i<n;i++)for(const [offset,r]of (club?[[-.48,root],[-.14,root],[.05,tip],[.26,tip],[.26,tip-.2],[.1,root+.12],[.45,root]]:[[-.5,root],[-.23,root],[-.13,tip],[.13,tip],[.23,root],[.5,root]])){const a=phase+(i+offset)*TAU/n;contour.push([x+r*Math.cos(a),y+r*Math.sin(a)])}
 if(spokes&&root>hub+rim+.3){const outer=root-rim;for(let i=0;i<spokes;i++){const a=i*TAU/spokes+.16,b=(i+1)*TAU/spokes-.16,p=[];for(let j=0;j<=14;j++){const q=a+(b-a)*j/14;p.push([x+outer*Math.cos(q),y+outer*Math.sin(q)])}for(let j=14;j>=0;j--){const q=a+(b-a)*j/14;p.push([x+hub*Math.cos(q),y+hub*Math.sin(q)])}holes.push(p)}}
 holes.push(circ(x,y,.16,20));return plate(contour,z,h,holes,.018);
};
export function watchDefinition(){
 const k=make('watch','Mechanical watch','Study 01 · Hand-wound · 2.5 Hz',{yaw:-1.4,pitch:.91}),{add,motion,assembly}=k;
 const wc=[-1.5,5.5],delta=[wc[0]-BARREL[0],wc[1]-BARREL[1]],wd=Math.hypot(...delta),along=(3.9**2-3.64**2+wd**2)/(2*wd),height=Math.sqrt(3.9**2-along**2),wi=[BARREL[0]+delta[0]/wd*along-delta[1]/wd*height,BARREL[1]+delta[1]/wd*along+delta[0]/wd*height];
 const ai=Math.atan2(wi[1]-BARREL[1],wi[0]-BARREL[0]),idlerPhase=ai+Math.PI+32/28*ai-Math.PI/28,ac=Math.atan2(wc[1]-wi[1],wc[0]-wi[0]),crownPhase=ac+Math.PI+ac-idlerPhase-Math.PI/28;
 k.definition.style='white-drawing';k.definition.autoFocusView=true;
 const part=(id,group,title,description,shapes,system=null,extra={})=>{const result=add(id,group,title,description,shapes,WHITE,{system,...extra});const p=k.parts.at(-1);if(id.includes('bridge')||id.includes('chaton')||id==='regulator'||id==='stud-arm')p.structural=true;if(['barrel-bridge','train-bridge','balance-bridge','pallet-bridge','fasteners','case','bezel','back','dial','minutes','hours','seconds'].includes(group)||id.startsWith('lug-'))p.studyOccluder=true;drawingPart(p,system,WATCH_SYSTEMS,{tone:extra.tone??WHITE});return result};
 const move=(id,vector,range=[0,1],extra={})=>motion(id,vector,{separateRange:range,...extra});
 const turn=(id,at,field,zLift=5,start=.5)=>move(id,[0,0,zLift],[start,1],{pivot:[...at,0],rotateField:field,rotateAxis:[0,0,1]});
 move('plate',[0,0,0]);move('case',[0,0,-7],[0,.25]);move('bezel',[0,0,16],[0,.32]);move('dial',[0,0,18],[0,.32]);move('back',[0,0,-11],[0,.25]);
 move('barrel-bridge',[0,0,13],[.14,.48]);move('train-bridge',[0,0,14],[.14,.48]);move('balance-bridge',[0,0,15],[.14,.48]);move('pallet-bridge',[0,0,12],[.14,.48]);
 move('fasteners',[0,0,21],[.03,.35]);move('barrel-lid',[0,0,18],[.08,.44]);move('spring',[-1.5,0,6],[.5,1],{pivot:[...BARREL,0],rotateField:'barrel',rotateAxis:[0,0,1]});move('spring-arbor',[-1.5,0,6],[.5,1],{pivot:[...BARREL,0],rotateField:'winding',rotateAxis:[0,0,1]});
 turn('barrel',BARREL,'barrel',6,.5);turn('ratchet',BARREL,'winding',8,.5);
 move('winding',[0,0,6],[.5,1]);move('wind-input',[0,0,6],[.5,1],{pivot:[.3,5.5,3.7],rotateField:'crown',rotateAxis:[1,0,0]});turn('winding-wheel',wc,'windingWheel',6,.5);turn('winding-idler',wi,'windingIdler',6,.5);turn('crown',[21.7,5.5,3.7],'crown',0,0);k.motions.crown.rotateAxis=[1,0,0];
 const axes=[...WHEEL_SPECS,{id:'escape',at:ESCAPE,teeth:15,z:3.25,pinion:8,pinionZ:3,module:.3,pinionModule:.075}];
 const holes=axes.map(w=>circ(...w.at,.29,24));holes.push(circ(...BALANCE,.23,20),circ(...PALLET,.23,20),circ(...BARREL,.4,24));
 for(const [x,y,r]of [[-9,10,2.4],[0,11,3.3],[9,9,3.6],[-13,1,1.6],[12,-5,2.8],[-8,-9,1.3]])holes.push(circ(x,y,r,60));
 part('mainplate','plate','Mainplate','The drilled plate locates every arbor. Jewels carry the small pivots; the bridge above fixes their endplay.',[disk(0,0,0,.72,18.3,holes,.085)],null,{tone:SOFT});
 part('case-middle','case','Hollow case middle','A hollow case surrounds the movement. The opening is a real cavity, not a solid hidden by transparency.',[ring(Z(),-.8,5.35,21,18.65,8,352),ring(X(18.65,5.5,3.7),0,2.5,.85,.5)],null);
 part('bezel','bezel','Stepped bezel','A turned retaining rim protects the dial edge. It lifts before the bridges in the dissection.',[ring(Z(),5.35,5.65,21,18.55),ring(Z(),5.65,5.85,20.8,18.7)],null);
 part('case-back','back','Case-back retaining ring','The rear retaining ring closes against the case lip; its centre is open in this study.',[ring(Z(),-1.4,-.8,20.6,17.3),ring(Z(),-1.6,-1.4,20.2,18)],null);
 for(let side of [-1,1])for(let end of [-1,1]){
  const x=side*12.5,y=end*20.3,id=(side<0?'l':'r')+(end<0?'b':'t');
  part('lug-'+id,'case','Case lug','A lug carries the spring bar that attaches a strap. It is part of the case.',[{...plate([[.8,end*16.3],[.8,end*22.9],[-2.7,end*22.7],[-3,end*17]],0,2.7,[circ(-1,end*21.2,.32,32)],.12),orientation:'x',offset:[x-1.35,0,0]}],null);
  part('lug-bore-'+id,'case','Spring-bar socket','A recessed-looking tubular socket receives the strap pin.',[ring(X(x-1.4,y+end*.9,1),0,2.8,.55,.32)],null,{tone:0xcbd0d1});
 }
 part('stem','wind-input','Winding stem','The crown drives this stem and the winding pinion; its input winds the barrel arbor.',[disc(X(.3,5.5,3.7),0,22,.28)],'energy');
 part('crown','crown','Winding crown','Click the crown to wind. The ratchet holds the arbor while the mainspring stores the work.',[{kind:'solid',F:X(21.7,5.5,3.7),profile:[[0,1.45],[.2,2.05],[2.8,2.05],[3,1.55]]}],'energy',{action:'wind',accentBase:true});
 for(let i=0;i<32;i++){const a=i*TAU/32,y=5.5+2.02*Math.cos(a),z=3.7+2.02*Math.sin(a);k.parts.find(p=>p.id==='crown').shapes.push(beam([22,y,z],[24.3,y,z],.055))}
 part('winding-pinion','wind-input','Winding pinion','A representative crown-wheel interface redirects the stem input to the winding train.',[{...shapeGear(0,0,-.3,.4,12,.13,{spokes:0}),orientation:'x',offset:[.3,5.5,3.7]}],'energy');
 part('crown-wheel','winding-wheel','Crown wheel','The intermediate winding wheel reverses the input and drives the ratchet wheel.',[shapeGear(...wc,3.7,.3,28,.13,{spokes:3,hub:.4,rim:.3,phase:crownPhase})],'energy');
 part('winding-link','winding','Stem bearing','This tubular support locates the winding shaft above the going train.',[ring(X(13,5.5,3.7),0,1.2,.48,.3)],'energy',{tone:0xe2e4e3});
 part('winding-idler','winding-idler','Winding intermediate wheel','An intermediate wheel meshes with both the crown wheel and ratchet. Two meshes preserve the winding direction.',[shapeGear(...wi,3.7,.3,28,.13,{spokes:3,hub:.4,rim:.28,phase:idlerPhase})],'energy');
 part('idler-post','plate','Winding-wheel post','A fixed post locates the intermediate winding wheel.',[disc(Z(...wi),.72,4.04,.14)],'energy');
 const [bx,by]=BARREL;
 part('barrel-floor','barrel','Barrel wheel','The spring pulls the barrel drum. Its 80-tooth wheel drives the ten-leaf centre pinion.',[shapeGear(bx,by,1.55,.34,80,.12,{spokes:0}),disk(bx,by,1.89,.16,4.35,[circ(bx,by,.42)])],'energy');
 part('barrel-wall','barrel','Cutaway barrel drum','The drum contains the mainspring. The front sector is removed so the spring and its attachment remain visible.',[ring(Z(bx,by),2.05,3.3,4.35,4.12,18,315)],'energy');
 part('mainspring','spring','Mainspring','Winding stores elastic energy in this steel ribbon. The outer end pulls the barrel; the inner end is attached to the arbor.',spiral({...Z(bx,by),v:[0,-1,0]},2.17,.65,6,.75,3.95,.075),'energy',{outline:false,accentBase:true,twist:{field:'springTwist',center:BARREL,inner:.75,outer:3.95},revealAt:.64});
 part('barrel-arbor','spring-arbor','Barrel arbor','The winding train turns the inner spring attachment. The click prevents its ratchet from turning backwards.',[disc(Z(bx,by),.65,4.4,.35),disc(Z(bx,by),2.05,2.95,.6)],'energy');
 part('inner-spring-hook','spring-arbor','Inner spring attachment','The inner ribbon end is held at the arbor. Its motion follows the winding input.',[beam([bx+.6,by,2.5],[bx+.75,by,2.5],.055)],'energy');
 part('spring-hook','barrel','Outer spring attachment','The outer end catches the barrel wall. Winding changes stored energy; the force curve is not simulated.',[box(bx+3.7,by-.14,2.15,.4,.28,.7)],'energy');
 part('barrel-lid','barrel-lid','Barrel lid cutaway','The lid closes the spring drum. This open sector preserves the teaching view.',[ring(Z(bx,by),3.35,3.52,4.3,3.6,20,315)],'energy');
 part('ratchet','ratchet','Ratchet wheel','The click permits winding in one direction and holds the wound arbor against reversal.',[shapeGear(bx,by,3.7,.28,32,.13,{spokes:4,hub:.6,rim:.3})],'energy',{revealAt:.64});
 part('click','plate','Ratchet click','A spring-loaded click catches the ratchet teeth so winding cannot unwind through the crown.',[beam([-8.8,1.2,3.8],[-7.5,2,3.8],.17),beam([-7.5,2,3.8],[-7.2,1.3,3.8],.17)],'energy',{accentBase:true});
 part('click-spring','plate','Click spring','This leaf presses the click toward the ratchet; it is not the mainspring.',[beam([-10,2,3.75],[-8.8,1.2,3.75],.07)],'energy',{outline:false});
 const jewel=(id,group,x,y,z,system)=>{part(id+'-chaton',group,'Jewel setting','A turned seat holds a bearing around the arbor pivot.',[ring(Z(x,y),z,z+.2,.62,.31)],system);part(id,group,'Pivot jewel','A pierced bearing supports a pivot with low friction. The coloured bearing identifies this functional system.',[ring(Z(x,y),z+.19,z+.31,.38,.17)],system,{accentBase:true})};
 for(const w of axes){const [x,y]=w.at,previous=w.id==='center'?{at:BARREL,teeth:80}:axes[axes.indexOf(w)-1],contact=Math.atan2(y-previous.at[1],x-previous.at[0]),pinionPhase=contact+Math.PI+previous.teeth/w.pinion*contact-Math.PI/w.pinion;turn(w.id,w.at,w.id,5.8+w.z*.3,.5);
  part(w.id+'-wheel',w.id,w.id==='escape'?'Escape wheel':w.id==='fourth'?'Fourth wheel · small seconds':w.id==='center'?'Centre wheel':'Third wheel',w.id==='escape'?'Fifteen teeth are released in half-tooth steps. Most of the time a pallet stone holds this wheel still.':w.id==='center'?'One revolution per hour. Its 80 teeth drive the ten-leaf third pinion.':w.id==='third'?'Its 75 teeth drive the ten-leaf fourth pinion. Two stages make the fourth wheel 60 times faster than the centre.':'One revolution per minute. Its 80 teeth drive the eight-leaf escape pinion.',[shapeGear(x,y,w.z,.27,w.teeth,w.module,{spokes:w.id==='escape'?5:4,hub:w.id==='escape'?.5:.7,club:w.id==='escape',rim:w.id==='escape'?.28:.38})],w.id==='escape'?'escapement':'train',{revealAt:.46});
  part(w.id+'-pinion',w.id,'Pinion · '+w.id,'The pinion is rigidly attached to this wheel. The preceding wheel meshes at this height.',[shapeGear(x,y,w.pinionZ,.27,w.pinion,w.pinionModule,{spokes:0,phase:pinionPhase})],'train');
  part(w.id+'-arbor',w.id,'Arbor · '+w.id,'This arbor locates the wheel and pinion between the plate and bridge bearings; display arbors continue to their hands.',[disc(Z(x,y),w.id==='center'?-1.04:.35,w.id==='center'?6.64:w.id==='fourth'?5.65:4.6,.145),disc(Z(x,y),w.z+.27,w.z+.42,.38)],'train');
  jewel(w.id+'-jewel-lower','plate',x,y,.58,w.id==='escape'?'escapement':'train');jewel(w.id+'-jewel-upper','train-bridge',x,y,4.32,w.id==='escape'?'escapement':'train');
 }
 // Bridges are actual pierced plates with thickness, mounted on fixed pillars.
 const bridge=(id,contour,holes,title,system)=>part(id,id,title,'A pierced bridge fixes the upper bearings. Its feet rest on plate pillars; screws hold it down.',[plate(contour,id==='balance-bridge'?5.55:4.1,.3,holes,.07)],system);
 bridge('train-bridge',[[-1.1,6.8],[5.9,8.3],[10.8,3.2],[10.2,-4.2],[7.25,-4.45],[7.1,-2.2],[5.4,-1.2],[3.9,.8],[1.55,.6],[-1.2,-1.6],[-2.25,.8]],axes.map(w=>circ(...w.at,.29,24)).concat([circ(4.4,5.5,1.2,40)]),'Skeleton train bridge','train');
 bridge('barrel-bridge',[[-13.7,6.1],[-10.2,7.8],[-5.2,5.8],[-2.4,2.7],[-3.6,1.6],[-6,3.6],[-10.3,5.1],[-12,3.2]],[],'Barrel bridge','energy');
 bridge('balance-bridge',[[-8.8,-10.3],[-7,-13.8],[-3.2,-13],[.9,-10.8],[.9,-9.3],[-.9,-8.9],[-4,-10.2],[-6.9,-10.8]], [circ(...BALANCE,.27,24)],'Balance cock','oscillator');
 bridge('pallet-bridge',[[3.5,-7.3],[5.6,-7.2],[6.35,-5.4],[4.7,-4.8],[3.6,-5.7]],[circ(...PALLET,.25,24)],'Pallet bridge','escapement');
 const mounts=[[-12,5.6,'barrel-bridge'],[5.2,7,'train-bridge'],[9.6,2.8,'train-bridge'],[-7.5,-11.4,'balance-bridge'],[5.5,-5.8,'pallet-bridge']];
 for(const [i,[x,y,g]]of mounts.entries()){
 const lift=g==='balance-bridge'?1.45:0;
  part('bridge-pillar-'+i,'plate','Bridge support pillar','A fixed pillar establishes the bridge height and carries the screw thread.',[disc(Z(x,y),.72,g==='balance-bridge'?5.55:4.1,.7)],null);
  part('bridge-screw-'+i,'fasteners','Slotted bridge screw','A recessed head clamps the bridge onto its support pillar.',[disc(Z(x,y),3.6+lift,4.42+lift,.22),disk(x,y,4.42+lift,.2,.65,[],.04),box(x-.5,y-.055,4.625+lift,1,.11,.02,.02)],null,{tone:0xe9ebea});
  part('screw-slot-'+i,'fasteners','Screwdriver slot','The slot belongs to the screw head and lifts with it.',[box(x-.48,y-.032,4.647+lift,.96,.064,.012)],null,{tone:INK,outline:false});
 }
 const [qx,qy]=BALANCE;turn('balance',BALANCE,'balance',7,.55);move('hairspring',[0,0,7],[.55,1]);turn('pallet',PALLET,'pallet',6,.55);
 part('balance','balance','Balance wheel','The rim stores kinetic energy. The hairspring supplies restoring torque; one oscillation contains two beats.',[ring(Z(qx,qy),4.5,4.88,5.15,4.75),beam([qx-4.85,qy,4.69],[qx+4.85,qy,4.69],.17),beam([qx,qy-4.85,4.69],[qx,qy+4.85,4.69],.17)],'oscillator',{revealAt:.46});
 part('balance-staff','balance','Balance staff','The balance, roller and inner hairspring attachment share this staff.',[disc(Z(qx,qy),.35,6.1,.145),disc(Z(qx,qy),4.4,5,.48)],'oscillator');
 for(let i=0;i<12;i++){const a=i*TAU/12;part('balance-weight-'+i,'balance','Balance timing weight '+(i+1),'Small rim weights distribute mass around the oscillator.',[disc(Z(qx+4.98*Math.cos(a),qy+4.98*Math.sin(a)),4.88,5.05,.14)],'oscillator',{tone:0xd8dddd})}
 part('hairspring','hairspring','Hairspring','Its inner end follows the staff; its outer end is fixed to the stud. Elastic recoil brings the balance back.',spiral(Z(qx,qy),5.22,.055,5,.5,3.8,.042),'oscillator',{outline:false,accentBase:true,twist:{field:'hairspring',center:BALANCE,inner:.5,outer:3.8},revealAt:.46});
 part('spring-collet','balance','Hairspring collet','The inner spring end is fixed to this collar on the staff.',[ring(Z(qx,qy),5.2,5.38,.5,.17)],'oscillator',{accentBase:true});
 part('stud-arm','balance-bridge','Stud carrier','A fixed arm ties the outer spring stud to the balance cock.',[beam([qx+.6,qy,5.8],[qx+3.8,qy,5.8],.09)],'oscillator');
+ part('spring-stud','balance-bridge','Outer spring stud','The outer spring end stays fixed here while the balance oscillates.',[disc(Z(qx+3.8,qy),5.2,5.9,.16)],'oscillator');
 part('regulator','balance-bridge','Regulator arm','Curb pins adjust the effective spring length. This study holds the physical frequency at 2.5 Hz.',[ring(Z(qx,qy),5.9,6.05,.8,.42,5,335),beam([qx+.6,qy,5.98],[qx+3.5,qy+.9,5.98],.1)],'oscillator');
 part('curb-pin-a','balance-bridge','Regulator curb pin','Guides the outer coil near the regulator.',[disc(Z(qx+3.45,qy+.8),5.2,6.0,.07)],'oscillator');
 part('curb-pin-b','balance-bridge','Regulator curb pin','The second pin controls the effective outer spring length.',[disc(Z(qx+3.65,qy+.8),5.2,6.0,.07)],'oscillator');
 part('roller','balance','Double roller','The impulse jewel couples the passing balance to the fork for a short part of each beat.',[disk(qx,qy,3.05,.2,.9,[circ(qx,qy,.17)]),disk(qx,qy,2.85,.13,.48,[circ(qx,qy,.17)])],'oscillator');
 part('impulse-jewel','balance','Impulse jewel','Near a centre crossing this pin unlocks the fork, then receives the impulse that sustains the balance.',[disc(Z(qx,qy+.78),3.25,3.6,.12)],'escapement',{accentBase:true});
 jewel('balance-jewel-upper','balance-bridge',qx,qy,5.8,'oscillator');jewel('balance-jewel-lower','plate',qx,qy,.58,'oscillator');
 const [px,py]=PALLET,contactA=[ESCAPE[0]-1.7,ESCAPE[1]-1.67],contactB=[ESCAPE[0]+.35,ESCAPE[1]-2.3];
 part('pallet-fork','pallet','Pallet fork','A fork with two pallet stones alternates locking and impulse. The balance controls release; the spring supplies the energy.',[beam([px,py,3.3],[contactA[0],contactA[1],3.3],.13),beam([px,py,3.3],[contactB[0],contactB[1],3.3],.13),beam([px,py,3.3],[qx+.8,qy+1,3.3],.14),beam([qx+.8,qy+1,3.3],[qx+.25,qy+.9,3.3],.08),beam([qx+.8,qy+1,3.3],[qx+.9,qy+.45,3.3],.08)],'escapement',{revealAt:.46});
 part('pallet-arbor','pallet','Pallet arbor','A pivot allows the lever to move between two banking stops.',[disc(Z(px,py),.35,4.5,.14)],'escapement');
 for(const [id,p]of [['entry-pallet',contactA],['exit-pallet',contactB]])part(id,'pallet',id==='entry-pallet'?'Entry pallet stone':'Exit pallet stone','A locking face holds an escape tooth; the impulse face transfers a brief push through the lever.',[box(p[0]-.3,p[1]-.14,3.2,.6,.28,.3,.035)],'escapement',{accentBase:true,revealAt:.46});
 for(let i=0;i<2;i++)part('banking-pin-'+i,'plate','Banking pin','A fixed stop limits the lever travel and protects the fork alignment.',[disc(Z(px+(i?-.8:.8),py-.7),.72,3.5,.1)],'escapement');
 jewel('pallet-jewel-lower','plate',px,py,.58,'escapement');jewel('pallet-jewel-upper','pallet-bridge',px,py,4.32,'escapement');
 // Real 12:1 motion work is on the dial side of the plate, shown from below.
 turn('cannon',[0,0],'center',-5,.55);turn('motion-minute',[2.88,0],'motionMinute',-5,.55);turn('motion-hour',[0,0],'motionHour',-5,.55);
 part('cannon-pinion','cannon','Cannon pinion · 12 leaves','A friction-fit cannon pinion carries the minute hand and drives the motion work.',[shapeGear(0,0,-.7,.22,12,.12,{spokes:0})],'display');
 part('minute-wheel','motion-minute','Minute wheel · 36 teeth','The first stage reduces the minute-arbor rotation by 3:1.',[shapeGear(2.88,0,-.7,.22,36,.12,{spokes:3,hub:.35,rim:.25,phase:Math.PI/36})],'display');
 part('minute-pinion','motion-minute','Minute pinion · 10 leaves','This pinion shares the minute-wheel arbor and drives the hour wheel.',[shapeGear(2.88,0,-1.04,.22,10,.1152,{spokes:0})],'display');
 part('hour-wheel','motion-hour','Hour wheel · 40 teeth','The second 4:1 stage combines with 3:1 to give one hour-hand turn per twelve minute-hand turns.',[shapeGear(0,0,-1.04,.22,40,.1152,{spokes:4,hub:.4,rim:.28,phase:Math.PI/40})],'display');
 part('motion-work-post','plate','Motion-work pivot','A pivot on the underside of the plate locates the minute wheel and its coaxial pinion.',[disc(Z(2.88,0),-1.1,.08,.145)],'display');
 part('dial-ring','dial','Skeleton chapter ring','The open chapter ring keeps the hour and minute scale visible without covering the mechanism.',[ring(Z(),5.95,6.12,19.8,18.45)],'display');
 const minuteMarks=[];for(let i=0;i<60;i++){const a=i*TAU/60,r0=i%5?19.2:18.65;minuteMarks.push(beam([r0*Math.sin(a),r0*Math.cos(a),6.17],[19.65*Math.sin(a),19.65*Math.cos(a),6.17],i%5?.028:.055))}part('minute-indices','dial','Minute and hour scale','Sixty engraved marks form one fixed scale. Longer marks divide it into twelve hours.',minuteMarks,'display',{tone:0x8c9294,outline:false});
 for(const [id,len,z,width]of [['minutes',15.7,6.45,.19],['hours',10.4,6.22,.32]]){move(id,[0,0,20],[0,.32],{pivot:[0,0,0],rotateField:id,rotateAxis:[0,0,-1]});part(id+'-hand',id,id==='minutes'?'Minute hand':'Hour hand',id==='minutes'?'The centre arbor turns once per hour.':'The motion work divides the minute rotation by twelve.',[beam([0,-2,z],[0,len,z],width),ring(Z(),z-.1,z+.14,.65,.2)],'display',{accentBase:id==='minutes'});}
 const f=WHEEL_SPECS[2].at;move('seconds',[0,0,20],[0,.32],{pivot:[...f,0],rotateField:'seconds',rotateAxis:[0,0,-1]});part('seconds-hand','seconds','Small-seconds hand','This hand sits directly on the fourth-wheel arbor and turns once a minute.',[beam([f[0],f[1]-.6,5.6],[f[0],f[1]+2.45,5.6],.055),disc(Z(...f),5.55,5.65,.25)],'display',{accentBase:true});
 part('seconds-scale','dial','Small-seconds scale','The fourth wheel is the seconds wheel; each of five beats advances it 1.2°.',[ring(Z(...f),5.3,5.33,2.8,2.77)],'display',{tone:0xb1b8ba});
 for(const [id,title,target]of [['energy','Energy & winding','mainspring'],['train','Going train','third-wheel'],['escapement','Lever escapement','pallet-fork'],['oscillator','Balance & hairspring','balance'],['display','Motion work & hands','minutes-hand'],['structure','Plate, bridges & case','mainplate']])assembly(id,title,target);
 return k;
}
