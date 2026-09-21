import * as T from 'three'
import {Kit,palette,material,road,type V} from './kit'

export const motorRoad:V[]=[[-4,1.1,7],[-.5,-.2,8.7],[4.7,-1.2,7.6],[7.6,.7,4.1],[6.9,3.8,0],[3.9,6.3,-3],[0,6.9,-4.6],[-5,5.3,-3.9],[-8,2.7,-.6],[-7.5,1.1,4]]
export function buildMotor(){const k=new Kit('Hyundai_coastal_driving_story'),p=palette(),navy=material('Hyundai_Blue_002C5F','#002c5f',.15,.53),grass=material('coastal_olive','#6c8249');coastalTerrain(k)
 // A modest lower bay occupies a carved coastal opening, not the whole planet.
 k.mesh('lower_bay',new T.CircleGeometry(3.65,64),p.water,[2,-2.65,6],[1,.78,1],[-Math.PI/2,0,0])
 for(let i=0;i<50;i++){const a=i*.81,y=-8.9+(i%8)*.64,r=Math.sqrt(Math.max(0,9*9-y*y));k.orb('coast_rock',p.stone,[Math.sin(a)*r,y,Math.cos(a)*r],[.35+(i%3)*.12,.45,.4])}
 // The factory is a carved, warm-lit room in the upper left mountain.
 k.box('factory_floor',p.ivory,[-3.9,1.28,5],[6.4,.22,4.2]);k.box('factory_back',p.stone,[-3.9,3.2,3],[6.4,3.9,.2]);for(const x of [-7.1,-.7])k.box('factory_side',p.ivory,[x,3.2,5],[.18,3.9,4.2]);k.box('factory_canopy',navy,[-3.9,5.22,5.8],[6.65,.68,2.6]);for(let i=0;i<5;i++)k.box('factory_wall_lamp',p.light,[-6.5+i*1.25,3.5,3.15],[.075,1.8,.08]);k.box('assembly_bed',p.steel,[-3.9,1.68,5.2],[4.8,.25,1.5]);k.car('assembly_car',p.white,p,[-3.9,1.8,5.2],1.2)
 for(const sign of [-1,1]){const arm=new T.Group();arm.name='motor_arm_'+sign;arm.position.set(-3.9+sign*2,1.65,4.8);k.root.add(arm);k.cyl('robot_base',navy,[0,0,0],.35,.3,arm);k.beam('robot_lower',p.ivory,[0,.15,0],[-sign*.5,1.25,0],.19,arm);k.orb('robot_joint',navy,[-sign*.5,1.25,0],[.24,.24,.24],arm);k.beam('robot_upper',p.ivory,[-sign*.5,1.25,0],[-sign*1.1,1.3,.25],.14,arm)}
 for(const x of [-6.7,-1.3]){k.box('tool_cart',navy,[x,1.85,6.2],[.65,.85,.7]);for(let j=0;j<3;j++)k.box('drawer',p.steel,[x,1.55+j*.25,6.56],[.54,.035,.02])}
 road(k,'curved_test_road',motorRoad,1.15,p)
 // Masonry bridge beneath the front road; open arches remain genuinely hollow.
 for(const x of []){k.box('bridge_pier',p.stone,[x,-2,8.1],[.42,3.2,.7]);const points=Array.from({length:21},(_,i)=>[x+.23+i/20*1.86,-1.8+Math.sin(i/20*Math.PI)*.82,8.1] as V);k.tube('stone_arch',p.stone,points,.19)}
 // Rock plinth joins the cockpit terrace to the mountain.
 const rock=new T.CylinderGeometry(2.5,3.15,3.5,24,9);const rp=rock.attributes.position;for(let i=0;i<rp.count;i++){const x=rp.getX(i),y=rp.getY(i),z=rp.getZ(i),f=1+Math.sin(Math.atan2(z,x)*7+y*1.7)*.055;rp.setXYZ(i,x*f,y,z*f)}rock.computeVertexNormals();k.mesh('cockpit_rock_plinth',rock,p.stone,[3.25,4.5,-.6],[1,1,.74]);
 const tunnel=Array.from({length:25},(_,i)=>[-4.9+Math.cos(i/24*Math.PI)*.85,1.1+Math.sin(i/24*Math.PI)*1.15,7.1] as V);k.tube('tunnel_portal',p.stone,tunnel,.25);k.box('tunnel_depth',p.dark,[-4.9,1.45,6.95],[1.5,1.5,.08]);k.box('tunnel_lamp',p.light,[-4.9,2.1,7.05],[.06,.5,.03])
 // The selected upper-right cockpit pavilion is small and fully furnished.
 k.cyl('cockpit_terrace',p.ivory,[3.25,6.4,-.6],2.7,.26);k.box('cockpit_floor',navy,[3.25,6.62,-.6],[4.4,.17,2.8]);k.box('cockpit_rear',p.ivory,[3.25,7.65,-1.95],[4.5,2.15,.17]);for(const x of [1.05,5.45])k.box('pavilion_column',p.ivory,[x,7.65,.65],[.15,2.1,.18]);k.mesh('sweeping_roof',new T.SphereGeometry(1,40,16,0,Math.PI*2,0,Math.PI*.48),p.ivory,[3.25,8.62,-.6],[2.75,.65,1.9]);k.box('IONIQ_sign',navy,[3.25,8.72,1.1],[2.1,.58,.08]);k.box('panoramic_dashboard',navy,[3.25,7.35,-1.2],[3.5,.65,.5]);k.box('music_screen',p.blue,[3.25,7.45,-.93],[2.25,.42,.025]);k.ring('steering_wheel',p.dark,[2.1,7.32,-.45],.28,.04)
 for(const x of [2.3,4.2]){k.box('seat_base',navy,[x,6.94,.1],[.8,.48,.8]);k.box('seat_cushion',p.ivory,[x,7.17,.1],[.81,.16,.76]);k.box('seat_back',p.ivory,[x,7.6,.48],[.82,.91,.2],[-.1,0,0]);k.box('headrest',navy,[x,8.12,.49],[.48,.28,.18])}for(const side of [-1,1])k.box('cockpit_light',p.light,[3.25+side*2.1,8.5,-.6],[.045,.035,2.4])
 for(let i=0;i<3;i++)k.car('motor_car_'+i,i===1?navy:p.white,p,[0,0,0],.85)
 // Plant on the actual sculpted height field, leaving rooms and road clear.
 for(let i=0;i<160;i++){const a=i*2.399,r=2+Math.sqrt((i%37)/37)*6.9,x=Math.sin(a)*r,z=Math.cos(a)*r,y=coastalHeight(x,z);if((x<0&&z>2)||(x>0&&x<6.3&&z> -3&&z<2)||roadDistance(x,z)<1.1)continue;k.tree([x,y,z],.28+(i%5)*.09,i%3?grass:p.green,p,i)}
 for(let i=0;i<95;i++){const a=i*2.399,r=5+(i%11)*.36,x=Math.sin(a)*r,z=Math.cos(a)*r,y=coastalHeight(x,z);if(roadDistance(x,z)<.9||(x<0&&z>2)||(x>0&&x<6.3&&z> -3&&z<2))continue;k.orb('stratified_coastal_rock',p.stone,[x,y-.15,z],[.5+(i%3)*.12,.22,.4])}
 for(let j=0;j<10;j++)k.box('factory_side_rib',navy,[-.585,3.3,3.3+j*.38],[.04,2.8,.07]);
 // Factory glazing, metal mullions, service lines and roof seams.
 for(let j=0;j<12;j++){const x=-6.8+j*.53;k.box('canopy_seam',p.steel,[x,5.57,5.8],[.025,.015,2.5]);k.box('factory_back_glazing',navy,[x,4.35,3.13],[.42,.52,.04]);k.box('factory_glazing_mullion',p.steel,[x+.24,4.35,3.17],[.025,.6,.04])}
 for(let j=0;j<9;j++)k.box('assembly_floor_joint',p.steel,[-6.5+j*.65,1.402,5],[.018,.01,3.8]);
 k.tube('factory_service_pipe',p.steel,[[-6.8,2,3.24],[-6.8,4.85,3.24],[-1,4.85,3.24]],.045)
 for(const x of [1.1,5.4])for(let j=0;j<8;j++)k.box('cockpit_side_louvre',p.ivory,[x,7.5,-1.6+j*.25],[.05,1.8,.035]);
 const under=motorRoad.map(q=>[q[0],q[1]-.11,q[2]] as V);k.tube('continuous_road_structure',p.stone,under,.16,k.static,true);
 const edge=new T.CatmullRomCurve3(motorRoad.map(q=>new T.Vector3(...q)),true);
 for(let j=0;j<72;j++){const t=j/72,q=edge.getPoint(t),d=edge.getTangent(t),side=new T.Vector3(-d.z,0,d.x).normalize();for(const sign of [-1,1]){const v=q.clone().addScaledVector(side,sign*.66);k.beam('road_safety_post',p.steel,v.toArray() as V,[v.x,v.y+.3,v.z],.018);if(j%4===0){const bottom=Math.min(coastalHeight(v.x,v.z)-.1,q.y-.5);k.box('viaduct_pier',p.stone,[v.x,(bottom+q.y)/2,v.z],[.18,q.y-bottom,.22])}}}
 for(const q of motorRoad.filter((_,i)=>i%2===0))k.lamp([q[0]+.65,q[1],q[2]],p,.65)
 k.box('charge_post',navy,[6.9,1.4,5.1],[.4,.95,.32]);k.box('charge_screen',p.blue,[6.9,1.57,5.28],[.25,.35,.025]);
 return k.finish()}

