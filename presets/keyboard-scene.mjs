import {KEYBOARD,KEYS} from './keyboard-model.mjs';
import {drawingPart,role,DRAWING,stagedMotion} from '../study-core.mjs';
import {beam,ring,disc} from './solid-kit.mjs';
export const KEYBOARD_ROLES={input:role('Input','orange'),guide:role('Guide','cyan'),contact:role('Contact','pink'),return:role('Return','blue'),signal:role('Signal','yellow')};

const box=(x,y,w,d,z,h,r=0)=>({kind:'slab',plan:{x,y,w,d,r},z,h});
const X=(x,y,z)=>({o:[x,y,z],a:[1,0,0],u:[0,1,0],v:[0,0,1]});
const Z=(x,y,z=0)=>({o:[x,y,z],a:[0,0,1],u:[1,0,0],v:[0,1,0]});
const rod=(F,a,b,r)=>({kind:'disc',F,a,b,r});
function loop(w,d,r,z,x=0,y=0){
  const points=[];for(const [cx,cy,a0]of [[w/2-r,d/2-r,0],[-w/2+r,d/2-r,90],[-w/2+r,-d/2+r,180],[w/2-r,-d/2+r,270]])for(let i=0;i<=4;i++){const a=(a0+i*22.5)*Math.PI/180;points.push([x+cx+r*Math.cos(a),y+cy+r*Math.sin(a),z])}return points;
}
export function capShape(k){
  const w=k.u*KEYBOARD.pitch-1.4,d=17.65,rings=[loop(w,d,1.1,25,k.x,k.y),loop(w-.5,d-.5,1.4,28,k.x,k.y),loop(w-3.6,d-3.6,2,33.5,k.x,k.y)];
  const inner0=loop(w-2.5,d-2.5,.8,25,k.x,k.y),inner1=loop(w-5.3,d-5.3,1.1,31.8,k.x,k.y),n=rings[0].length,vertices=[...rings.flat(),...inner0,...inner1],faces=[];
  const join=(a,b,inward=false)=>{for(let i=0;i<n;i++){const j=(i+1)%n;faces.push(inward?[a+i,b+i,b+j,a+j]:[a+i,a+j,b+j,b+i])}};
  join(0,n);join(n,2*n);join(3*n,4*n,true);
  for(let i=0;i<n;i++){const j=(i+1)%n;faces.push([i,3*n+i,3*n+j,j])}
  // Concentric dish rings retain a true shallow concave crown.
  let prev=2*n;
  for(const [scale,z]of [[.72,33.05],[.35,32.8]]){
    const at=vertices.length;vertices.push(...rings[2].map(p=>[k.x+(p[0]-k.x)*scale,k.y+(p[1]-k.y)*scale,z]));join(prev,at);prev=at;
  }
  const center=vertices.length;vertices.push([k.x,k.y,32.72]);for(let i=0;i<n;i++)faces.push([prev+i,prev+(i+1)%n,center]);
  faces.push(Array.from({length:n},(_,i)=>4*n+n-1-i));
  return {kind:'mesh',vertices,faces};
}
function capSocket(k){const cross=[[-3.2,-.9],[-.9,-.9],[-.9,-3.2],[.9,-3.2],[.9,-.9],[3.2,-.9],[3.2,.9],[.9,.9],[.9,3.2],[-.9,3.2],[-.9,.9],[-3.2,.9]];return{kind:'plate',contour:Array.from({length:32},(_,i)=>[k.x+4*Math.cos(i*Math.PI/16),k.y+4*Math.sin(i*Math.PI/16)]),holes:[cross.map(([x,y])=>[k.x+x,k.y+y])],z:28.2,h:3.5,bevel:.015}}
function stem(k){return [box(k.x-2,k.y-2,4,4,19,9,.45),box(k.x-3.1,k.y-.8,6.2,1.6,28,3.8,.2),box(k.x-.8,k.y-3.1,1.6,6.2,28,3.8,.2),box(k.x-3.6,k.y-3.3,7.2,6.6,18.8,1.4,.5),rod(Z(k.x,k.y),15.5,19,1.1)]}
function lower(k,cut=false){
  return [box(k.x-7,k.y-7,14,14,10,1.5,.65),box(k.x-7,k.y-7,1.5,14,11.5,4.5),box(k.x+5.5,k.y-7,1.5,14,11.5,4.5),box(k.x-5.5,k.y+5.5,11,1.5,11.5,4.5),...(cut?[]:[box(k.x-5.5,k.y-7,11,1.5,11.5,4.5)]),rod(Z(k.x-4,k.y+3),6.2,10, .45),rod(Z(k.x+3,k.y+3),6.2,10,.45)];
}
function upper(k,cut=false){
  const a=[box(k.x-7,k.y-7,1.5,14,16,7),box(k.x+5.5,k.y-7,1.5,14,16,7),box(k.x-5.5,k.y+5.5,11,1.5,16,7),box(k.x-5.5,k.y+2.4,11,3.1,22.4,1.2),box(k.x-5.5,k.y-2.4,3.1,4.8,22.4,1.2),box(k.x+2.4,k.y-2.4,3.1,4.8,22.4,1.2)];
  if(!cut)a.push(box(k.x-5.5,k.y-7,11,1.5,16,7),box(k.x-5.5,k.y-5.5,11,3.1,22.4,1.2));
  a.push(box(k.x-7.7,k.y-5, .7,10,21,.8),box(k.x+7,k.y-5,.7,10,21,.8));return a;
}
function perforated(z,h){
  const holes=KEYS.map(k=>({x0:k.x-7,x1:k.x+7,y0:k.y-7,y1:k.y+7}));
  for(const k of KEYS.filter(k=>k.u>=2))for(const side of [-1,1]){const x=k.x+side*(k.code==='Space'?50:11.9);holes.push({x0:x-3,x1:x+3,y0:k.y-4,y1:k.y+4})}
  return [{kind:'plate',contour:[[-147,-3],[147,-3],[147,101],[-147,101]],holes:holes.map(p=>[[p.x0,p.y0],[p.x1,p.y0],[p.x1,p.y1],[p.x0,p.y1]]),z,h,bevel:.025}];
}
export function keyboardDefinition(){
  const parts=[],motions={},add=(id,assembly,title,description,shapes,color=0xd7dfe5,extra={})=>{parts.push({id,assembly,title,description,shapes,material:{color,edgeColor:color<0x777777?0x303b44:0x82909a},...extra});return parts.at(-1)},motion=(id,separate,extra={})=>motions[id]={separate:[0,0,separate],...extra};
  for(const [id,z]of Object.entries({case:-42,bezel:24,plate:26,foam:13,pcb:0,switches:48,'demo-upper':72,'demo-stem':94,'demo-contact':48,stabilizers:48}))motion(id,z);
  const demo=KEYS[0];
  for(const k of KEYS){
    motion('key-'+k.code,k.code==='Escape'?122:88,{axis:[0,0,-1],translateField:'travel_'+k.code});
    add('keycap-'+k.code,'key-'+k.code,k.label||'Spacebar','The hollow sculpted cap and its cross socket transfer your press into the stem.',[capShape(k),capSocket(k)],k.row===0||k.u>1?0xdce3e8:0xf1f4f6,{action:'key',key:k.code,label:k.label?{text:k.label,at:[k.x,k.y+1.2,33.42],width:Math.min(k.u*12,27),height:5.2}:null});
    add('switch-'+k.code,'switches','Switch · '+(k.label||'Space'),'Guides the stem and locates the spring and electrical contacts.',[...(k.code==='Escape'?lower(k,true).filter((_,i)=>i!==2):lower(k)),...(k.code==='Escape'?[]:upper(k))],0x394550,{key:k.code});
    if(k.code!=='Escape'){
      add('stem-'+k.code,'key-'+k.code,'Stem · '+(k.label||'Space'),'The guided stem and cap move together through 4 mm.',stem(k),0xf5f5f2,{key:k.code,action:'key'});
      parts.push({id:'spring-'+k.code,assembly:'switches',title:'Return spring · '+(k.label||'Space'),description:'The seated coil compresses with the stem and restores the key after release.',spring:{origin:[k.x,k.y,0],axis:[0,0,1],start:11.69,end:18.61,turns:6,radius:1.8,wire:.19,segments:72,sides:6,fixed:'start',advanceField:'travel_'+k.code},key:k.code});
    }
  }
  Object.assign(motions['key-Escape'],{liftField:'detail',lift:[0,0,38]});Object.assign(motions['demo-upper'],{liftField:'detail',lift:[0,0,22]});
  add('demo-upper','demo-upper','Upper housing','Guides the stem; its front wall is cut away for inspection.',upper(demo,true),0x5b6873,{requiresApart:true,key:'Escape'});
  motion('demo-stem',94,{axis:[0,0,-1],translateField:'travel_Escape'});
  add('demo-stem','demo-stem','Sliding stem','Moves 4 mm; its cam frees the contact leaf at 2 mm.',stem(demo),0x929fa9,{requiresApart:true,key:'Escape',action:'key'});
  parts.push({id:'demo-spring',assembly:'switches',title:'Return spring',description:'Compresses under the stem and returns the key after release.',material:{color:0x7d8992},spring:{origin:[demo.x,demo.y,0],axis:[0,0,1],start:11.69,end:18.61,turns:6,radius:1.8,wire:.19,segments:100,sides:8,fixed:'start',advanceField:'travel_Escape'},requiresApart:true,key:'Escape'});
  const cx=demo.x+4.2,cy=demo.y+1.5;
  add('fixed-contact','demo-contact','Fixed contact','One half of the switch contact pair connects to a PCB pin.',[box(cx,cy,.28,3.3,11.4,7),rod(X(cx,cy+1.2,15.5),-.25,0,.45)],0x9aa7af,{requiresApart:true,key:'Escape',activeField:'contact_Escape'});
  motion('leaf',48);
  add('contact-leaf','leaf','Moving contact leaf','The anchored leaf bends as the stem releases it. Its contact meets the fixed contact at 2 mm.',[box(cx-1,cy,.2,3.3,11.4,7),box(cx-.8,cy,.2,3.3,17.3,1.1),rod(X(cx-1,cy+1.2,15.5),.2,.27,.45)],0xa7b2b9,{requiresApart:true,key:'Escape',activeField:'closed_Escape',bend:{field:'contact_Escape',axis:[1,0,0],from:11.4,to:15.5}});
  add('case','case','Lower case','Supports the electronics and closes the underside of the keyboard.',[box(-151,-8,302,112,0,3,5),box(-151,-8,3,112,3,17),box(148,-8,3,112,3,17),box(-148,101,296,3,3,17),box(-148,-8,76,3,3,8),box(-72,-8,220,3,3,17)],0xd5dce1);
  add('bezel','bezel','Top frame','Protects the edges and gives the key field a precise opening.',[box(-151,-8,4,112,20,1.8),box(147,-8,4,112,20,1.8),box(-147,-8,294,5,20,1.8),box(-147,101,294,3,20,1.8)],0xdce3e8);
  add('plate','plate','Switch plate','Its 61 square openings locate the switches and resist flex.',perforated(19.5,1.5),0xb9c5ce,{requiresApart:true});
  add('plate-foam','foam','Plate foam','Fits around the switch bodies and damps vibration between plate and PCB.',perforated(17.5,1.4),0x616d76,{requiresApart:true});
  add('pcb','pcb','Circuit board','Connects the 61 switches through a scanned row and column matrix.',[box(-147,-3,294,104,8.4,1.6,3)],0x707f89,{requiresApart:true});
  const copper=[];
  // Rows run on the top face; columns run on the underside. A diode and via
  // connect each second switch pin to its nearest column without trace crossings.
  for(let row=0;row<5;row++){const y=10+row*KEYBOARD.pitch-6;copper.push(box(-144,y,288,.18,10,.06),rod(Z(-144,y),10,10.08,.65),rod(Z(144,y),10,10.08,.65))}
  for(let col=0;col<15;col++){const x=-KEYBOARD.pitch*7+col*KEYBOARD.pitch;copper.push(box(x,0,.18,98,8.32,.08),rod(Z(x,98),8.32,8.4,.65))}
  for(const k of KEYS){const rowY=k.y-6,diodeY=k.y-5.2,viaX=k.x+8.8,colX=-KEYBOARD.pitch*7+Math.round((viaX+KEYBOARD.pitch*7)/KEYBOARD.pitch)*KEYBOARD.pitch;copper.push(rod(Z(k.x-4,k.y+3),10,10.08,.8),rod(Z(k.x+3,k.y+3),10,10.08,.8),box(k.x-4,rowY,.18,9,10,.06),box(k.x+3,diodeY,.18,8.2,10,.06),box(k.x+3,diodeY,2.7,.18,10,.06),box(k.x+8.45,diodeY,.35,.18,10,.06),rod(Z(viaX,diodeY),8.32,10.08,.25),box(Math.min(viaX,colX),diodeY,Math.max(.18,Math.abs(viaX-colX)),.18,8.32,.08))}
  add('traces','pcb','Matrix traces & pads','Top-face row traces and underside columns connect through each diode.',copper,0xacbac4,{requiresApart:true,outline:false});
  add('case-foam','case','Case foam','Fills the cavity below the PCB to reduce case resonance.',[box(-146,-3,292,103,3.6,2.3,3)],0xa3adb4,{requiresApart:true});
  add('sockets','pcb','Hot-swap sockets','Grip the switch pins, allowing switches to be replaced without soldering.',KEYS.flatMap(k=>[box(k.x-5,k.y+1,10,5.8,5.4,2.7,1),box(k.x-4.6,k.y+2,1.4,3.5,7.8,.6),box(k.x+3.2,k.y+2,1.4,3.5,7.8,.6)]),0x485660,{requiresApart:true});
  add('diodes','pcb','Matrix diodes','Isolate each switch in the scanning matrix and prevent ghost paths.',KEYS.flatMap(k=>[box(k.x+6,k.y-5.8,2.1,1.3,10,.7,.2),box(k.x+5.6,k.y-5.8,.4,1.3,10,.5),box(k.x+8.1,k.y-5.8,.4,1.3,10,.5)]),0x333e48,{requiresApart:true});
  add('controller','pcb','Controller & clock','Scans the matrix and sends the resulting key events over USB.',[box(95,96,7.5,4,10,1,.6),box(107,96,4,2.5,10,.8,.4),...Array.from({length:12},(_,i)=>box(95+i*.6,95.5,.3,.5,10,.4)),...Array.from({length:7},(_,i)=>box(114+i*3.4,96.5,2,1.2,10,.5,.2))],0x3c4852,{requiresApart:true});
  add('usb-c','pcb','USB-C connector','A tongue inside the hollow shield carries power and keyboard data to the host.',[box(-129.3,96,8.6,5.8,11.2,.65,.3),...Array.from({length:12},(_,i)=>box(-128.7+i*.66,99,.28,2.5,11.85,.06))],0xa4b0b9,{requiresApart:true});
  const screwPoints=[[-144,-1],[144,-1],[-144,97],[144,97],[-52,-1],[52,-1],[-52,97],[52,97]];
  add('fasteners','case','Case fasteners','Clamp the PCB standoffs to the lower case.',screwPoints.flatMap(([x,y])=>[rod(Z(x,y),3,8.3,1.6),rod(Z(x,y),8.3,9.1,2.1),box(x-1.1,y-.15,2.2,.3,9.1,.12)]),0x8b98a2,{requiresApart:true});
  add('feet','case','Rubber feet','Keep the keyboard stable and separate the case from the desk.',[box(-139,-1,18,7,-1.8,1.9,2),box(121,-1,18,7,-1.8,1.9,2),box(-139,88,18,7,-1.8,1.9,2),box(121,88,18,7,-1.8,1.9,2)],0x5d6a74);
  for(const k of KEYS.filter(k=>k.u>=2)){
    const offset=k.code==='Space'?50:11.9,points=[k.x-offset,k.x+offset];
    add('stabilizer-'+k.code,'stabilizers','Stabilizer · '+(k.label||'Spacebar'),'Guides both ends of a wide key so it stays level.',points.flatMap(x=>[box(x-2.5,k.y-4,1,8,10,12),box(x+1.5,k.y-4,1,8,10,12),box(x-1.5,k.y+3,3,1,10,12),box(x-3,k.y-4.6,6,.6,21,.8)]),0x55636d,{requiresApart:true,key:k.code});
    motion('wire-'+k.code,48,{pivot:[k.x,k.y-6,18],rotateAxis:[-1,0,0],rotateField:'wire_'+k.code});
    add('stabilizer-wire-'+k.code,'wire-'+k.code,'Stabilizer wire','The wire pivots in its housings; its two crank arms keep both sliders at the same height.',[rod(X(points[0],k.y-6,18),0,points[1]-points[0],.55),...points.map(x=>beam([x,k.y-6,18],[x,k.y,18],.55))],0x929fa9,{requiresApart:true,key:k.code});
    parts.find(p=>p.id==='stabilizer-'+k.code).shapes.push(...points.flatMap(x=>[ring(X(x-1,k.y-6,18),0,2,1,.6),beam([x,k.y-6,18],[x,k.y-3.5,18],.8)]));
    parts.find(p=>p.id==='keycap-'+k.code).shapes.push(...points.map(x=>capSocket({...k,x})));
    add('stabilizer-sliders-'+k.code,'key-'+k.code,'Stabilizer sliders','Both sliders move with the wide key. The crossbar constrains their height together.',points.flatMap(x=>[box(x-1.35,k.y-2,2.7,4,17.8,11.7,.3),box(x-3,k.y-.7,6,1.4,28.2,3.5,.2),box(x-.7,k.y-3,1.4,6,28.2,3.5,.2)]),0xf5f5f2,{key:k.code,requiresApart:true});
  }
  // A representative switch has a real spring post, rails and moulded retention tabs.
  add('spring-post','switches','Spring centring post','A fixed post seats the lower coil; the stem shaft slides above it.',[ring(Z(demo.x,demo.y),11.5,14.1,1.45,1.15)],0xf5f5f2,{key:'Escape'});
  add('switch-guide-rails','switches','Stem guide rails','Two rails constrain side play while leaving the 4 mm stroke clear.',[-1,1].map(s=>box(demo.x+s*4.2-.35,demo.y-2.2,.7,4.4,11.5,10.5,.15)),0xf5f5f2,{key:'Escape'});
  const rowY=demo.y-6,viaX=demo.x+8.8,colX=-KEYBOARD.pitch*7+Math.round((viaX+KEYBOARD.pitch*7)/KEYBOARD.pitch)*KEYBOARD.pitch;
  add('demo-matrix-path','pcb','Active row and column','The closed Escape switch links its row through a diode to a scanned column. The highlighted route is illustrative, not firmware timing.',[box(-144,rowY,288,.24,10.09,.035),box(colX,0,.24,98,8.27,.035),box(demo.x-4,rowY,.24,9,10.09,.035),box(demo.x+3,demo.y-5.2,.24,8.2,10.09,.035)],0xf5f5f2,{activeField:'closed_Escape'});
  add('usb-shell','pcb','USB-C shield','A hollow folded shield surrounds the connector tongue.',[box(-130,95.7,10,6.2,13.4,.25,.5),box(-130,95.7,.3,6.2,10,3.4),box(-120.3,95.7,.3,6.2,10,3.4)],0xf5f5f2);
  const def={version:2,id:'keyboard',title:'Mechanical keyboard',units:'mm',style:'white-drawing',study:{id:'keyboard'},autoFocusView:true,camera:{yaw:-1.28,pitch:1.08,roll:0,portraitRoll:.8},assemblies:[{id:'caps',title:'Keycaps',part:'keycap-Escape'},{id:'switches',title:'Switch housing',part:'demo-upper'},{id:'stem',title:'Sliding stem',part:'demo-stem'},{id:'spring',title:'Spring',part:'demo-spring'},{id:'contacts',title:'Contacts',part:'contact-leaf'},{id:'stabilizers',title:'Stabilizers',part:'stabilizer-Space'},{id:'plate',title:'Plate',part:'plate'},{id:'pcb',title:'Circuit board',part:'pcb'},{id:'case',title:'Case',part:'case'}],motions,parts,keys:KEYS};
  const body=parts.find(p=>p.id==='case');body.shapes.splice(3,1,box(-148,101,17.5,3,3,17),box(-119.5,101,267.5,3,3,17),box(-130.5,101,11,3,3,6.7),box(-130.5,101,11,3,14,6));
  for(const [id,m]of Object.entries(motions)){let range=id==='case'?[0,.25]:id==='bezel'?[0,.28]:id.startsWith('key-')?[0,.48]:id==='demo-upper'?[.18,.62]:id==='demo-stem'?[.38,.9]:id==='plate'?[.45,.78]:id==='foam'?[.58,.9]:id==='pcb'?[.7,1]:[.4,1];m.separateRange=range;}
  for(const p of parts){let system=p.id.startsWith('keycap')||p.id==='demo-stem'||p.id.startsWith('stem-')?'input':p.spring?'return':/contact/.test(p.id)?'contact':/pcb|traces|diodes|controller|sockets|usb/.test(p.id)?'signal':'guide';drawingPart(p,system,KEYBOARD_ROLES,{tone:/case|foam|switch-/.test(p.id)?DRAWING.soft:/wire|contact|traces|fastener/.test(p.id)?DRAWING.metal:DRAWING.white});p.structural=['case','bezel','plate','plate-foam','case-foam','feet','fasteners'].includes(p.id);if(p.key==='Escape')p.studyKeep=true;else if(p.key)p.studyHide=['input','return','contact'];if(p.structural||['pcb','traces','sockets','diodes','controller','usb-c','usb-shell'].includes(p.id))p.studyHide=['input','return','contact'];if(p.id==='keycap-Escape'||p.id==='demo-upper')p.studyHide=['return','contact'];if(p.id==='keycap-Escape')p.accentBase=true;if(p.id==='fixed-contact')p.activeField='closed_Escape';p.revealAt=p.key==='Escape'?.12:p.requiresApart?.65:0;}
  for(const p of parts){if(['pcb','traces','sockets'].includes(p.id))p.structural=true;if(p.id==='demo-matrix-path'){p.system='signal';p.material.accent=KEYBOARD_ROLES.signal.color;p.studyHide=['input','return','contact','guide']}if(p.key==='Escape'&&p.id!=='keycap-Escape')p.revealAt=.75;}
  // The macro view reveals Escape only; the complete keyboard retains all 61 switches.
  return def;
}
