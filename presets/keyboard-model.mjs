export const KEYBOARD=Object.freeze({pitch:19.05,travel:4,actuation:2,duration:1.2,slow:.18,width:302,depth:112});
const rows=[
  [['Esc','Escape'],...Array.from({length:10},(_,i)=>[String((i+1)%10),'Digit'+((i+1)%10)]),['−','Minus'],['=','Equal'],['Backspace','Backspace',2]],
  [['Tab','Tab',1.5],...'QWERTYUIOP'.split('').map(k=>[k,'Key'+k]),['[','BracketLeft'],[']','BracketRight'],['\\','Backslash',1.5]],
  [['Caps','CapsLock',1.75],...'ASDFGHJKL'.split('').map(k=>[k,'Key'+k]),[';','Semicolon'],["'",'Quote'],['Enter','Enter',2.25]],
  [['Shift','ShiftLeft',2.25],...'ZXCVBNM'.split('').map(k=>[k,'Key'+k]),[',','Comma'],['.','Period'],['/','Slash'],['Shift','ShiftRight',2.75]],
  [['Ctrl','ControlLeft',1.25],['Win','MetaLeft',1.25],['Alt','AltLeft',1.25],['','Space',6.25],['Alt','AltRight',1.25],['Fn','Fn',1.25],['Menu','ContextMenu',1.25],['Ctrl','ControlRight',1.25]]
];
export const KEYS=rows.flatMap((row,r)=>{let left=-KEYBOARD.pitch*7.5;return row.map(([label,code,u=1])=>{const key={label,code,u,x:left+u*KEYBOARD.pitch/2,y:(4-r)*KEYBOARD.pitch+10,row:r};left+=u*KEYBOARD.pitch;return key})});
export const smooth=x=>{x=Math.min(1,Math.max(0,x));return x*x*(3-2*x)};
export function keyPose(progress){
  const p=Math.min(1,Math.max(0,progress));
  const travel=4*(p<.32?smooth(p/.32):p<.64?1:1-smooth((p-.64)/.36));
  return {travel,contact:travel>=2,stable:p===1,progress:p};
}
export function contactAdvance(travel){return .48*smooth(Math.min(1,travel/KEYBOARD.actuation))}
export function keyboardState(cycles){const state={};for(const [code,p]of Object.entries(cycles)){const s=keyPose(p);state['travel_'+code]=s.travel;state['contact_'+code]=contactAdvance(s.travel);state['closed_'+code]=s.contact?1:0;state['wire_'+code]=Math.asin(Math.min(1,s.travel/6))*180/Math.PI}return state}
