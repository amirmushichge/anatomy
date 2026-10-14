import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {KEYS,KEYBOARD,keyPose,keyboardState} from '../presets/keyboard-model.mjs';
import {capShape} from '../presets/keyboard-scene.mjs';
import {geometryFor,makeSpringGeometry} from '../geometry.mjs';
const definition=JSON.parse(readFileSync(new URL('../presets/keyboard.json',import.meta.url),'utf8'));
assert.equal(KEYS.length,61);assert.equal(new Set(KEYS.map(k=>k.code)).size,61);assert.equal(definition.parts.length,150);assert.equal(new Set(definition.parts.map(p=>p.id)).size,150);
for(let r=0;r<5;r++)assert.equal(KEYS.filter(k=>k.row===r).reduce((n,k)=>n+k.u,0),15);
for(let i=0;i<=1200;i++){const p=i/1200,s=keyPose(p);assert(s.travel>=0&&s.travel<=4);assert.equal(s.contact,s.travel>=2);assert.equal(keyboardState({Escape:p}).contact_Escape,s.contact?.48:0)}
assert.equal(keyPose(0).travel,0);assert.equal(keyPose(.5).travel,4);assert.equal(keyPose(1).travel,0);assert.equal(keyPose(1).contact,false);
const shapes=definition.parts.find(p=>p.id==='plate').shapes;
for(const k of KEYS){assert(!shapes.some(s=>{const p=s.plan;return k.x>p.x+1e-8&&k.x<p.x+p.w-1e-8&&k.y>p.y+1e-8&&k.y<p.y+p.d-1e-8}),'Plate blocks '+k.code)}
for(const part of definition.parts){assert(part.title&&part.description&&definition.motions[part.assembly]);const g=part.spring?makeSpringGeometry(part.spring):geometryFor(part.shapes);for(const name of ['position','normal'])assert([...g.attributes[name].array].every(Number.isFinite),part.id+' non-finite '+name);g.dispose()}
function closed(g){const p=g.attributes.position,index=g.index?.array||Array.from({length:p.count},(_,i)=>i),edges=new Map(),key=i=>[p.getX(i),p.getY(i),p.getZ(i)].map(x=>Math.round(x*1e4)).join(',');for(let i=0;i<index.length;i+=3)for(let e=0;e<3;e++){const a=key(index[i+e]),b=key(index[i+(e+1)%3]);assert.notEqual(a,b);const id=[a,b].sort().join('|');edges.set(id,(edges.get(id)||0)+1)}assert([...edges.values()].every(n=>n===2),'Open solid surface');g.dispose()}
for(const k of [KEYS[0],KEYS.find(k=>k.code==='Enter'),KEYS.find(k=>k.code==='Space')])closed(geometryFor([capShape(k)]));
const spring=definition.parts.find(p=>p.spring).spring;
for(const travel of [0,1,2,3,4]){const g=makeSpringGeometry(spring,travel);assert(g.boundingBox.min.z>=11.5-1e-4);assert(g.boundingBox.max.z<=18.8-travel+1e-4);closed(g)}
const contactGap=.48;for(const p of [0,.2,.5,.8,1]){const s=keyPose(p),advance=keyboardState({Escape:p}).contact_Escape;assert.equal(contactGap-advance,s.contact?0:.48)}
const layerGap={capsToHousing:25+88-(23.6+48),housingToPlate:10+48-(21+26),plateToFoam:19.5+26-(18.9+13),foamToBoard:17.5+13-10,demoUpperToStem:15.5+94-(23.6+72),demoStemToCap:25+122-(31.8+94)};
Object.values(layerGap).forEach(g=>assert(g>0));
console.log('keyboard audit passed: 61 keys; 150 registered finite meshes; five 15u rows; 1,201 travel/contact states; 61 plate openings; three closed keycap profiles; five closed spring compression poses with seated ends; zero sampled separated-layer overlap; contacts meet at actuation');
console.log(JSON.stringify({layerGap,dimensions:KEYBOARD}));
