import * as T from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
export function buildHyundai(){
 const root=new T.Group(),staticRoot=new T.Group();root.name='Hyundai_blue_white_miniature_v3';root.add(staticRoot)
 const mat=(name:string,color:string,rough=.65,metal=.08,emissive?:string)=>{const m=new T.MeshStandardMaterial({color,roughness:rough,metalness:metal,emissive:emissive||'#000000',emissiveIntensity:emissive?.65:0});m.name=name;return m}
 const navy=mat('Hyundai_Blue_002C5F','#002C5F',.47,.22),white=mat('White_FFFFFF','#FFFFFF',.65,.12),silver=mat('Brushed_aluminium','#9fadb6',.4,.65),road=mat('Test_track_asphalt','#25323e',.95),dark=mat('Graphite_and_rubber','#111b24',.8),seat=mat('Warm_white_seat','#e9e0d0',.88),green=mat('Landscaping','#344b39',.96),warm=mat('Warm_practical_lights','#f6dcb1',.65,.02,'#f4b868'),orange=mat('Assembly_robot','#c28d35',.45,.4),screen=mat('Screen_backplate','#06162d',.25,.15),glass=mat('Window_panels','#8cb5d0',.25,.1)
 const blueLight=mat('Integrated_blue_lighting','#2165bc',.38,.08,'#247cff');blueLight.emissiveIntensity=7
 white.side=T.DoubleSide;glass.transparent=true;glass.opacity=.085;glass.depthWrite=false;glass.side=T.DoubleSide
 const boxGeo=new T.BoxGeometry(1,1,1),roundedGeo=new RoundedBoxGeometry(1,1,1,3,.17),sphereGeo=new T.IcosahedronGeometry(1,0)
 function mesh(name:string,g:T.BufferGeometry,m:T.Material,p=[0,0,0],s=[1,1,1],r=[0,0,0],parent:T.Group=staticRoot){const o=new T.Mesh(g,m);o.name=name;o.position.set(...p as [number,number,number]);o.scale.set(...s as [number,number,number]);o.rotation.set(...r as [number,number,number]);parent.add(o);return o}
 const box=(name:string,m:T.Material,p:number[],s:number[],r=[0,0,0],parent=staticRoot)=>mesh(name,/^(seat_|head_rest|car_body|car_cabin|dashboard_body|center_console)/.test(name)?roundedGeo:boxGeo,m,p,s,r,parent)
 const cylinder=(name:string,m:T.Material,p:number[],radius:number,height:number,parent=staticRoot)=>mesh(name,new T.CylinderGeometry(radius,radius,height,radius>2?64:20),m,p,[1,1,1],[0,0,0],parent)
 const tube=(name:string,m:T.Material,points:T.Vector3[],radius:number)=>mesh(name,new T.TubeGeometry(new T.CatmullRomCurve3(points),40,radius,6,false),m)
 const ring=(name:string,m:T.Material,r:number,y:number,t=.07)=>mesh(name,new T.TorusGeometry(r,t,6,96),m,[0,y,0],[1,1,1],[Math.PI/2,0,0])
 // Upper terrace and a continuous perimeter track, with no massive luminous belt.
 cylinder('upper_terrace',white,[0,.12,0],10.2,.3)
 mesh('circular_test_road',new T.RingGeometry(7.75,9.6,128),road,[0,.3,0],[1,1,1],[-Math.PI/2,0,0])
 ring('track_outer_edge',white,9.55,.34,.035);ring('track_inner_edge',white,7.79,.34,.035)
 for(let i=0;i<64;i++){const a=i/64*Math.PI*2;box('lane_dash',white,[Math.sin(a)*8.68,.325,Math.cos(a)*8.68],[.045,.015,.28],[0,a,0])}
 for(const r of [7.65,9.85]){ring('safety_rail',silver,r,.78,.045);for(let i=0;i<36;i++){const a=i/36*Math.PI*2;box('rail_post',silver,[Math.sin(a)*r,.53,Math.cos(a)*r],[.035,.52,.035])}}
 cylinder('factory_plinth',white,[0,.52,-.6],7.25,.6)
 box('factory_floor',dark,[0,.88,-1],[11.8,.2,6.4])
 box('rear_wall',navy,[0,2.75,-4.25],[11.8,3.7,.22])
 box('left_wall',navy,[-5.85,2.75,-1.1],[.22,3.7,6.3]);box('right_wall',navy,[5.85,2.75,-1.1],[.22,3.7,6.3])
 for(const x of [-5.7,-2.85,0,2.85,5.7]){box('white_facade_column',white,[x,2.8,2.2],[.17,3.9,.3]);box('rear_column',white,[x,2.8,-4.36],[.16,3.9,.25])}
 box('brand_fascia',navy,[0,4.55,2.25],[11.9,1.15,.3]);box('fascia_upper_edge',white,[0,5.15,2.24],[12,.12,.36])
 for(let i=0;i<16;i++){const x=-5.5+i*.73;box('front_glazing_mullion',silver,[x,2.5,2.21],[.035,2.85,.045]);box('back_mullion',silver,[x,2.55,-4.4],[.04,2.8,.08])}
 for(const y of [1,2.25,3.7])box('front_transom',silver,[0,y,2.22],[11.5,.04,.045])
 box('factory_front_glazing',glass,[0,2.4,2.2],[11.4,2.7,.025])
 for(const x of [-6.4,6.4]){box('white_service_tower',white,[x,2.8,-1.0],[1.05,4.4,5.8]);for(let i=0;i<8;i++)box('tower_panel_joint',silver,[x+(x>0?.54:-.54),2.8,-3.5+i*.68],[.014,4.1,.022]);box('side_loading_door',dark,[x,1.8,1.95],[.82,2.3,.03]);box('wall_light',warm,[x,3.5,2.0],[.28,.09,.08])}
 // Recessed building lights sit on the facade and roof, not around the planet.
 box('front_canopy_light',blueLight,[0,3.92,2.43],[11.35,.12,.08])
 box('rear_canopy_light',blueLight,[0,4.35,-4.49],[11.35,.12,.08])
 for(const x of [-5.7,-2.85,2.85,5.7])box('facade_light',blueLight,[x+.1,2.5,2.37],[.08,2.65,.06])
 for(const x of [-5.98,5.98])box('side_eave_light',blueLight,[x,4.55,-1.05],[.055,.07,6.1])
 // Four sawtooth glazed roof bays; steel ridge beams and roof service boxes.
 for(let i=0;i<4;i++){const x=-4.4+i*2.9;for(const side of [-1,1]){const angle=-side*.49;box('roof_glass',glass,[x+side*.63,5.48,-1],[1.55,.055,6.4],[0,0,angle]);box('roof_eave',white,[x+side*1.31,5.13,-1],[.08,.13,6.5]);for(let j=0;j<9;j++)box('roof_mullion',silver,[x+side*.63,5.5,-4.1+j*.78],[1.58,.055,.04],[0,0,angle])}box('roof_ridge',white,[x,5.87,-1],[.09,.09,6.6]);}
 for(let i=0;i<3;i++){box('roof_vent',silver,[-4+i*2,5.4,-4.25],[.7,.6,.6]);box('vent_top',dark,[-4+i*2,5.72,-4.25],[.55,.04,.48])}
 // Assembly conveyors and visible handrails, visual theme only.
 for(const x of [-2.8,2.8]){box('conveyor_bed',silver,[x,1.07,-.6],[2.7,.25,4.9]);for(let j=0;j<14;j++)box('conveyor_roller',dark,[x,1.23,-2.8+j*.34],[2.6,.045,.09]);}
 for(const z of [1.65,-3.3]){box('yellow_safety_rail',orange,[0,1.6,z],[11,.04,.05]);for(let x=-5;x<=5;x++)box('yellow_safety_post',orange,[x,1.25,z],[.04,.75,.04])}
 function car(name:string,p:number[],rot=0,m=white,parent=staticRoot,scale=1){const g=new T.Group();g.name=name;g.position.set(...p as [number,number,number]);g.rotation.y=rot;g.scale.setScalar(scale);parent.add(g);box('car_body',m,[0,.32,0],[.92,.35,1.92],[0,0,0],g);box('car_cabin',dark,[0,.62,-.05],[.73,.38,1.06],[.07,0,0],g);box('car_roof',m,[0,.83,-.1],[.69,.04,.66],[0,0,0],g);for(const side of [-1,1])for(const z of [-.59,.6]){mesh('tire',new T.CylinderGeometry(.22,.22,.12,12),dark,[side*.46,.22,z],[1,1,1],[0,0,Math.PI/2],g);mesh('wheel',new T.CylinderGeometry(.13,.13,.125,12),silver,[side*.47,.22,z],[1,1,1],[0,0,Math.PI/2],g)}for(const side of [-1,1]){box('headlight',warm,[side*.3,.37,.96],[.21,.07,.025],[0,0,0],g);box('tail_light',navy,[side*.3,.39,-.96],[.21,.07,.025],[0,0,0],g)}return g}
 car('assembly_car_1',[-2.8,1.24,-.5],0,white);car('assembly_car_2',[2.8,1.24,-.5],0,navy)
 car('test_car_0',[0,.34,8.65],Math.PI/2,white,root);car('test_car_1',[0,.34,-8.65],-Math.PI/2,navy,root)
 for(let i=0;i<4;i++){const x=-4.8+i*3.2,z=i%2?-.9:.4;cylinder('robot_base',dark,[x,1.14,z],.33,.25);const joint=new T.Group();joint.name='robot_joint_'+i;joint.position.set(x,1.25,z);root.add(joint);cylinder('robot_shoulder',orange,[0,.27,0],.22,.55,joint);box('robot_upper_arm',orange,[.32,.77,0],[.28,1.05,.3],[0,0,-.6],joint);mesh('elbow',new T.SphereGeometry(.2,10,8),dark,[.61,1.16,0],[1,1,1],[0,0,0],joint);box('robot_forearm',orange,[.85,1.1,0],[.72,.22,.22],[0,0,-.2],joint);box('robot_tool',dark,[1.23,1.0,0],[.14,.35,.17],[0,0,0],joint)}
 // A small showroom pavilion on the upper terrace, complete on its rear side too.
 cylinder('pavilion_floor',white,[5.25,.57,4.3],1.85,.28);cylinder('pavilion_roof',navy,[5.25,2.45,4.3],1.94,.15)
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;box('pavilion_pillar',white,[5.25+Math.sin(a)*1.75,1.53,4.3+Math.cos(a)*1.75],[.055,1.8,.055])}
 car('showroom_car',[5.25,.72,4.3],.8,navy,staticRoot,.8)
 for(let i=0;i<44;i++){const a=i/44*Math.PI*2,r=i%3?7.35:10;mesh('shrub',sphereGeo,green,[Math.sin(a)*r,.67,Math.cos(a)*r],[.27,.36+(i%3)*.1,.28]);if(i%4===0){cylinder('bollard',navy,[Math.sin(a)*9.7,.72,Math.cos(a)*9.7],.07,.65);box('path_light',warm,[Math.sin(a)*9.7,1.04,Math.cos(a)*9.7],[.15,.08,.15])}}
 // Small road markers follow the physical terrace, with gaps between lights.
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2;box('blue_road_marker',blueLight,[Math.sin(a)*9.56,.38,Math.cos(a)*9.56],[.09,.06,.62],[0,a,0])}
 // Continuous equatorial frame and three structural ribs down to the keel.
 ring('equator_white_cap',white,10.18,0,.18);ring('equator_navy_seam',navy,10.18,-.24,.17);ring('lower_service_ring',silver,7.17,-7.3,.055)
 for(const a of [-.92,.92,Math.PI]){const pts=Array.from({length:30},(_,i)=>{const t=i/29*Math.PI/2;return new T.Vector3(Math.sin(a)*10.2*Math.cos(t),-10.2*Math.sin(t),Math.cos(a)*10.2*Math.cos(t))});tube('continuous_white_rib',white,pts,.16)}
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const pts=Array.from({length:20},(_,j)=>{const t=j/19*Math.PI/2;return new T.Vector3(Math.sin(a)*10.13*Math.cos(t),-10.13*Math.sin(t),Math.cos(a)*10.13*Math.cos(t))});tube('glass_mullion',silver,pts,.018)}
 // The smart cockpit is a designed room, with human-scale seats and clear air around it.
 cylinder('cockpit_floor',navy,[0,-6.8,0],6.55,.28);ring('cabin_floor_blue_edge',blueLight,6.4,-6.59,.045)
 mesh('curved_rear_cabin_wall',new T.CylinderGeometry(6.25,6.25,3.3,48,1,true,Math.PI/2,Math.PI),white,[0,-4.95,0]);box('rear_service_grille',navy,[0,-4.7,-4.65],[2.7,.8,.05]);for(let i=0;i<15;i++)box('grille_fin',silver,[-1.22+i*.175,-4.7,-4.60],[.035,.65,.025])
 for(const x of [-2.05,2.05]){box('seat_plinth',navy,[x,-6.2,1.8],[1.75,.6,1.9]);box('seat_cushion',seat,[x,-5.77,1.85],[1.72,.4,1.88]);box('seat_back',seat,[x,-4.65,2.5],[1.78,2.0,.43],[-.12,0,0]);box('seat_back_shell',navy,[x,-4.62,2.79],[1.48,1.6,.18],[-.12,0,0]);box('head_rest',seat,[x,-3.35,2.50],[1.12,.65,.55],[-.1,0,0]);box('seat_center_panel',seat,[x,-4.58,2.17],[1.36,1.6,.18],[-.12,0,0]);for(const side of [-1,1])box('seat_bolster',seat,[x+side*.76,-5.39,1.85],[.18,.44,1.7]);}
 // Dashboard faces outward so visitors can see the music experience from the front glass.
 box('dashboard_body',navy,[0,-3.7,-.2],[8.1,1.0,1.1]);box('dashboard_upper',white,[0,-3.15,-.2],[8.2,.13,1.17]);box('panoramic_screen',screen,[.65,-3.65,.38],[5.3,.92,.09]);box('dashboard_warm_strip',blueLight,[0,-4.23,.22],[7.7,.035,.035]);box('center_console',white,[0,-5.45,1.9],[.85,.95,2.55]);box('console_controls',screen,[0,-4.94,1.7],[.67,.04,1.35]);
 for(let i=0;i<3;i++)mesh('console_dial',new T.CylinderGeometry(.14,.14,.06,20),silver,[0,-4.88,1.1+i*.48])
 mesh('steering_wheel',new T.TorusGeometry(.69,.085,8,40),dark,[-2.4,-3.8,1.2],[1,1,1],[.15,0,0]);box('steering_hub',navy,[-2.4,-3.9,1.19],[.53,.28,.14]);for(const x of [-.4,.4])box('steering_spoke',silver,[-2.4+x,-3.86,1.19],[.43,.06,.055]);
 // A continuous cabin sill and roof light tie the interior into the outer frame.
 for(const a of [-1,1]){box('cabin_side_trim',white,[a*5.3,-4.8,0],[.3,.8,5.9]);box('cabin_side_light',blueLight,[a*5.15,-4.38,0],[.045,.04,5.5]);}
 for(let i=0;i<10;i++){const a=Math.PI/2+i/9*Math.PI;box('cabin_rear_panel_joint',silver,[Math.sin(a)*6.20,-4.9,Math.cos(a)*6.20],[.025,3.1,.025]);}
 // Real rear-side details: service doors, charging cabinets and a roof-access stair.
 for(const x of [-3.8,3.8]){box('rear_service_door',white,[x,1.85,-4.42],[1.25,1.9,.05]);box('door_handle',silver,[x+.39,1.76,-4.47],[.04,.25,.035])}
 for(let i=0;i<8;i++)box('roof_access_step',silver,[-6.8,1+i*.37,-3.6+i*.42],[.9,.12,.5]);
 // Flatten only static opaque parts. Moving assemblies retain named roots.
 function batch(group:T.Group){group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert();const buckets=new Map<T.Material,T.BufferGeometry[]>(),dispose=new Set<T.BufferGeometry>();group.traverse(o=>{if(o instanceof T.Mesh){let g=o.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));if(g.index)g=g.toNonIndexed();g.deleteAttribute('uv');const m=o.material as T.Material;const arr=buckets.get(m)||[];arr.push(g);buckets.set(m,arr);dispose.add(o.geometry)}});group.clear();for(const [m,gs] of buckets){const g=mergeGeometries(gs);if(g){const o=new T.Mesh(g,m);o.name=m.name;group.add(o)}gs.forEach(g=>g.dispose())}return dispose}
 // Static vertices are already in model coordinates; moving nodes remain small independent meshes.
 batch(staticRoot);for(const child of root.children)if(child!==staticRoot&&child instanceof T.Group)batch(child);root.updateMatrixWorld(true)
 return root
}
