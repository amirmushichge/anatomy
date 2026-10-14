import {KEYBOARD,KEYS} from './keyboard-model.mjs';

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
  const xs=[-147,...new Set(holes.flatMap(p=>[p.x0,p.x1])),147].sort((a,b)=>a-b),ys=[-3,...new Set(holes.flatMap(p=>[p.y0,p.y1])),101].sort((a,b)=>a-b),out=[];
  for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){const x=(xs[i]+xs[i+1])/2,y=(ys[j]+ys[j+1])/2;if(!holes.some(p=>x>p.x0&&x<p.x1&&y>p.y0&&y<p.y1))out.push(box(xs[i],ys[j],xs[i+1]-xs[i],ys[j+1]-ys[j],z,h))}return out;
}
export function keyboardDefinition(){
  const parts=[],motions={},add=(id,assembly,title,description,shapes,color=0xd7dfe5,extra={})=>{parts.push({id,assembly,title,description,shapes,material:{color,edgeColor:color<0x777777?0x303b44:0x82909a},...extra});return parts.at(-1)},motion=(id,separate,extra={})=>motions[id]={separate:[0,0,separate],...extra};
  for(const [id,z]of Object.entries({case:-42,bezel:24,plate:26,foam:13,pcb:0,switches:48,'demo-upper':72,'demo-stem':94,'demo-contact':48,stabilizers:48}))motion(id,z);
  const demo=KEYS[0];
  for(const k of KEYS){
    motion('key-'+k.code,k.code==='Escape'?122:88,{axis:[0,0,-1],translateField:'travel_'+k.code});
    add('keycap-'+k.code,'key-'+k.code,k.label||'Spacebar','Transfers your press to a linear switch; the spring returns it.',[capShape(k),...(k.code==='Escape'?[]:stem(k))],k.row===0||k.u>1?0xdce3e8:0xf1f4f6,{action:'key',key:k.code,label:k.label?{text:k.label,at:[k.x-(k.u>1?Math.min(8,k.u*3):3.6),k.y+3.3,33.44],width:Math.min(k.u*12,27),height:5.2}:null});
    add('switch-'+k.code,'switches','Switch · '+(k.label||'Space'),'Guides the stem and locates the spring and electrical contacts.',[...lower(k,k.code==='Escape'),...(k.code==='Escape'?[]:upper(k))],0x394550,{key:k.code});
  }
  Object.assign(motions['key-Escape'],{liftField:'detail',lift:[0,0,38]});Object.assign(motions['demo-upper'],{liftField:'detail',lift:[0,0,22]});
  add('demo-upper','demo-upper','Upper housing','Guides the stem; its front wall is cut away for inspection.',upper(demo,true),0x5b6873,{requiresApart:true,key:'Escape'});
  motion('demo-stem',94,{axis:[0,0,-1],translateField:'travel_Escape'});
  add('demo-stem','demo-stem','Sliding stem','Moves 4 mm; its cam frees the contact leaf at 2 mm.',stem(demo),0x929fa9,{requiresApart:true,key:'Escape',action:'key'});
  parts.push({id:'demo-spring',assembly:'switches',title:'Return spring',description:'Compresses under the stem and returns the key after release.',material:{color:0x7d8992},spring:{origin:[demo.x,demo.y,0],axis:[0,0,1],start:11.69,end:18.61,turns:6,radius:1.8,wire:.19,segments:100,sides:8,fixed:'start',advanceField:'travel_Escape'},requiresApart:true,key:'Escape'});
  const cx=demo.x+4.2,cy=demo.y+1.5;
  add('fixed-contact','demo-contact','Fixed contact','One half of the switch contact pair connects to a PCB pin.',[box(cx,cy,.28,3.3,11.4,7),rod(X(cx,cy+1.2,15.5),-.25,0,.45)],0x9aa7af,{requiresApart:true,key:'Escape',activeField:'contact_Escape'});
  motion('leaf',48,{axis:[1,0,0],translateField:'contact_Escape'});
  add('contact-leaf','leaf','Moving contact leaf','Closes against the fixed contact once travel reaches 2 mm.',[box(cx-1,cy,.2,3.3,11.4,7),box(cx-.8,cy,.2,3.3,17.3,1.1),rod(X(cx-1,cy+1.2,15.5),.2,.27,.45)],0xa7b2b9,{requiresApart:true,key:'Escape',activeField:'contact_Escape'});
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
  add('usb-c','pcb','USB-C connector','Carries power and keyboard data to the host.',[box(-130,95.7,10,6.2,10,3.4,1.1),box(-128.5,101,7,1,10.5,2,.4)],0xa4b0b9,{requiresApart:true});
  const screwPoints=[[-144,-1],[144,-1],[-144,97],[144,97],[-52,-1],[52,-1],[-52,97],[52,97]];
  add('fasteners','case','Case fasteners','Clamp the PCB standoffs to the lower case.',screwPoints.flatMap(([x,y])=>[rod(Z(x,y),3,8.3,1.6),rod(Z(x,y),8.3,9.1,2.1),box(x-1.1,y-.15,2.2,.3,9.1,.12)]),0x8b98a2,{requiresApart:true});
  add('feet','case','Rubber feet','Keep the keyboard stable and separate the case from the desk.',[box(-139,-1,18,7,-1.8,1.9,2),box(121,-1,18,7,-1.8,1.9,2),box(-139,88,18,7,-1.8,1.9,2),box(121,88,18,7,-1.8,1.9,2)],0x5d6a74);
  for(const k of KEYS.filter(k=>k.u>=2)){
    const offset=k.code==='Space'?50:11.9,points=[k.x-offset,k.x+offset];
    add('stabilizer-'+k.code,'stabilizers','Stabilizer · '+(k.label||'Spacebar'),'Guides both ends of a wide key so it stays level.',points.flatMap(x=>[box(x-2.5,k.y-4,1,8,10,12),box(x+1.5,k.y-4,1,8,10,12),box(x-1.5,k.y+3,3,1,10,12),box(x-3,k.y-4.6,6,.6,21,.8)]),0x55636d,{requiresApart:true,key:k.code});
    add('stabilizer-wire-'+k.code,'key-'+k.code,'Stabilizer wire','Links the two stabilizer sliders as the wide key moves.',[rod(X(points[0],k.y-4,15),0,points[1]-points[0],.55),...points.map(x=>rod(Z(x,k.y-4),15,29.5,.55))],0x929fa9,{requiresApart:true,key:k.code});
  }
  return {version:1,id:'keyboard',title:'Mechanical keyboard',units:'mm',camera:{yaw:-1.05,pitch:.82,roll:0,portraitRoll:.8},assemblies:[{id:'caps',title:'Keycaps',part:'keycap-Escape'},{id:'switches',title:'Switch housing',part:'demo-upper'},{id:'stem',title:'Sliding stem',part:'demo-stem'},{id:'spring',title:'Spring',part:'demo-spring'},{id:'contacts',title:'Contacts',part:'contact-leaf'},{id:'stabilizers',title:'Stabilizers',part:'stabilizer-Space'},{id:'plate',title:'Plate',part:'plate'},{id:'pcb',title:'Circuit board',part:'pcb'},{id:'case',title:'Case',part:'case'}],motions,parts,keys:KEYS};
}
