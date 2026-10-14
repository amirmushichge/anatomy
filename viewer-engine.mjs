import * as THREE from 'three';
import {geometryFor,makeSpringGeometry,updateSpringGeometry} from './geometry.mjs';

const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const V=a=>new THREE.Vector3(...a);
const DEFAULT={yaw:1.17,pitch:.46,zoom:1,roll:0};

/** Content-independent viewer: model state, geometry and descriptions are supplied. */
export class SceneViewer {
  constructor(canvas,definition,{inspectionPanel=null,onInspect=()=>{},onCamera=()=>{},onInteract=()=>{},onActivate=()=>{}}={}){
    this.inspectionPanel=inspectionPanel;
    this.canvas=canvas;this.definition=definition;this.onInspect=onInspect;this.onCamera=onCamera;this.onInteract=onInteract;this.onActivate=onActivate;
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));this.renderer.setClearColor(0xffffff);this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.world=new THREE.Scene();this.camera=new THREE.OrthographicCamera(-100,100,70,-70,.1,2000);this.camera.up.set(0,0,1);
    this.world.add(new THREE.AmbientLight(0xffffff,.82));
    const key=new THREE.DirectionalLight(0xffffff,1.12);key.position.set(-70,20,130);this.world.add(key);
    const fill=new THREE.DirectionalLight(0xffffff,.42);fill.position.set(30,100,35);this.world.add(fill);
    this.groups=new Map();this.parts=new Map();this.pickables=[];this.ray=new THREE.Raycaster();this.ndc=new THREE.Vector2();
    this.pinned=null;this.hovered=null;this.inspected=null;this.anchor=null;this._pointers=new Map();this.gestures=0;this.active=false;this._hoverTimer=0;
    this.defaults={...DEFAULT,...definition.camera};
    this.current={...this.defaults,center:new THREE.Vector3(),span:85};this.target={...this.defaults,center:this.current.center.clone(),span:85};
    this.state={};this.apart=0;
    this._build();this._bind();this.resize();this.current.roll=this.target.roll=this._homeRoll();this.fit(null,false);
  }
  _build(){
    for(const [id,motion]of Object.entries(this.definition.motions)){
      const group=new THREE.Group();group.userData.motion=motion;this.groups.set(id,group);this.world.add(group);
    }
    for(const part of this.definition.parts){
      const group=this.groups.get(part.assembly),pivot=group.userData.motion.pivot||[0,0,0];
      const geometry=part.spring?makeSpringGeometry(part.spring):geometryFor(part.shapes);
      geometry.translate(-pivot[0],-pivot[1],-pivot[2]);geometry.computeBoundingBox();
      const color=part.material?.color??0xe5e9ec,edgeColor=part.material?.edgeColor??0x7e8b94;
      const finish=part.material?.finish||(/rubber|foam|gasket|seal|grip|surround|cone|spider/i.test(part.id)?'matte':/shaft|gear|pin|screw|bearing|coil|wire|commutator|platter|rotor|spring|cone-front|front-cone/i.test(part.id)?'metal':'plastic');
      const material=new THREE.MeshPhongMaterial({color,shininess:finish==='metal'?42:finish==='matte'?2:12,specular:finish==='metal'?0x292929:finish==='matte'?0x030303:0x101010,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
      const mesh=new THREE.Mesh(geometry,material);mesh.userData.part=part;group.add(mesh);
      if(part.twist||part.flex){geometry.userData.restPositions=geometry.attributes.position.array.slice();geometry.userData.restNormals=geometry.attributes.normal.array.slice()}
      let edges=null;
      if(!part.spring&&part.outline!==false){edges=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,38),new THREE.LineBasicMaterial({color:edgeColor,transparent:true,opacity:.28,depthWrite:false}));mesh.add(edges)}
      if(part.flex&&edges)edges.geometry.userData.restPositions=edges.geometry.attributes.position.array.slice();
      if(part.label){
        const s=part.label,c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d'),fontSize=s.text.length>6?48:58;ctx.fillStyle='#42505a';ctx.font='400 '+fontSize+'px Manrope,Arial';if('letterSpacing' in ctx)ctx.letterSpacing=fontSize*-.04+'px';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s.text,256,64);
        const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const label=new THREE.Mesh(new THREE.PlaneGeometry(s.width,s.height),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3}));label.position.fromArray(s.at).sub(V(pivot));mesh.add(label);
      }
      this.parts.set(part.id,{mesh,edges,baseColor:color,edgeColor,part,lastAdvance:NaN});this.pickables.push(mesh);
    }
    this.setMechanism(this.state,0);
  }
  load(definition,state={}){
    clearTimeout(this._hoverTimer);this._pointers.clear();this.clear();
    for(const group of this.groups.values()){group.traverse(obj=>{obj.geometry?.dispose();if(obj.material){obj.material.map?.dispose();obj.material.dispose()}});this.world.remove(group)}
    this.groups.clear();this.parts.clear();this.pickables=[];this.definition=definition;this.defaults={...DEFAULT,...definition.camera};this.current={...this.defaults,center:new THREE.Vector3(),span:85};this.target={...this.defaults,center:this.current.center.clone(),span:85};this.state=state;this.apart=0;this.fitBox=null;this.referenceSpan=0;this._build();this.current.roll=this.target.roll=this._homeRoll();this.fit(null,false);this.gestures=0;
  }
  setMechanism(state,apart){
    this.state=state;this.apart=apart;
    for(const group of this.groups.values()){
      const m=group.userData.motion,p=V(m.pivot||[0,0,0]),move=V(m.separate||[0,0,0]).multiplyScalar(apart);
      if(m.positionFields)m.positionFields.forEach((field,i)=>{if(field)move.setComponent(i,move.getComponent(i)+(state[field]||0))});
      if(m.translateField)move.addScaledVector(V(m.axis||[1,0,0]),state[m.translateField]||0);
      if(m.liftField)move.addScaledVector(V(m.lift),state[m.liftField]||0);
      group.position.copy(p).add(move);
      if(m.rotateField)group.quaternion.setFromAxisAngle(V(m.rotateAxis),THREE.MathUtils.degToRad(state[m.rotateField]||0));
      if(m.rotationFields)group.rotation.set(...m.rotationFields.map(field=>THREE.MathUtils.degToRad(state[field]||0)));
    }
    for(const entry of this.parts.values())if(entry.part.spring){
      const advance=state[entry.part.spring.advanceField]||0;
      if(advance!==entry.lastAdvance){updateSpringGeometry(entry.mesh.geometry,advance);const pivot=this.groups.get(entry.part.assembly).userData.motion.pivot||[0,0,0];entry.mesh.geometry.translate(-pivot[0],-pivot[1],-pivot[2]);entry.mesh.geometry.computeBoundingBox();entry.mesh.geometry.computeBoundingSphere();entry.lastAdvance=advance}
    }
    for(const {part,mesh}of this.parts.values())if(part.twist){const s=part.twist,g=mesh.geometry,p=g.attributes.position.array,n=g.attributes.normal.array,rest=g.userData.restPositions,normal=g.userData.restNormals,pivot=this.groups.get(part.assembly).userData.motion.pivot||[0,0,0],cx=s.center[0]-pivot[0],cy=s.center[1]-pivot[1];for(let i=0;i<p.length;i+=3){const x=rest[i]-cx,y=rest[i+1]-cy,r=Math.hypot(x,y),a=(state[s.field]||0)*Math.PI/180*clamp((s.outer-r)/(s.outer-s.inner),0,1),c=Math.cos(a),sn=Math.sin(a);p[i]=cx+x*c-y*sn;p[i+1]=cy+x*sn+y*c;n[i]=normal[i]*c-normal[i+1]*sn;n[i+1]=normal[i]*sn+normal[i+1]*c}g.attributes.position.needsUpdate=true;g.attributes.normal.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere()}
    for(const {part,mesh,edges}of this.parts.values())if(part.flex){const s=part.flex;for(const g of [mesh.geometry,edges?.geometry].filter(Boolean)){const p=g.attributes.position.array,rest=g.userData.restPositions;for(let i=0;i<p.length;i+=3){const r=Math.hypot(rest[i]-s.center[0],rest[i+1]-s.center[1]);p[i+2]=rest[i+2]+(state[s.field]||0)*clamp((s.outer-r)/(s.outer-s.inner),0,1)}g.attributes.position.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere()}}
    this.world.updateMatrixWorld(true);
    this._paint();
  }
  bounds(state=this.state,apart=this.apart){
    const box=new THREE.Box3();
    for(const {mesh,part}of this.parts.values()){
      const m=this.groups.get(part.assembly).userData.motion,p=V(m.pivot||[0,0,0]).addScaledVector(V(m.separate||[0,0,0]),apart);
      if(m.positionFields)m.positionFields.forEach((field,i)=>{if(field)p.setComponent(i,p.getComponent(i)+(state[field]||0))});
      if(m.translateField)p.addScaledVector(V(m.axis||[1,0,0]),state[m.translateField]||0);
      if(m.liftField)p.addScaledVector(V(m.lift),state[m.liftField]||0);
      const q=m.rotationFields?new THREE.Quaternion().setFromEuler(new THREE.Euler(...m.rotationFields.map(field=>THREE.MathUtils.degToRad(state[field]||0)))):m.rotateField?new THREE.Quaternion().setFromAxisAngle(V(m.rotateAxis),THREE.MathUtils.degToRad(state[m.rotateField]||0)):new THREE.Quaternion();
      const matrix=new THREE.Matrix4().compose(p,q,new THREE.Vector3(1,1,1));box.union(mesh.geometry.boundingBox.clone().applyMatrix4(matrix));
    }return box;
  }
  resize(){const box=this.canvas.getBoundingClientRect();this.width=Math.max(1,box.width);this.height=Math.max(1,box.height);this.renderer.setSize(this.width,this.height,false);if(this.fitBox){this.target.roll=this._homeRoll();this.target.span=this._fitSpan(this.fitBox)}this._camera();this.onCamera(this.cameraState());this.active=true;this.onInteract()}
  _camera(){
    const c=this.current,dir=new THREE.Vector3(Math.cos(c.yaw)*Math.cos(c.pitch),Math.sin(c.yaw)*Math.cos(c.pitch),Math.sin(c.pitch));
    this.camera.position.copy(c.center).addScaledVector(dir,350);this.camera.lookAt(c.center);this.camera.rotateZ(c.roll);
    const h=c.span/2,w=h*this.width/this.height;Object.assign(this.camera,{left:-w,right:w,top:h,bottom:-h,zoom:c.zoom});this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  }
  _fitSpan(box){
    const saved=this.current;this.current={...this.target,center:box.getCenter(new THREE.Vector3())};this._camera();
    const points=[],append=(b,m)=>{for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const p=new THREE.Vector3(x,y,z);if(m)p.applyMatrix4(m);points.push(p.applyMatrix4(this.camera.matrixWorldInverse))}};
    if(this.tightFit){this.world.updateMatrixWorld(true);for(const {mesh} of this.parts.values())append(mesh.geometry.boundingBox,mesh.matrixWorld)}else append(box);
    const width=Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x)),height=Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y));
    this.current=saved;this._camera();return Math.max(16,height*1.38,width/(this.width/this.height)*1.2);
  }
  fit(box=null,animate=true){
    this.tightFit=!box;box=box||this.bounds();this.fitBox=box.clone();this.target.center.copy(box.getCenter(new THREE.Vector3()));this.target.span=this._fitSpan(box);this.target.zoom=1;
    if(!animate){this.current.center.copy(this.target.center);this.current.span=this.target.span;this.current.zoom=1;this._camera()}
    this.active=true;this.onInteract();
    if(!this.referenceSpan)this.referenceSpan=this.target.span;
  }
  focus(id){const p=this.parts.get(id);if(!p)return;this.world.updateMatrixWorld(true);this.select(id,true);if(this.definition.autoFocusView)this._visibleView(p.mesh);this.fit(p.mesh.geometry.boundingBox.clone().applyMatrix4(p.mesh.matrixWorld).expandByScalar(2));}
  _visibleView(mesh){
    // Probe real surface points, including rings whose box centre is empty.
    // Prefer the current angle; turn only if another solid hides the target.
    const pos=mesh.geometry.attributes.position,index=mesh.geometry.index,triangles=[],count=index?index.count:pos.count,get=i=>new THREE.Vector3().fromBufferAttribute(pos,index?index.getX(i):i);
    for(let i=0;i<count;i+=3){const a=get(i),b=get(i+1),c=get(i+2),area=b.clone().sub(a).cross(c.clone().sub(a)).lengthSq();triangles.push({area,point:a.add(b).add(c).multiplyScalar(1/3).applyMatrix4(mesh.matrixWorld)})}
    triangles.sort((a,b)=>b.area-a.area);const points=triangles.slice(0,9).map(t=>t.point),probe=new THREE.Raycaster(),yaw=this.target.yaw,pitch=this.target.pitch;
    const visible=(y,p)=>{const direction=new THREE.Vector3(Math.cos(y)*Math.cos(p),Math.sin(y)*Math.cos(p),Math.sin(p));let n=0;for(const point of points){probe.set(point.clone().addScaledVector(direction,350),direction.clone().negate());if(probe.intersectObjects(this.pickables,false)[0]?.object===mesh)n++}return n};
    let best={yaw,pitch,score:visible(yaw,pitch),cost:0};if(best.score<3)for(const dy of [0,.7,-.7,1.4,-1.4,Math.PI])for(const p of [pitch,.35,.8,1.25,-.35]){const score=visible(yaw+dy,p),cost=Math.abs(dy)+Math.abs(p-pitch);if(score>best.score||(score===best.score&&cost<best.cost))best={yaw:yaw+dy,pitch:p,score,cost}}
    this.target.yaw=best.yaw;this.target.pitch=best.pitch;
    const direction=new THREE.Vector3(Math.cos(best.yaw)*Math.cos(best.pitch),Math.sin(best.yaw)*Math.cos(best.pitch),Math.sin(best.pitch));for(const point of points){probe.set(point.clone().addScaledVector(direction,350),direction.clone().negate());if(probe.intersectObjects(this.pickables,false)[0]?.object===mesh){this.anchor={id:mesh.userData.part.id,point:mesh.worldToLocal(point.clone())};break}}
  }
  focusParts(ids,selectId=ids[0]){this.world.updateMatrixWorld(true);const box=new THREE.Box3();for(const id of ids){const p=this.parts.get(id);if(p)box.union(p.mesh.geometry.boundingBox.clone().applyMatrix4(p.mesh.matrixWorld))}if(!box.isEmpty()){this.select(selectId,true);this.fit(box.expandByScalar(2))}}
  _homeRoll(){return this.width<this.height?(this.definition.camera?.portraitRoll??this.defaults.roll):this.defaults.roll}
  home(){for(const field of ['yaw','pitch'])this.target[field]=this.current[field]=this.defaults[field];this.target.roll=this.current.roll=this._homeRoll();this._camera();this.fit();this.gestures++}
  cameraState(){return {yaw:this.current.yaw,pitch:this.current.pitch,roll:this.current.roll,zoom:this.current.zoom,tightFit:!!this.tightFit,magnification:(this.referenceSpan||this.current.span)/this.current.span*this.current.zoom,target:this.current.center.toArray(),span:this.current.span,frameBox:this.fitBox?[...this.fitBox.min.toArray(),...this.fitBox.max.toArray()]:null}}
  setCameraState(s,animate=false){
    this.tightFit=!!s.tightFit;
    if(Number.isFinite(s.yaw))this.target.yaw=s.yaw;if(Number.isFinite(s.pitch))this.target.pitch=clamp(s.pitch,-1.38,1.38);if(Number.isFinite(s.zoom))this.target.zoom=clamp(s.zoom,.65,18);
    if(Number.isFinite(s.roll))this.target.roll=s.roll;
    if(Array.isArray(s.frameBox)&&s.frameBox.length===6&&s.frameBox.every(Number.isFinite))this.fitBox=new THREE.Box3(V(s.frameBox.slice(0,3)),V(s.frameBox.slice(3)));
    if(Array.isArray(s.target)&&s.target.length===3&&s.target.every(Number.isFinite))this.target.center.fromArray(s.target);
    if(Number.isFinite(s.span))this.target.span=Math.max(4,s.span);
    if(!animate){this.current={...this.target,center:this.target.center.clone()};this._camera()}
    this.active=true;this.onInteract();
  }
  _planePoint(x,y){const r=this.canvas.getBoundingClientRect();this.ndc.set((x-r.left)/r.width*2-1,1-(y-r.top)/r.height*2);this.ray.setFromCamera(this.ndc,this.camera);return this.ray.ray.intersectPlane(new THREE.Plane().setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(new THREE.Vector3()),this.current.center),new THREE.Vector3())}
  zoomBy(factor,x=null,y=null){
    const r=this.canvas.getBoundingClientRect();x=x??r.left+r.width/2;y=y??r.top+r.height/2;
    const before=this._planePoint(x,y);this.target.zoom=clamp(this.target.zoom*factor,.65,18);
    const previous=this.current.zoom;this.current.zoom=this.target.zoom;this._camera();const after=this._planePoint(x,y);this.current.zoom=previous;this._camera();
    if(before&&after)this.target.center.add(before.sub(after));this.gestures++;this.active=true;this.onInteract();
  }
  orbitBy(dx,dy){this.target.yaw-=dx*.007;this.target.pitch=clamp(this.target.pitch+dy*.006,-1.38,1.38);if(this.fitBox)this.target.span=this._fitSpan(this.fitBox);this.gestures++;this.active=true;this.onInteract()}
  panBy(dx,dy){
    const scale=this.current.span/this.current.zoom/this.height,right=new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld,0),up=new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld,1);
    this.target.center.addScaledVector(right,-dx*scale).addScaledVector(up,dy*scale);this.gestures++;this.active=true;this.onInteract();
  }
  pick(x,y){
    const r=this.canvas.getBoundingClientRect();this.ndc.set((x-r.left)/r.width*2-1,1-(y-r.top)/r.height*2);this.ray.setFromCamera(this.ndc,this.camera);
    const hit=this.ray.intersectObjects(this.pickables,false)[0];return hit?{id:hit.object.userData.part.id,point:hit.object.worldToLocal(hit.point.clone())}:null;
  }
  select(id,pin=false,anchor=null){
    if(id&&!this.parts.has(id))return;
    clearTimeout(this._hoverTimer);this._hoverCandidate=null;
    if(!pin&&this.pinned)return;
    if(pin){this.pinned=id;this.hovered=null}else this.hovered=id;
    const active=this.pinned||this.hovered;
    if(anchor&&active===id&&(pin||this.anchor?.id!==id))this.anchor={id,point:anchor.clone()};
    else if(active!==this.inspected)this.anchor=null;
    if(active!==this.inspected){
      this.inspected=active;
      this._paint();
      this.onInspect(active?this.parts.get(active).part:null,!!this.pinned&&active===this.pinned);
    }else this.onInspect(active?this.parts.get(active).part:null,!!this.pinned&&active===this.pinned);
    this.active=true;this.onInteract();
  }
  _paint(){for(const [name,p]of this.parts){const highlighted=name===this.inspected||p.part.activeField&&this.state[p.part.activeField]>0;p.mesh.material.color.setHex(highlighted?0x377cdf:p.baseColor);if(p.edges)p.edges.material.color.setHex(highlighted?0x225ea8:p.edgeColor)}}
  clear(){this.hovered=null;this.pinned=null;this.anchor=null;this.select(null)}
  holdHover(){clearTimeout(this._hoverTimer)}
  clearHover(){clearTimeout(this._hoverTimer);if(this.inspectionPanel?.contains(document.activeElement)&&document.activeElement.matches(':focus-visible'))return;this._hoverTimer=setTimeout(()=>{this.hovered=null;this.select(null)},160)}
  hover(hit){
    if(this.pinned)return;
    if(hit?.id===this.hovered){this.holdHover();return}
    if(hit?.id===this._hoverCandidate)return;
    clearTimeout(this._hoverTimer);this._hoverCandidate=hit?.id||null;
    this._hoverTimer=setTimeout(()=>{this.select(hit?.id||null,false,hit?.point)},120);
  }
  projectPart(id=this.inspected){
    const entry=this.parts.get(id);if(!entry)return null;
    const local=this.anchor?.id===id?this.anchor.point:entry.mesh.geometry.boundingBox.getCenter(new THREE.Vector3());
    const point=entry.mesh.localToWorld(local.clone()).project(this.camera);
    return {x:(point.x+1)*this.width/2,y:(1-point.y)*this.height/2,visible:Math.abs(point.x)<1&&Math.abs(point.y)<1&&point.z>-1&&point.z<1};
  }
  frame(dt,calm=false){
    const follow=calm?1:1-Math.exp(-dt/.095),c=this.current,t=this.target;
    for(const field of ['yaw','pitch','roll','zoom','span']){c[field]+=(t[field]-c[field])*follow;if(Math.abs(t[field]-c[field])<1e-4)c[field]=t[field]}
    c.center.lerp(t.center,follow);if(c.center.distanceTo(t.center)<1e-4)c.center.copy(t.center);
    this.active=['yaw','pitch','roll','zoom','span'].some(field=>c[field]!==t[field])||!c.center.equals(t.center)||this._pointers.size>0;
    this._camera();this.renderer.render(this.world,this.camera);this.onCamera(this.cameraState());return this.active;
  }
  _bind(){
    this.canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoomBy(Math.exp(-clamp(e.deltaY,-240,240)*.002),e.clientX,e.clientY)},{passive:false});
    this.canvas.addEventListener('contextmenu',e=>e.preventDefault());
    this.canvas.addEventListener('pointerdown',e=>{
      this.canvas.focus({preventScroll:true});this._pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false,pan:e.button===2||e.shiftKey});
      try{this.canvas.setPointerCapture(e.pointerId)}catch{}this._gesture=this._touchPair();this.active=true;this.onInteract();
    });
    this.canvas.addEventListener('pointermove',e=>{
      const p=this._pointers.get(e.pointerId);
      if(!p){if(e.pointerType!=='touch')this.hover(this.pick(e.clientX,e.clientY));return}
      const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
      if(Math.hypot(p.x-p.startX,p.y-p.startY)>5)p.moved=true;
      if(this._pointers.size>=2){for(const x of this._pointers.values())x.moved=true;const pair=this._touchPair();if(this._gesture){this.zoomBy(pair.distance/this._gesture.distance,pair.x,pair.y);this.panBy(pair.x-this._gesture.x,pair.y-this._gesture.y)}this._gesture=pair;this.hovered=null;this.select(null)}
      else if(p.moved){this.hovered=null;this.select(null);if(p.pan)this.panBy(dx,dy);else this.orbitBy(dx,dy)}
    });
    const release=(e,cancel=false)=>{
      const p=this._pointers.get(e.pointerId);this._pointers.delete(e.pointerId);this._gesture=this._touchPair();
      if(p&&!p.moved&&!cancel&&e.button!==2){const hit=this.pick(e.clientX,e.clientY);this.hovered=null;if(hit){if(this.pinned===hit.id)this.clear();else this.select(hit.id,true,hit.point);this.onActivate(this.parts.get(hit.id).part)}else this.clear()}
      this.active=true;this.onInteract();
    };
    this.canvas.addEventListener('pointerup',e=>release(e));this.canvas.addEventListener('pointercancel',e=>release(e,true));
    this.canvas.addEventListener('pointerleave',()=>{if(!this._pointers.size)this.clearHover()});
    this.canvas.addEventListener('dblclick',()=>this.fit());
    this._resizeObserver=new ResizeObserver(()=>this.resize());this._resizeObserver.observe(this.canvas.parentElement);
  }
  _touchPair(){const points=[...this._pointers.values()];if(points.length<2)return null;return {x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2,distance:Math.max(1,Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y))}}
  diagnostics(){return {parts:this.parts.size,meshes:this.pickables.length,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,camera:this.cameraState(),selected:this.inspected,pinned:this.pinned,active:this.active}}
}