const sampledRoad=new T.CatmullRomCurve3(motorRoad.map(q=>new T.Vector3(...q)),true).getPoints(240)
function roadDistance(x:number,z:number){return Math.min(...sampledRoad.map(q=>Math.hypot(x-q.x,z-q.z)))}
function coastalHeight(x:number,z:number){
 const r=Math.hypot(x,z),edge=Math.sqrt(Math.max(0,1-r*r/(9.45*9.45)));
 let h=-3+edge*(5.8+3.4*Math.exp(-((x+2)**2/16+(z+4)**2/10)));
 h+=edge*(Math.sin(x*2.1+z)*.14+Math.sin(z*3.4-x)*.07);
 if(z>4.5&&x> -1.5){const t=T.MathUtils.smoothstep(z,4.5,5.5)*T.MathUtils.smoothstep(x,-1.5,-.5);h=T.MathUtils.lerp(h,-4.1,t)}
 // Smooth approach terraces are below furnished floors; no triangle cutout holes.
 const shelf=(cx:number,cz:number,w:number,d:number,level:number)=>{const dist=Math.max(Math.abs(x-cx)-w,Math.abs(z-cz)-d,0),t=T.MathUtils.smoothstep(dist,0,.65);h=Math.min(h,level+(1-t)*0+t*20)};
 shelf(-3.9,5.3,3.45,2.35,1.1);shelf(3.25,-.6,2.9,2,6.16);
 for(const q of sampledRoad){const dist=Math.hypot(x-q.x,z-q.z);if(dist<1.05)h=Math.min(h,q.y-.17+T.MathUtils.smoothstep(dist,.7,1.05)*8)}
 return h
}
function coastalTerrain(k:Kit){
 const n=128,rows=48,vertices:number[]=[],colors:number[]=[],indices:number[]=[],stone=new T.Color('#8a8976'),green=new T.Color('#657853');
 for(const lower of [false,true])for(let j=0;j<=rows;j++)for(let i=0;i<=n;i++){const r=j/rows*9.45,a=i/n*Math.PI*2,x=Math.sin(a)*r,z=Math.cos(a)*r,y=lower?-3-6.2*Math.sqrt(Math.max(0,1-r*r/9.45**2)):coastalHeight(x,z);vertices.push(x,y,z);const c=stone.clone().lerp(green,lower?.12:T.MathUtils.clamp(.25+y*.065+Math.sin(x+z)*.12,0,.75));colors.push(...c.toArray());}
 const count=(rows+1)*(n+1);for(let part=0;part<2;part++)for(let j=0;j<rows;j++)for(let i=0;i<n;i++){const a=part*count+j*(n+1)+i,b=a+n+1;indices.push(...(part?[a,b,a+1,a+1,b,b+1]:[a,a+1,b,a+1,b+1,b]))}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();const m=material('coastal_layered_terrain','#ffffff',.02,.92);m.vertexColors=true;m.side=T.DoubleSide;k.mesh('coastal_sculpture',g,m)
}
