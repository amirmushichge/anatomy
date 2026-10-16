export const DIM = Object.freeze({ length:140, diameter:10.8, travel:3, push:4.5, notch:60, duration:1.65, slow:0.18, springStart:117, springEnd:130, ball:0.7 });
export const MOVES = Object.freeze({ barrel:0, sleeve:-17, plunger:-36, cam:-5, refill:14, spring:25, cone:42 });
export const clamp = (x,a=0,b=1) => Math.min(b,Math.max(a,x));
export const smooth = x => {x=clamp(x);return x*x*(3-2*x)};
export const ramp = (x,a,b) => smooth((x-a)/(b-a));
export function pose(clicks, progress=1) {
  const p=clamp(progress), active=p<1, old=Math.max(0, clicks-1), from=old%2?DIM.travel:0, target=clicks%2?DIM.travel:0;
  if (!active) return { clicks, angle:clicks*DIM.notch, refill:target, plunger:0, phase:clicks%2?'Locked on ledge':'Resting in deep slot', tip:clicks%2?'Tip out':'Tip retracted', stable:true, progress:1 };
  const push=ramp(p,0,.32), turnA=ramp(p,.26,.5), turnB=ramp(p,.53,.72), release=ramp(p,.72,1);
  const driven=Math.max(from,DIM.push*push),travel=driven-(DIM.push-target)*release;
  const angle=old*DIM.notch+30*turnA+30*turnB;
  // The actuator has no retaining ledge: it returns even while the refill stays out.
  const plunger=DIM.push*push*(1-release);
  const phase=p<.26?'Plunger pushes cam':p<.53?'Crown faces start the turn':p<.72?'Sleeve teeth finish the index':clicks%2?'Spring seats cam on ledge':'Spring returns cam into slot';
  return {clicks, angle, refill:travel, plunger, phase, tip:138.85+travel>140?'Tip out · moving':'Tip inside · moving', stable:false, progress:p};
}
export function offset(group, state, apart) { return MOVES[group]*apart+(group==='plunger'?state.plunger:group==='cam'||group==='refill'?state.refill:0) }
