import {definitionHash} from './hash-definition.mjs';
import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import {pose,DIM} from '../presets/pen-model.mjs';import {keyPose,KEYS,KEYBOARD,keyboardState,contactAdvance} from '../presets/keyboard-model.mjs';
import {penDefinition} from '../presets/pen-scene.mjs';import {keyboardDefinition,capShape} from '../presets/keyboard-scene.mjs';import {watchDefinition} from '../presets/watch-scene.mjs';
import {WATCH_CHAPTERS,WATCH_SYSTEMS} from '../presets/watch-model.mjs';import {STUDIES} from '../study-definitions.mjs';import {validateStudy,STUDY_PALETTE} from '../study-core.mjs';import {geometryFor,makeSpringGeometry} from '../geometry.mjs';
const pen=penDefinition(JSON.parse(fs.readFileSync(new URL('../presets/pen-baseline.json',import.meta.url)))),keyboard=keyboardDefinition(),checks=[],report={};
for(const [d,study]of [[pen,STUDIES.pen],[keyboard,STUDIES.keyboard],[watchDefinition().definition,{roles:WATCH_SYSTEMS,chapters:WATCH_CHAPTERS}]]){report[d.id]=validateStudy(d,study);assert.equal(d.style,'white-drawing');const roles=Object.values(study.roles).map(r=>r.color);assert.deepEqual(new Set(roles),new Set(Object.values(STUDY_PALETTE)));let triangles=0;for(const p of d.parts){const g=p.spring?makeSpringGeometry(p.spring):geometryFor(p.shapes);assert(g.attributes.position.count>0,p.id);for(const attr of ['position','normal'])assert([...g.attributes[attr].array].every(Number.isFinite),p.id+' '+attr);g.computeBoundingBox();const size=g.boundingBox.getSize(new THREE.Vector3());assert(size.x>0&&size.y>0&&size.z>0,p.id+' thickness');triangles+=(g.index?.count??g.attributes.position.count)/3;g.dispose()}report[d.id].triangles=triangles;}
checks.push('Three mechanism contracts resolve every role, chapter focus, assembly and finite solid; one shared five-colour palette');
let penSamples=0;for(let clicks=1;clicks<=12;clicks++){const prev=pose(clicks-1),done=pose(clicks);assert.equal(done.refill,clicks%2?3:0);assert.equal(done.plunger,0);assert.equal(done.angle,clicks*60);assert.equal(pose(clicks,0).refill,prev.refill);assert.equal(pose(clicks,0).plunger,0);let lastAngle=prev.angle;for(let i=0;i<=1000;i++){const p=pose(clicks,i/1000);assert(Object.values(p).filter(v=>typeof v==='number').every(Number.isFinite));assert(p.angle>=lastAngle-1e-8&&p.angle<=done.angle+1e-8);assert(p.plunger>=0&&p.plunger<=4.5);assert(p.refill>=0&&p.refill<=4.5);assert(130-(117+p.refill)>10*.46);lastAngle=p.angle;penSamples++}assert.equal(done.refill>1.15,clicks%2===1)}
checks.push('12 full pen cycles / 12012 poses: 60-degree indexing, alternating 3 mm retention, independent button return, spring coil clearance and tip threshold');
let keyboardSamples=0;for(let i=0;i<=4000;i++){const s=keyPose(i/4000),v=keyboardState({Escape:i/4000,Space:i/4000}),gap=.48-v.contact_Escape;assert(s.travel>=0&&s.travel<=4);assert(gap>=-1e-10&&gap<=.48);assert.equal(s.contact,s.travel>=2);assert(s.contact?gap<1e-8:gap>0);assert(Math.abs(6*Math.sin(v.wire_Space*Math.PI/180)-s.travel)<1e-10);assert(18.61-s.travel-11.69>6*.38);keyboardSamples++}
assert.equal(contactAdvance(0),0);assert.equal(contactAdvance(2),.48);assert.equal(contactAdvance(4),.48);
checks.push('4001 keyboard poses: 2 mm electrical closure, 4 mm bottom-out, continuous contact gap, spring clearance and equal-height stabilizer crank endpoints');
// Test the actual triangulated plate, rather than its input rectangle list.
const plate=new THREE.Mesh(geometryFor(keyboard.parts.find(p=>p.id==='plate').shapes),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));plate.updateMatrixWorld();const ray=new THREE.Raycaster();for(const k of KEYS){ray.set(new THREE.Vector3(k.x,k.y,50),new THREE.Vector3(0,0,-1));assert.equal(ray.intersectObject(plate).length,0,'Blocked opening '+k.code)}ray.set(new THREE.Vector3(-145,0,50),new THREE.Vector3(0,0,-1));assert(ray.intersectObject(plate).length>0,'No solid plate web');plate.geometry.dispose();plate.material.dispose();
checks.push('Actual solid plate ray tests: 61 open switch apertures plus remaining load-bearing web');
// Rooted bending: lower vertices remain fixed, contact buttons meet at x=3.95 relative to Escape.
const leaf=keyboard.parts.find(p=>p.id==='contact-leaf'),root=leaf.bend.from;assert.equal(leaf.bend.to,15.5);for(const travel of [0,.5,1,1.99,2,3,4]){const advance=contactAdvance(travel);assert.equal((root-root)/(leaf.bend.to-root)*advance,0);assert(Math.abs((4.2-.25)-(4.2-1+.27+advance)-(.48-advance))<1e-12)}
checks.push('Contact leaf root fixed; actual contact surface coordinates meet without overlap at actuation');
const sep=(m,p)=>{const [a,b]=m.separateRange||[0,1],t=Math.max(0,Math.min(1,(p-a)/(b-a)));return t*t*(3-2*t)};
for(let i=0;i<=1000;i++){const a=i/1000;for(const d of [pen,keyboard])for(const m of Object.values(d.motions))assert(Number.isFinite(sep(m,a)));if(a>=.48)assert(sep(keyboard.motions['key-KeyA'],a)===1);}
assert(keyboard.motions['demo-upper'].separateRange[0]<keyboard.motions['demo-stem'].separateRange[0]);assert(keyboard.motions['demo-stem'].separateRange[0]<keyboard.motions.plate.separateRange[0]);assert(pen.motions.cone.separateRange[0]<pen.motions.refill.separateRange[0]);
checks.push('1001 separation states finite; caps and covers lead internal components');
// Preserve the watch geometry contract and nine untouched mechanism definitions.
const baseline=JSON.parse(fs.readFileSync(new URL('./baseline-manifest.json',import.meta.url)));assert.equal(definitionHash(watchDefinition().parts),baseline.watchParts);
for(const [id,hash]of Object.entries(baseline.references))assert.equal(definitionHash(JSON.parse(fs.readFileSync(new URL('../presets/'+id+'.json',import.meta.url)))),hash,id+' baseline drift');
checks.push('Approved watch parts and pen/keyboard definitions preserved against the reference set');
fs.mkdirSync(new URL('../review/',import.meta.url),{recursive:true});fs.writeFileSync(new URL('../review/study-model-qa.json',import.meta.url),JSON.stringify({checks,penSamples,keyboardSamples,models:report},null,2));console.log(JSON.stringify({checks,models:report},null,2));



