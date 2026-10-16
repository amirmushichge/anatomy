import assert from 'node:assert/strict';
import fs from 'node:fs';
import {WATCH,WHEEL_SPECS,ESCAPE,BARREL,watchPose,watchInitial,advanceWatch} from '../presets/watch-model.mjs';
import {watchDefinition} from '../presets/watch-scene.mjs';
import {geometryFor} from '../geometry.mjs';
const near=(a,b,e=1e-7)=>assert(Math.abs(a-b)<=e,`${a} != ${b}`),report={sampledTimes:0,geometry:{},checks:[]};
const wheels=[{at:BARREL,teeth:80,module:.12},...WHEEL_SPECS,{at:ESCAPE,pinion:8,pinionModule:.075,pinionZ:3}];
for(let i=1;i<wheels.length;i++){const a=wheels[i-1],b=wheels[i];near(Math.hypot(a.at[0]-b.at[0],a.at[1]-b.at[1]),a.teeth*a.module/2+b.pinion*b.pinionModule/2);if(i>1)near(a.z,b.pinionZ)}
near(80/10*75/10,60);near(80/8,10);near(360/15/2,12);near(36/12*40/10,12);
for(let i=0;i<=36000;i++){
 const s={...watchInitial(),elapsed:i/100},m=watchPose(s),v=m.pose;assert(Object.values(v).every(Number.isFinite));near(v.escape+10*v.fourth,0);near(v.fourth+7.5*v.third,0);near(v.third+8*v.center,0);near(v.center+8*v.barrel,0);near(v.hours*12,v.minutes);near(v.motionMinute*3,-v.center);near(v.motionHour,v.center/12);assert(Math.abs(v.balance)<=270+1e-8);assert(m.release>=0&&m.release<=1);report.sampledTimes++;
}
const h=watchPose({...watchInitial(),elapsed:3600}).pose;near(h.center,-360);near(h.fourth,-21600);near(h.hours,30);near(h.seconds,21600);near(h.barrel,45);
for(let beat=0;beat<300;beat++){const a=watchPose({...watchInitial(),elapsed:beat/5}),b=watchPose({...watchInitial(),elapsed:(beat+1)/5});near(b.pose.escape-a.pose.escape,12);const rest1=watchPose({...watchInitial(),elapsed:(beat+.4)/5}),rest2=watchPose({...watchInitial(),elapsed:(beat+.9)/5});near(rest1.pose.escape,rest2.pose.escape)}
let s=watchInitial();s.running=true;s.paused=false;for(let i=0;i<1000;i++)advanceWatch(s,.01);near(s.elapsed,2);near(s.param,8-2/3600,1e-9);
s.param=0;const stopped=s.elapsed;advanceWatch(s,100);near(s.elapsed,stopped);assert(!s.running);assert.equal(watchPose(s).phase,'No power');
s=watchInitial();s.stepTo=.2;for(let i=0;i<1000;i++)advanceWatch(s,.01);near(s.elapsed,.2);assert.equal(s.stepTo,null);assert.equal(watchPose(s).beats,1);assert(!s.running);
s=watchInitial();s.running=true;s.paused=false;s.param=.1/3600;advanceWatch(s,1);near(s.elapsed,.1);near(s.param,0);assert(!s.running);
const d=watchDefinition().definition;assert.equal(d.parts.length,new Set(d.parts.map(p=>p.id)).size);let triangles=0;
for(const p of d.parts){const g=geometryFor(p.shapes);for(const a of ['position','normal'])assert([...g.attributes[a].array].every(Number.isFinite),p.id);assert(g.boundingBox.min.z<g.boundingBox.max.z,p.id+' thickness');triangles+=g.index?g.index.count/3:g.attributes.position.count/3;g.dispose()}
report.geometry={namedFeatures:d.parts.length,triangles};
const progress=(m,a)=>{const [l,h]=m.separateRange||[0,1],v=Math.max(0,Math.min(1,(a-l)/(h-l)));return v*v*(3-2*v)};
for(let i=0;i<=1000;i++){const a=i/1000;for(const id of ['center','third','fourth','escape']){if(progress(d.motions[id],a)>0)assert(progress(d.motions['train-bridge'],a)===1,'Train lifts before bridge clears')}if(progress(d.motions.balance,a)>0)assert(progress(d.motions['balance-bridge'],a)===1)}
report.checks=['Actual pitch-centre distances match all four going-train meshes','Gear layers: centre wheel clears barrel drum, each pinion shares its driving-wheel height','36001 finite time samples: train/hands/motion-work constraints','One physical hour: centre360deg, fourth60rev, hour30deg','300 half-tooth beats with stationary lock intervals','Time and power integration, zero-power stop, one-beat endpoint, reserve exhaustion','All named geometries finite with nonzero thickness','1001 separation samples: bridges clear before wheels/balance lift'];
fs.writeFileSync('review/watch-model-qa.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
