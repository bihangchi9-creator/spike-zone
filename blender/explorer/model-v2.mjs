// Rebuildable sculpted surfaces, not a recolour of the original capsule model.
import {Workshop,T,mat,vec} from '../five-worlds/geometry-v2.mjs'
const TAU=Math.PI*2
import {sample,derivative,hermite,canopy,shoulderPoint,sidePoint,bellyPoint,nosePoint} from './hull-surfaces-v2.mjs'
function surface(fn,rows,cols,flip=false){const p=[],uv=[],idx=[];for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){p.push(...fn(i/rows,j/cols));uv.push(j/cols,i/rows)}for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+1,c=a+cols+1,d=c+1;idx.push(...(flip?[a,c,b,b,c,d]:[a,b,c,b,d,c]))}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g}
function superellipse(a,n=3.7){return [Math.sign(Math.cos(a))*Math.abs(Math.cos(a))**(2/n),Math.sign(Math.sin(a))*Math.abs(Math.sin(a))**(2/n)]}
export function buildVesselV2(low=false,design){
 const k=new Workshop('Spike_BiHangChi_private_craft_v2',low),N=low?28:48,C=low?16:26
 const m={blue:mat('cobalt_automotive_paint','#1256c6',.29,.38),blueShade:mat('cobalt_recess_paint','#153c82',.4,.34),silver:mat('brushed_titanium','#88949f',.29,.91),dark:mat('graphite_structure','#1b2631',.62,.4),rubber:mat('graphite_seals','#121c25',.83,.03),seat:mat('warm_neutral_upholstery','#5b5c59',.91,.01),stitch:mat('seat_piping','#969087',.84,.03),screen:mat('instrument_glass','#142f3d',.21,.27),ice:mat('engine_core','#17354a',.4,.05,'#4db9ef'),amber:mat('cabin_amber','#dbaa5d',.43,.1,'#ffc574'),white:mat('Spike_wordmark','#9aa9ba',.72,.02),plateText:mat('BiHangChi_nameplate','#18202a',.65,.15)}
 m.blue=new T.MeshPhysicalMaterial({...{color:'#123f99',metalness:.28,roughness:.36,clearcoat:.40,clearcoatRoughness:.30}});m.blue.name='cobalt_automotive_paint'
 m.glass=new T.MeshPhysicalMaterial({color:'#304c66',roughness:.13,metalness:.04,transparent:true,opacity:.24,depthWrite:false,side:T.DoubleSide,clearcoat:.70,clearcoatRoughness:.16,ior:1.46});m.glass.name='smoked_blue_canopy'
 m.ice.name='ice_navigation';m.ice.emissiveIntensity=.5;m.amber.emissiveIntensity=.42
 const engineMaterials=[0,1].map(i=>{const e=m.ice.clone();e.name='engine_core_'+i;e.emissiveIntensity=.75;return e})
 const grid=(name,material,fn,rows=N,cols=C,flip=false)=>k.mesh(name,surface(fn,rows,cols,flip),material)
 const tube=(name,material,points,r=.012,closed=false,segments=low?24:64)=>k.mesh(name,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(vec),closed),segments,r,low?6:10,closed),material)
 function loft(name,material,keys,angle=[0,TAU],sidesign=1,exp=2.5,rows=N,cols=C){
  const point=(u,v,inset=0)=>{const z=keys[0][0]+u*(keys.at(-1)[0]-keys[0][0]),[cx,cy,w,h]=sample(keys,z),[x,y]=superellipse(angle[0]+v*(angle[1]-angle[0]),exp);return [sidesign*(cx+Math.max(.003,w-inset)*x),cy+Math.max(.003,h-inset)*y,z]}
  const mesh=grid(name,material,(u,v)=>point(u,v),rows,cols,sidesign<0)
  if(angle[1]-angle[0]>6.28){
   for(const end of [0,1]){
    const z=keys[end?keys.length-1:0][0],[cx,cy]=sample(keys,z),p=[cx*sidesign,cy,z],uv=[.5,.5],idx=[]
    for(let i=0;i<C;i++){p.push(...point(end,i/C));uv.push(.5+.5*Math.cos(i/C*TAU),.5+.5*Math.sin(i/C*TAU))}
    for(let i=0;i<C;i++){const a=1+i,b=1+(i+1)%C;idx.push(...((sidesign>0)!==!!end?[0,b,a]:[0,a,b]))}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();k.mesh(name+'_closed_end',g,material)
   }
  }

  return mesh
 }
 // One rounded polygon defines the shroud, its saddle, lips and their exact junction.
 const polygon=[[1,.53],[.70,1],[-.70,1],[-1,.53],[-1,-.53],[-.70,-1],[.70,-1],[1,-.53]],outletCurve=new T.CurvePath()
 for(let i=0;i<polygon.length;i++){
  const v=vec([...polygon[i],0]),prev=vec([...polygon[(i+7)%8],0]),next=vec([...polygon[(i+1)%8],0]),start=v.clone().lerp(prev,.13),end=v.clone().lerp(next,.13)
  outletCurve.add(new T.QuadraticBezierCurve3(start,v,end));outletCurve.add(new T.LineCurve3(end,next.clone().lerp(v,.13)))
 }
 // Upper arc starts and ends on the vertical sides at the existing shoulder chine.
 const upperStart=1-(.3922-(.172-.10)/.387)/outletCurve.getLength(),upperEnd=.5-(.3922+(.172-.10)/.387)/outletCurve.getLength()
 const outletPoint=(q,w=.487,h=.387)=>{const p=outletCurve.getPoint(((q%1)+1)%1);return[p.x*w,p.y*h]}
 const hood=[[1.55,.487,.387],[1.74,.482,.358],[1.89,.454,.316],[design.engines[0].position[2]-.055,.452,.31]]
 const hoodTop=(z,q,side=1)=>{const [w,h]=sample(hood,z),[x,y]=outletPoint(upperStart+q*(1+upperEnd-upperStart),w,h);return[side*(1.16+x),.10+y,z]}
 const bodyShoulder=(z,q,side=1)=>{
  if(z<=1.12)return shoulderPoint(z,q,side)
  if(z>=1.55)return hoodTop(z,q,side)
  const p=shoulderPoint(1.12,q,side),target=hoodTop(1.55,q,side),h=.00001
  const before=shoulderPoint(1.12-h,q,side),after=shoulderPoint(1.12+h,q,side),startSlope=after.map((v,i)=>(v-before[i])/(2*h))
  const [dx,dy]=outletPoint(upperStart+q*(1+upperEnd-upperStart),...derivative(hood,1.55)),endSlope=[side*dx,dy,1]
  return hermite(p,target,startSlope,endSlope,(z-1.12)/.43,.43)
 }
 const rearBlend=z=>{const a=Math.min(1,Math.max(0,(z-1.12)/.43));return a*a*(3-2*a)}
 const sideSkin=(z,v,side)=>{
  const p=sidePoint(z,v,side),[x,y]=outletPoint(upperStart+v*(.80-upperStart)),target=[side*(1.16+x),.10+y,z],a=rearBlend(z)
  const result=p.map((n,i)=>n+(target[i]-n)*a)
  // Carry the locally repaired shoulder chine into its adjacent side skin.
  const oldTop=sidePoint(z,0,side),[ox,oy]=outletPoint(upperStart),top=oldTop.map((n,i)=>n+([side*(1.16+ox),.10+oy,z][i]-n)*a),sharedTop=bodyShoulder(z,0,side)
  return result.map((n,i)=>n+(sharedTop[i]-top[i])*(1-v))
 }
 const [aftX,aftY]=outletPoint(.80)
 const bottomSkin=(z,v)=>{const p=bellyPoint(z,v),f=v*2-1,target=[f*(1.16+aftX),-.315+(.10+aftY+.315)*Math.abs(f)**3,z],a=rearBlend(z);return p.map((n,i)=>n+(target[i]-n)*a)}
 // The blue shoulders, silver side armour and dark belly share these boundaries.
 // Cooling apertures are cut into two local stretches, not a full-length separation.
 const bodyZ=[...new Set([...Array.from({length:N+1},(_,i)=>-2.94+4.49*i/N),-1.80,-1.72,-.65,.45,1.02,1.04,1.07,1.12,1.18,1.26,1.30,1.35,1.44,1.50,1.535,1.545,1.55,1.56,1.58,1.63,1.70,1.74,1.80])].sort((a,b)=>a-b).filter((z,i,a)=>!i||z-a[i-1]>.00001)
 const strip=(name,material,fn,a=-2.94,b=1.55,rows=N,cols=C,flip=false)=>{const knots=[a,...bodyZ.filter(z=>z>a+.00001&&z<b-.00001),b];return grid(name,material,(u,v)=>fn(knots[Math.round(u*(knots.length-1))],v),knots.length-1,cols,flip)}
 strip('continuous_lower_pressure_hull',m.dark,bottomSkin,-2.94,1.55,N,C)
 grid('aft_pressure_hull_bulkhead',m.dark,(u,v)=>{const p=bottomSkin(1.55,u);p[1]+=(.035-p[1])*v;return p},low?16:28,4,true)
 for(const side of [-1,1]){
  strip('continuous_sculpted_blue_shoulder',m.blue,(z,v)=>bodyShoulder(z,v,side),-2.94,1.80,N,C,side<0)
  const sideStrip=(a,b,aperture)=>{
   const window=(z)=>aperture?.30*Math.sin(Math.PI*(z-a)/(b-a))**.65:0
   if(!aperture){strip('continuous_side_titanium_skin',m.silver,(z,v)=>sideSkin(z,v,side),a,b,Math.ceil(N*(b-a)/4.49),6,side>0);return}
   for(const lower of [false,true])strip('vent_surround_titanium_skin',m.silver,(z,v)=>{const d=window(z),q=lower?.5+d+v*(.5-d):v*(.5-d);return sideSkin(z,q,side)},a,b,low?10:20,4,side>0)
   strip('recessed_side_cooling_cavity',m.dark,(z,v)=>{const p=sideSkin(z,v,side);p[0]-=side*.055;return p},a,b,low?10:20,5,side>0)
   for(const lower of [false,true])strip('cooling_aperture_return',m.silver,(z,v)=>{const p=sideSkin(z,.5+(lower?1:-1)*window(z),side);p[0]-=side*.055*v;return p},a,b,low?10:20,2,side>0)
  }
  sideStrip(-2.94,-1.8,false);sideStrip(-1.8,-.65,true);sideStrip(-.65,.45,false);sideStrip(.45,1.3,true);sideStrip(1.3,1.55,false)
  // A shallow silver sill closes the canopy/shoulder join using the same rim.
  strip('canopy_load_sill',m.silver,(z,v)=>{const [w,y]=sample(canopy,z);return[side*(w+v*.08),y-v*.004,z]},-1.72,1.02,N,5,side>0)
  // A short wing begins within the load-bearing side skin, with a closed foil.
  const wing=[[0,0,-.145,.34,.068],[.20,-side*.12,-.15,.29,.063],[.45,-side*.27,-.17,.14,.038],[.59,-side*.37,-.17,.025,.012]]
  k.group('integrated_short_wing',[side*1.23,0,.65],()=>{
   loft('closed_short_wing_airfoil',m.silver,wing,[0,TAU],1,2.6,low?12:22,low?12:20)
   grid('wing_blue_inlay',m.blue,(u,v)=>{const z=.12+u*.40,[cx,y,w,h]=sample(wing,z),x=cx+(v-.5)*w;return[x,y+h*Math.pow(1-Math.pow(Math.abs((x-cx)/w),2.6),1/2.6)+.003,z]},low?8:16,low?6:12,true)
  },[0,side*Math.PI/2,0])
 }
 // Shared wedge, carried all the way into the cockpit frame, instead of a separate triangular lid.
 strip('nose_titanium_load_wedge',m.silver,nosePoint,-2.94,-1.72,low?14:26,12,true)
 grid('nose_blue_arrow',m.blue,(u,v)=>{const p=nosePoint(-2.81+u*1.04,.5+(v-.5)*.48);p[1]+=.004;return p},low?14:26,8,true)
 // A single clear arched canopy; the perimeter is closed and meets the sill.
 const edge=[];for(let i=0;i<=N;i++){const z=-1.72+i/N*2.74,[w,y]=sample(canopy,z);edge.push([w,y,z])}for(let i=N;i>=0;i--){const z=-1.72+i/N*2.74,[w,y]=sample(canopy,z);edge.push([-w,y,z])}
 tube('cockpit_gasket',m.rubber,edge,.012,true,low?72:128)
 tube('cockpit_titanium_frame',m.silver,edge.map(([x,y,z])=>[x+Math.sign(x)*.018,y-.004,z]),.009,true,low?72:128)
 grid('thick_smoked_canopy',m.glass,(u,v)=>{const z=-1.72+u*2.74,[w,y,h]=sample(canopy,z),a=Math.PI*v;return[w*Math.cos(a),y+h*Math.sin(a),z]},N,C)
 for(const end of [-1.72,1.02])grid('canopy_end_lamination',m.glass,(u,v)=>{const [w,y,h]=sample(canopy,end),a=Math.PI*v;return[w*Math.cos(a),y+u*h*Math.sin(a),end]},2,low?16:26,end>0)
 const arch=Array.from({length:low?17:33},(_,i)=>{const a=i/(low?16:32)*Math.PI,z=.78,[w,y,h]=sample(canopy,z);return[w*Math.cos(a),y+h*Math.sin(a)+.006,z]});tube('aft_canopy_structural_hoop',m.silver,arch,.010)
 k.box('cockpit_floor',m.dark,[0,-.015,-.20],[.83,.07,1.65],undefined,.06)
 // Sculpted tapering seat, with curved bolsters instead of stacked rectangular cushions.
 function cushion(name,material,keys){
  const point=(u,v)=>{const [y,w,z,depth]=sample(keys,u),[x,zz]=superellipse(v*TAU,3.1);return[x*w,y,z+zz*depth]}
  const count=low?20:32,g=surface(point,low?16:30,count,true);k.mesh(name,g,material)
  for(const end of [0,1]){const [y,,z]=sample(keys,end),p=[0,y,z],uv=[.5,.5],idx=[];for(let i=0;i<count;i++){p.push(...point(end,i/count));uv.push(.5+.5*Math.cos(i/count*TAU),.5+.5*Math.sin(i/count*TAU))}for(let i=0;i<count;i++){const a=i+1,b=1+(i+1)%count;idx.push(...(end?[0,b,a]:[0,a,b]))}const cap=new T.BufferGeometry();cap.setAttribute('position',new T.Float32BufferAttribute(p,3));cap.setAttribute('uv',new T.Float32BufferAttribute(uv,2));cap.setIndex(idx);cap.computeVertexNormals();k.mesh(name+'_closed_end',cap,material)}
 }
 cushion('contoured_seat_back_shell',m.dark,[[0,.10,.21,.115,.075],[.12,.18,.24,.13,.095],[.48,.34,.245,.17,.073],[.78,.51,.19,.22,.062],[1,.55,.10,.24,.045]])
 cushion('contoured_back_upholstery',m.seat,[[0,.13,.09,.053,.035],[.1,.19,.15,.055,.045],[.56,.35,.166,.085,.045],[.88,.48,.145,.135,.04],[1,.51,.095,.153,.025]])
 cushion('shaped_headrest',m.seat,[[0,.50,.10,.22,.055],[.15,.52,.14,.23,.065],[.76,.61,.13,.245,.055],[1,.633,.07,.245,.035]])
 grid('curved_seat_base',m.seat,(u,v)=>{const z=-.30+u*.49,x=(v-.5)*.41;return[x,.115+.045*(x/.205)**2+.020*Math.cos(u*Math.PI),z]},low?14:32,low?14:32,true)
 k.box('seat_underpan',m.dark,[0,.080,-.055],[.405,.065,.48],[.03,0,0],.025)
 for(const side of [-1,1]){
  grid('sculpted_thigh_bolster',m.dark,(u,v)=>{const z=-.26+u*.40,a=v*TAU,x=side*(.195+.015*Math.sin(u*Math.PI))+.045*Math.cos(a),y=.13+Math.sin(u*Math.PI)*.022+.060*Math.sin(a);return[x,y,z]},low?12:24,low?16:28)
  tube('upholstery_piping',m.stitch,[[side*.154,.12,-.26],[side*.17,.14,.10],[side*.16,.51,.16]],.007)
  k.box('cabin_side_console',m.dark,[side*.34,.14,-.4],[.12,.20,.58],undefined,.045)
  k.box('amber_console_guide',m.amber,[side*.33,.254,-.37],[.013,.01,.43],undefined,.002)
  k.box('recessed_footwell',m.rubber,[side*.16,.025,-.93],[.22,.027,.40],[.13,0,0],.015)
 }
 k.box('instrument_dashboard',m.dark,[0,.22,-1.02],[.65,.21,.27],[.35,0,0],.055)
 k.box('instrument_display',m.screen,[0,.323,-1.015],[.47,.018,.16],[.35,0,0],.015)
 for(let i=0;i<3;i++)k.box('subtle_instrument_bar',i===0?m.amber:m.ice,[-.13+i*.13,.339,-1.00],[.07,.005,.012],[.35,0,0],.002)
 tube('pilot_yoke',m.dark,[[-.15,.25,-.74],[-.13,.32,-.77],[0,.33,-.79],[.13,.32,-.77],[.15,.25,-.74]],.012)
 // Faceted aft backbone tapers into a small transom, not a rounded black plug.
 const spine=[[1.0,0,.385,.094,.104],[1.28,0,.335,.30,.135],[1.76,0,.25,.27,.10],[2.02,0,.16,.18,.073]]
 loft('central_rear_titanium_spine',m.silver,spine,[0,TAU],1,4.4,low?18:28,low?12:20)
 grid('spine_cobalt_inset',m.blueShade,(u,v)=>{const z=1.17+u*.70,[,y,w,h]=sample(spine,z),x=(v-.5)*w;return[x,y+h*Math.pow(1-Math.pow(Math.abs(x/w),4.4),1/4.4)+.004,z]},low?12:22,8,true)
 k.box('stern_recessed_service_panel',m.dark,[0,.12,2.025],[.24,.084,.015],undefined,.014)
 k.box('stern_navigation_slit',m.ice,[0,.211,2.031],[.13,.008,.008],undefined,.003)
 // Open, layered rounded-polygon outlets. Their longitudinal cavities remain geometrically empty.
 function nozzle(side,index){
  const [cx,cy,cz]=design.engines[index].position
  const outline=(a,w,h)=>{const [x,y]=outletPoint(a/TAU,w,h);return[cx+x,cy+y]}
  const ring=(name,material,sections)=>grid(name,material,(u,v)=>{const [z,w,h]=sample(sections,u),[x,y]=outline(v*TAU,w,h);return[x,y,z]},low?8:12,low?24:40)
  // Axial exterior shroud: upper/outer panels, a neck and the thin existing lip.
  grid('nozzle_longitudinal_outer_shroud',m.silver,(u,v)=>{const z=1.55+u*.25,[w,h]=sample(hood,z),[x,y]=outline((upperEnd+v*(upperStart-upperEnd))*TAU,w,h);return[x,y,z]},low?8:14,low?14:24)
  grid('nozzle_hood_exposed_aft',m.silver,(u,v)=>{const z=1.80+u*(cz-.055-1.80),[w,h]=sample(hood,z),[x,y]=outline(v*TAU,w,h);return[x,y,z]},low?8:14,low?24:40)
  ring('nozzle_graphite_outer_seat',m.dark,[[0,cz-.17,.443,.302],[1,cz-.055,.452,.31]])
  // Blue upper saddle is now the same continuous mesh as the shoulder, with shared tangents.
  ring('layered_titanium_nozzle_frame',m.silver,[[0,cz-.085,.455,.31],[.25,cz-.008,.46,.315],[.42,cz+.003,.45,.302],[.68,cz+.003,.417,.272],[1,cz-.05,.410,.265]])
  ring('nozzle_inset_graphite_frame',m.dark,[[0,cz-.048,.411,.266],[.52,cz-.031,.388,.243],[1,cz-.10,.372,.232]])
  ring('fine_inner_titanium_lip',m.silver,[[0,cz-.097,.373,.233],[.5,cz-.092,.361,.221],[1,cz-.15,.356,.219]])
  ring('dark_nozzle_inner_wall',m.dark,[[0,cz-.15,.354,.218],[1,cz-.48,.313,.188]])
  ring('inset_ice_blue_nozzle_rim',m.ice,[[0,cz-.146,.353,.217],[.5,cz-.143,.343,.207],[1,cz-.158,.340,.204]])
  k.box('recessed_engine_chamber',m.rubber,[cx,cy,cz-.485],[.73,.47,.022],undefined,.065)
  k.group(design.engines[index].name,[0,0,0],()=>{
   for(let j=0;j<4;j++){
    const y=cy+(j-1.5)*.096,width=j===0||j===3?.49:.57
    k.box('engine_core_grille',engineMaterials[index],[cx,y,cz-.192],[width,.026,.036],undefined,.01)
    k.box('grille_titanium_collar',m.silver,[cx,y-.028,cz-.215],[width+.02,.018,.042],undefined,.004)
   }
  },undefined,true)
  const anchor=new T.Object3D();anchor.name='exhaust_'+(side<0?'port':'starboard');anchor.position.set(cx,cy,cz+.02);anchor.userData.direction=[0,0,1];k.root.add(anchor)
 }
 nozzle(-1,0);nozzle(1,1)
 // A single S flight-path inlay, capped with a forward-pointing chevron; real raised geometry.
 function emblem(z,w,len,surfaceY){
  const pts=[[-.45,.40],[.25,.40],[.38,.2],[-.30,-.08],[-.34,-.27],[.16,-.37]].map(([x,t])=>[x*w,surfaceY(z+t*len)+.012,z+t*len])
  const curve=new T.CatmullRomCurve3(pts.map(vec));grid('S_flightpath_inlay',m.silver,(u,v)=>{const p=curve.getPoint(u),d=curve.getTangent(u),x=p.x+d.z*(v-.5)*.030,zz=p.z-d.x*(v-.5)*.030;return[x,surfaceY(zz)+.008,zz]},low?20:48,4,true)
  const shape=new T.Shape();shape.moveTo(-.045*w,-.28*len);shape.lineTo(.27*w,-.59*len);shape.lineTo(.32*w,-.22*len);shape.closePath();const g=new T.ExtrudeGeometry(shape,{depth:.012,bevelEnabled:true,bevelSegments:low?1:2,steps:1,bevelSize:.006,bevelThickness:.004});g.rotateX(Math.PI/2);g.translate(0,0,z);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,p.getY(i)+surfaceY(p.getZ(i))+.018);g.computeVertexNormals();k.mesh('S_forward_chevron',g,m.silver)
 }
 emblem(-2.22,.23,.29,z=>nosePoint(z,.5)[1]+.010)
 emblem(1.48,.26,.32,z=>{const [,y,,h]=sample(spine,z);return y+h+.013})
 // UV decals conform to the shoulder, not floating planes. Text PNGs are reproducible typography.
 for(const side of [-1,1]){
  const letters=grid('Spike_exact_side_wordmark',m.white,(u,v)=>{const z=-.34+(side<0?1-u:u)*.91,p=shoulderPoint(z,.24+v*.22,side);return[p[0]+side*.0025,p[1]+.0035,z]},low?12:24,low?6:12,false)
  const uv=letters.geometry.attributes.uv;for(let i=0;i<uv.count;i++){const u=uv.getX(i),v=uv.getY(i);uv.setXY(i,1-v,1-u)}
  const z=-.70,q=.43,p=vec(shoulderPoint(z,q,side)),eps=.0005
  const tangentX=vec(shoulderPoint(z,q+eps,side)).sub(vec(shoulderPoint(z,q-eps,side))).multiplyScalar(-side).normalize()
  const tangentZ=vec(shoulderPoint(z+eps,q,side)).sub(vec(shoulderPoint(z-eps,q,side)))
  tangentZ.addScaledVector(tangentX,-tangentZ.dot(tangentX)).normalize()
  const normal=tangentZ.clone().cross(tangentX).normalize(),basis=new T.Matrix4().makeBasis(tangentX,normal,tangentZ),rotation=new T.Euler().setFromRotationMatrix(basis)
  p.addScaledVector(normal,.025)
  // Base, letters and fasteners use exactly the same rigid transform and normal gap.
  k.group('nameplate_mount',p.toArray(),()=>{
   k.box('dedication_brushed_plate',m.silver,[0,0,0],[.108,.018,.38],undefined,.012)
   const text=grid('BiHangChi_exact_name',m.plateText,(u,v)=>[side*(v-.5)*.078,.017,(u-.5)*.31],1,1,side>0)
   const uv=text.geometry.attributes.uv;for(let i=0;i<uv.count;i++){const a=uv.getX(i),b=uv.getY(i);uv.setXY(i,side<0?b:1-b,a)}
   for(const z of [-.166,.166])k.cyl('nameplate_fastener',m.dark,[0,.012,z],.005,.005,.005,undefined,8)
  },[rotation.x,rotation.y,rotation.z])
  const marker=new T.Object3D();marker.name='nameplate_'+(side<0?'port':'starboard');marker.position.copy(p);marker.rotation.copy(rotation);k.root.add(marker)

 }
 // Restrained maintenance detail underneath, structurally attached and legible when rotated.
 k.box('belly_access_recess',m.rubber,[0,-.398,.31],[.43,.025,.69],undefined,.045)
 k.box('belly_access_cover',m.silver,[0,-.415,.31],[.37,.025,.62],undefined,.038)
 for(const side of [-1,1]){
  tube('belly_load_rail',m.silver,[[side*.25,-.26,-1.3],[side*.53,-.35,-.1],[side*.50,-.29,1.22]],.025)
  k.box('retractable_landing_pad',m.dark,[side*.52,-.395,.77],[.18,.068,.35],undefined,.055)
  for(const z of [-.4,.15,.70])k.box('underside_recess_louver',m.rubber,[side*.56,-.297,z],[.14,.025,.026],[0,0,side*.15],.004)
 }
 k.box('asymmetric_optical_sensor_mount',m.silver,[-.59,.385,-1.07],[.10,.065,.18],undefined,.025)
 k.box('sensor_black_housing',m.dark,[-.60,.434,-1.1],[.10,.073,.15],undefined,.024)
 k.box('sensor_lens',m.screen,[-.60,.434,-1.18],[.069,.042,.007],undefined,.015)
 if(!low){
  for(const side of [-1,1])for(const z of [-1.52,.73]){const pts=Array.from({length:14},(_,i)=>{const p=shoulderPoint(z,.03+i/13*.62,side);return[p[0]+side*.001,p[1]+.0015,z]});tube('purposeful_panel_joint',m.blueShade,pts,.0045,false,20)}
  for(const x of [-.13,.13])for(const z of [.08,.53])k.cyl('underside_captive_screw',m.dark,[x,-.433,z],.010,.010,.005,undefined,10)
 }
 const root=k.finish();root.userData={...root.userData,source:'blender/explorer/model-v2.mjs',version:'v2',forward:'-Z',scale:design.scale,collisionRadius:design.collisionRadius,personalText:['Spike','毕航驰'],engines:design.engines};return root
}
