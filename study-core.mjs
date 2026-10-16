/** Shared drawing language. Roles belong to a mechanism, colours to this library. */
export const STUDY_PALETTE=Object.freeze({orange:0xe6a568,cyan:0x71cbd8,pink:0xe39cbe,blue:0x829ee2,yellow:0xe3c65e});
export const DRAWING=Object.freeze({white:0xf5f5f2,soft:0xe7e9e8,metal:0xd8dddd,edge:0x62686b});
export const hex=color=>'#'+color.toString(16).padStart(6,'0');
export const role=(short,color)=>({short,color:STUDY_PALETTE[color],hex:hex(STUDY_PALETTE[color])});
export function drawingPart(part,system,roles,{tone=DRAWING.white,...extra}={}){
 Object.assign(part,{system,...extra});part.material={color:tone,edgeColor:DRAWING.edge,edgeOpacity:.48,accent:roles[system]?.color??0x9da7b0,finish:'drawing'};return part;
}
export function stagedMotion(separate,range=[0,1],extra={}){return{separate,separateRange:range,...extra}}
export function studyMarkup(prefix,chapters,roles,{whole='Whole object ↗',action='Play cycle',next='Next →'}={}){
 return `<div class="study-chapters" aria-label="Functional systems">${chapters.map((c,i)=>`<button data-study-chapter="${i}" aria-label="${i+1}. ${roles[c.system].short}" title="${roles[c.system].short}" style="--system:${roles[c.system].hex}">${i+1}</button>`).join('')}</div><div class="study-topic"><span id="${prefix}-family"></span><span id="${prefix}-count"></span></div><h2 id="${prefix}-question"></h2><p id="${prefix}-explanation"></p><p id="${prefix}-fact" class="study-fact"></p><div class="study-guide-actions"><button id="${prefix}-whole">${whole}</button><button id="${prefix}-action">${action}</button><button id="${prefix}-next">${next}</button></div>`;
}
export function validateStudy(definition,study){
 const ids=new Set(definition.parts.map(p=>p.id));if(ids.size!==definition.parts.length)throw Error('Duplicate part id');
 for(const p of definition.parts){if(!definition.motions[p.assembly])throw Error('Missing assembly '+p.id);if(p.system&&!study.roles[p.system])throw Error('Unknown role '+p.id);if(!p.title||!p.description)throw Error('Missing explanation '+p.id)}
 for(const c of study.chapters){if(!study.roles[c.system]||!c.text||!c.title||!c.focus.length)throw Error('Incomplete chapter');for(const id of c.focus)if(!ids.has(id))throw Error('Missing focus '+id)}
 return{parts:ids.size,chapters:study.chapters.length,roles:Object.keys(study.roles)};
}
