// Millimetres; every helper returns closed, opaque solid geometry.
export const TAU=Math.PI*2,deg=a=>a*Math.PI/180;
export const C={shell:0xd7dee3,dark:0x48535d,steel:0xaebbc5,bright:0xe9eef1,copper:0xbfa58a,rubber:0x68747e,glass:0xc3dce8};
export const Z=(x=0,y=0,z=0)=>({o:[x,y,z],a:[0,0,1],u:[1,0,0],v:[0,1,0]});
export const X=(x=0,y=0,z=0)=>({o:[x,y,z],a:[1,0,0],u:[0,1,0],v:[0,0,1]});
export const Y=(x=0,y=0,z=0)=>({o:[x,y,z],a:[0,1,0],u:[0,0,1],v:[1,0,0]});
export const box=(x,y,z,w,d,h,r=0)=>({kind:'slab',plan:{x,y,w,d,r},z,h});
export const disc=(F,a,b,r)=>({kind:'disc',F,a,b,r});
export const prism=(F,a,b,poly)=>({kind:'prism',F,a,b,poly});
export const sector=(F,a,b,r0,r1,inner0,inner1,d0=0,d1=360)=>({kind:'annular',F,a,b,r0,r1,inner0,inner1,d0,d1});
export const ring=(F,a,b,r,inner,d0=0,d1=360)=>sector(F,a,b,r,r,inner,inner,d0,d1);
export const ball=(x,y,z,r)=>({kind:'ball',at:[x,y,z],r});
export function beam(a,b,r){const v=b.map((x,i)=>x-a[i]),l=Math.hypot(...v),axis=v.map(x=>x/l),ref=Math.abs(axis[2])<.9?[0,0,1]:[0,1,0],u=[axis[1]*ref[2]-axis[2]*ref[1],axis[2]*ref[0]-axis[0]*ref[2],axis[0]*ref[1]-axis[1]*ref[0]],ul=Math.hypot(...u);u.forEach((_,i)=>u[i]/=ul);const vv=[axis[1]*u[2]-axis[2]*u[1],axis[2]*u[0]-axis[0]*u[2],axis[0]*u[1]-axis[1]*u[0]];return disc({o:a,a:axis,u,v:vv},0,l,r)}
export function polyTube(points,r){return points.slice(1).map((p,i)=>beam(points[i],p,r))}
export function gear(F,z,h,n,module=1,internal=false,phase=0){
  // Trapezoidal educational tooth profile, with real pitch radius and module.
  const pitch=n*module/2,root=pitch-1.25*module,tip=pitch+module,out=[];
  if(internal){out.push(ring(F,z,z+h,pitch+3*module,tip));for(let i=0;i<n;i++){const a=phase+i*360/n;out.push(sector(F,z,z+h,tip,tip,root,root,a-360/n*.22,a+360/n*.22))}}
  else{out.push(disc(F,z,z+h,root));for(let i=0;i<n;i++){const a=deg(phase+i*360/n),p=[[-.24,root],[-.15,tip],[.15,tip],[.24,root]].map(([s,r])=>{const t=a+s*TAU/n;return [r*Math.cos(t),r*Math.sin(t)]});out.push(prism(F,z,z+h,p))}}
  return out;
}
export function spiral(F,z,h,turns,r0,r1,width=.2){const vertices=[],faces=[],n=Math.ceil(turns*90),point=(ax,r,a)=>F.o.map((v,k)=>v+F.a[k]*ax+(F.u[k]*Math.cos(a)+F.v[k]*Math.sin(a))*r);for(let i=0;i<=n;i++){const a=i*turns*TAU/n,r=r0+(r1-r0)*i/n;vertices.push(point(z,r+width/2,a),point(z,r-width/2,a),point(z+h,r+width/2,a),point(z+h,r-width/2,a));if(i<n){const q=i*4,t=q+4;faces.push([q,q+1,t+1,t],[q+2,t+2,t+3,q+3],[q,t,t+2,q+2],[q+1,q+3,t+3,t+1])}}faces.push([0,2,3,1],[n*4,n*4+1,n*4+3,n*4+2]);return [{kind:'mesh',vertices,faces}]}
export function torus(F,a,r,wire){const steps=20,profile=[];for(let i=0;i<=steps;i++){const t=i*TAU/steps;profile.push([a+wire*Math.sin(t),r+wire*Math.cos(t)])}return {kind:'solid',F,profile}}
export function make(id,title,detail,camera={yaw:-1.3,pitch:.68}){
  const parts=[],motions={},assemblies=[],definition={id,title,parts,motions,assemblies,camera,autoFocusView:true};
  const motion=(id,separate=[0,0,0],extra={})=>{motions[id]={separate,...extra};return id};
  const add=(id,assembly,title,description,shapes,color=C.steel,extra={})=>{if(!motions[assembly])motion(assembly);parts.push({id,assembly,title,description,shapes,material:{color,edgeColor:0x7e8b94},...extra});return id};
  const assembly=(id,title,part)=>assemblies.push({id,title,part});
  const screw=(id,assembly,x,y,z,r=1,h=4)=>add(id,assembly,'Fastener · '+id.replaceAll('-',' '),'Clamps the adjoining pieces without obstructing the moving assembly.',[disc(Z(x,y),z,z+h,r*.58),disc(Z(x,y),z+h,z+h+.7,r),box(x-r*.65,y-.13,z+h+.7,r*1.3,.26,.08)],C.dark);
  const bearing=(id,assembly,F,a,b,inner,outer,count=8)=>{add(id+'-inner',assembly,'Inner bearing race','Locates the shaft and carries its load through the rolling elements.',[ring(F,a,b,inner+.5,inner)],C.steel);add(id+'-outer',assembly,'Outer bearing race','Transfers shaft loads into the fixed housing.',[ring(F,a,b,outer,outer-.5)],C.steel);const r=(inner+outer)/2;for(let i=0;i<count;i++){const t=i*TAU/count,p=F.o.map((v,k)=>v+F.a[k]*(a+b)/2+F.u[k]*r*Math.cos(t)+F.v[k]*r*Math.sin(t));add(id+'-ball-'+i,assembly,'Bearing ball '+(i+1),'Rolls between the inner and outer races to reduce friction.',[ball(...p,(outer-inner-1)/2)],C.bright)}};
  return {id,title,detail,definition,parts,motions,add,motion,assembly,screw,bearing};
}
