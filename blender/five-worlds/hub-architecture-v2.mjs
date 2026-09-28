import {T,vec} from './geometry-v2.mjs'

// Constructed architectural components; all rooms remain actual geometry from every angle.
export function hubArchitecture(k,m,low){
 function outline(w,d,r){
  const x=w/2,z=d/2,s=new T.Shape();s.moveTo(-x+r,-z);s.lineTo(x-r,-z);s.quadraticCurveTo(x,-z,x,-z+r);s.lineTo(x,z-r);s.quadraticCurveTo(x,z,x-r,z);s.lineTo(-x+r,z);s.quadraticCurveTo(-x,z,-x,z-r);s.lineTo(-x,-z+r);s.quadraticCurveTo(-x,-z,-x+r,-z);return s
 }
 function slab(name,material,p,w,d,h,r=.5){
  const g=new T.ExtrudeGeometry(outline(w,d,r),{depth:h,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:low?1:3,curveSegments:low?8:20});
  return k.mesh(name,k.uv(g),material,p,[-Math.PI/2,0,0])
 }
 function frame(p,w,h,rotation=0){k.group('window_bay',p,()=>{
  for(const sx of [-1,1])k.box('window_recess_jamb',m.navy,[sx*(w/2+.025),h/2,-.08],[.07,h+.08,.16]);k.box('window_glazing',m.glass,[0,h/2,.013],[w-.04,h-.03,.02]);
  for(const x of [-w/2,0,w/2])k.box('window_stile',m.alloy,[x,h/2,.029],[.035,h,.06]);for(const y of [0,h])k.box('window_transom',m.alloy,[0,y,.03],[w+.07,.04,.07]);
  k.box('window_sill',m.white,[0,-.025,.065],[w+.15,.07,.23]);k.box('warm_window_valance',m.warm,[0,h-.09,-.012],[w-.1,.022,.038]);
 },[0,rotation,0])}
 function frontHallPodium(i,x,y,z){k.group('rectangular_occupied_wing_'+i,[x,0,z],()=>{
  slab('wing_foundation',m.navy,[0,-2.15,0],5.24,4.22,.42,.63);
  slab('wing_lower_floor',m.white,[0,-1.75,0],5.47,4.48,.13,.66);
  slab('wing_upper_floor',m.white,[0,y-.17,0],5.55,4.55,.26,.7);
  slab('wing_wear_surface',m.floor,[0,y+.1,0],5.45,4.45,.045,.66);
  for(const sx of [-1,1]){k.box('wing_load_header',m.white,[sx*2.4,y-.32,0],[.28,.21,3.34]);k.box('wing_load_plinth',m.white,[sx*2.4,-1.65,0],[.28,.19,3.34]);for(const zz of [-1,1])k.box('wing_corner_pier',m.white,[sx*2.4,(y-1.62)/2,zz*1.75],[.28,y+1.7,.3]);for(let bay=0;bay<3;bay++)frame([sx*2.552,-1.47,-1.07+bay*1.08],.85,Math.max(.63,y+1.18),sx*Math.PI/2)}
  for(const zz of [-1,1])for(let bay=0;bay<4;bay++){const xx=-1.74+bay*1.16;frame([xx,-1.48,zz*2.13],.94,Math.max(.62,y+1.18),zz<0?Math.PI:0);k.box('wing_structural_pier',m.white,[xx-.56,(y-1.62)/2,zz*2.16],[.16,y+1.8,.2])}
  // Visible lower interior shelving, benches and suspended services.
  for(let bay=0;bay<3;bay++){k.box('lower_work_bench',m.wood,[-1.5+bay*1.45,-.99,.9],[1.12,.09,.59]);k.box('bench_storage',m.navy,[-1.5+bay*1.45,-1.29,.9],[.53,.5,.47])}
  for(const sx of [-1,1]){k.box('wing_bottom_beam',m.alloy,[sx*1.75,-2.21,0],[.15,.27,3.8]);k.box('wing_service_trunk',m.navy,[sx*1.75,-2.42,-.2],[.31,.19,2.38]);}
  // Individually jointed porcelain fascia, not repeated ventilation grilles.
  for(let j=0;j<8;j++)k.box('fascia_expansion_joint',m.alloy,[-2.14+j*.61,y-.035,2.284],[.015,.2,.009]);
 })}
 function frontHall(i){
  // Wide cutaway hall. Side piers and clerestory preserve the silhouette of a real room.
  for(const sx of [-1,1]){k.box('hall_side_wall',m.white,[sx*2.48,1.03,-.7],[.19,2.06,2.55],undefined,.06);k.box('corner_titanium_reveal',m.alloy,[sx*2.589,1.03,-.42],[.028,1.95,.065]);}
  k.box('hall_back_wall',m.white,[0,1.13,-2.03],[4.83,2.26,.22],undefined,.075);
  for(const sx of [-1,1]){k.box('rear_display_recess',m.navy,[sx*1.37,1.13,-1.897],[1.46,1.67,.043]);for(let j=0;j<4;j++){k.box('shelf',m.wood,[sx*1.37,.44+j*.41,-1.71],[1.4,.04,.35]);for(let book=0;book<5;book++)k.box('tool_archive',book%3===0?m.blue:m.white,[sx*1.37-.53+book*.23,.59+j*.41,-1.75],[.13,.23,.12]);}k.box('shelf_light',m.warm,[sx*1.37,1.924,-1.63],[1.28,.025,.018]);}
  k.box('rear_door_reveal',m.navy,[0,.91,-1.896],[.8,1.82,.065]);k.box('rear_door',m.alloy,[0,.91,-1.848],[.72,1.7,.026]);k.box('door_glass',m.glass,[0,1.15,-1.828],[.5,.81,.018]);k.box('door_pull',m.dark,[.23,.76,-1.791],[.035,.21,.045]);
  // Partial sloping canopy exposes the machines without removing the architectural frame.
  const slope=i===0?-.16:-.055;
  k.group('sloped_roof',[0,2.43,-1.2],()=>{
   slab('roof_undertray',m.white,[0,-.08,0],5.34,1.97,.1,.25);
   slab('blue_standing_seam_roof',i===0?m.blue:m.white,[0,.03,0],5.4,2.02,.075,.28);
   for(let j=0;j<9;j++)k.box('roof_seam',m.alloy,[-2.45+j*.61,.117,0],[.018,.018,1.82]);
   for(const xx of [-1.7,0,1.7]){k.box('canopy_structural_rib',m.navy,[xx,-.15,0],[.055,.15,1.78]);k.box('interior_linear_fixture',m.alloy,[xx,-.235,0],[.105,.055,.74]);k.box('interior_diffuser',m.warm,[xx,-.267,0],[.078,.012,.65]);}
  },[slope,0,0]);
  for(const sx of [-1,1]){k.box('hall_front_pier',m.white,[sx*2.46,1.01,.58],[.24,2.02,.24],undefined,.045);k.box('pier_blue_inlay',m.blue,[sx*2.46,1.15,.709],[.12,1.52,.019]);}
  for(const sx of [-1,1]){k.box('hall_return_header',m.white,[sx*2.19,2.08,.58],[.73,.25,.24],undefined,.065);k.box('header_enamel_strip',m.blue,[sx*2.19,2.075,.716],[.57,.085,.02]);k.box('side_eave',m.white,[sx*2.48,2.14,-.6],[.21,.16,2.4],[-.055,0,0]);}
  // Long curved-corner front balustrade, matching the footprint rather than a circular balcony.
  const pts=[[-2.55,.69,.7],[-2.55,.69,1.55],[-2.4,.69,2.03],[-1.96,.69,2.17],[-.53,.69,2.17]];
  for(const side of [-1,1]){const rail=pts.map(p=>[p[0]*side,p[1],p[2]]);k.tube('hall_balustrade_top',m.alloy,rail,.027);for(const p of rail)k.beam('balustrade_post',m.alloy,[p[0],.06,p[2]],p,.023);k.tube('hall_balustrade_lower',m.alloy,rail.map(p=>[p[0],.32,p[2]]),.014)}
  for(let j=0;j<6;j++)k.box('floor_tile_joint',m.alloy,[-2.08+j*.82,.008,.1],[.01,.01,3.75],undefined,0);
 }
 function articulatedArm(side){k.group('machined_content_arm',[side*1.4,0,.22],()=>{
  k.cyl('bolted_robot_base',m.navy,[0,.11,0],.29,.32,.22);k.cyl('slew_bearing',m.alloy,[0,.255,0],.22,.22,.09);k.cyl('azimuth_housing',m.blue,[0,.37,0],.18,.21,.17);
  const joints=[[0,.43,0],[-side*.15,1.13,-.13],[-side*.51,1.7,.02],[-side*.8,1.54,.16]];
  for(let j=0;j<joints.length;j++){
   const p=joints[j],radius=j===3?.092:.135;k.cyl('joint_bearing_housing',m.navy,p,radius,radius,.24,[Math.PI/2,0,0],low?14:32);
   for(const zz of [-1,1]){k.cyl('bearing_cover',m.alloy,[p[0],p[1],p[2]+zz*.127],radius*.81,radius*.81,.019,[Math.PI/2,0,0]);k.cyl('bearing_axle',m.dark,[p[0],p[1],p[2]+zz*.14],radius*.34,radius*.34,.02,[Math.PI/2,0,0]);}
   if(j){const a=vec(joints[j-1]),b=vec(p),direction=b.clone().sub(a),mid=a.clone().add(b).multiplyScalar(.5),len=direction.length();
    const link=k.box('cast_robot_link',m.white,mid.toArray(),[.17,len-.12,.16],undefined,.045);link.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());
    for(const zz of [-1,1]){const brace=k.box('link_flange',m.alloy,[mid.x,mid.y,mid.z+zz*.098],[.12,len-.2,.025]);brace.quaternion.copy(link.quaternion)}
   }
  }
  k.tube('articulated_service_hose',m.dark,[[.16,.39,-.12],[.12,.85,-.27],[-side*.2,1.2,-.28],[-side*.49,1.73,-.15]],.022);
  for(let j=0;j<4;j++){const a=j*Math.PI/2;k.cyl('base_anchor_bolt',m.alloy,[Math.sin(a)*.24,.229,Math.cos(a)*.24],.026,.026,.025)}
  k.box('wrist_mount',m.navy,[-side*.8,1.54,.28],[.22,.22,.15]);
  k.box('content_holder',m.alloy,[-side*.8,1.63,.41],[.61,.75,.07],undefined,.04);k.box('editable_content_plate',m.paper,[-side*.8,1.63,.453],[.54,.68,.018]);
  if(side<0)for(let row=0;row<4;row++)k.box('content_layout_line',m.blue,[-side*.8,1.84-row*.115,.468],[.36-row*.04,.022,.008]);
  else {const shape=new T.Shape();shape.moveTo(-.13,-.14);shape.lineTo(.16,0);shape.lineTo(-.13,.14);shape.closePath();k.mesh('content_play_icon',k.uv(new T.ShapeGeometry(shape)),m.blue,[-side*.8,1.63,.469])}
 })}
 return {slab,frame,frontHallPodium,frontHall,articulatedArm}
}
