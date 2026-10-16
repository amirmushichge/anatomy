import {CATALOG,ROLLOUT_IDS} from './study-catalog.mjs';
import {mechanism} from './presets/mechanisms.mjs';
/** State adapters keep mechanism-specific state out of the shared study panel. */
const pen={
 progress:s=>s.progress,
 seek:(s,p)=>{s.clicks=Math.max(1,s.clicks);s.progress=p},
 begin:s=>{s.clicks++;s.progress=0},
 chapter:()=>{},capture:()=>null,restore:()=>{},
 status:(s,v)=>v.phase,
 steps:[.2,.48,.68,.86,1],
 shortTitles:['Push the cam.','Index one notch.','Catch or release.','Return on the spring.','Advance the ball tip.'],
 shortText:['Straight ribs guide the button. Its crown pushes the cam against the return spring.','Crown and sleeve slopes turn the cam 60° per click.','One click catches the followers on ledges. The next sends them into deep slots.','The fixed front seat lets the spring push the refill back to its cam stop.','The refill advances 3 mm. Ink feeds the rolling ball; the cone supports its tip.']
};
const keyboard={
 progress:s=>s.cycles[s.key]??1,
 seek:(s,p)=>{s.cycles[s.key]=p;s.presses=Math.max(1,s.presses)},
 begin:s=>{s.cycles[s.key]=0;s.presses++},
 chapter:(s,c)=>{s.detail=s.detailTarget=0;s.key=c.key||'Escape'},
 capture:s=>s.detailTarget,
 restore:(s,detail)=>{s.detailTarget=detail??0},
 status:(s,v)=>v['closed_'+s.key]?'Contact closed':'Contact open',
 steps:[.1,.16,.32,.64,.82,1],
 shortTitles:['Press the stem.','Compress the spring.','Close at 2 mm.','Scan the matrix.','Keep both ends level.'],
 shortText:['The cap and guided stem move together through a 4 mm stroke.','The upper coil follows the stem; its lower seat stays fixed.','The leaf meets the fixed contact at 2 mm. The key still has 2 mm left to travel.','Rows, columns and diodes identify the key. The controller sends its event over USB.','A pivoting wire links two sliders so both ends of the spacebar move together.']
};
const adapters=Object.fromEntries(ROLLOUT_IDS.map(id=>[id,{progress:s=>s.progress,seek:(s,p)=>{s.cycles=Math.max(1,s.cycles);s.progress=p;s.preview=undefined},begin:s=>{if(id==='hdd')s.armFrom=mechanism(id,s).pose.arm;s.cycles++;s.progress=0;s.preview=undefined},chapter:(s,c)=>{if(c.mode!==undefined)s.mode=c.mode;if(c.phase!==undefined){s.cycles=Math.max(1,s.cycles);s.progress=c.phase;s.preview=undefined}},capture:s=>({mode:s.mode}),restore:(s,v)=>{if(v)s.mode=v.mode},status:(s,v)=>{const r=mechanism(id,s).readouts;return id==='engine'?r[1][1]:id==='pump'?r[2][1]:id==='motor'?r[2][1]:id==='hdd'&&s.mode?'Parking mode':r.slice(0,2).map(x=>x[1]).join(' · ')},steps:[.125,.25,.375,.5,.625,.75,.875,1],shortTitles:CATALOG[id]?.chapters.map(c=>c.shortTitle||c.title),shortText:CATALOG[id]?.chapters.map(c=>c.shortText||c.text)}]));
export const STUDY_ADAPTERS={...adapters,pen,keyboard};
export const studyAdapter=id=>STUDY_ADAPTERS[id]||null;
