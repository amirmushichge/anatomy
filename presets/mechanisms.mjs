import {watchInitial,watchPose} from './watch-model.mjs';
const rad=Math.PI/180,clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),ease=v=>v*v*(3-2*v);
export const NEW_IDS=['lens','watch','gamepad','lock','hub','engine','motor','speaker','pump','hdd'];
export function initialMechanism(id){if(id==='watch')return watchInitial();return {cycles:0,progress:1,preview:undefined,paused:false,phase:0,mode:0,param:id==='lens'?5.6:id==='speaker'?80:50,speed:1,apart:0,apartTarget:0}}
export const durations={lens:3,watch:4,gamepad:3,lock:7,hub:6,engine:8,motor:4,speaker:4,pump:5,hdd:5};
export function mechanism(id,s){if(id==='watch')return watchPose(s);
  const p=s.preview??s.progress,t=(s.cycles-1+Math.min(p,1)),theta=Math.max(0,t)*360,v={},out={pose:v,readouts:[],primary:'Cycle',secondary:'',param:null};
  if(id==='lens'){
    const shift=4*(.5-.5*Math.cos(p*Math.PI*2));v.focus=s.cycles&&!s.mode?shift:0;v.focusAngle=v.focus*24;
    // Nine overlapping iris leaves, tangential pivots, inward travel narrows aperture.
    const aperture=s.mode&&s.cycles?s.param+((s.param<9?16:2)-s.param)*Math.sin(p*Math.PI)**2:s.param,d=50/aperture;v.aperture=aperture;v.irisAngle=Math.acos((d/2+14.5)/27)/rad;v.irisDrive=v.irisAngle*.35;
    v.detail=s.mode;out.primary=s.mode?'Iris cycle':'Focus cycle';out.secondary='Iris';out.param={label:'Aperture',min:2,max:16,step:.1,value:s.param,unit:'f/'+s.param.toFixed(1)};
    out.readouts=[['Aperture','f/'+aperture.toFixed(1)],['Focus travel',v.focus.toFixed(1)+' mm'],['Iris opening',d.toFixed(1)+' mm']];
  }else if(id==='gamepad'){
    const a=s.cycles?Math.sin(p*Math.PI)**2:0;v.stickX=(s.param-50)/50*18*a;v.stickY=12*a;v.trigger=16*a;v.button=1.2*a;v.pad=Math.min(1,v.button);v.buttonClosed=v.button>=1?1:0;v.rumble=theta*12;v.rumbleOn=a>.1?1:0;
    out.primary='Input cycle';out.param={label:'Stick X',min:0,max:100,step:1,value:s.param,unit:((s.param-50)/50).toFixed(2)};
    out.readouts=[['Stick X',((s.param-50)/50*a).toFixed(2)],['Trigger',Math.round(a*100)+'%'],['Button',v.buttonClosed?'Closed':'Open']];
  }else if(id==='lock'){
    // Insert, align all five joints, turn, return, withdraw. Rotation cannot
    // begin before insertion completes and withdrawal waits for zero angle.
    const insert=p<.25?ease(p/.25):p>.85?1-ease((p-.85)/.15):1;
    const turn=p<.35?0:p<.55?ease((p-.35)/.2):p<.65?1:p<.85?1-ease((p-.65)/.2):0;
    v.key=-(1-insert)*37;v.plug=90*turn;v.aligned=insert>=1?1:0;
    [2.5,1.4,3.2,2,2.8].forEach((h,i)=>{v['pin'+i]=h*insert;v['pinY'+i]=-h*insert*Math.sin(v.plug*rad);v['pinZ'+i]=h*insert*Math.cos(v.plug*rad)});
    out.primary='Use key';out.readouts=[['Key',insert>=1?'Inserted':insert<=0?'Removed':'Moving'],['Plug',Math.round(v.plug)+'°'],['Shear line',v.aligned?'Clear':'Blocked']];
  }else if(id==='hub'){
    // Ns=24, Nr=72; sun fixed. Ring input -> carrier .75; carrier input
    // -> ring 4/3; direct clutch -> 1. Planet spin satisfies Willis equation.
    const ratio=[.75,1,4/3][s.mode];v.sun=0;v.carrier=s.mode===0?theta*.75:theta;v.ring=v.carrier*4/3;v.output=theta*ratio;v.input=theta;
    for(let i=0;i<3;i++){const a=(v.carrier+i*120)*rad;v['planetX'+i]=24*Math.cos(a)-24*Math.cos(i*120*rad);v['planetY'+i]=24*Math.sin(a)-24*Math.sin(i*120*rad);v['planet'+i]=2*v.carrier+i*120+7.5}
    v.clutch=s.mode*5;out.primary='Drive revolution';out.secondary='Gear '+(s.mode+1);out.readouts=[['Gear',String(s.mode+1)],['Ratio',ratio.toFixed(3)+'×'],['Output',Math.round(v.output)+'°']];
  }else if(id==='engine'){
    const a=theta*2%720,r=18,l=70,c=Math.cos(a*rad),sin=Math.sin(a*rad),z=r*c+Math.sqrt(l*l-r*r*sin*sin);
    v.crank=a;v.cam=-a/2;v.piston=z-(r+l);v.rodX=r*sin;v.rodZ=r*c-r;v.rodAngle=Math.asin(r*sin/l)/rad;
    v.intake=a<180?7*Math.sin(a*rad):0;v.exhaust=a>=540?7*Math.sin((a-540)*rad):0;v.spark=a>=355&&a<=365?1:0;v.rocker0=-Math.asin(v.intake/26.5)/rad;v.rocker1=-Math.asin(v.exhaust/15.5)/rad;
    out.primary='Four strokes';out.readouts=[['Crank',Math.round(a)+'°'],['Stroke',['Intake','Compression','Power','Exhaust'][Math.floor(a/180)]],['Piston',(r+l-z).toFixed(1)+' mm']];
  }else if(id==='motor'){
    const polarity=s.mode?-1:1;v.rotor=theta*polarity;const positive=Math.floor((((s.mode?180:360)-v.rotor%360)%360+360)%360/120);for(let i=0;i<3;i++)v['comm'+i]=i===positive?1:0;out.primary='Rotor revolution';out.secondary=s.mode?'Reverse −':'Forward +';out.readouts=[['Rotor',Math.round(v.rotor%360)+'°'],['Supply',s.mode?'−6 V':'+6 V'],['Commutator','Segment '+String.fromCharCode(65+positive)+' +']];
  }else if(id==='speaker'){
    // Physical sinusoidal displacement; scene time is deliberately slowed.
    v.cone=s.cycles?1.8*Math.sin(theta*rad*2):0;v.coilActive=Math.abs(v.cone)>.1?1:0;out.primary='2 oscillations';out.param={label:'Tone',min:40,max:200,step:1,value:s.param,unit:s.param+' Hz'};out.readouts=[['Tone',s.param+' Hz'],['Excursion',v.cone.toFixed(2)+' mm'],['Scene time','1/'+(s.param*2)+'×']];
  }else if(id==='pump'){
    const travel=180*(.5-.5*Math.cos(p*Math.PI*2)),compress=p>.5;v.piston=travel;
    // Isothermal chamber from 1 bar absolute; outlet opens at 3 bar absolute.
    const volume=20+travel,pressure=s.cycles===0?1:compress?Math.min(3,200/volume):Math.max(1,(s.cycles>1?3:1)*20/volume);
    v.inlet=!compress&&travel>0&&pressure<=1?1.1:0;v.outlet=s.cycles&&compress&&p<1&&200/volume>=3?1.1:0;v.flow=v.outlet?1:0;
    out.primary='Pump stroke';out.readouts=[['Piston',travel.toFixed(0)+' mm'],['Chamber',pressure.toFixed(2)+' bar abs'],['Valve',v.outlet?'Outlet open':v.inlet?'Inlet open':'Closed']];
  }else if(id==='hdd'){
    v.spindle=theta*4;v.arm=s.cycles?(s.armFrom||0)+((s.mode?-30:s.param/100*24)-(s.armFrom||0))*ease(Math.min(1,p/.3)):0;v.read=s.cycles&&!s.mode&&p>.3&&p<1?1:0;out.primary=s.mode?'Park heads':'Seek & read';out.param={label:'Target track',min:0,max:100,step:1,value:s.param,unit:Math.round(s.param)+'%'};
    // Head position follows the physical actuator arc rather than linear seek.
    const r=Math.hypot(23+47*Math.cos((-150+v.arm)*rad),54+47*Math.sin((-150+v.arm)*rad));
    out.readouts=[['Track radius',r.toFixed(1)+' mm'],['Actuator',v.arm.toFixed(1)+'°'],['Spindle','7200 rpm · slowed']];
  }
  return out;
}
