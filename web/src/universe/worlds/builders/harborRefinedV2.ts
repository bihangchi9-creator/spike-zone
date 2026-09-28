import * as T from 'three'
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js'
import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js'
type V=[number,number,number]
// One local unit is roughly a metre. Original v3 arrangement, rebuilt as thick architectural shells.
export function buildHarborRefinedV2(low=false){
 const root=new T.Group();root.name='Chongzhen_refined_v2';const fixed=new T.Group();fixed.name='architecture_and_props';root.add(fixed);let parent=fixed
 const mat=(name:string,color:string,roughness=.75,metalness=0,emissive?:string)=>{const m=new T.MeshStandardMaterial({color,roughness,metalness,emissive:emissive||0,emissiveIntensity:emissive?.5:1});m.name=name;m.vertexColors=true;return m}
 const m={wall:mat('harbor_plaster_cream','#f0dfba'),orange:mat('harbor_plaster_orange','#e08a42'),tile:mat('harbor_plaster_clay','#c36336'),stone:mat('harbor_stone','#758d98'),paving:mat('harbor_stone_paving','#d9caaa'),wood:mat('harbor_wood','#d4a163'),woodDark:mat('harbor_wood_dark','#947041'),roof:mat('harbor_slate','#436579',.58,.15),metal:mat('harbor_metal','#263e4a',.43,.55),brass:mat('harbor_metal_brass','#cda66a',.4,.65),paper:mat('harbor_paper','#efddba'),glass:mat('harbor_glass','#2e7187',.17,.35),light:mat('harbor_lamp','#ffe3a5',.45,0,'#ffd382'),cyan:mat('harbor_thruster','#91e2e2',.4,.1,'#51cacf'),rubber:mat('harbor_rubber','#283840'),leaf:mat('harbor_leaf','#6d8850'),leafLight:mat('harbor_leaf_light','#8e9b59'),water:mat('harbor_pool','#ffffff',.24,.23),poolbed:mat('harbor_stone_poolbed','#4a9c91'),art:Array.from({length:6},(_,i)=>mat('harbor_art_'+i,'#ffffff'))}
 m.leaf.side=m.leafLight.side=T.DoubleSide
 let variation=0
 const rand=(n:number)=>{const f=Math.sin(n*127.1+311.7)*43758.5453;return f-Math.floor(f)}
 const v=(p:V)=>new T.Vector3(...p)
 function projectUV(g:T.BufferGeometry,scale=1){const a=g.attributes.position,n=g.attributes.normal,uv=[];for(let i=0;i<a.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));uv.push((nx>ny&&nx>nz?a.getZ(i):a.getX(i))*scale,(ny>nx&&ny>nz?a.getZ(i):a.getY(i))*scale)}g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return g}
 function mesh(name:string,g:T.BufferGeometry,material:T.Material,p:V=[0,0,0],r:V=[0,0,0]){
  const c=new T.Color().setRGB(1,1,1),kind=material.name;variation++;
  if(!/glass|lamp|thruster|art|paper|pool/.test(kind)){const t=(rand(variation)-.5)*.12;c.setRGB(1+t,1+t*.82,1+t*.62)}
  const colors=new Float32Array(g.attributes.position.count*3);for(let i=0;i<colors.length;i+=3){colors[i]=c.r;colors[i+1]=c.g;colors[i+2]=c.b}g.setAttribute('color',new T.BufferAttribute(colors,3));
  const o=new T.Mesh(g,material);o.name=name;o.position.set(...p);o.rotation.set(...r);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o
 }
 function box(name:string,material:T.Material,p:V,size:V,r:V=[0,0,0],round=true){
  const smallest=Math.min(...size),g=round&&smallest>.04&&(!low||/arch|bench|table|cabin|drip|verge/.test(name))?new RoundedBoxGeometry(...size,1,Math.min(.018,smallest*.1)):new T.BoxGeometry(...size);projectUV(g);
  if(material.name.includes('wood')){const a=g.attributes.position,n=g.attributes.normal,uv=[];for(let i=0;i<a.count;i++){const coords=[a.getX(i),a.getY(i),a.getZ(i)],norms=[Math.abs(n.getX(i)),Math.abs(n.getY(i)),Math.abs(n.getZ(i))],face=norms.indexOf(Math.max(...norms)),axes=[0,1,2].filter(j=>j!==face).sort((a,b)=>size[b]-size[a]);uv.push(coords[axes[0]]*.8,coords[axes[1]]*.8)}g.setAttribute('uv',new T.Float32BufferAttribute(uv,2))}
  return mesh(name,g,material,p,r)
 }

 function cyl(name:string,material:T.Material,p:V,rt:number,rb:number,h:number,r:V=[0,0,0],seg=low?10:20){return mesh(name,new T.CylinderGeometry(rt,rb,h,seg),material,p,r)}
 function sphere(name:string,material:T.Material,p:V,s:V){const o=mesh(name,new T.SphereGeometry(1,low?8:12,low?6:8),material,p);o.scale.set(...s);return o}
 function beam(name:string,material:T.Material,a:V,b:V,r=.03){const d=v(b).sub(v(a)),o=cyl(name,material,v(a).addScaledVector(d,.5).toArray() as V,r,r,d.length());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o}
 function tube(name:string,material:T.Material,pts:V[],radius=.035){return mesh(name,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(v)),low?12:28,radius,low?5:8,false),material)}
 function ring(name:string,material:T.Material,p:V,r:number,thick=.02,rot:V=[Math.PI/2,0,0]){return mesh(name,new T.TorusGeometry(r,thick,low?5:8,low?16:32),material,p,rot)}
 function group(name:string,p:V,fn:()=>void,r:V=[0,0,0],part=false){const prev=parent,g=new T.Group();g.name=name;g.position.set(...p);g.rotation.set(...r);(part?root:parent).add(g);parent=g;fn();parent=prev;return g}
 function extrude(name:string,shape:T.Shape,depth:number,material:T.Material,p:V,r:V=[0,0,0],bevel=.035){const g=new T.ExtrudeGeometry(shape,{depth,steps:1,curveSegments:low?12:28,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:low?1:2});return mesh(name,projectUV(g),material,p,r)}
 function polygon(points:[number,number][]){const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s}
 function rail(points:V[],h=.65){for(let i=0;i<points.length;i++){const p=points[i];cyl('railing_foot',m.metal,[p[0],p[1]+.04,p[2]],.09,.115,.09);cyl('railing_post',m.metal,[p[0],p[1]+h/2,p[2]],.042,.057,h);sphere('railing_cap',m.metal,[p[0],p[1]+h,p[2]],[.065,.055,.065]);if(i){for(const y of [.27,h-.1])beam('railing',m.metal,[points[i-1][0],points[i-1][1]+y,points[i-1][2]],[p[0],p[1]+y,p[2]],.026)}}}
 function linePoints(a:V,b:V,count:number){return Array.from({length:count},(_,i)=>v(a).lerp(v(b),i/(count-1)).toArray() as V)}
 function frame(p:V,w:number,h:number,art=3,rotation:V=[0,0,0]){group('framed_illustration',p,()=>{box('frame_back',m.woodDark,[0,0,0],[w+.12,h+.12,.075]);box('mat_board',m.paper,[0,0,.044],[w+.04,h+.04,.015],undefined,false);mesh('illustration_not_actual_project',new T.PlaneGeometry(w,h),m.art[art],[0,0,.055]);for(const side of [-1,1]){box('frame_vertical',m.wood,[side*(w/2+.045),0,.065],[.065,h+.16,.08]);box('frame_horizontal',m.wood,[0,side*(h/2+.045),.065],[w+.16,.065,.08])}},rotation)}
 function sheet(p:V,w=.38,h=.48,art=0,r:V=[-Math.PI/2,0,0]){mesh('illustrative_sketch',new T.PlaneGeometry(w,h),m.art[art],p,r)}
 function cup(p:V){cyl('mug',m.paper,[p[0],p[1]+.075,p[2]],.055,.043,.15);cyl('mug_dark_interior',m.woodDark,[p[0],p[1]+.152,p[2]],.043,.043,.003);ring('mug_handle',m.paper,[p[0]+.055,p[1]+.09,p[2]],.038,.01,[0,Math.PI/2,0])}
 function bottle(p:V,i=0){cyl('bottle_body',i%2?m.glass:m.brass,[p[0],p[1]+.11,p[2]],.045,.055,.22);cyl('bottle_neck',m.brass,[p[0],p[1]+.245,p[2]],.025,.035,.07)}
 function books(p:V,count=7){for(let i=0;i<count;i++){const h=.23+(i*7%5)*.035;box('book',i%3===0?m.roof:i%3===1?m.tile:m.paper,[p[0]+i*.085,p[1]+h/2,p[2]],[.065,h,.19],[0,0,(i===count-1?-.08:0)]);box('book_spine',m.paper,[p[0]+i*.085,p[1]+h*.24,p[2]+.098],[.045,.013,.005],undefined,false)}}
 function cabinet(p:V,w=1,h=.65){box('cabinet_case',m.woodDark,[p[0],p[1]+h/2,p[2]],[w,h,.5]);for(let j=0;j<3;j++){box('drawer',m.wood,[p[0],p[1]+.13+j*(h-.1)/3,p[2]+.272],[w-.06,(h-.1)/3-.03,.065]);beam('drawer_handle',m.metal,[p[0]-.11,p[1]+.14+j*(h-.1)/3,p[2]+.324],[p[0]+.11,p[1]+.14+j*(h-.1)/3,p[2]+.324],.018)}}
 function shelf(p:V,w:number,h=1.65){for(const x of [-w/2,w/2])box('shelf_side',m.woodDark,[p[0]+x,p[1]+h/2,p[2]],[.055,h,.26]);for(let j=0;j<4;j++){const y=p[1]+j*h/3;box('shelf_board',m.wood,[p[0],y,p[2]],[w,.055,.31]);if(j<3){books([p[0]-w*.43,y+.03,p[2]+.045],Math.floor(w*8));bottle([p[0]+w*.32,y+.03,p[2]+.04],j)}}}
 function chair(p:V,i=0,r=0){group('chair',p,()=>{for(const x of [-.18,.18])for(const z of [-.15,.15])beam('chair_leg',m.metal,[x*1.2,0,z*1.25],[x,.48,z],.022);if(i%2){cyl('stool_seat',m.wood,[0,.47,0],.25,.24,.07);ring('stool_footrest',m.metal,[0,.22,0],.2,.013)}else{box('chair_seat',m.wood,[0,.47,0],[.49,.07,.44]);for(const x of [-.19,.19])beam('chair_back_stay',m.metal,[x,.44,-.16],[x,.91,-.23],.018);box('chair_backrest',m.wood,[0,.79,-.22],[.44,.28,.055],[.08,0,0])}},[0,r,0])}
 function pendant(p:V){beam('lamp_drop',m.metal,p,[p[0],p[1]-.22,p[2]],.015);const lathe=new T.LatheGeometry([new T.Vector2(.02,0),new T.Vector2(.065,-.05),new T.Vector2(.1,-.12),new T.Vector2(.23,-.22),new T.Vector2(.23,-.25)],low?12:24);lathe.computeVertexNormals();mesh('spun_metal_lampshade',lathe,m.metal,[p[0],p[1]-.22,p[2]]);sphere('warm_bulb',m.light,[p[0],p[1]-.43,p[2]],[.095,.045,.095])}
 function lantern(p:V,post=false){group('lantern',p,()=>{if(post){cyl('lamp_base',m.metal,[0,.07,0],.095,.14,.14);cyl('lamp_post',m.metal,[0,.65,0],.035,.055,1.15)}const y=post?1.25:0;box('lantern_glow',m.light,[0,y+.2,0],[.16,.28,.16]);for(const x of [-.105,.105])for(const z of [-.105,.105])beam('lantern_frame',m.metal,[x*.72,y+.03,z*.72],[x,y+.38,z],.014);cyl('lantern_roof',m.metal,[0,y+.4,0],.04,.18,.17,[0,Math.PI/4,0],4);cyl('lantern_base',m.brass,[0,y+.025,0],.115,.09,.06);sphere('lantern_tip',m.brass,[0,y+.51,0],[.03,.04,.03])})}
 function plant(p:V,s=.6){group('planter',p,()=>{
  const pot=new T.LatheGeometry([new T.Vector2(0,0),new T.Vector2(.135,0),new T.Vector2(.19,.3),new T.Vector2(.205,.31),new T.Vector2(.205,.345),new T.Vector2(.175,.345),new T.Vector2(.17,.29),new T.Vector2(.13,.05)],low?12:20);mesh('hollow_terracotta_pot',pot,m.tile);cyl('pot_soil',m.woodDark,[0,.295,0],.169,.169,.014);
  const branches=7;beam('trunk',m.woodDark,[0,.28,0],[.02,.36+s*.65,0],.024);
  for(let b=0;b<branches;b++){const a=b*2.399,h=.46+s*(.35+rand(b+21)*.48),r=.15+s*.15,end:V=[Math.cos(a)*r,h,Math.sin(a)*r];beam('tapered_branch',m.woodDark,[0,.4,0],end,.011);const count=low?9:17;
   for(let i=0;i<count;i++){const seed=b*27+i+71,aa=rand(seed)*Math.PI*2,rr=.17*Math.sqrt(rand(seed+17)),y=end[1]+(rand(seed+4)-.45)*.32,x=end[0]+Math.cos(aa)*rr,z=end[2]+Math.sin(aa)*rr;
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,0,0,-.039,.013,.052,-.042,.018,.11,0,.025,.161,.042,.018,.11,.039,.013,.052,0,.035,.075],3));g.setIndex([0,1,6,1,2,6,2,3,6,3,4,6,4,5,6,5,0,6]);g.computeVertexNormals();projectUV(g);const o=mesh('cupped_leaf',g,i%4?m.leaf:m.leafLight,[x,y,z],[rand(seed+3)*1.5-.8,aa,rand(seed+8)*1.5-.7]);o.scale.setScalar(.72+rand(seed+5)*.7)
   }
  }
 })}

 function crate(p:V,s=.55){group('shipping_crate',p,()=>{
  box('crate_body',m.woodDark,[0,s/2,0],[s*.94,s*.94,s*.94]);
  for(const side of [-1,1]){for(let i=0;i<4;i++){box('crate_face_plank',m.wood,[-s*.375+i*s*.25,s/2,side*s*.5],[s*.24,s,.025]);box('crate_side_plank',m.wood,[side*s*.5,s/2,-s*.375+i*s*.25],[.025,s,s*.24])}for(const yy of [.085,.91]){box('crate_batten',m.wood,[0,s*yy,side*(s*.5+.019)],[s+.025,s*.11,.04]);box('crate_batten',m.wood,[side*(s*.5+.019),s*yy,0],[.04,s*.11,s])}box('crate_handle',m.metal,[0,s*.75,side*(s/2+.045)],[s*.26,.024,.013],undefined,false)}
  for(let i=0;i<4;i++)box('crate_lid_plank',m.wood,[0,s+.007,-s*.375+i*s*.25],[s+.025,.03,s*.235]);for(const x of [-1,1])for(const y of [.085,.91])sphere('crate_screw',m.brass,[x*s*.38,s*y,s/2+.043],[.01,.01,.006]);
 })}

 function roof(x:number,y:number,z:number,w:number,depth:number,rise=.8){
  for(const side of [-1,1]){const angle=side*Math.atan2(rise,w/2),len=Math.hypot(w/2,rise);group('pitched_roof_panel',[x+side*w/4,y+rise/2,z],()=>{
   box('roof_sheathing',m.woodDark,[0,-.07,0],[len+.14,.11,depth+.31]);const count=Math.max(4,Math.round(depth/.4));
   for(let i=0;i<count;i++){const zz=-depth/2+(i+.5)*depth/count;box('roof_metal_sheet',m.roof,[0,0,zz],[len+.2,.068,depth/count-.011]);box('folded_standing_seam',m.metal,[0,.042,zz-depth/count/2],[len+.21,.022,.013],undefined,false)}
   for(const dz of [-1,1])box('gable_verge',m.roof,[0,-.025,dz*(depth/2+.13)],[len+.23,.15,.065]);box('eave_flashing',m.roof,[side*(len/2+.09),-.045,0],[.08,.16,depth+.33]);
   for(let i=0;i<4;i++)box('exposed_rafter',m.woodDark,[side*(len/2+.06),-.14,-depth/2+.22+i*(depth-.44)/3],[.25,.1,.1]);
  },[0,0,-angle])}
  beam('rolled_ridge_cap',m.roof,[x,y+rise+.035,z-depth/2-.2],[x,y+rise+.035,z+depth/2+.2],.07)
 }

 function windowAt(p:V,w=.55,h=.83,ry=0){group('recessed_window',p,()=>{box('window_recess',m.woodDark,[0,0,-.025],[w+.14,h+.14,.08]);box('window_glass',m.glass,[0,0,.023],[w,h,.025]);box('window_inner_curtain',m.paper,[-w*.32,0,.035],[w*.12,h*.85,.014]);for(const side of [-1,1]){box('window_frame',m.paper,[side*(w/2+.025),0,.055],[.035,h+.1,.065]);box('window_frame',m.paper,[0,side*(h/2+.025),.055],[w+.08,.035,.065])}box('window_mullion',m.paper,[0,0,.06],[.035,h,.04]);box('window_mullion',m.paper,[0,0,.06],[w,.035,.04]);box('window_sill',m.paving,[0,-h/2-.09,.08],[w+.27,.12,.22])},[0,ry,0])}
 // Terraced hull: closed underside, U-shaped pedestrian quay and physically bounded water court.
 const outer:[number,number][]=[[-8,-4.6],[-7.5,-5.2],[7.5,-5.2],[8,-4.6],[8,4.6],[7.6,5.15],[5.1,5.5],[4.1,6.9],[2.1,7.5],[-2.1,7.5],[-4.1,6.9],[-5.1,5.5],[-7.6,5.15],[-8,4.6]]
 // Shapes use x/-z because horizontal extrusion rotates around x.
 const horiz=(pts:[number,number][])=>polygon(pts.map(([x,z])=>[x,-z]))
 const hullVerts:number[]=[],hullIndex:number[]=[];for(const [y,scale]of [[-1.9,.91],[-1.29,1]])for(const [x,z]of outer)hullVerts.push(x*scale,y,z*scale);const hn=outer.length;for(let i=0;i<hn;i++){const j=(i+1)%hn;hullIndex.push(i,j,hn+i,j,hn+j,hn+i)}const face=T.ShapeUtils.triangulateShape(outer.map(([x,z])=>new T.Vector2(x,z)),[]);for(const f of face){hullIndex.push(f[0],f[2],f[1]);hullIndex.push(hn+f[0],hn+f[1],hn+f[2])}const hg=new T.BufferGeometry();hg.setAttribute('position',new T.Float32BufferAttribute(hullVerts,3));hg.setIndex(hullIndex);hg.computeVertexNormals();mesh('tapered_closed_lower_hull',projectUV(hg),m.stone)

 const pool:[number,number][]=[[-2.8,-.65],[2.8,-.65],[2.8,4.65],[4.35,5.55],[3.5,6.27],[1.8,6.78],[-1.8,6.78],[-3.5,6.27],[-4.35,5.55],[-2.8,4.65]]
 const quay=horiz(outer),hole=new T.Path();pool.forEach(([x,z],i)=>i?hole.lineTo(x,-z):hole.moveTo(x,-z));hole.closePath();quay.holes.push(hole)
 extrude('thick_quay',quay,1.15,m.stone,[0,-1.28,0],[-Math.PI/2,0,0],.035)
 extrude('paved_quay',quay,.12,m.paving,[0,-.13,0],[-Math.PI/2,0,0],.012)
 extrude('submerged_pool_floor',horiz(pool),.025,m.poolbed,[0,-1.1,0],[-Math.PI/2,0,0],0)
 extrude('contained_turquoise_water',horiz(pool),.035,m.water,[0,-.67,0],[-Math.PI/2,0,0],0)
 // Copings, steel retaining ribs and inset lights follow both the exterior and pool outline.
 for(const [points,inside]of [[outer,false],[pool,true]] as [[number,number][],boolean][]){for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),n=Math.ceil(len/.65);for(let j=0;j<n;j++){const f=(j+.5)/n,x=a[0]+dx*f,z=a[1]+dz*f;box('fitted_coping',inside?m.paving:m.tile,[x,.075,z],[.29,.15,len/n-.018],[0,Math.atan2(dx,dz),0]);if(!inside&&j%3===0){box('hull_rib',m.metal,[x,-.8,z],[.15,1.7,.08],[0,Math.atan2(-dz,dx),0]);sphere('hull_fastener',m.brass,[x,-.4,z],[.025,.025,.025])}}if(!inside&&len>3){const x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;box('inset_hull_lamp_frame',m.metal,[x,-.63,z],[.24,.18,.12],[0,Math.atan2(dx,dz),0]);box('inset_hull_lamp',m.light,[x,-.62,z+.045],[.14,.1,.13],[0,Math.atan2(dx,dz),0])}}}
 for(const [x,z]of [[-7,3.9],[7,3.9],[-5.7,-3.4],[5.7,-3.4],[0,6.7]]){cyl('foundation_drum',m.stone,[x,-1.3,z],.75,.54,2);ring('foundation_collar',m.metal,[x,-1.55,z],.61,.065);cyl('thruster_recess',m.metal,[x,-2.35,z],.42,.31,.3);cyl('thruster_lens',m.cyan,[x,-2.52,z],.26,.2,.05);for(const dx of [-.2,0,.2])box('foundation_window',m.light,[x+dx,-1.63,z+.59],[.13,.25,.04])}
 for(const z of [-3.8,0,3.8])beam('underside_crossmember',m.metal,[-6.8,-1.96,z],[6.8,-1.96,z],.14)
 tube('underside_plumbing',m.brass,[[-6.7,-2.05,-3],[-6.7,-2.2,0],[-3,-2.2,3],[3,-2.2,3],[6.7,-2.05,3]],.08)
 // Fitted ashlar follows the existing retaining outline. The joints are geometry, not black outlines.
 for(const [points,inner]of [[outer,false],[pool,true]] as [[number,number][],boolean][]){
  for(let e=0;e<points.length;e++){const a=points[e],b=points[(e+1)%points.length],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),angle=Math.atan2(dx,dz),count=Math.max(1,Math.ceil(len/.65));
   for(let row=0;row<(inner?3:5);row++){const step=len/count,shift=row%2*.5;for(let k=-1;k<count;k++){const start=Math.max(0,(k+shift)*step),end=Math.min(len,(k+1+shift)*step);if(end-start<.06)continue;const t=(start+end)/(2*len),bottom=row>=3?(.02+(row-3)*.035):0;box('retaining_ashlar_course',m.stone,[(a[0]+dx*t)*(row===4&&!inner?.952:1),-.19-row*.34,(a[1]+dz*t)*(row===4&&!inner?.952:1)],[.15-bottom,.32,end-start-.018],[0,angle,0])}}
  }
 }
 // Tapered buttresses remain under the same platform corners and front edge.
 for(const [x,z]of [[-7,3.9],[7,3.9],[-5.7,-3.4],[5.7,-3.4],[0,6.7]]){
  for(let row=0;row<5;row++){const y=-.45-row*.34,rad=.76-row*.035;for(let j=0;j<12;j++){const a=(j+(row%2)*.5)/12*Math.PI*2;box('drum_cut_stone',m.stone,[x+Math.sin(a)*rad,y,z+Math.cos(a)*rad],[.38,.326,.13],[0,a,0])}}
 }
 for(const [x,z,ry]of [[-5.05,5.37,-.48],[5.05,5.37,.48],[0,7.38,0],[-7.92,1.5,-Math.PI/2],[7.92,1.5,Math.PI/2]]){group('structural_buttress',[x,-1.05,z],()=>{const q=polygon([[-.22,.72],[.22,.72],[.18,-1.2],[-.12,-1.12],[-.43,-.4]]);extrude('buttress_web',q,.18,m.metal,[-.09,0,0],[0,Math.PI/2,0],.015);for(const y of [-.8,0,.55])sphere('buttress_anchor',m.brass,[.11,y,0],[.028,.028,.025])},[0,ry,0])}
 // Mosaic-like paving joints use thin fitted slabs only over walkable areas.
 const inPoly=(x:number,z:number,points:[number,number][])=>{let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside}return inside};
 for(let row=0;row<21;row++)for(let col=0;col<25;col++){const x=-7.8+col*.65+(row%2)*.325,z=-4.8+row*.59;if([[-.32,-.29],[.32,-.29],[-.32,.29],[.32,.29]].every(([dx,dz])=>inPoly(x+dx,z+dz,outer)&&!inPoly(x+dx,z+dz,pool)))box('fitted_paving_slab',m.paving,[x,.021,z],[.631,.035,.569])}
 // Rooms, arches and actual inner surfaces.
 function room(x:number,z:number,w:number,h:number,wall:T.Material,arched=false){group('room_shell',[x,0,z],()=>{box('room_floor',m.paving,[0,.06,-.03],[w,.12,2.85]);for(let j=0;j<7;j++)box('room_floor_plank',m.wood,[0,.13,-1.28+j*.41],[w-.28,.026,.395]);box('interior_wainscot',m.woodDark,[0,.39,-1.335],[w-.3,.59,.035]);for(let j=0;j<Math.floor(w/.33);j++)box('wainscot_batten',m.wood,[-w/2+.22+j*.33,.39,-1.3],[.02,.55,.02],undefined,false);box('room_rear_wall',wall,[0,h/2,-1.48],[w+.22,h,.24]);for(const side of [-1,1]){box('room_side_wall',wall,[side*w/2,h/2,0],[.24,h,3.2]);box('room_wall_plinth',m.paving,[side*w/2,.2,.05],[.29,.4,3.12]);box('room_corner_beam',m.metal,[side*(w/2-.15),h/2,1.49],[.12,h,.14]);box('column_foot',m.metal,[side*(w/2-.15),.13,1.49],[.21,.26,.22]);for(let j=0;j<7;j++)sphere('column_rivet',m.brass,[side*(w/2-.15),.32+j*.35,1.573],[.019,.019,.01]);beam('braced_corner',m.metal,[side*(w/2-.15),h-.65,1.44],[side*(w/2-.65),h-.15,1.44],.035)}box('room_ceiling',m.wood,[0,h+.01,0],[w+.25,.17,3.3]);for(const zz of [-1,.1,1.12])box('ceiling_joist',m.woodDark,[0,h-.13,zz],[w,.14,.1]);
 if(arched){const a=new T.Shape();a.moveTo(-w/2-.1,0);a.lineTo(-w/2-.1,h+.65);a.lineTo(w/2+.1,h+.65);a.lineTo(w/2+.1,0);a.lineTo(w/2-.38,0);a.lineTo(w/2-.38,1.95);a.absellipse(0,1.95,w/2-.38,1.08,0,Math.PI,false,0);a.lineTo(-w/2+.38,0);a.closePath();extrude('true_open_arch',a,.29,wall,[0,0,1.42]);const archBand=new T.Shape();const rx=w/2-.38,ry=1.08,cy=1.95;archBand.moveTo(rx,cy);archBand.absellipse(0,cy,rx,ry,0,Math.PI,false,0);archBand.lineTo(-rx-.19,cy);archBand.absellipse(0,cy,rx+.19,ry+.19,Math.PI,0,true,0);archBand.closePath();extrude('solid_arch_voussoir',archBand,.39,m.orange,[0,0,1.39],undefined,.015);
 for(const side of [-1,1]){box('arch_jamb',m.orange,[side*(rx+.095),.975,1.59],[.19,1.95,.4]);box('arch_foot_stone',m.stone,[side*(rx+.095),.14,1.65],[.28,.28,.46])}
 for(let i=1;i<16;i++){const t=i/16*Math.PI;beam('radial_mortar_joint',m.tile,[rx*Math.cos(t),cy+ry*Math.sin(t),1.798],[(rx+.19)*Math.cos(t),cy+(ry+.19)*Math.sin(t),1.798],.005)}
}
 else{box('steel_lintel',m.metal,[0,h-.14,1.51],[w+.18,.25,.2]);for(let j=0;j<9;j++)sphere('lintel_rivet',j%3===0?m.light:m.brass,[-w/2+.2+j*(w-.4)/8,h-.14,1.625],[.032,.032,.018])}
 for(const xx of [-w*.3,0,w*.3])pendant([xx,h-.12,.6]);for(const xside of [-1,1])tube('copper_conduit',m.brass,[[xside*(w/2-.18),.3,-1.24],[xside*(w/2-.18),h-.45,-1.24],[xside*(w/2-.45),h-.24,-1.24],[0,h-.24,-1.24]],.018)
 });}
 room(0,-2.9,5.05,3.05,m.orange,true);room(-5.45,.1,4.3,2.9,m.wall);room(5.45,.1,4.3,2.9,m.wall)
 // Meeting room: broad wood table, mixed chair silhouettes, shelves, drawings and lamps.
 group('exchange_room_furniture',[0,0,-2.9],()=>{for(let i=0;i<5;i++)box('table_solid_plank',m.wood,[-1.48+i*.74,.85,.08],[.725,.13,1.08]);for(const x of [-1.28,1.28])for(const z of [-.34,.46])beam('trestle_leg',m.woodDark,[x*1.02,.12,z],[x,.8,z*.8],.065);beam('trestle_stretcher',m.woodDark,[-1.28,.29,.05],[1.28,.29,.05],.045);for(let i=0;i<3;i++){chair([-1+i,.12,.95],i,Math.PI);chair([-1+i,.12,-.8],i+1,0)}shelf([-1.68,.17,-1.23],1.1,2.15);cabinet([1.61,.15,-1.13],1.12,.7);frame([.2,1.98,-1.29],1.2,.9,3);frame([1.56,1.98,-1.29],.62,.83,4);sheet([-.8,.925,.04],.55,.42,0);sheet([.62,.926,.05],.47,.38,1,[ -Math.PI/2,0,.16]);cup([-.55,.93,.3]);cup([1.3,.93,-.22]);bottle([1.25,.86,-1],0);box('architectural_model_base',m.woodDark,[-1.15,.95,-.09],[.45,.07,.35]);for(let j=0;j<4;j++)box('small_model_volume',m.paper,[-1.28+j*.09,1.03+(j%2)*.05,-.1],[.065,.12+(j%2)*.1,.2]);plant([1.92,.86,-1.07],.52)})
 // Left prototype workshop, with tilted drawing desk and transparent wire prototype.
 group('design_workshop',[-5.45,0,.1],()=>{shelf([-1.4,.15,-1.18],.88,2.1);shelf([1.35,.15,-1.18],.85,2.1);box('prototype_desk_top',m.wood,[.25,.87,.1],[2.3,.13,.8]);cabinet([.95,.13,.03],.6,.67);for(const x of [-.65,.47])beam('bench_leg',m.metal,[x,.12,.32],[x,.82,.32],.035);chair([.22,.13,.88],1);frame([.05,1.98,-1.25],1.15,.83,0);for(let i=0;i<2;i++)sheet([.73+i*.28,1.66,-1.285],.25,.34,i,[0,0,.02]);group('inclined_drafting_table',[-1.15,1.05,.9],()=>{box('drawing_board',m.wood,[0,0,0],[1.18,.065,.85]);sheet([0,.039,0],1.04,.73,1);for(const x of [-.51,.51])for(const z of [-.3,.3])sphere('paper_clip',m.brass,[x,.049,z],[.023,.018,.026])},[.42,0,0]);for(const x of [-1.57,-.73])beam('drafting_leg',m.woodDark,[x,.12,1.08],[x,1.05,.93],.037);box('prototype_pedestal',m.glass,[.35,1,.02],[.66,.08,.66]);const verts:V[]=[[0,.2,0],[-.27,.48,-.25],[.27,.48,-.25],[.27,.48,.25],[-.27,.48,.25],[0,.94,0]];for(let i=1;i<=4;i++){beam('prototype_wire',m.cyan,[.35,1.04+.2,.02],[.35+verts[i][0],1.04+verts[i][1],.02+verts[i][2]],.012);beam('prototype_wire',m.cyan,[.35,1.98,.02],[.35+verts[i][0],1.04+verts[i][1],.02+verts[i][2]],.012);const j=i===4?1:i+1;beam('prototype_wire',m.cyan,[.35+verts[i][0],1.04+verts[i][1],.02+verts[i][2]],[.35+verts[j][0],1.04+verts[j][1],.02+verts[j][2]],.012)}cup([-.4,.94,.32]);bottle([1.03,.94,-.08]);for(let i=0;i<4;i++)cyl('drawing_roll',m.paper,[1.7,.42+i*.03,.88+i*.08],.045,.045,.68,[0,0,.07])})
 // Right workshop: proper drawers, articulated robot, project-neutral illustration wall and a miniature sail.
 group('fabrication_workshop',[5.45,0,.1],()=>{box('workbench_top',m.wood,[0,.92,-.02],[3.7,.14,.78]);for(const x of [-1.35,1.35])cabinet([x,.12,-.09],.83,.72);chair([-.38,.12,.91],1);shelf([-1.6,.98,-1.19],.55,1.64);for(let i=0;i<3;i++)frame([-.74+i*.77,2.04,-1.28],.53,.72,i+3);for(let i=0;i<3;i++)sheet([-.7+i*.44,1.32,-1.28],.33,.35,i,[0,0,0]);sheet([-.95,1.001,.12],.45,.37,2);box('robot_foot',m.metal,[.62,1.04,-.04],[.39,.1,.33]);const a:V=[.62,1.14,-.04],b:V=[.41,1.6,-.04],c:V=[.87,1.95,-.04],d:V=[1.17,1.52,.08];for(const [p,q]of [[a,b],[b,c],[c,d]]){beam('robot_link',m.metal,p,q,.066);beam('robot_link_highlight',m.roof,[p[0],p[1],p[2]+.028],[q[0],q[1],q[2]+.028],.023)}for(const p of [a,b,c,d]){cyl('robot_joint',m.metal,p,.105,.105,.12,[Math.PI/2,0,0]);cyl('robot_joint_bolt',m.brass,[p[0],p[1],p[2]+.069],.04,.04,.016,[Math.PI/2,0,0])}for(const dx of [-.07,.07])beam('robot_gripper',m.metal,[d[0]+dx,d[1]-.01,d[2]],[d[0]+dx*.5,d[1]-.19,d[2]],.017);box('monitor_stand',m.metal,[1.45,1.09,.1],[.22,.05,.19]);beam('monitor_neck',m.metal,[1.45,1.09,.1],[1.45,1.32,0],.025);box('monitor_bezel',m.metal,[1.45,1.49,-.05],[.59,.4,.065],[.12,0,0]);mesh('monitor_drawing',new T.PlaneGeometry(.49,.31),m.art[1],[1.45,1.49,-.006],[.12,0,0]);box('model_base',m.woodDark,[-.33,1.02,-.13],[.65,.08,.39]);beam('miniature_mast',m.brass,[-.33,1.04,-.13],[-.33,1.84,-.13],.012);const sail=polygon([[0,0],[0,.66],[.28,0]]);extrude('miniature_sail',sail,.009,m.paper,[-.31,1.17,-.13],undefined,0);for(let i=0;i<3;i++)bottle([-1.65+i*.12,1,-.23],i)})
 // Personal-scale desk tools; all drawings are decorative and carry no project claims.
 function pencils(p:V){cyl('pencil_cup',m.brass,[p[0],p[1]+.075,p[2]],.06,.052,.15);for(let j=0;j<5;j++){const a=j*2.4,x=p[0]+Math.cos(a)*.025,z=p[2]+Math.sin(a)*.025;beam('wood_pencil',j%2?m.wood:m.metal,[x,p[1]+.04,z],[x+.016*Math.sin(a),p[1]+.24+(j%3)*.025,z+.016*Math.cos(a)],.007)}}
 function tasklamp(p:V){cyl('desk_lamp_base',m.metal,[p[0],p[1]+.025,p[2]],.115,.13,.05);const a:V=[p[0],p[1]+.06,p[2]],b:V=[p[0]-.1,p[1]+.42,p[2]],c:V=[p[0]+.11,p[1]+.58,p[2]];beam('desk_lamp_lower_arm',m.metal,a,b,.017);beam('desk_lamp_upper_arm',m.metal,b,c,.017);for(const q of [b,c])sphere('lamp_pivot',m.brass,q,[.028,.028,.026]);cyl('desk_lamp_shade',m.metal,[c[0]+.036,c[1]-.04,c[2]],.036,.09,.11,[0,0,.25]);cyl('desk_lamp_diffuser',m.light,[c[0]+.05,c[1]-.094,c[2]],.068,.068,.008)}
 group('exchange_room_life',[0,0,-2.9],()=>{
  for(const [x,y,a]of [[-.77,1.96,0],[-.76,1.38,1],[.14,1.31,2],[.66,1.23,0],[1.96,2.55,1]])sheet([x,y,-1.296],.34,.43,a,[0,0,.04*Math.sin(x)]);
  pencils([.93,.935,.19]);tasklamp([1.61,.89,-1.05]);
  // A stepped architectural maquette and a low fabric work mat on the long table.
  box('work_mat',m.roof,[.26,.92,-.02],[.84,.008,.55],undefined,false);sheet([.26,.929,-.02],.64,.43,2);for(let j=0;j<3;j++){box('stacked_notebook',j%2?m.tile:m.paper,[-.11,.958+j*.027,-.28],[.25,.024,.17],[0,j*.04,0])}
  for(const x of [-1.63,1.67]){box('table_apron',m.woodDark,[x,.735,.08],[.06,.19,.96]);for(const z of [-.3,.43])sphere('table_joinery_pin',m.brass,[x+.034,.75,z],[.012,.014,.014])}
 })
 group('design_tools',[-5.45,0,.1],()=>{pencils([-.55,.94,-.04]);tasklamp([1.12,.94,.24]);for(let j=0;j<3;j++)box('prototype_reference_book',j%2?m.tile:m.paper,[-.41,.965+j*.027,.32],[.27,.024,.18],[0,-.12,0]);crate([.17,.17,-.01],.46);for(let j=0;j<4;j++){const xx=1.7+j*.055;tube('rolled_drawing_edge',m.woodDark,[[xx,.12,.89],[xx,.53,.89]],.003)}})
 group('fabrication_tools',[5.45,0,.1],()=>{
  pencils([-.84,1,-.16]);pencils([.23,1,-.2]);
  for(let j=0;j<3;j++){box('tool_handle',m.wood,[-1.41+j*.27,1.007,.24],[.12,.025,.035],[0,.17*j,0]);beam('tool_shank',m.metal,[-1.36+j*.27,1.013,.24],[-1.2+j*.27,1.013,.24],.009)}
  box('monitor_keyboard',m.metal,[1.43,1.012,.26],[.49,.021,.16]);for(let row=0;row<3;row++)for(let k=0;k<10;k++)box('keyboard_key',m.roof,[1.22+k*.045,1.026,.206+row*.045],[.029,.005,.027],undefined,false);
  // Fine wire ribs make the sail maquette legible as an assembled physical object.
  for(let j=0;j<5;j++){const zz=-.31+j*.083;tube('model_hull_rib',m.brass,[[-.61,1.115,zz],[-.56,1.065,zz],[-.15,1.065,zz],[0,1.13,zz]],.006)}
  for(const x of [-.6,-.15])beam('model_rigging',m.brass,[x,1.12,-.13],[-.33,1.84,-.13],.0035);
 })

 // Slate workshop roofs and narrow rear homes: varied height, real gables, side/rear windows.
 for(const x of [-5.45,5.45]){
  group('single_slope_workshop_roof',[x,3.18,.05],()=>{
   box('roof_substrate',m.woodDark,[0,-.09,0],[4.68,.12,3.55]);
   for(let j=0;j<11;j++){box('roof_sheet',m.roof,[-2.16+j*.432,0,0],[.419,.078,3.6]);box('roof_fold',m.metal,[-2.371+j*.432,.049,0],[.015,.024,3.61],undefined,false)}
   box('front_drip_edge',m.roof,[0,-.015,1.83],[4.83,.17,.09]);for(const side of [-1,1])box('sloped_verge',m.roof,[side*2.4,-.015,0],[.08,.17,3.68]);
  },[.13,0,0]);
  box('rear_roof_terrace',m.paving,[x,3.39,-1.35],[4.65,.12,.82]);box('rear_terrace_coping',m.tile,[x,3.49,-1.75],[4.73,.14,.23]);rail(linePoints([x-2.15,3.56,-1.68],[x+2.15,3.56,-1.68],6),.52);
  for(const side of [-1,1])tube('workshop_downpipe',m.metal,[[x+side*2.28,3.3,-1.57],[x+side*2.31,2.9,-1.67],[x+side*2.31,.18,-1.67]],.04);
 }

 for(const [x,z,w,h,wall]of [[-4.15,-3.4,2.55,5.85,m.wall],[4.18,-3.48,2.65,5.33,m.orange],[0,-4,2.5,4.9,m.orange]] as [number,number,number,number,T.Material][]){const baseY=x===0?3.82:0;box('rear_home_body',wall,[x,(h+baseY)/2,z],[w,h-baseY,2.7]);const g=polygon([[-w/2,0],[w/2,0],[0,.88]]);extrude('masonry_gable',g,2.7,wall,[x,h,z-1.35]);roof(x,h,z,w+.2,2.7,.9);for(const yy of (x===0?[4.36]:[1.05,2.6,4.1])){if(yy>3||x===0)windowAt([x,yy,z+1.37],.55,.85);windowAt([x,yy,z-1.37],.61,.92,Math.PI);for(const side of [-1,1])windowAt([x+side*(w/2+.025),yy,z],.6,.81,side*Math.PI/2)}box('chimney_shaft',m.wall,[x+w*.26,h+.72,z-.62],[.35,1.28,.38]);box('chimney_crown',m.tile,[x+w*.26,h+1.39,z-.62],[.47,.13,.49]);box('chimney_opening',m.metal,[x+w*.26,h+1.465,z-.62],[.22,.015,.25]);tube('home_downpipe',m.metal,[[x+w/2+.12,h-.1,z+.7],[x+w/2+.17,h-.4,z+.9],[x+w/2+.17,baseY+.22,z+.9]],.045)}
 // Usable-looking links supported at both ends, steps reach terrace level without floating.
 for(const side of [-1,1]){const x=side*2.91;for(let j=0;j<10;j++){const h=(j+1)*.29;box('terrace_step',m.paving,[x,h/2,-.38-j*.29],[1.04,h,.3]);box('step_nosing',m.wall,[x,h,-.24-j*.29],[1.07,.06,.055])}rail(Array.from({length:11},(_,i)=>[x+side*.48,i*.29,-.18-i*.29] as V),.62);box('terrace_landing',m.paving,[x,2.83,-3.49],[1.07,.16,1.03]);for(const z of [-3.82,-3.04])cyl('terrace_pier',m.stone,[x,1.41,z],.15,.22,2.82);for(let j=0;j<4;j++)box('upper_landing_step',m.paving,[x,2.94+j*.205,-3.87-j*.25],[1.04,.17,.26]);box('upper_connecting_walk',m.metal,[side*2.05,3.68,-4.6],[1.68,.18,.8]);for(const zz of [-4.94,-4.26])beam('bridge_support',m.metal,[side*2.84,2.6,zz],[side*1.32,3.59,zz],.055);rail(linePoints([side*1.26,3.78,-4.95],[side*2.86,3.78,-4.95],4),.54)}
 // Central parapet, nameplate, fitted coping and full rear service elevation.
 box('meeting_roof',m.tile,[0,3.71,-2.84],[5.48,.18,3.15]);for(let j=0;j<15;j++)for(let k=0;k<6;k++)box('terracotta_roof_tile',m.tile,[-2.56+j*.365,3.82,-4.13+k*.5],[.35,.06,.487]);rail(linePoints([-2.45,3.85,-1.65],[2.45,3.85,-1.65],7),.46)
 box('nameplate_back',m.woodDark,[0,3.37,-1.083],[3.08,.6,.12]);box('nameplate_face',m.paper,[0,3.37,-1.007],[2.96,.48,.043]);for(const x of [-1.37,1.37])for(const y of [3.22,3.52])sphere('nameplate_screw',m.metal,[x,y,-.976],[.025,.025,.012])
 for(const x of [-2.31,2.31]){lantern([x,2.03,-1.02]);plant([x+Math.sign(x)*.32,.09,-.38],.91)}
 rail(linePoints([-7.75,.1,-4.9],[-7.75,.1,4.7],14));rail(linePoints([7.75,.1,-4.9],[7.75,.1,3.3],12));rail(linePoints([-7.6,.1,-4.98],[7.6,.1,-4.98],20));rail(linePoints([-7.45,.1,4.92],[-4.92,.1,5.28],5));rail(linePoints([4.92,.1,5.28],[6.5,.1,4.97],4));rail(linePoints([-2.55,.1,-.67],[2.55,.1,-.67],8));for(const side of [-1,1])rail(linePoints([side*2.82,.1,-.35],[side*2.82,.1,3.5],7));
 // Independent outer berth: solid stepped platform, fenders and physical gap for a future gangway.
 box('outer_berth_deck',m.paving,[7.9,-.22,4.35],[2.05,.26,1.48]);box('berth_support',m.stone,[7.8,-.89,4.35],[1.92,1.13,1.32]);for(let i=0;i<3;i++)box('berth_step',m.paving,[7.03+i*.28,-.06-i*.07,4.35],[.3,.15,1.45]);rail(linePoints([7.28,-.1,3.68],[8.85,-.1,3.68],4),.6);rail(linePoints([7.28,-.1,5.02],[8.85,-.1,5.02],4),.6);for(const z of [3.75,4.94]){cyl('berth_bollard',m.metal,[8.85,.02,z],.08,.12,.33);ring('berth_rope',m.wood,[8.85,.06,z],.12,.017)}crate([7.66,-.08,4.55],.39);plant([7.3,.04,3.7],.48)
 // Quay planting, lights and moorings leave readable larger surfaces between detailed areas.
 for(const [x,z]of [[-7.25,2.1],[7.25,2.5],[-3.34,-.28],[3.34,-.18],[-6.9,-2.25],[6.86,-2.45],[-1.8,-4.78],[1.65,-4.78]])plant([x,.1,z],.6+Math.abs(x)*.04)
 for(const [x,z]of [[-6.95,3.76],[6.9,3.62],[-3.3,3.97],[3.3,3.97],[-2.85,-1],[2.85,-1]])lantern([x,.12,z],true)
 for(const side of [-1,1]){for(const z of [0,2,4.2]){cyl('pool_mooring_pile',m.metal,[side*2.65,-.44,z],.1,.14,1.54);ring('pile_band',m.brass,[side*2.65,-.14,z],.108,.025);ring('waterline_ripple',m.cyan,[side*2.65,-.641,z],.24,.009)}crate([side*3.47,.1,3.78],.51);crate([side*3.46,.62,3.78],.4)}
 // Paired truss cranes are mechanically supported, with hanging cables and suspended crates.
 for(const side of [-1,1]){const x=side*7.47;box('crane_base',m.metal,[x,.2,2.72],[.5,.38,.5]);beam('crane_column',m.metal,[x,.22,2.72],[x,2.9,2.72],.07);beam('crane_jib',m.metal,[x,2.9,2.72],[x+side*1.1,2.9,2.72],.065);beam('crane_brace',m.metal,[x,2.24,2.72],[x+side*.8,2.9,2.72],.028);ring('crane_pulley',m.brass,[x+side*1.1,2.9,2.72],.09,.025,[0,Math.PI/2,0]);beam('crane_cable',m.woodDark,[x+side*1.1,2.85,2.72],[x+side*1.1,1.81,2.72],.009);crate([x+side*1.1,1.35,2.72],.4)}
 // Existing outer walls receive the windows and framed works visible in the reference.
 for(const side of [-1,1]){windowAt([side*7.746,1.75,-.15],.59,.85,side*Math.PI/2);box('workshop_corner_quoin',m.paving,[side*7.6,.2,1.68],[.35,.4,.34]);for(let j=0;j<5;j++)box('thin_corner_quoin',m.wall,[side*7.59,.65+j*.48,1.69],[.31,.21,.29]);}
 group('exterior_art_wall',[7.746,0,.1],()=>{for(let i=0;i<3;i++)frame([-.76+i*.75,1.64,.04],.46,.62,3+i);box('wall_console',m.wood,[0,.65,.3],[2.5,.09,.48]);for(const x of [-1,1])beam('console_bracket',m.metal,[x,.26,.05],[x,.6,.42],.022);bottle([.72,.7,.33]);cup([.3,.7,.33])},[0,Math.PI/2,0]);
 // Modest roof service details from the chosen silhouette, anchored to real surfaces.
 for(const [x,y,z]of [[-4.15,6.82,-3.9],[4.18,6.3,-3.9]]){beam('aerial_mast',m.metal,[x,y-.2,z],[x,y+.65,z],.019);for(const yy of [y+.18,y+.49])beam('aerial_crossbar',m.metal,[x-.2,yy,z],[x+.2,yy,z],.011)}
 for(const side of [-1,1]){crate([side*6.5,3.48,-1.45],.37);plant([side*7.14,3.48,-1.46],.57)}
 // Back-of-house service brackets are attached to the back wall, not suspended at the quay boundary.
 for(const side of [-1,1]){const x=side*4.18;box('rear_service_hatch',m.metal,[x,1.1,-4.855],[.61,.85,.06]);box('rear_service_handle',m.brass,[x+.19,1.07,-4.903],[.025,.13,.028]);for(const yy of [.22,1.4,2.7,4.3])box('pipe_wall_clamp',m.brass,[x+.71,yy,-4.91],[.12,.045,.13]);tube('rear_wall_riser',m.metal,[[x+.71,.1,-4.96],[x+.71,4.65,-4.96],[x+.4,4.8,-4.96]],.039)}
 // Sculpted chine hulls and a real glazed cabin; separate assemblies remain static.
 function hull(name:string,material:T.Material,length:number,width:number,height:number){
  const outline=new T.Shape();outline.moveTo(0,length*.5);outline.bezierCurveTo(width*.22,length*.48,width*.5,length*.29,width*.5,length*.12);outline.lineTo(width*.5,-length*.35);outline.quadraticCurveTo(width*.5,-length*.49,width*.33,-length*.5);outline.lineTo(-width*.33,-length*.5);outline.quadraticCurveTo(-width*.5,-length*.49,-width*.5,-length*.35);outline.lineTo(-width*.5,length*.12);outline.bezierCurveTo(-width*.5,length*.29,-width*.22,length*.48,0,length*.5);
  const points=outline.getSpacedPoints(low?24:48).slice(0,-1),N=points.length,pos:number[]=[],indices:number[]=[];
  const rings=[[.79,.84,0],[.88,.94,height*.15],[1,1,height*.79],[.99,.998,height]];
  for(const [sx,sz,yy]of rings)for(const q of points)pos.push(q.x*sx,yy,q.y*sz);
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<N;i++){const a=j*N+i,b=j*N+(i+1)%N,c=a+N,d=b+N;indices.push(a,b,c,b,d,c)}
  const bottom=pos.length/3;pos.push(0,0,0);const top=pos.length/3;pos.push(0,height,0);for(let i=0;i<N;i++){indices.push(bottom,(i+1)%N,i);indices.push(top,3*N+i,3*N+(i+1)%N)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(indices);g.computeVertexNormals();return mesh(name,projectUV(g),material)
 }
 function pane(name:string,material:T.Material,points:V[]){const p=points.flat(),idx:number[]=[];for(let j=1;j<points.length-1;j++)idx.push(0,j,j+1);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();projectUV(g);return mesh(name,g,material)}
 function boat(p:V,rot:number,courier=false,idx=0){group(courier?'idea_courier_static':'harbor_workboat_'+idx,p,()=>{
  const length=courier?2.36:2.02,width=courier?.99:.92;
  hull('lower_curved_hull',m.roof,length*.99,width*.95,.19);
  hull('orange_topsides',m.orange,length,width,.16).position.y=.16;
  hull('narrow_rubber_sheer',m.rubber,length*1.012,width*1.02,.035).position.y=.315;
  hull('cream_deck_lip',m.paper,length*.985,width*.982,.034).position.y=.35;
  box('recessed_cargo_floor',m.woodDark,[0,.389,-.49],[width*.8,.025,.95]);
  for(let j=0;j<6;j++)box('cargo_deck_plank',m.wood,[-width*.33+j*width*.132,.407,-.49],[width*.125,.018,.94]);
  for(const side of [-1,1]){for(const z of [-length*.4,-length*.09]){beam('boat_rail_post',m.metal,[side*width*.46,.39,z],[side*width*.46,.57,z],.013);ring('rubber_fender',m.rubber,[side*width*.51,.22,z],.094,.032,[0,Math.PI/2,0]);beam('fender_lanyard',m.woodDark,[side*width*.45,.39,z],[side*width*.51,.28,z],.005)}beam('cargo_guardrail',m.metal,[side*width*.46,.57,-length*.4],[side*width*.46,.57,-length*.09],.017);
   for(const z of [-length*.32,length*.11]){box('boat_hull_patch',m.roof,[side*width*.496,.235,z],[.012,.05,.16]);sphere('hull_rivet',m.brass,[side*width*.512,.25,z+.08],[.007,.013,.013])}
  }
  const cabRear=-.16,front=.86,roofFront=.51,roofY=.98,bottom=.4,half=.375;
  // Tubular frames describe a gently rounded trapezoidal cabin, with no opaque box behind the windows.
  for(const side of [-1,1]){const xx=side*half;
   pane('side_cabin_glass',m.glass,[[xx,bottom+.07,cabRear+.06],[xx,roofY-.06,cabRear+.08],[xx,roofY-.06,roofFront-.05],[xx,bottom+.095,front-.14]]);
   tube('ivory_cabin_frame',m.paper,[[xx,bottom,cabRear],[xx,roofY-.08,cabRear],[xx*.96,roofY,cabRear+.06],[xx*.96,roofY,roofFront-.035],[xx*.98,roofY-.05,roofFront+.035],[xx*.9,bottom+.055,front],[xx,bottom,cabRear]],.02);
   beam('door_divider',m.paper,[xx,bottom+.045,.055],[xx,roofY-.015,.055],.017);box('door_lower_panel',m.orange,[xx,bottom+.052,.12],[.047,.095,.62]);box('door_handle',m.metal,[xx+side*.027,.59,.11],[.022,.024,.085]);
   sphere('running_light',m.light,[side*.315,.3,front+.14],[.053,.032,.022]);
  }
  pane('curved_front_windshield',m.glass,[[-half*.89,bottom+.08,front+.005],[-half*.96,roofY-.04,roofFront+.018],[0,roofY-.018,roofFront+.047],[half*.96,roofY-.04,roofFront+.018],[half*.89,bottom+.08,front+.005]]);
  tube('windshield_upper_lip',m.paper,[[-half*.96,roofY-.04,roofFront+.018],[0,roofY+.018,roofFront+.052],[half*.96,roofY-.04,roofFront+.018]],.02);
  tube('windshield_bottom_lip',m.paper,[[-half*.9,bottom+.08,front+.01],[0,bottom+.055,front+.055],[half*.9,bottom+.08,front+.01]],.02);
  beam('thin_centre_mullion',m.paper,[0,bottom+.071,front+.036],[0,roofY-.015,roofFront+.052],.012);
  pane('rear_cabin_glass',m.glass,[[-half+.04,bottom+.12,cabRear-.006],[half-.04,bottom+.12,cabRear-.006],[half-.04,roofY-.08,cabRear-.006],[-half+.04,roofY-.08,cabRear-.006]]);
  // Slightly crowned roof, supported by the frame, with a thin folded edge.
  const cap=new T.Shape();cap.moveTo(-half-.03,0);cap.quadraticCurveTo(0,.09,half+.03,0);cap.lineTo(half+.03,-.038);cap.quadraticCurveTo(0,.047,-half-.03,-.038);cap.closePath();extrude('crowned_cabin_roof',cap,roofFront-cabRear+.055,courier?m.orange:m.paper,[0,roofY+.015,cabRear-.015],undefined,.009);
  box('roof_beacon_base',m.metal,[0,roofY+.09,.15],[.19,.042,.1]);box('roof_beacon_lens',m.brass,[0,roofY+.115,.15],[.14,.035,.064]);
  // Cabin interior: cushion, seat back, control shelf, wheel and footwell are visible through glazing.
  box('cabin_floor',m.roof,[0,.407,.29],[.69,.025,.76]);box('seat_cushion',m.rubber,[0,.56,.08],[.32,.1,.26]);box('seat_back',m.rubber,[0,.71,-.045],[.33,.31,.065],[.1,0,0]);beam('seat_pedestal',m.metal,[0,.42,.08],[0,.52,.08],.06);box('control_console',m.metal,[0,.64,.58],[.52,.07,.18],[.13,0,0]);ring('steering_wheel',m.metal,[0,.734,.49],.087,.011,[.7,0,0]);beam('steering_column',m.brass,[0,.6,.58],[0,.73,.49],.013);
  for(const side of [-1,1]){box('nose_lamp_housing',m.metal,[side*.23,.27,length*.43],[.13,.071,.067],[0,-side*.25,0]);box('nose_lamp_lens',m.light,[side*.23,.27,length*.447],[.075,.033,.025],[0,-side*.25,0])}
  if(courier){
   for(const side of [-1,1])for(const zz of [-.77,.59]){group('independent_lift_pod',[side*.49,.1,zz],()=>{cyl('pod_housing',m.roof,[0,0,0],.14,.155,.17);ring('pod_ring',m.metal,[0,-.075,0],.131,.024);cyl('pod_lens',m.cyan,[0,-.102,0],.1,.1,.025)})}
   crate([-.19,.42,-.51],.32);crate([.19,.42,-.7],.29);
   // Blueprint rack runs along the rear cargo bed; broad rolls and their open end rings are visible.
   for(const zz of [-.96,-.31]){beam('blueprint_rack',m.metal,[-.39,.42,zz],[-.39,.99,zz],.018);beam('blueprint_rack',m.metal,[.39,.42,zz],[.39,.99,zz],.018);beam('rack_crossbar',m.metal,[-.39,.85,zz],[.39,.85,zz],.015)}
   for(let j=0;j<3;j++){const xx=-.245+j*.245;cyl('rolled_blueprints',m.paper,[xx,.94,-.65],.091,.091,.85,[Math.PI/2,0,0]);for(const zz of [-1.081,-.218]){ring('paper_roll_rim',m.paper,[xx,.94,zz],.081,.01,[0,0,0]);cyl('paper_roll_hollow',m.woodDark,[xx,.94,zz],.047,.047,.003,[Math.PI/2,0,0])}for(const zz of [-.91,-.4])ring('blueprint_strap',m.metal,[xx,.94,zz],.097,.012,[0,0,0])}
  }else{crate([-.18,.43,-.48],.32);crate([.2,.43,-.66],.28);beam('boat_antenna',m.metal,[.2,1.04,.2],[.2,1.37,.2],.007)}
 },[0,rot,0],true)}
 boat([-1.1,-.62,2.3],-.35,false,1);boat([1.18,-.62,4.4],Math.PI*.62,false,2);boat([10.15,-.48,4.38],Math.PI/2,true)
 // A supported rear roof landing carries the existing central upper house.
 box('rear_upper_landing',m.paving,[0,3.71,-4.87],[2.78,.17,1.01]);
 for(const side of [-1,1]){
  box('rear_support_foot',m.stone,[side*1.29,.1,-5.09],[.29,.2,.29]);box('rear_upper_pier',m.metal,[side*1.29,1.9,-5.09],[.13,3.61,.13]);
  beam('rear_roof_bracket',m.metal,[side*1.29,2.73,-5.09],[side*.56,3.6,-5.09],.032);
  box('bridge_wall_mount',m.metal,[side*2.84,2.6,-4.86],[.18,.18,.24]);
  box('rear_room_vent',m.metal,[side*1.55,2.53,-4.505],[.66,.4,.07]);for(let j=0;j<6;j++)box('vent_louvre',m.roof,[side*1.55,2.39+j*.055,-4.55],[.55,.022,.018],undefined,false)
 }
 box('rear_access_door',m.woodDark,[0,1.13,-4.525],[.9,2.0,.065]);for(let j=0;j<6;j++)box('door_vertical_plank',m.wood,[-.36+j*.145,1.13,-4.567],[.138,1.92,.019]);box('door_latch',m.brass,[.28,1.05,-4.589],[.027,.13,.019]);
 // Service ladders and mounts attach to each existing rear elevation.
 for(const side of [-1,1]){const x=side*4.18+.9;for(const xx of [x-.16,x+.16])tube('service_ladder',m.metal,[[xx,.18,-4.99],[xx,4.91,-4.99],[xx,5.05,-4.88]],.022);for(let j=0;j<18;j++)beam('ladder_rung',m.metal,[x-.16,.25+j*.26,-4.99],[x+.16,.25+j*.26,-4.99],.016);for(const yy of [.42,1.8,3.1,4.5])for(const xx of [x-.16,x+.16])beam('ladder_wall_mount',m.metal,[xx,yy,-4.99],[xx,yy,-4.81],.02)}
 // Batch static geometry by material, preserving UVs and named moving assemblies.
 root.updateMatrixWorld(true)
 for(const branch of [...root.children]){const inverse=branch.matrixWorld.clone().invert(),buckets=new Map<T.Material,T.BufferGeometry[]>();branch.traverse(o=>{if(o instanceof T.Mesh){let g=o.geometry.clone().applyMatrix4(inverse.clone().multiply(o.matrixWorld));if(g.index)g=g.toNonIndexed();const material=o.material as T.Material,gs=buckets.get(material)||[];gs.push(g);buckets.set(material,gs)}});branch.clear();for(const [material,gs]of buckets){const merged=mergeGeometries(gs);if(merged){const indexed=mergeVertices(merged);merged.dispose();const o=new T.Mesh(indexed,material);o.name=material.name;branch.add(o)}gs.forEach(g=>g.dispose())}}
 root.userData={revision:'harbor-refined-v2',staticReview:true,illustrations:'Decorative props; not claimed as actual portfolio work',source:'blender/harbor-refined + harborRefinedV2.ts'};return root
}
