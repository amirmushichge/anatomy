import {STUDY_PALETTE} from '../study-core.mjs';
export const WATCH={diameter:36.6,caseDiameter:42,frequency:2.5,beatsPerSecond:5,escapeTeeth:15,escapeStep:12,scale:.2,reserve:48};
export const WATCH_SYSTEMS={
 energy:{title:'Store energy',short:'Energy',color:STUDY_PALETTE.orange,hex:'#e6a568'},
 train:{title:'Transmit torque',short:'Train',color:STUDY_PALETTE.cyan,hex:'#71cbd8'},
 escapement:{title:'Release one beat',short:'Escapement',color:STUDY_PALETTE.pink,hex:'#e39cbe'},
 oscillator:{title:'Keep the rhythm',short:'Balance',color:STUDY_PALETTE.blue,hex:'#829ee2'},
 display:{title:'Count the time',short:'Display',color:STUDY_PALETTE.yellow,hex:'#e3c65e'}
};
export const WHEEL_SPECS=[
 {id:'center',at:[0,0],teeth:80,module:.1,z:.9,pinion:10,pinionModule:.12,pinionZ:1.55},
 {id:'third',at:[3.1,Math.sqrt(4.5**2-3.1**2)],teeth:75,module:.1,z:2.2,pinion:10,pinionModule:.1,pinionZ:.9},
 {id:'fourth',at:[5.5,Math.sqrt(4.5**2-3.1**2)-Math.sqrt(4.25**2-2.4**2)],teeth:80,module:.075,z:3,pinion:10,pinionModule:.1,pinionZ:2.2}
];
const fourth=WHEEL_SPECS[2].at;
export const ESCAPE=[fourth[0]+2.4,fourth[1]-Math.sqrt(3.3**2-2.4**2)];
export const BALANCE=[.2,-10.1],PALLET=[4.7,-6.2],BARREL=[-5.4,0];
export const WATCH_CHAPTERS=[
 {system:'energy',title:'A spring stores the work of winding.',text:'Turn the crown: the arbor winds the mainspring. Its outer end pulls the barrel, feeding the train.',fact:'Winding adds 4 h to this teaching model.',part:'mainspring',focus:['barrel-floor','mainspring','barrel-wall','ratchet'],apart:.64},
 {system:'train',title:'The wheels trade torque for speed.',text:'Each wheel drives the next pinion. The centre turns once an hour; the fourth wheel once a minute.',fact:'80:10 × 75:10 = 60:1',part:'third-wheel',focus:['center-wheel','third-wheel','fourth-wheel','escape-wheel'],apart:.46},
 {system:'escapement',title:'The escapement releases one beat.',text:'Two pallet stones alternate the lock. Near each centre crossing, the fork releases a half-tooth and returns an impulse to the balance.',fact:'15 teeth · 12° per beat',part:'pallet-fork',focus:['escape-wheel','pallet-fork','entry-pallet','exit-pallet','impulse-jewel'],apart:.46},
 {system:'oscillator',title:'The balance sets the interval.',text:'The hairspring pulls the balance back. One full oscillation has two beats; the fork supplies a short impulse, then lets it swing freely.',fact:'2.5 oscillations/s = 5 beats/s',part:'balance',focus:['balance','hairspring','balance-staff','pallet-fork'],apart:.46},
 {system:'display',title:'The hands count those releases.',text:'The fourth wheel carries small seconds. Under the plate, a 12:1 motion-work train drives the hour hand from the minute arbor.',fact:'300 beats/min · 18,000 beats/h',part:'minutes-hand',focus:['minutes-hand','hours-hand','seconds-hand','dial-ring'],apart:0}
];
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x)),smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
export function watchInitial(){return{cycles:0,progress:1,paused:true,running:false,elapsed:0,param:8,winding:0,windTarget:0,stepTo:null,speed:1,apart:0,apartTarget:0,mode:0,chapter:-1};}
export function watchPose(s){
 const seconds=Math.max(0,s.elapsed||0),beats=seconds*WATCH.beatsPerSecond,k=Math.floor(beats+1e-9),f=beats-k;
 const release=smooth((f-.015)/.17),step=k+release,powered=s.param>0;
 const escape=step*WATCH.escapeStep,fourth=-escape/10,third=-fourth/7.5,center=-third/8,barrel=-center/8;
 const balance=powered?270*Math.sin(beats*Math.PI):0,pallet=(k%2?1:-1)*7*(1-2*release);
 const phase=!powered?'No power':f<.015?(k%2?'Exit lock':'Entry lock'):f<.045?'Unlock':f<.15?'Impulse':f<.185?'Drop':k%2?'Entry lock':'Exit lock';
 return{pose:{escape,fourth,third,center,barrel,balance,pallet,seconds:-fourth,minutes:-center,hours:-center/12,motionMinute:-center/3,motionHour:center/12,winding:(s.winding||0)*360,springTwist:(s.winding||0)*360-barrel,windingWheel:(s.winding||0)*360*32/28,windingIdler:-(s.winding||0)*360*32/28,crown:(s.winding||0)*960,hairspring:balance,energy:powered?1:0},beats:Math.floor(step+1e-9),seconds,phase,powered,remaining:s.param,release,
 readouts:[['Watch time',seconds.toFixed(2)+' s'],['Beat count',String(k).padStart(2,'0')],['Escapement',phase]],primary:!powered?'Wind to start':s.running?'Pause':'Run movement',secondary:'',param:{label:'Power reserve',min:0,max:48,step:1,value:s.param,unit:s.param.toFixed(1)+' h'}};
}
export function advanceWatch(s,dt){s.winding+=(s.windTarget-s.winding)*(1-Math.exp(-dt/.08));if(Math.abs(s.windTarget-s.winding)<.0001)s.winding=s.windTarget;if(s.param<=0){s.running=false;s.paused=true;s.stepTo=null}const stepping=s.stepTo!==null&&s.stepTo>s.elapsed;if((s.running&&!s.paused||stepping)&&s.param>0){const time=Math.min(dt*WATCH.scale*s.speed,s.param*3600,stepping?s.stepTo-s.elapsed:Infinity);s.elapsed+=time;s.param=Math.max(0,s.param-time/3600);if(stepping&&Math.abs(s.elapsed-s.stepTo)<1e-8){s.elapsed=s.stepTo;s.stepTo=null}if(s.param===0){s.running=false;s.paused=true;s.stepTo=null}}return s.running&&!s.paused||s.stepTo!==null||s.winding!==s.windTarget;}
