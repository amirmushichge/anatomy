import * as THREE from 'three';
import {toCreasedNormals,mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

const V=p=>new THREE.Vector3(...p);
const point=(f,s,u,v)=>f.o.map((o,i)=>o+s*f.a[i]+u*f.u[i]+v*f.v[i]);
const radial=(f,s,r,d)=>point(f,s,r*Math.cos(d),r*Math.sin(d));
const clean=face=>face.filter((p,i)=>!p.every((v,j)=>Math.abs(v-face[(i+face.length-1)%face.length][j])<1e-7));
const key=face=>face.map(p=>p.map(v=>v.toFixed(6)).join(',')).sort().join('|');
function prism(f,poly,a,b) {
  const front=poly.map(([u,v])=>point(f,a,u,v)),back=poly.map(([u,v])=>point(f,b,u,v));
  return [front,back,...poly.map((_,i)=>[front[i],front[(i+1)%poly.length],back[(i+1)%poly.length],back[i]])];
}
function roundedPlan(p){const out=[];for(const [x,y,start]of [[p.x+p.w-p.r,p.y+p.r,-90],[p.x+p.w-p.r,p.y+p.d-p.r,0],[p.x+p.r,p.y+p.d-p.r,90],[p.x+p.r,p.y+p.r,180]])for(let i=0;i<=5;i++){const a=(start+i*18)*Math.PI/180;out.push([x+p.r*Math.cos(a),y+p.r*Math.sin(a)])}return out}
function facesOf(s) {
  if(s.kind==='mesh')return s.faces.map(face=>face.map(i=>s.vertices[i]));
  if(s.kind==='prism')return prism(s.F,s.poly,s.a,s.b);
  if(s.kind==='slab')return prism({o:[0,0,0],a:[0,0,1],u:[1,0,0],v:[0,1,0]},roundedPlan(s.plan),s.z,s.z+s.h);
  if(s.kind==='coneSector') {
    const [a,b,r0,r1,i0,i1,d0,d1]=[s.a,s.b,s.r0,s.r1,s.inner0,s.inner1,s.d0*Math.PI/180,s.d1*Math.PI/180];
    const vs=[[a,i0,d0],[a,r0,d0],[a,r0,d1],[a,i0,d1],[b,i1,d0],[b,r1,d0],[b,r1,d1],[b,i1,d1]].map(([x,r,d])=>radial(s.F,x,r,d));
    return [[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]].map(face=>face.map(i=>vs[i]));
  }
  if(s.kind==='disc'||s.kind==='solid') {
    const profile=s.kind==='disc'?[[s.a,0],[s.a,s.r],[s.b,s.r],[s.b,0]]:[[s.profile[0][0],0],...s.profile,[s.profile.at(-1)[0],0]];
    const out=[];
    for(let i=0;i<profile.length-1;i++)for(let j=0;j<64;j++) {
      const [a,r0]=profile[i],[b,r1]=profile[i+1],d0=j*Math.PI/32,d1=(j+1)*Math.PI/32;
      out.push([radial(s.F,a,r0,d0),radial(s.F,a,r0,d1),radial(s.F,b,r1,d1),radial(s.F,b,r1,d0)]);
    }
    return out;
  }
  throw Error('Unsupported solid: '+s.kind);
}

// Neighbouring kit chunks share internal faces. Remove those before meshing;
// the result is an opaque solid, rather than a stack of outlined facets.
export function geometryFor(shapes) {
  if(shapes.length>1&&shapes.some(s=>s.kind==='plate'||s.kind==='ball')){const gs=shapes.map(s=>{let g=geometryFor([s]);if(g.index)g=g.toNonIndexed();g.deleteAttribute('uv');return g});const out=mergeGeometries(gs);gs.forEach(g=>g.dispose());out.computeBoundingBox();out.computeBoundingSphere();return out;}
  if(shapes.length===1&&shapes[0].kind==='plate'){
    const s=shapes[0],outline=new THREE.Shape(s.contour.map(p=>new THREE.Vector2(...p)));
    for(const points of s.holes||[]){const hole=new THREE.Path(points.map(p=>new THREE.Vector2(...p)));outline.holes.push(hole)}
    const b=s.bevel||0,g=new THREE.ExtrudeGeometry(outline,{depth:Math.max(.008,s.h-2*b),steps:1,bevelEnabled:b>0,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:12});
    g.translate(0,0,s.z+b);if(s.F){const m=new THREE.Matrix4().makeBasis(V(s.F.u),V(s.F.v),V(s.F.a));m.setPosition(V(s.F.o));g.applyMatrix4(m)}else if(s.orientation==='x'){g.rotateY(Math.PI/2);g.translate(...s.offset)}g.computeBoundingBox();g.computeBoundingSphere();return g;
  }
  if(shapes.length===1&&shapes[0].kind==='ball') {
    const s=shapes[0],g=new THREE.SphereGeometry(s.r,32,16);g.translate(...s.at);return g;
  }
  const faces=new Map();
  const chunks=shapes.flatMap(s=>{if(s.kind!=='annular')return [s];const n=Math.max(1,Math.ceil(Math.abs(s.d1-s.d0)/4)),out=[];for(let i=0;i<n;i++){const t=i/n,u=(i+1)/n;out.push({...s,kind:'coneSector',d0:s.d0+(s.d1-s.d0)*t,d1:s.d0+(s.d1-s.d0)*u})}return out});
  for(const shape of chunks){
    const fs=facesOf(shape).map(clean).filter(f=>f.length>=3);
    const all=fs.flat(),center=all.reduce((p,v)=>p.add(V(v)),new THREE.Vector3()).divideScalar(all.length);
    for(let face of fs){
      const n=V(face[1]).sub(V(face[0])).cross(V(face[2]).sub(V(face[0])));
      if(n.lengthSq()<1e-12)continue;
      const mid=face.reduce((p,v)=>p.add(V(v)),new THREE.Vector3()).divideScalar(face.length);
      if(shape.kind!=='mesh'&&n.dot(mid.sub(center))<0)face=face.slice().reverse();
      const k=key(face);if(faces.has(k))faces.set(k,null);else faces.set(k,face);
    }
  }
  const positions=[];
  for(const face of faces.values())if(face)for(let i=1;i<face.length-1;i++)positions.push(...face[0],...face[i],...face[i+1]);
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();
  const smooth=toCreasedNormals(geometry,Math.PI/5);smooth.computeBoundingBox();smooth.computeBoundingSphere();return smooth;
}

export function makeSpringGeometry(spec,advance=0){
  const segments=spec.segments||240,sides=spec.sides||10,bodyVertices=(segments+1)*(sides+1),positions=new Float32Array((bodyVertices+2*(sides+2))*3),normals=new Float32Array(positions.length),indices=[];
  for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,a+1,b,b,a+1,b+1)}
  for(let end=0;end<2;end++){const center=bodyVertices+end*(sides+2);for(let j=0;j<sides;j++)indices.push(center,center+1+j+(end?0:1),center+1+j+(end?1:0))}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));g.setAttribute('normal',new THREE.BufferAttribute(normals,3).setUsage(THREE.DynamicDrawUsage));g.setIndex(indices);g.userData={spec,segments,sides};updateSpringGeometry(g,advance);return g;
}
export function updateSpringGeometry(g,advance){
  const {spec:s,segments:n,sides:m}=g.userData,positions=g.attributes.position.array,normals=g.attributes.normal.array;
  const length=s.end-s.start-advance,total=s.turns*2*Math.PI,origin=s.origin||[0,0,0];
  const t=new THREE.Vector3(),normal=new THREE.Vector3(),binormal=new THREE.Vector3();
  for(let i=0;i<=n;i++){
    const share=i/n,a=share*total,x=s.start+(s.fixed==='start'?0:advance)+length*share;
    t.set(length,-s.radius*total*Math.sin(a),s.radius*total*Math.cos(a)).normalize();normal.set(0,Math.cos(a),Math.sin(a));binormal.crossVectors(t,normal).normalize();
    for(let j=0;j<=m;j++){
      const b=j/m*2*Math.PI,nx=normal.x*Math.cos(b)+binormal.x*Math.sin(b),ny=normal.y*Math.cos(b)+binormal.y*Math.sin(b),nz=normal.z*Math.cos(b)+binormal.z*Math.sin(b),at=(i*(m+1)+j)*3;
      positions[at]=origin[0]+x+s.wire*nx;positions[at+1]=origin[1]+s.radius*Math.cos(a)+s.wire*ny;positions[at+2]=origin[2]+s.radius*Math.sin(a)+s.wire*nz;
      normals[at]=nx;normals[at+1]=ny;normals[at+2]=nz;
    }
  }
  // Separate cap vertices give the two cut wire ends flat normals.
  const bodyVertices=(n+1)*(m+1);
  for(let end=0;end<2;end++){
    const a=end*total,x=end?s.end-(s.fixed==='start'?advance:0):s.start+(s.fixed==='start'?0:advance),base=bodyVertices+end*(m+2),ring=end*n*(m+1);
    t.set(length,-s.radius*total*Math.sin(a),s.radius*total*Math.cos(a)).normalize().multiplyScalar(end?1:-1);
    for(let j=0;j<m+2;j++){const at=(base+j)*3;if(j===0){positions[at]=origin[0]+x;positions[at+1]=origin[1]+s.radius*Math.cos(a);positions[at+2]=origin[2]+s.radius*Math.sin(a)}else{const source=(ring+j-1)*3;for(let c=0;c<3;c++)positions[at+c]=positions[source+c]}normals[at]=t.x;normals[at+1]=t.y;normals[at+2]=t.z}
  }
  if(s.axis){const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1,0,0),V(s.axis).normalize()),v=new THREE.Vector3();for(let i=0;i<positions.length;i+=3){v.fromArray(positions,i).sub(V(origin)).applyQuaternion(q).add(V(origin)).toArray(positions,i);v.fromArray(normals,i).applyQuaternion(q).toArray(normals,i)}}
  g.attributes.position.needsUpdate=true;g.attributes.normal.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();
}
