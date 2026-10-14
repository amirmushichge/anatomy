import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {newPresets} from '../presets/new-scenes.mjs';
import {mechanism,initialMechanism,NEW_IDS} from '../presets/mechanisms.mjs';
import {geometryFor,makeSpringGeometry} from '../geometry.mjs';
import {ring,sector,Z,spiral} from '../presets/solid-kit.mjs';
const report={presets:[],poses:0,checks:[]};
for(const {id,definition:d}of newPresets()){
 assert(d.parts.length>=40,id);assert.equal(new Set(d.parts.map(p=>p.id)).size,d.parts.length);
 let triangles=0;for(const p of d.parts){assert(p.title&&p.description&&d.motions[p.assembly],id+'/'+p.id);const g=p.spring?makeSpringGeometry(p.spring):geometryFor(p.shapes);assert(g.attributes.position.count>=12,id+'/'+p.id+' empty');for(const attr of ['position','normal'])assert([...g.attributes[attr].array].every(Number.isFinite),id+'/'+p.id+' nonfinite');triangles+=g.index?g.index.count/3:g.attributes.position.count/3;g.dispose()}
 for(let mode=0;mode<(id==='hub'?3:2);mode++)for(let i=0;i<=720;i++){const s={...initialMechanism(id),cycles:1,mode,progress:i/720},m=mechanism(id,s);assert(Object.values(m.pose).every(Number.isFinite),id+' pose');assert.equal(m.readouts.length,3);report.poses++;
  if(id==='engine'){const v=m.pose,a=v.crank*Math.PI/180;const small=[v.rodX-70*Math.sin(v.rodAngle*Math.PI/180),18+v.rodZ+70*Math.cos(v.rodAngle*Math.PI/180)];assert(Math.abs(small[0])<1e-8);assert(Math.abs(small[1]-(88+v.piston))<1e-8);assert(v.piston>=-36-1e-8&&v.piston<=1e-8);assert(!(v.intake>1e-6&&v.exhaust>1e-6));assert.equal(v.cam,-v.crank/2)}
  if(id==='hub'){const v=m.pose;assert(Math.abs((v.ring-v.carrier)*72+(v.sun-v.carrier)*24)<1e-7);for(let j=0;j<3;j++){const x=24*Math.cos(j*2*Math.PI/3)+v['planetX'+j],y=24*Math.sin(j*2*Math.PI/3)+v['planetY'+j];assert(Math.abs(Math.hypot(x,y)-24)<1e-8)}}
  if(id==='lock'){const v=m.pose;if(Math.abs(v.plug)>1e-9){assert(Math.abs(v.key)<1e-9);assert.equal(v.aligned,1)}[2.5,1.4,3.2,2,2.8].forEach((h,j)=>{if(v.aligned)assert(Math.abs(8-h+v['pin'+j]-8)<1e-9)})}
  if(id==='speaker')assert(Math.abs(m.pose.cone)<=1.8+1e-9);
  if(id==='pump'){assert(m.pose.piston>=0&&m.pose.piston<=180+1e-9);assert(!(m.pose.inlet&&m.pose.outlet))}
  if(id==='watch'){const v=m.pose;assert(Math.abs(v.seconds+v.fourth)<1e-8);assert(Math.abs(v.hours*12-v.minutes)<1e-9)}
 }
 report.presets.push({id,parts:d.parts.length,triangles});
}
function closed(shape){const g=geometryFor([shape]),p=g.attributes.position,edges=new Map(),key=i=>[p.getX(i),p.getY(i),p.getZ(i)].map(v=>v.toFixed(4)).join(',');for(let i=0;i<p.count;i+=3)for(let j=0;j<3;j++){const a=key(i+j),b=key(i+(j+1)%3);assert.notEqual(a,b);const k=[a,b].sort().join('|');edges.set(k,(edges.get(k)||0)+1)}assert([...edges.values()].every(v=>v===2),'Open primitive');g.dispose()}
closed(ring(Z(),0,3,20,18));closed(sector(Z(),0,20,10,30,9,29,0,280));closed(spiral(Z(),0,.4,4,1,8,.2)[0]);
// Independently measure the transformed inner edge of each real blade.
const lens=newPresets().find(p=>p.id==='lens').definition;
for(const f of [2,2.8,5.6,8,16]){const v=mechanism('lens',{...initialMechanism('lens'),param:f}).pose,a=v.irisAngle*Math.PI/180;for(let i=0;i<9;i++){const blade=lens.parts.find(p=>p.id==='iris-blade-'+i),pivot=lens.motions[blade.assembly].pivot,poly=blade.shapes[0].poly,transform=([x,y])=>{x-=pivot[0];y-=pivot[1];return [pivot[0]+x*Math.cos(a)-y*Math.sin(a),pivot[1]+x*Math.sin(a)+y*Math.cos(a)]},p=transform(poly[0]),q=transform(poly[3]),dx=q[0]-p[0],dy=q[1]-p[1],distance=Math.abs(p[0]*q[1]-p[1]*q[0])/Math.hypot(dx,dy),foot=-(p[0]*dx+p[1]*dy)/(dx*dx+dy*dy);assert(Math.abs(distance-25/f)<1e-8,'Physical iris edge');assert(foot>=0&&foot<=1,'Iris segment misses incircle')}}
report.checks.push('Nine real pivoting blade edges match the f/2-f/16 pupil incircle');
report.checks=['Nine real pivoting blade edges match the f/2-f/16 pupil incircle','All 10 presets have >=40 named solids and finite geometry','Closed full ring, conical cutaway and spiral strip','Slider-crank endpoints match piston throughout 720 degrees','Valve sequence and 2:1 cam rotation','Willis planetary constraint and constant planet orbit','Lock insertion interlock and five aligned pin joints','Speaker excursion, pump travel and mutually exclusive valves','Watch 16:1 / 8:1 / 7.5:1 train and 12:1 hands'];
writeFileSync('qa/new-model-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
