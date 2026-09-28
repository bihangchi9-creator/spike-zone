import {curveRoom,roomOffset,THEATRE_SIGN,theatreWallBehindSign} from './campus-curves-v2.mjs'
import {noise,rockVariation,smoothMin,ellipsoid} from './geology-v2.mjs'
import {shrub} from './flora-v2.mjs'
import {Workshop,T,mat} from './geometry-v2.mjs'
import {branch} from './organic-v2.mjs'
import {implicitTerrain,sdBox,smoothMax} from './implicit-terrain.mjs'
export function buildUniversity(low=false,{audit=false}={}){
 const k=new Workshop('DUT_refined_v2',low),m={stone:mat('campus_limestone','#abac8d',.91),pale:mat('campus_pale_stone','#d8d2b9',.85),brick:mat('campus_brick','#af7256',.87),white:mat('campus_window_frame','#e1e5da',.63),blue:mat('campus_blue','#236ea1',.5,.13),navy:mat('campus_screen','#193c54',.48),glass:mat('campus_glass','#729baf',.22,.22),clear:mat('campus_clear_glass','#99c4d5',.15),wood:mat('campus_wood','#b79266',.79),metal:mat('campus_metal','#4c6570',.43,.6),gold:mat('campus_ginkgo_gold','#d9ae3c',.89),green:mat('campus_foliage','#65865b',.91),darkGreen:mat('campus_groundcover','#486c52',.95),red:mat('campus_bridge_lacquer','#ae4435',.51,.12),curtain:mat('campus_velvet','#863b37',.95),water:mat('campus_lake','#5895a0',.22,.15),shallow:mat('campus_shallow_water','#82afa6',.39),warm:mat('campus_window_warm','#eec995',.5,0,'#dca362')}
 const courtFootprint=(x,z,margin=.5)=>{const dx=x+7.2,dz=z-1.3,a=-.62;return Math.abs(dx*Math.cos(a)-dz*Math.sin(a))<1.85+margin&&Math.abs(dx*Math.sin(a)+dz*Math.cos(a))<2.65+margin};
 k.audit=audit;m.clear.transparent=true;m.clear.opacity=.14;m.clear.depthWrite=false;m.clear.side=T.DoubleSide
 const base=new T.Color('#b1a48a'),grass=new T.Color('#71815b'),terrainMat=mat('campus_stratified_terrain','#ffffff',.94)
 const field=(x,y,z)=>{
  let d=Math.hypot(x,y,z)-9.25+rockVariation(x,y,z);
  // Continuous rock shoulders wrap the story rooms rather than leaving freestanding boxes.
  d=smoothMin(d,ellipsoid(x+3.6,y+.25,z-5.65,4.3,3.3,3.1),.85);
  d=smoothMin(d,ellipsoid(x-4.25,y+3.25,z-5.3,3.9,3.55,3.12),.8);d=smoothMin(d,ellipsoid(x+7.05,y+.25,z-1.3,2.35,2.05,3.1),.55);
  const lake=Math.hypot(x/3.25,(z-.3)/3.6),depression=T.MathUtils.smoothstep(1.06-lake,0,.18)*.29;
  d=smoothMax(d,y-(4.32-depression+.025*Math.sin(x*.8)*Math.cos(z*.8)),.13);
  for(const [cx,cy,w,h,back,front]of [[-3.6,.15,3.23,1.93,4.97,7.91],[4.4,-2.65,2.87,2.17,4.49,7.785]]){let cut=sdBox(x-cx,y-cy,z-roomOffset(x,cx,front)-(back+4),w,h,4);if(cx>0)cut=Math.max(cut,y-(-.55-.5*((x-cx)/2.9)**2));d=smoothMax(d,-cut,.28);}
  const ca=Math.cos(-.62),sa=Math.sin(-.62),courtX=(x+7.2)*ca-(z-1.3)*sa,courtZ=(x+7.2)*sa+(z-1.3)*ca;d=smoothMax(d,-sdBox(courtX,y-6.02,courtZ,1.85,4.25,2.65),.15);
  return d
 }
 const ground=implicitTerrain(k,'terrain_with_recessed_story_spaces',terrainMat,field,(x,y,z,n)=>{
  const tone=noise(x*.85,y*.7,z*.85),soil=base.clone().offsetHSL(.005*tone,.01,.055*tone),cover=T.MathUtils.clamp(y>4.05?.68:Math.max(0,n.y)*.16+T.MathUtils.smoothstep(noise(x*.44,y*.38,z*.44),.02,.45)*.19,0,.78);return soil.lerp(grass,cover)
 },{extent:11.4,resolution:low?76:120});
 function window(p,w,h,rotation=0){k.group('recessed_campus_window',p,()=>{k.box('window_reveal',m.metal,[0,0,-.02],[w+.11,h+.12,.09]);k.box('window_glass',m.glass,[0,0,.03],[w,h,.025]);for(const s of [-1,1]){k.box('window_jamb',m.white,[s*(w/2+.016),0,.065],[.03,h+.07,.07]);k.box('window_transom',m.white,[0,s*(h/2+.017),.065],[w+.07,.031,.07])}k.box('window_mullion',m.white,[0,0,.065],[.021,h,.03]);k.box('window_sill',m.pale,[0,-h/2-.08,.09],[w+.2,.1,.23]);if(!low)k.box('interior_blind',m.warm,[-w*.33,0,.047],[w*.14,h*.88,.009])},[0,rotation,0])}
 function building(x,z,w,d,h,material,courtyard=false){if(courtyard){const make=(ww,dd,height)=>{const shape=new T.Shape();shape.moveTo(-ww/2,-dd/2);shape.lineTo(ww/2,-dd/2);shape.lineTo(ww/2,dd/2);shape.lineTo(-ww/2,dd/2);shape.closePath();const hole=new T.Path();hole.moveTo(-w/2+.72,-d/2+.66);hole.lineTo(-w/2+.72,d/2-.66);hole.lineTo(w/2-.72,d/2-.66);hole.lineTo(w/2-.72,-d/2+.66);hole.closePath();shape.holes.push(hole);return k.uv(new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false}))};k.mesh('courtyard_building_mass',make(w,d,h),material,[x,4.38,z],[-Math.PI/2,0,0]);k.mesh('courtyard_roof_coping',make(w+.16,d+.16,.15),m.pale,[x,4.38+h,z],[-Math.PI/2,0,0]);k.mesh('courtyard_waterproofing',make(w-.1,d-.1,.025),m.metal,[x,4.55+h,z],[-Math.PI/2,0,0]);}else{k.box('campus_building_mass',material,[x,4.38+h/2,z],[w,h,d]);k.box('roof_coping',m.pale,[x,4.42+h,z],[w+.16,.15,d+.16]);k.box('roof_waterproofing',m.metal,[x,4.51+h,z],[w-.2,.02,d-.2]);}for(let row=0;row<3;row++){for(let col=0;col<Math.floor(w/.55);col++)for(const side of [-1,1])window([x-w/2+.32+col*.55,4.7+row*(h-.43)/3,z+side*(d/2+.025)],.35,.37,side>0?0:Math.PI);for(let col=0;col<3;col++)for(const side of [-1,1])window([x+side*(w/2+.025),4.7+row*(h-.43)/3,z-d*.3+col*d*.3],.31,.37,side*Math.PI/2)}for(let row=0;row<12;row++)k.box('masonry_course',m.pale,[x,4.5+row*h/12,z+d/2+.008],[w,.011,.009]);k.box('entrance_portico',m.pale,[x,5.48,z+d/2+.28],[1.03,.12,.59]);for(const s of [-1,1])k.box('portico_pier',m.pale,[x+s*.44,4.97,z+d/2+.46],[.11,.94,.13]);window([x,4.95,z+d/2+.04],.68,.9);for(let j=0;j<3;j++)k.box('entry_steps',m.pale,[x,4.42+j*.08,z+d/2+.73-j*.15],[1.22,.1,.31]);for(let i=0;i<3;i++){k.box('roof_vent',m.white,[x-w*.29+i*w*.29,4.7+h,z+(courtyard?-d*.37:0)],[.3,.3,.33]);k.box('roof_vent_cap',m.metal,[x-w*.29+i*w*.29,4.87+h,z+(courtyard?-d*.37:0)],[.35,.05,.38])}}
 building(-4.6,-3.1,3.8,1.9,2.1,m.brick);building(1,-4.7,3.6,2.7,2.3,m.pale,true);building(5,1.4,3.2,1.65,1.8,m.pale)
 const lake=new T.Shape();for(let i=0;i<=80;i++){const a=i/80*Math.PI*2,r=1+.05*Math.sin(a*5)+.04*Math.cos(a*3),x=Math.sin(a)*3.22*r,z=.3+Math.cos(a)*3.55*r;i?lake.lineTo(x,-z):lake.moveTo(x,-z)}const lakeG=new T.ShapeGeometry(lake,64);k.mesh('shallow_lake_bed',lakeG,m.shallow,[0,4.36,0],[-Math.PI/2,0,0]);const deep=lakeG.clone();deep.scale(.92,.92,1);k.mesh('deep_lake_water',deep,m.water,[0,4.39,0],[-Math.PI/2,0,0]);const shoreline=[];for(let i=0;i<=80;i++){const a=i/80*Math.PI*2,r=1+.05*Math.sin(a*5)+.04*Math.cos(a*3);shoreline.push([Math.sin(a)*3.5*r,4.42,.3+Math.cos(a)*3.83*r])}k.ribbon('lakeside_walk',m.pale,shoreline,.5,.1,true)
 const bridge=Array.from({length:32},(_,i)=>[-3.07+i/31*6.14,4.51+Math.sin(i/31*Math.PI)*.44,-1.3]);k.ribbon('bridge_deck',m.wood,bridge,.72,.14);for(let i=0;i<30;i++){const q=bridge[i];k.box('bridge_plank',m.wood,[q[0],q[1]+.025,q[2]],[.18,.035,.7]);for(const s of [-1,1]){k.beam('bridge_post',m.red,[q[0],q[1],q[2]+s*.35],[q[0],q[1]+.61,q[2]+s*.35],.019)}}for(const s of [-1,1]){k.tube('bridge_handrail',m.red,bridge.map(q=>[q[0],q[1]+.62,q[2]+s*.36]),.035);k.tube('bridge_arch_structure',m.red,bridge.map((q,i)=>[q[0],4.05+Math.sin(i/31*Math.PI)*.65,q[2]+s*.3]),.07);for(const x of [-3.1,3.1])k.box('bridge_abutment',m.stone,[x,4.33,-1.3],[.44,.45,.95])}
 for(const side of [-1,1]){const rib=bridge.map((q,i)=>[q[0],4.55+Math.sin(i/(bridge.length-1)*Math.PI)*1.45,q[2]+side*.36]);k.tube('red_bridge_upper_arch',m.red,rib,.07);for(let j=3;j<29;j+=4)k.beam('bridge_arch_hanger',m.metal,[rib[j][0],bridge[j][1],rib[j][2]],rib[j],.018)}
 function ginkgo(p,s,seed){k.group('ginkgo_tree',p,()=>{branch(k,'ginkgo_trunk',m.wood,[[0,0,0],[.05,s*.7,0],[0,s*1.38,.08]],[s*.09,s*.055,.012]);for(let j=0;j<9;j++){const a=j*2.399+seed,h=s*(.66+j*.074),end=[Math.sin(a)*s*.47,h+s*.25,Math.cos(a)*s*.42];branch(k,'ginkgo_branch',m.wood,[[0,h-.23,0],[end[0]*.5,h,end[2]*.5],end],[s*.033,s*.024,.004]);for(let q=0;q<(low?9:19);q++){const b=q*2.399,rad=s*.25*Math.sqrt(q/(low?9:19)),pos=[end[0]+Math.sin(b)*rad,end[1]+s*.13*Math.sin(q*1.7),end[2]+Math.cos(b)*rad],fan=new T.Shape();fan.moveTo(0,0);fan.absarc(0,.025,s*.24,-Math.PI*.15,Math.PI*1.15,false);fan.lineTo(0,0);const leaf=k.mesh('fan_shaped_ginkgo_leaf',new T.ShapeGeometry(fan,low?4:8),seed%4?m.gold:m.green,pos,[-Math.PI*.37,b,.15]);leaf.material.side=T.DoubleSide}}})}
 for(let i=0;i<45;i++){const a=i*2.399,r=4.75+(i%4)*.5,x=Math.sin(a)*r,z=Math.cos(a)*r;if((x< -2&&z< -2)||(x>3&&z>-.2)||(z<-5&&x> -1)||(z>3.65&&Math.abs(x)<3.35))continue;if(courtFootprint(x,z,.5))continue;ginkgo([x,4.36,z],.76+(i%3)*.15,i)}
 function roomFloor(cx,y,z,w,d){k.box('recessed_room_slab',m.pale,[cx,y,z],[w,.21,d]);for(let i=0;i<Math.ceil(w/.3);i++)k.box('floor_board',m.wood,[cx-w/2+.16+i*.3,y+.125,z],[.285,.035,d-.08]);for(const side of [-1,1]){k.box('room_retaining_cheek',m.stone,[cx+side*(w/2+.07),y+1.8,z],[.23,3.8,d]);for(let j=0;j<12;j++)k.box('retaining_masonry_joint',m.pale,[cx+side*(w/2+.07),y+j*.3,z+d/2+.018],[.25,.025,.03])}k.box('room_header',m.pale,[cx,y+3.8,z],[w+.4,.26,d]);k.box('room_rear',m.pale,[cx,y+1.9,z-d/2],[w,3.8,.16])}
 const laboratory=k.group('curved_digital_human_laboratory',[0,0,0],()=>{
 roomFloor(-3.6,-1.65,6.52,6.15,2.78);k.box('digital_human_screen_case',m.blue,[-4.4,.15,5.3],[1.65,2.9,.1]);k.box('voice_display',m.navy,[-2.2,.62,5.29],[1.45,.85,.12]);for(let i=0;i<17;i++)k.box('abstract_voice_wave',m.warm,[-2.8+i*.074,.62,5.36],[.022,.07+Math.abs(Math.sin(i*1.7))*.42,.01]);
 for(const x of [-5.6,-2.2]){k.box('lab_worktop',m.pale,[x,-.85,6.23],[1.55,.12,.75]);for(const side of [-1,1])k.box('lab_desk_leg',m.metal,[x+side*.55,-1.24,6.23],[.07,.65,.54]);k.box('lab_monitor',m.navy,[x,-.46,6.05],[.64,.39,.065]);k.box('lab_keyboard',m.metal,[x,-.774,6.37],[.42,.025,.17]);k.box('lab_seat',m.blue,[x,-1.15,7.12],[.5,.1,.49]);k.box('lab_backrest',m.blue,[x,-.85,7.32],[.49,.48,.08]);for(const sx of [-.18,.18])for(const z of [6.96,7.28])k.beam('chair_leg',m.metal,[x+sx,-1.54,z],[x+sx,-1.16,z],.022)}
 for(const x of [-6.45,-.75]){k.box('lab_facade_frame',m.white,[x,.2,7.93],[.1,3.4,.1]);k.box('lab_glass_return',m.clear,[x,.1,6.84],[.018,3.12,1.98])}k.box('lab_ceiling_diffuser',m.warm,[-3.6,1.99,6.61],[3.7,.02,.075]);
 for(const x of [-5.6,-2.2]){
  k.cyl('microphone_base',m.metal,[x+.45,-.758,6.33],.12,.12,.03);k.beam('microphone_stalk',m.metal,[x+.45,-.74,6.33],[x+.38,-.4,6.24],.018);k.cyl('microphone_grille',m.navy,[x+.38,-.35,6.24],.06,.06,.19,[.17,0,0]);k.tube('microphone_cable',m.metal,[[x+.45,-.75,6.33],[x+.53,-.75,6.2],[x+.61,-.83,6.0],[x+.61,-1.1,5.91]],.009);
  k.box('lab_desktop_computer',m.blue,[x+.51,-1.25,5.97],[.28,.59,.42],undefined,.035);for(let vent=0;vent<6;vent++)k.box('computer_vent',m.metal,[x+.657,-1.39+vent*.058,5.97],[.008,.023,.28]);
 }
 for(const x of [-6.2,-1]){k.box('wall_fixture_backplate',m.metal,[x,.95,5.145],[.18,.43,.035]);k.box('wall_fixture_diffuser',m.warm,[x,.95,5.18],[.09,.33,.036]);}
 k.box('lab_reference_board',m.blue,[-.99,.56,6.3],[.03,1.45,1.2]);for(let row=0;row<3;row++)k.box('abstract_process_card',m.white,[-1.012,.2+row*.33,6.3],[.02,.24,.88]);
 });curveRoom(laboratory,-3.6,7.91,low);
 const theatre=k.group('curved_recessed_theatre',[0,0,0],()=>{
 roomFloor(4.4,-4.5,6.28,5.3,3.01);k.box('stage_platform',m.wood,[4.4,-4.14,5.8],[4.5,.5,1.55]);for(const side of [-1,1])for(let j=0;j<(low?7:13);j++){const x=4.4+side*(1.72+j*.063);k.cyl('velvet_curtain_fold',m.curtain,[x,-2.58,5.13+Math.sin(j*Math.PI)*.04],.059,.074,3.12,undefined,low?8:12)}k.box('layered_valance',m.curtain,[4.4,-.92,5.15],[4.95,.43,.26]);for(let j=0;j<7;j++)k.sphere('valance_scallop',m.curtain,[2.25+j*.7,-1.15,5.26],[.39,.15,.08]);
 for(let row=0;row<3;row++){k.box('seating_riser',m.pale,[4.4,-4.35+row*.16,6.59+row*.45],[4.77,.12+row*.13,.47]);for(let col=0;col<6;col++){const x=2.55+col*.74,z=6.59+row*.45,y=-4.07+row*.16;k.box('empty_seat_cushion',m.curtain,[x,y,z],[.48,.09,.36]);k.box('empty_seat_back',m.curtain,[x,y+.21,z+.14],[.48,.4,.07],[.09,0,0]);for(const side of [-1,1])k.box('seat_support',m.metal,[x+side*.19,y-.15,z],[.04,.23,.23])}}
 k.beam('theatre_lighting_bar',m.metal,[2.05,-.99,5.95],[6.75,-.99,5.95],.033);for(let i=0;i<5;i++){k.cyl('stage_spot_housing',m.metal,[2.5+i*.95,-1.11,5.95],.07,.09,.19,[.6,0,0],12);k.cyl('stage_spot_lens',m.warm,[2.5+i*.95,-1.22,5.9],.064,.064,.012,[.6,0,0],12)}
 });curveRoom(theatre,4.4,7.785,low,true);
 const titleMaterial=mat('campus_title_backplate','#eee4cc',.76);
 k.group('rigid_theatre_title_support',THEATRE_SIGN.position,()=>{
  const back=-THEATRE_SIGN.faceGap-THEATRE_SIGN.plateSize[2];
  k.box('theatre_title_backplate',titleMaterial,[0,0,-THEATRE_SIGN.faceGap-THEATRE_SIGN.plateSize[2]/2],THEATRE_SIGN.plateSize,undefined,.008);
  for(const x of [-1.04,1.04])for(const y of [-.18,.18])k.beam('theatre_title_wall_standoff',m.metal,[x,y,theatreWallBehindSign(x)-.02],[x,y,back+.004],.022);
 },THEATRE_SIGN.rotation);
 for(let pane=0;pane<12;pane++){
  const x0=-6.55+pane*.49,x1=x0+.49;if(Math.abs((x0+x1)/2+3.6)<.52)continue;
  const z0=7.965+roomOffset(x0,-3.6,7.91),z1=7.965+roomOffset(x1,-3.6,7.91),geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([x0,-1.48,z0,x1,-1.48,z1,x0,1.98,z0,x1,1.98,z1],3));geo.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,0,1,1,1],2));geo.setIndex([0,1,2,1,3,2]);geo.computeVertexNormals();k.mesh('curved_lab_front_glass',geo,m.clear);k.beam('curved_lab_front_mullion',m.white,[x0,-1.51,z0],[x0,2.02,z0],.025);
 }
 // Court stays on the left flank; a terraced retaining foundation grows from the hillside.
 k.group('basketball_terrace',[-7.2,1.75,1.3],()=>{k.box('terrace_foundation',m.stone,[0,-.45,0],[3.45,.85,5.14]);k.box('court_surface',m.blue,[0,.025,0],[3.2,.07,4.9]);for(const side of [-1,1]){for(let q=0;q<13;q++){const z=-2.45+q*4.9/12;if(side>0&&z>1.8)continue;k.beam('court_guard_post',m.metal,[side*1.65,.07,z],[side*1.65,.68,z],.018)}k.beam('court_side_handrail',m.metal,[side*1.65,.68,-2.45],[side*1.65,.68,side>0?1.7:2.45],.025)}for(const x of [-1.5,1.5])k.box('sideline',m.white,[x,.071,0],[.022,.008,4.6]);for(const z of [-2.3,0,2.3])k.box('baseline',m.white,[0,.071,z],[3,.008,.022]);k.ring('center_circle',m.white,[0,.08,0],.44,.011);for(const side of [-1,1]){k.arc('three_point_arc',m.white,[0,.078,side*2.15],1.17,1.19,.008,side>0?0:Math.PI,Math.PI);k.arc('free_throw_arc',m.white,[0,.079,side*1.28],.43,.45,.008,side>0?0:Math.PI,Math.PI);for(const x of [-.67,.67])k.box('key_edge',m.white,[x,.074,side*1.79],[.02,.008,1.02]);k.box('free_throw_line',m.white,[0,.074,side*1.28],[1.34,.008,.02]);k.beam('basket_support',m.metal,[0,.08,side*2.42],[0,1.55,side*2.35],.045);k.box('glass_backboard',m.clear,[0,1.43,side*2.2],[.8,.5,.04]);for(const edge of [-1,1])k.box('backboard_vertical_frame',m.white,[edge*.415,1.43,side*2.2],[.03,.54,.055]);k.box('backboard_top_frame',m.white,[0,1.7,side*2.2],[.85,.03,.055]);k.box('backboard_rim',m.white,[0,1.16,side*2.2],[.85,.035,.06]);k.ring('basket_rim',m.red,[0,1.29,side*1.98],.145,.014);for(let n=0;n<10;n++){const a=n/10*Math.PI*2;k.beam('basket_net',m.white,[Math.sin(a)*.14,1.29,side*1.98+Math.cos(a)*.14],[Math.sin(a+.17)*.08,1.06,side*1.98+Math.cos(a+.17)*.08],.005)}}},[0,-.62,0])
 k.group('campus_ball',[-7.2,2.15,1.3],()=>{k.sphere('basketball',m.red,[0,0,0],[.16,.16,.16]);k.ring('ball_seam',m.metal,[0,0,0],.161,.004,[0,0,0]);k.ring('ball_seam',m.metal,[0,0,0],.161,.004,[0,Math.PI/2,0])},undefined,true)
 // Curved landings link the approved stories; no walking game is introduced.
 const routeSamples=[];
 const plantable=p=>!(p[1]>1.1&&p[1]<5.7&&courtFootprint(p[0],p[2],.65))&&!routeSamples.some(q=>(p[0]-q[0])**2+(p[1]-q[1])**2+(p[2]-q[2])**2<1.1**2);
 function cliffWalk(name,points,width=.79){
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),n=Math.ceil(curve.getLength()/.17),dense=curve.getPoints(n).map(p=>p.toArray());routeSamples.push(...dense);k.ribbon(name+'_retaining_soffit',m.pale,dense,width,.22);
  for(let j=0;j<n;j++){const p=curve.getPoint(j/n),d=curve.getTangent(j/n),yaw=Math.atan2(d.x,d.z);k.box('grounded_path_tread',m.pale,[p.x,p.y+.018,p.z],[width,.08,.205],[0,yaw,0]);if(j%5===0){const side=new T.Vector3(d.z,0,-d.x).normalize();for(const sign of [-1,1]){const q=p.clone().addScaledVector(side,sign*width*.5);k.beam('path_guard_post',m.metal,[q.x,q.y,q.z],[q.x,q.y+.57,q.z],.018)}k.beam('retaining_corbels',m.stone,[p.x*.9,p.y-.9,p.z*.9],[p.x,p.y-.16,p.z],.13)}
   if(j%13===0){k.box('low_path_lamp',m.metal,[p.x+.35,p.y+.22,p.z],[.09,.42,.09]);k.box('path_lamp_diffuser',m.warm,[p.x+.35,p.y+.46,p.z],[.1,.08,.1]);}
  }
  for(const sign of [-1,1])k.tube('continuous_path_handrail',m.metal,dense.map((p,j)=>{const d=curve.getTangent(j/n),side=new T.Vector3(d.z,0,-d.x).normalize();return[p[0]+side.x*sign*width*.5,p[1]+.58,p[2]+side.z*sign*width*.5]}),.023);
 }
 cliffWalk('campus_to_lab',[[-6.15,4.3,3.7],[-7.55,3.2,4.25],[-7.35,1.15,4.9],[-6.8,-1.47,5.4]]);
 cliffWalk('basketball_entry_steps',[[-7.55,3.2,4.25],[-8,2.45,4.7],[-7.25,1.83,3.93]],.6);
 const labEdge=Array.from({length:24},(_,i)=>{const x=-6.7+i/23*6.08;return[x,-1.47,8.31+roomOffset(x,-3.6,7.91)]});cliffWalk('laboratory_promenoir',labEdge,.68);
 cliffWalk('lab_to_theatre',[labEdge.at(-1),[.55,-2.18,8.8],[.65,-3.46,9.02],[1.58,-4.34,8.9]],.72);
 const theatreEdge=Array.from({length:24},(_,i)=>{const x=1.65+i/23*5.42;return[x,-4.33,8.12+roomOffset(x,4.4,7.785)]});cliffWalk('theatre_lower_walk',theatreEdge,.69);
 cliffWalk('east_cliff_stairs',[[7.05,4.25,1.7],[8.18,2.2,2.9],[8.0,.22,3.68],[7.52,-1.93,4.5],theatreEdge.at(-1)]);
 // Short planted outcrops vary in length and bury their ends into the hillside.
 for(let ledge=0;ledge<26;ledge++){
  const y=-7.1+(ledge%6)*1.77,a=ledge*2.399,width=.62+(ledge%4)*.16,r=Math.sqrt(Math.max(0,9.25**2-y*y))-.1,x=Math.sin(a)*r,z=Math.cos(a)*r;
  if(y>1&&y<4.8&&courtFootprint(x,z,.7))continue;
  if(z>3.5&&((x>-7.5&&x<.1&&y>-2.35&&y<2.65)||(x>1&&x<8&&y>-5.3&&y<.25)))continue;
  const shape=new T.Shape();shape.moveTo(-width,-.16);shape.lineTo(-width*.76,.2);shape.lineTo(-width*.15,.37);shape.lineTo(width*.72,.29);shape.lineTo(width,.07);shape.lineTo(width*.63,-.31);shape.lineTo(-width*.58,-.38);shape.closePath();
  k.mesh('embedded_irregular_rock_ledge',k.uv(new T.ExtrudeGeometry(shape,{depth:.38,bevelEnabled:true,bevelSize:.12,bevelThickness:.1,bevelSegments:1})),m.stone,[x,y-.2,z],[-Math.PI/2,0,-a]);
  for(let j=0;j<3;j++){const t=(j-1)*width*.58,p=[x+Math.cos(a)*t,y+.05,z-Math.sin(a)*t];if(!plantable(p))continue;shrub(k,m,p,.78+(j%2)*.18,ledge+j)}
 }
 ground.updateMatrixWorld();const ray=new T.Raycaster();
 for(let i=0;i<620;i+=(low?2:1)){
  const a=i*2.399,y=-8.45+i/619*12.42,rr=Math.sqrt(Math.max(0,9.25**2-y*y)),dir=new T.Vector3(Math.sin(a)*rr,y,Math.cos(a)*rr).normalize();ray.set(dir.clone().multiplyScalar(16),dir.clone().negate());const hit=ray.intersectObject(ground)[0];if(!hit)continue;const p=hit.point;if(!plantable(p.toArray()))continue;
  if(p.z>3.6&&((p.x<-.1&&p.x>-7.5&&p.y>-2.2&&p.y<2.65)||(p.x>1.25&&p.x<7.85&&p.y>-5.1&&p.y<.1)))continue;
  // Plants occupy soil pockets and ledges rather than the exposed vertical center of each room.
  if(noise(p.x*.44,p.y*.38,p.z*.44)>-.16||hit.face.normal.y>.4){const plant=shrub(k,m,p.toArray(),Math.max(.15,Math.min(.8+(i%4)*.17,(11.5-p.length())/1.05)),i);const outward=hit.face.normal.clone().multiplyScalar(.9).add(new T.Vector3(0,.32,0)).normalize();plant.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),outward);}
 }
 k.box('DUT_identity_wall',m.pale,[0,5.05,5.25],[4.8,1.25,.22]);for(const side of [-1,1])k.box('identity_wall_foot',m.stone,[side*1.85,4.49,5.25],[.34,.24,.64])
 // Low planted shelves soften the cliff-to-campus transition without concealing the story openings.
 for(let i=0;i<48;i++){const a=i*2.399,r=5.2+(i%6)*.4,x=Math.sin(a)*r,z=Math.cos(a)*r;if((x< -2&&z< -2)||(x>3&&z>-.1)||(z>3.6&&Math.abs(x)<3.4))continue;if(!plantable([x,4.32,z]))continue;shrub(k,m,[x,4.32,z],.78+(i%3)*.15,i)}
 // Shore boulders are broad layered chunks, with planting behind the pedestrian edge.
 for(let i=0;i<26;i++){const a=i/26*Math.PI*2,r=1+.05*Math.sin(a*5)+.04*Math.cos(a*3),x=Math.sin(a)*3.33*r,z=.3+Math.cos(a)*3.66*r;const shape=new T.Shape(),w=.25+(i%3)*.055;shape.moveTo(-w,-.2);shape.lineTo(w*.8,-.23);shape.lineTo(w,.09);shape.lineTo(w*.2,.26);shape.lineTo(-w*.85,.16);shape.closePath();k.mesh('shoreline_stone',k.uv(new T.ExtrudeGeometry(shape,{depth:.13+(i%3)*.03,bevelEnabled:true,bevelSize:.055,bevelThickness:.045,bevelSegments:1})),m.pale,[x,4.26,z],[-Math.PI/2,a,.04]);}
 return k.finish()
}
