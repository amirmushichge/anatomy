import {X,ring,disc,box,beam} from './solid-kit.mjs';
import {DRAWING,drawingPart,role,stagedMotion} from '../study-core.mjs';
export const PEN_ROLES={input:role('Push','orange'),index:role('Index','cyan'),latch:role('Latch','pink'),return:role('Return','blue'),write:role('Write','yellow')};
export function penDefinition(baseline){
 const d=structuredClone(baseline);d.id="pen";d.style='white-drawing';d.autoFocusView=true;d.study={id:'pen'};
 const assigned=p=>p.assembly==='plunger'?'input':p.assembly==='cam'?'index':p.assembly==='sleeve'?'latch':p.assembly==='spring'?'return':p.assembly==='refill'?'write':null;
 for(const p of d.parts){const system=assigned(p);drawingPart(p,system,PEN_ROLES,{tone:/shell|cone|sleeve-wall/.test(p.id)?DRAWING.soft:DRAWING.white});p.revealAt=p.assembly==='sleeve'||p.assembly==='cam'?.2:p.assembly==='spring'?.15:0;if(p.assembly==='barrel')p.structural=true;if(['barrel-shell','clip-blade','clip-socket','clip-root','clip-toe'].includes(p.id))p.studyHide=['input','index','latch','return','write'];if(p.assembly==='sleeve'&&['sleeve-wall','sleeve-bearing-insert'].includes(p.id))p.studyHide=['input','index','latch'];if(p.id==='refill-tube')p.studyHide=['write'];}
 const get=id=>d.parts.find(p=>p.id===id),F=X(0,0,10);
 get('barrel-shell').shapes=[ring(F,12.08,124.8,5.4,4.65,15,305),ring(F,12.08,12.45,5.3,4.65,15,305),ring(F,124.45,124.8,5.25,4.65,15,305)];
 get('barrel-shell').description='A 0.75 mm wall carries the fixed sleeve. The open sector is a deliberate teaching cutaway.';
 get('sleeve-wall').shapes=[ring(F,12.1,39.5,4.35,4,20,300)];
 get('plunger-button').shapes=[{kind:'solid',F,profile:[[0,2.9],[.25,3.25],[3.5,3.25],[3.8,2.95]]}];get('plunger-button').accentBase=true;
 get('rotator-drum').shapes=[ring(F,35,40.9,2.4,1.15),ring(F,40.9,41.2,2.35,.85)];get('rotator-drum').accentBase=true;get('rotator-drum').description='Three follower lugs index 60° per click. They alternate between a retaining ledge and a deep axial slot.';
 // Chamfered shoulder and sleeve bearings have real central bores.
 get('refill-rear-plug').shapes=[disc(F,41.2,42,1.95)];
 get('refill-tube').shapes=[ring(F,42,121.9,1.95,1.55,15,305)];
 get('ink-column').shapes=[disc(F,45,121.5,1.46)];get('ink-column').accentBase=true;get('ink-column').description='Ink occupies the refill bore. The barrel and refill wall are cut away here to expose it.';
 get('front-cone').shapes=[{kind:'annular',F,a:125,b:139.7,r0:5.2,r1:1.02,inner0:4.45,inner1:.78,d0:15,d1:305}];
 get('ball-socket').shapes=[{kind:'solid',F,profile:[[135,1.05],[137.8,.72],[138.15,.45]]}];
 for(const id of ['plunger-guide-0','plunger-guide-1','plunger-guide-2'])get(id).description='An axial rib prevents the push button from rotating. Only the rotator indexes.';
 const ranges={barrel:[0,.22],cone:[0,.3],plunger:[.12,.65],sleeve:[.22,.76],cam:[.48,1],refill:[.42,1],spring:[.35,1]};
 const moves={barrel:[0,0,-16],cone:[39,0,0],plunger:[-38,0,0],sleeve:[-18,0,0],cam:[0,0,0],refill:[17,0,0],spring:[28,0,0]};
 for(const [id,m]of Object.entries(d.motions))Object.assign(m,stagedMotion(moves[id],ranges[id]));
 // Visible integral details are named for inspection, not presented as a service BOM.
 for(let i=0;i<6;i++){const a=i*Math.PI/3;d.parts.push(drawingPart({id:'button-flute-'+i,assembly:'plunger',title:'Button grip flute',description:'An integral longitudinal flute gives the button a tactile edge.',shapes:[beam([.7,3.24*Math.cos(a),10+3.24*Math.sin(a)],[3.1,3.24*Math.cos(a),10+3.24*Math.sin(a)],.08)],action:'press'},'input',PEN_ROLES));}
 d.assemblies=[['plunger','Push button','plunger-button'],['cam','Rotating cam','rotator-drum'],['sleeve','Sleeve & latch','sleeve-tooth-0'],['spring','Return spring','return-spring'],['refill','Refill & ball','refill-tube'],['cone','Front cone','front-cone'],['barrel','Cutaway barrel','barrel-shell']].map(([id,title,part])=>({id,title,part}));
 return d;
}
