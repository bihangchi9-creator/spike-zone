import {Workshop,T,mat,vec} from './geometry-v2.mjs'
import {hubArchitecture} from './hub-architecture-v2.mjs'
export function buildByteDance(low,motion,{audit=false}={}){
 const k=new Workshop('ByteDance_refined_v2',low),m={
 white:mat('hub_porcelain','#ebeee9',.43,.12),blue:mat('hub_blue_enamel','#287cce',.32,.48),navy:mat('hub_service_navy','#183b59',.5,.35),alloy:mat('hub_brushed_aluminum','#aab8c1',.38,.78),floor:mat('hub_mineral_floor','#d1d3c8',.82),wood:mat('hub_worktop','#cfb18a',.67),dark:mat('hub_seals','#263640',.86),warm:mat('hub_warm_diffuser','#ffe6b5',.48,0,'#ffd49a'),light:mat('hub_blue_indicator','#72cae7',.4,.1,'#53b4de'),screen:mat('hub_screen','#1d4c69',.4,.15),paper:mat('hub_content_card','#e9e8d7',.85),glass:mat('hub_glazing','#a1d3e0',.14,.05),leaf:mat('hub_plant','#4e8868',.8)}
 k.audit=audit;const architecture=hubArchitecture(k,m,low);
 m.glass.transparent=true;m.glass.opacity=.17;m.glass.depthWrite=false;m.glass.side=T.DoubleSide
 const circle=(r,y,n=40)=>Array.from({length:n},(_,i)=>[Math.sin(i/n*Math.PI*2)*r,y,Math.cos(i/n*Math.PI*2)*r])
 const cylinder=(name,material,p,r,h)=>k.cyl(name,material,p,r,r,h)
 function bolts(p,w,d){if(low)return;for(const x of [-w/2,w/2])for(const z of [-d/2,d/2])cylinder('captive_fastener',m.alloy,[p[0]+x,p[1],p[2]+z],.025,.014)}
 function panel(p,w,h,rotation=0){k.group('removable_access_panel',p,()=>{k.box('panel_gasket',m.dark,[0,0,0],[w+.04,h+.04,.025]);k.box('panel_cover',m.white,[0,0,.03],[w,h,.035]);for(const x of [-w*.38,w*.38])for(const y of [-h*.35,h*.35])k.cyl('panel_screw',m.alloy,[x,y,.053],.018,.018,.008,[Math.PI/2,0,0],8);k.box('panel_pull',m.navy,[0,-h*.25,.055],[w*.23,.028,.02]);if(!low)for(let i=0;i<4;i++)k.box('vent_slot',m.navy,[0,h*.22-i*.055,.052],[w*.58,.016,.012])},[0,rotation,0])}
 function chair(p,rotation=0){k.group('task_chair',p,()=>{cylinder('chair_column',m.alloy,[0,.26,0],.05,.44);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;k.beam('chair_spoke',m.alloy,[0,.1,0],[Math.sin(a)*.28,.07,Math.cos(a)*.28],.025);k.sphere('caster',m.dark,[Math.sin(a)*.28,.04,Math.cos(a)*.28],[.055,.04,.045])}k.box('upholstered_seat',m.navy,[0,.5,0],[.48,.09,.46],undefined,.06);k.box('back_shell',m.white,[0,.77,-.2],[.48,.48,.07],[.12,0,0],.06);k.box('upholstered_back',m.navy,[0,.77,-.15],[.41,.4,.04],[.12,0,0]);for(const x of [-.24,.24]){k.beam('armrest_stay',m.alloy,[x,.47,-.1],[x,.69,-.1],.015);k.box('arm_pad',m.dark,[x,.69,0],[.065,.05,.25])}},[0,rotation,0])}
 function desk(p,w=1.35){k.group('workstation',p,()=>{k.box('worktop_edge',m.white,[0,.78,0],[w,.11,.68]);k.box('worktop_inlay',m.wood,[0,.842,0],[w-.1,.022,.57]);for(const x of [-w*.37,w*.37]){k.box('desk_pedestal',m.alloy,[x,.39,0],[.06,.73,.45]);k.box('desk_foot',m.navy,[x,.035,0],[.13,.065,.62])}k.box('monitor_foot',m.alloy,[0,.87,-.13],[.26,.026,.18]);k.box('monitor_stalk',m.alloy,[0,1,-.16],[.045,.27,.05]);k.box('monitor_bezel',m.navy,[0,1.19,-.16],[.64,.39,.055]);k.box('abstract_monitor',m.screen,[0,1.19,-.125],[.57,.32,.015]);for(let i=0;i<3;i++)k.box('non_numeric_interface_line',i===0?m.light:m.alloy,[-.11,1.26-i*.07,-.114],[.29-i*.055,.012,.007]);k.box('keyboard',m.dark,[0,.873,.15],[.4,.025,.13]);if(!low)for(let i=0;i<7;i++)k.box('key_row',m.alloy,[-.15+i*.05,.888,.15],[.024,.005,.08]);chair([0,0,.8],Math.PI)},[0,0,0])}
 function planter(p){k.group('inset_planter',p,()=>{cylinder('planter_lip',m.white,[0,.22,0],.25,.4);cylinder('soil',m.dark,[0,.427,0],.22,.01);for(let i=0;i<6;i++){const a=i*2.399;k.beam('plant_stem',m.leaf,[0,.43,0],[Math.sin(a)*.22,.75+i*.06,Math.cos(a)*.22],.014);const o=k.sphere('plant_leaf',m.leaf,[Math.sin(a)*.24,.77+i*.06,Math.cos(a)*.24],[.16,.045,.09]);o.rotation.z=Math.sin(a)*.4}})}
 function railing(r,y,start=0,end=Math.PI*2){const count=Math.ceil((end-start)*r/.7);const pts=[];for(let i=0;i<=count;i++){const a=start+(end-start)*i/count,x=Math.cos(a)*r,z=-Math.sin(a)*r;pts.push([x,y+.66,z]);cylinder('rail_socket',m.navy,[x,y+.02,z],.07,.055);k.beam('rail_stanchion',m.alloy,[x,y,z],[x,y+.66,z],.022)}k.tube('continuous_handrail',m.alloy,pts,.028);if(!low)k.tube('lower_guard_cable',m.alloy,pts.map(p=>[p[0],p[1]-.34,p[2]]),.012)}
 function facade(r,y,h,start=0,end=Math.PI*2,step=.24){const n=Math.ceil((end-start)/step);for(let j=0;j<n;j++){const a=start+(end-start)*j/n,b=start+(end-start)*(j+1)/n; k.arc('curved_glass_pane',m.glass,[0,y,0],r,r+.014,h,a+.012,b-a-.024);const x=Math.cos(a)*r,z=-Math.sin(a)*r;k.box('slender_curtainwall_mullion',m.alloy,[x,y+h/2,z],[.045,h,.075],[0,a+Math.PI/2,0]);if(!low){k.arc('curtainwall_gasket',m.dark,[0,y,0],r-.008,r+.03,.027,a,b-a);k.arc('curtainwall_header',m.alloy,[0,y+h-.035,0],r-.015,r+.045,.035,a,b-a)}}}
 function deck(p,r,y,name){k.group(name,p,()=>{cylinder('structural_pan',m.navy,[0,y-.4,0],r-.12,.75);cylinder('white_fascia',m.white,[0,y-.14,0],r,.22);cylinder('wear_surface',m.floor,[0,y+.01,0],r-.035,.06);k.ring('edge_reveal',m.blue,[0,y-.26,0],r-.015,.035);for(let j=0;j<12;j++){const a=j*Math.PI/6;k.box('radial_underfloor_rib',m.alloy,[Math.cos(a)*r*.54,y-.74,Math.sin(a)*r*.54],[r*.89,.24,.08],[0,-a,0]);if(j%2===0)panel([Math.sin(a)*(r-.03),y-.48,Math.cos(a)*(r-.03)],.6,.31,a)}})}
 // Continuous occupied base, stepped upper plates, genuine underside structure.
 cylinder('sealed_lower_hull',m.navy,[0,-2.75,0],5.85,1.0);cylinder('lower_deck_fascia',m.white,[0,-2.17,0],6.6,.2);cylinder('inhabited_service_floor',m.floor,[0,-1.93,0],6.65,.24)
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2;k.group('lower_service_bay_'+i,[Math.sin(a)*5.86,-2.25,Math.cos(a)*5.86],()=>{k.box('service_frame',m.alloy,[0,0,0],[1.18,.72,.08]);k.box('recessed_service_glass',m.screen,[0,0,.055],[1.02,.55,.025]);for(const x of [-.32,.32])k.box('glazing_bar',m.white,[x,0,.08],[.028,.62,.04]);k.box('warm_ceiling_strip',m.warm,[0,.28,.09],[.98,.025,.035]);k.box('lower_window_sill',m.white,[0,-.33,.11],[1.2,.08,.22]);k.box('foundation_buttress',m.blue,[.62,-.25,-.15],[.12,.9,.4]);if(!low)panel([0,-.73,.02],.9,.25)},[0,a,0]);k.beam('load_bearing_bottom_diagonal',m.alloy,[Math.sin(a)*2.6,-3.7,Math.cos(a)*2.6],[Math.sin(a)*5.85,-2.75,Math.cos(a)*5.85],.075)}
 cylinder('bottom_maintenance_core',m.navy,[0,-3.35,0],2.7,.5);for(let i=0;i<8;i++){const a=i*Math.PI/4;k.group('underside_radiator', [Math.sin(a)*3.8,-3.07,Math.cos(a)*3.8],()=>{k.box('radiator_carrier',m.alloy,[0,0,0],[.8,.15,1.8]);for(let f=0;f<(low?5:10);f++)k.box('cooling_fin',m.navy,[-.32+f*.64/(low?4:9),-.12,0],[.035,.23,1.65])},[0,a,0])}
 cylinder('central_lower_access_cover',m.white,[0,-3.617,0],1.17,.04)
 k.ring('central_access_gasket',m.alloy,[0,-3.644,0],1.06,.024)
 for(let j=0;j<12;j++){const a=j*Math.PI/6;k.box('bottom_service_segment',m.blue,[Math.sin(a)*1.73,-3.615,Math.cos(a)*1.73],[.42,.055,.43],[0,a,0]);k.cyl('bottom_access_fastener',m.alloy,[Math.sin(a)*.89,-3.652,Math.cos(a)*.89],.03,.03,.013,undefined,8)}
 // A shared entrance court articulates the existing base; it does not add fictional projects.
 for(const side of [-1,1])k.group('lower_shared_waiting_area',[side*2.08,-1.8,4.72],()=>{
  k.box('bench_base',m.navy,[0,.2,0],[1.12,.38,.47]);k.box('bench_seat',m.wood,[0,.42,0],[1.23,.095,.51]);k.box('bench_back',m.white,[0,.67,-.22],[1.24,.45,.075]);for(let joint=0;joint<6;joint++)k.box('seat_slat_joint',m.navy,[-.48+joint*.19,.473,0],[.012,.006,.46]);planter([side*.81,0,-.06]);
 })
 for(let j=0;j<9;j++)k.box('forecourt_paving_joint',m.alloy,[-2.8+j*.7,-1.804,4.86],[.009,.008,2.14],undefined,0)
 // Shared entrance pavilion occupies the forecourt and joins its two workshop wings.
 k.group('shared_arrival_foyer',[0,-1.8,5.05],()=>{
  architecture.slab('foyer_floor',m.floor,[0,0,0],2.74,1.63,.075,.23);
  for(const side of [-1,1]){k.box('foyer_corner_pier',m.white,[side*1.28,.79,.63],[.16,1.58,.2],undefined,.035);k.box('foyer_side_frame',m.white,[side*1.28,.79,-.57],[.16,1.58,.17]);k.box('foyer_side_glass',m.glass,[side*1.28,.84,.03],[.02,1.26,1.03]);k.box('foyer_side_sill',m.alloy,[side*1.28,.16,.03],[.08,.08,1.11]);}
  architecture.slab('foyer_canopy',m.blue,[0,1.58,0],2.95,1.84,.1,.28);
  architecture.slab('foyer_soffit',m.white,[0,1.52,0],2.83,1.7,.055,.23);
  for(const side of [-1,1]){k.box('entry_glass_leaf',m.glass,[side*.38,.83,.71],[.71,1.41,.018]);k.box('entry_door_stile',m.alloy,[side*.77,.83,.73],[.035,1.5,.055]);k.box('entry_pull_handle',m.alloy,[side*.06,.8,.77],[.025,.25,.04]);}
  k.box('entry_door_header',m.white,[0,1.56,.7],[1.61,.07,.13]);k.box('foyer_fixture',m.warm,[0,1.45,.1],[1.23,.027,.05]);
  k.box('foyer_reception_counter',m.white,[.78,.52,-.3],[.43,.94,.47]);k.box('counter_top',m.wood,[.78,1.01,-.3],[.49,.07,.53]);
 })
 // Central hub has two actual rooms behind segmented curved glass, not an opaque barrel.
 for(const y of [-1.65,.05,1.85]){cylinder('hub_structural_floor',m.white,[0,y,0],2.65,.17);k.arc('floor_edge_reveal',m.blue,[0,y+.09,0],2.51,2.65,.045)}
 for(const y of [-1.55,.15]){facade(2.5,y,1.35);for(let i=0;i<6;i++){const a=i*Math.PI/3;k.group('interior_console_bay',[Math.sin(a)*1.65,y+.08,Math.cos(a)*1.65],()=>desk([0,0,0],1.05),[0,a+Math.PI,0])}cylinder('central_routing_table',m.navy,[0,y+.7,0],.71,.18);cylinder('routing_table_diffuser',m.light,[0,y+.803,0],.58,.018);for(let i=0;i<6;i++){const a=i*Math.PI/3;cylinder('interior_support',m.white,[Math.sin(a)*1.09,y+.62,Math.cos(a)*1.09],.055,1.32)}k.ring('interior_ceiling_luminaire',m.warm,[0,y+1.31,0],2.15,.025)}
 k.arc('blue_brand_fascia',m.blue,[0,1.24,0],2.46,2.66,.59);cylinder('hub_roof',m.white,[0,2.03,0],2.76,.19);k.ring('roof_drip_edge',m.alloy,[0,2.09,0],2.77,.025)
 for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;k.group('roof_service_module',[Math.sin(a)*2,2.21,Math.cos(a)*2],()=>{k.box('air_handler',m.white,[0,.1,0],[.45,.21,.6]);for(let j=0;j<5;j++)k.box('louver',m.navy,[0,.212,-.22+j*.11],[.34,.018,.035])},[0,a,0])}
 k.group('hub_dispatch',[0,2.16,0],()=>{cylinder('spire_bearing',m.alloy,[0,.1,0],1.12,.19);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;k.group('slim_dispatch_blade',[Math.sin(a)*.48,0,Math.cos(a)*.48],()=>{k.box('blade_root',m.navy,[0,.28,0],[.37,.4,.5]);k.box('blade_enamel',i%2?m.blue:m.white,[0,1.88,0],[.22,3.3,.4],undefined,.045);k.box('blade_inset',m.alloy,[0,1.68,.209],[.11,2.65,.015]);k.box('signal_segment',m.light,[0,1.75,.22],[.035,2.38,.012]);for(let j=0;j<4;j++)k.box('blade_joint',m.navy,[0,.6+j*.8,.226],[.2,.014,.015])},[0,a,0])}cylinder('spire_cap',m.alloy,[0,3.68,0],.15,.15)},undefined,true)
 const zones=[[-5.5,0,4.7],[5.4,-.5,4.7],[5.6,1.7,-3.4],[-4.8,2.3,-4.5],[.5,3,-6.5]]
 zones.forEach(([x,y,z],i)=>{
  const r=i===4?1.9:2.48;if(i<2)architecture.frontHallPodium(i,x,y,z);else deck([x,y,z],r,.1,'project_district_'+i)
  for(const side of [-1,1]){k.beam('district_structural_strut',m.alloy,[x*.64+side*.22,-2.6,z*.64],[x+side*.7,y-.51,z],.12);k.cyl('strut_bearing',m.blue,[x+side*.7,y-.55,z],.22,.22,.2)}
  // Occupied lower wings connect the five districts to the city chassis.
  if(i>=2)k.group('inhabited_district_podium_'+i,[x,0,z],()=>{
   cylinder('podium_bottom',m.navy,[0,-1.86,0],r-.19,.3)
   k.ring('podium_lower_reveal',m.alloy,[0,-2.023,0],r-.36,.026)
   cylinder('underfloor_access_hatch',m.white,[0,-2.034,0],.57,.044)
   k.ring('hatch_gasket',m.alloy,[0,-2.061,0],.49,.016)
   for(let rib=0;rib<8;rib++){const angle=rib*Math.PI/4;k.box('underside_load_rib',m.alloy,[Math.cos(angle)*(r*.52),-2.034,Math.sin(angle)*(r*.52)],[r*.77,.068,.038],[0,-angle,0]);if(!low)k.cyl('hatch_fastener',m.alloy,[Math.sin(angle)*.42,-2.066,Math.cos(angle)*.42],.024,.024,.012,undefined,8)}
   for(let floor=-1.7;floor<y-.63;floor+=1.7){const h=Math.min(1.6,y-.63-floor);if(h<.12)continue;
    cylinder('podium_floor',m.white,[0,floor,0],r-.17,.12)
    k.arc('podium_rear_spandrel',m.white,[0,floor+.07,0],r-.36,r-.21,.18,0,Math.PI)
    k.arc('podium_rear_header',m.white,[0,floor+h-.09,0],r-.36,r-.21,.16,0,Math.PI)
    if(h>.48)facade(r-.27,floor+.25,h-.36,0,Math.PI,.34)
    for(let pier=0;pier<=6;pier++){const a=pier*Math.PI/6;k.box('rear_structural_pier',m.white,[Math.cos(a)*(r-.26),floor+h*.5,-Math.sin(a)*(r-.26)],[.095,h,.15],[0,a+Math.PI/2,0])}
    facade(r-.27,floor+.09,h-.08,Math.PI,Math.PI*2,.3)
    if(h>1.42){k.group('lower_shared_desk',[0,floor+.08,.58],()=>desk([0,0,0],1.35));k.arc('lower_office_ceiling_light',m.warm,[0,floor+h-.03,0],r-.46,r-.43,.018,Math.PI,Math.PI)}else if(h>.6){k.box('utility_level_equipment',m.white,[0,floor+.34,.6],[1.25,.48,.68]);for(let vent=0;vent<5;vent++)k.box('utility_grille',m.navy,[-.43+vent*.215,floor+.34,.953],[.095,.28,.014])}
   }
  })
  const inward=Math.atan2(-z,-x),radius=r+.28,steps=Math.max(4,Math.ceil((y+.1+1.65)/.17)),sweep=steps*.24/radius;
  const stair=[];for(let j=0;j<=steps;j++){const f=j/steps,a=inward+sweep*f;stair.push([x+Math.cos(a)*radius,-1.65+f*(y+.1+1.65),z+Math.sin(a)*radius])}
  k.ribbon('district_curved_stair_soffit',m.white,stair,.66,.14)
  for(let j=0;j<steps;j++){const q=stair[j],a=inward+sweep*j/steps;k.box('curved_stair_tread',m.floor,q,[.67,.05,.27],[0,-a,0]);for(const side of [-1,1]){const rr=radius+side*.34;k.beam('stair_guard_post',m.alloy,[x+Math.cos(a)*rr,q[1],z+Math.sin(a)*rr],[x+Math.cos(a)*rr,q[1]+.61,z+Math.sin(a)*rr],.018)}}
  for(const side of [-1,1])k.tube('stair_guardrail',m.alloy,stair.map((q,j)=>{const a=inward+sweep*j/steps;return[q[0]+Math.cos(a)*side*.34,q[1]+.62,q[2]+Math.sin(a)*side*.34]}),.025)
  const start=stair[0],len=Math.hypot(x,z),hub=[x/len*2.66,-1.65,z/len*2.66];k.ribbon('lower_concourse_connection',m.white,[hub,start],1.05,.18)
  const landing=stair.at(-1);k.ribbon('stair_upper_landing',m.floor,[landing,[x+(landing[0]-x)*.79,y+.1,z+(landing[2]-z)*.79]],.71,.12)
  k.group('workshop_'+i,[x,y+.15,z],()=>{
   if(i<2)architecture.frontHall(i)
   if(i===2){
    // Comparison hall has an asymmetric glazed side and a small cantilevered roof.
    k.box('comparison_rear_spine',m.white,[0,1.15,-1.91],[3.7,2.3,.2],undefined,.065);
    facade(2.31,.1,2.03,Math.PI*.1,Math.PI*.43,.23);
    k.group('comparison_asymmetric_roof',[.85,2.47,-1],()=>{architecture.slab('comparison_blue_roof',m.blue,[0,0,0],2.7,1.93,.13,.38);k.box('comparison_roof_soffit',m.white,[0,-.07,0],[2.48,.05,1.7]);for(let j=0;j<4;j++)k.box('comparison_roof_seam',m.alloy,[-1+j*.65,.156,0],[.017,.018,1.7]);k.box('comparison_downlight',m.warm,[0,-.11,0],[1.93,.021,.037])},[0,0,-.12]);
    for(const side of [-1,1])k.box('comparison_steel_pier',m.alloy,[side*1.69,1.2,-1.86],[.075,2.4,.12]);
   }
   if(i===3){
    // The evidence channels define the roofline; only two occupied flank wings remain.
    for(const side of [-1,1])k.group('evidence_flank_wing',[side*1.82,0,-.8],()=>{k.box('flank_cladding',m.white,[0,1.15,0],[.63,2.3,1.8],undefined,.07);k.box('flank_inset',m.navy,[-side*.326,1.26,.1],[.022,1.72,1.22]);k.box('flank_window',m.glass,[-side*.342,1.26,.1],[.022,1.59,1.09]);k.box('flank_light',m.warm,[-side*.362,1.99,.1],[.018,.023,1.05]);architecture.slab('flank_roof',m.white,[0,2.31,0],.74,1.94,.09,.12)});
   }
   if(i>=2){railing(r-.09,.05,-Math.PI*.94,-Math.PI*.59);railing(r-.09,.05,-Math.PI*.41,-Math.PI*.06)}
   if(i===4)railing(r-.09,.05,Math.PI*.08,Math.PI*.92)
   if(i<2){desk([-.9,0,-1.2],1.08);planter([2.03,0,1.2])}
   if(i===2)planter([-1.83,0,.75]);
   if(i===0){
    k.box('creation_table_frame',m.white,[0,.79,.47],[2.2,.16,1.08]);k.box('creation_inset_surface',m.wood,[0,.883,.47],[2.04,.02,.92]);for(const sx of [-.87,.87])for(const sz of [.1,.8])k.box('table_leg',m.alloy,[sx,.4,sz],[.08,.73,.08]);
    for(const side of [-1,1])architecture.articulatedArm(side)
    for(const side of [-1,1]){k.box('creation_machine_cabinet',m.navy,[side*.69,.44,.47],[.54,.62,.78],undefined,.045);for(let drawer=0;drawer<3;drawer++){k.box('machine_drawer',m.white,[side*.69,.25+drawer*.19,.881],[.47,.15,.025]);k.box('drawer_recess',m.dark,[side*.69,.29+drawer*.19,.897],[.22,.022,.01])}k.box('cabinet_status_lamp',m.warm,[side*.69,.72,.9],[.1,.02,.013])}
    for(let j=0;j<3;j++)k.box('stacked_draft_sheet',m.paper,[.25+j*.014,.902+j*.018,.6],[.47,.015,.33],[0,.12,0]);bolts([0,.886,.47],1.94,.83)
   }
   if(i===1){
    k.box('conveyor_chassis',m.navy,[0,.6,.45],[1.56,.21,2.72]);for(const sx of [-.61,.61])for(const z of [-.62,1.53])k.box('conveyor_leg',m.alloy,[sx,.27,z],[.08,.54,.08]);
    for(let j=0;j<(low?10:19);j++)k.cyl('conveyor_roller',m.alloy,[0,.737,-.74+j*2.37/(low?9:18)],.052,.052,1.36,[0,0,Math.PI/2],low?8:16)
    const shape=new T.Shape();shape.moveTo(-1.13,0);shape.lineTo(-1.13,1.54);shape.quadraticCurveTo(-1.13,2.21,-.49,2.21);shape.lineTo(.49,2.21);shape.quadraticCurveTo(1.13,2.21,1.13,1.54);shape.lineTo(1.13,0);shape.lineTo(.88,0);shape.lineTo(.88,1.54);shape.quadraticCurveTo(.88,1.96,.49,1.96);shape.lineTo(-.49,1.96);shape.quadraticCurveTo(-.88,1.96,-.88,1.54);shape.lineTo(-.88,0);shape.closePath();k.mesh('scanner_arch_casting',k.uv(new T.ExtrudeGeometry(shape,{depth:.39,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:low?1:3,curveSegments:low?12:32})),m.white,[0,0,.05]);k.box('scan_aperture',m.navy,[0,1.947,.24],[1.24,.055,.24]);k.box('scan_emitter',m.light,[0,1.91,.24],[1.06,.025,.12]);
    for(let j=0;j<3;j++){k.box('item_tray',m.blue,[0,.805,-.44+j*.8],[.86,.065,.49]);k.box('sample_content',m.paper,[0,.855,-.44+j*.8],[.66,.028,.35])}panel([1.15,1.02,.28],.28,.74,Math.PI/2)
   }
   if(i===2){for(const side of [-1,1]){k.box('module_plinth',m.alloy,[side*.74,.14,.35],[.96,.28,.92]);k.box('comparison_module',side<0?m.blue:m.white,[side*.74,1.07,.22],[.82,1.67,.69],undefined,.075);k.box('module_inset',m.navy,[side*.74,1.13,.578],[.66,1.3,.025]);for(let row=0;row<5;row++){k.box('hot_swap_module',side<0?m.white:m.alloy,[side*.74,.63+row*.23,.612],[.56,.18,.043]);k.box('module_status',m.light,[side*.74-.18,.63+row*.23,.637],[.06,.02,.01]);k.box('module_latch',m.dark,[side*.74+.17,.63+row*.23,.642],[.07,.04,.018])}}k.box('common_calibration_worktop',m.wood,[0,.79,1.17],[2.05,.13,.65]);for(const side of [-1,1])k.box('calibration_support',m.alloy,[side*.83,.4,1.17],[.06,.72,.49]);k.box('calibration_console',m.screen,[0,.94,1.17],[.63,.26,.31],[.2,0,0]);for(const side of [-1,1])k.tube('paired_calibration_cable',m.dark,[[side*.74,.35,.64],[side*.74,.26,.84],[side*.32,.48,1.06]],.025)}
   if(i===3){for(let j=0;j<3;j++){const px=(j-1)*.93,pts=[[px,3,-.61],[px,2.27,-.32],[px,1.35,.23],[px*.2,.55,1.1]];k.ribbon('evidence_channel_'+j,m.blue,pts,.58,.065);for(const sign of [-1,1])k.tube('evidence_channel_rim',m.alloy,pts.map(p=>[p[0]+sign*.29,p[1]+.035,p[2]]),.018);for(let row=0;row<2;row++){const y=2.36-row*.53,z=-.38+row*.36;k.box('evidence_card',m.paper,[px,y,z+.055],[.43,.4,.035],[-.55,0,0]);if(j===0)for(let line=0;line<3;line++)k.box('text_evidence_glyph',m.blue,[px,y+.11-line*.07,z+.09],[.28,.017,.01],[-.55,0,0]);else if(j===1){k.sphere('image_evidence_motif',m.blue,[px,y,z+.12],[.14,.1,.02])}else k.box('product_evidence_volume',m.blue,[px,y,z+.13],[.19,.17,.11])}}cylinder('evidence_intake',m.white,[0,.35,1.05],.56,.35);cylinder('intake_aperture',m.screen,[0,.54,1.05],.41,.02);k.ring('intake_read_light',m.light,[0,.56,1.05],.44,.022)}
   if(i===4){desk([0,0,-.48],1.52);const trunk=[[0,.23,1.43],[0,.23,.79],[0,.23,.34]];k.ribbon('review_intake',m.navy,trunk,.61,.1);for(const side of [-1,1]){const pts=[[0,.23,.34],[side*.5,.23,.07],[side*1.32,.23,-.18]];k.ribbon('review_output_'+side,m.white,pts,.47,.1);k.tube('review_output_guide_'+side,side<0?m.light:m.warm,pts.map(p=>[p[0],p[1]+.023,p[2]]),.016);k.box('review_output_tray',m.blue,[side*1.35,.34,-.18],[.5,.14,.56]);k.box('reviewed_packet',m.paper,[side*1.35,.44,-.18],[.31,.065,.36])}}
  })
 })
 // Same centerline function is consumed by the exported track and live shuttle motion.
 for(let track=0;track<2;track++){
  const pts=Array.from({length:128},(_,j)=>motion.hubRailPoint(track,j/128*Math.PI*2));k.ribbon('boxed_track_girder_'+track,m.white,pts,.64,.16,true);
  for(const side of [-1,1]){const rail=pts.map(p=>{const yaw=motion.hubRailYaw(track,pts.indexOf(p)/pts.length*Math.PI*2);return[p[0]+Math.cos(yaw)*side*.22,p[1]+.035,p[2]-Math.sin(yaw)*side*.22]});k.tube('continuous_running_rail_'+track,m.alloy,rail,.032,true);k.tube('track_edge_reveal',m.navy,pts.map(p=>{const yaw=motion.hubRailYaw(track,pts.indexOf(p)/pts.length*Math.PI*2);return[p[0]+Math.cos(yaw)*side*.31,p[1]-.08,p[2]-Math.sin(yaw)*side*.31]}),.023,true)}
  for(let j=0;j<(track?16:12);j++){
   const a=j/(track?16:12)*Math.PI*2,p=motion.hubRailPoint(track,a),radius=Math.hypot(p[0],p[2]),s=p[0]/radius,c=p[2]/radius,yaw=motion.hubRailYaw(track,a);
   k.box('track_cross_tie',m.navy,[p[0],p[1]-.015,p[2]],[.59,.055,.065],[0,yaw,0]);
   if(!track){k.beam('roof_edge_track_bracket',m.white,[s*2.46,1.93,c*2.46],[p[0],p[1]-.18,p[2]],.075);k.box('roof_track_seat',m.alloy,[p[0],p[1]-.185,p[2]],[.52,.07,.16],[0,a,0]);}
   else{
    const anchor=[p[0]*.82,-1.86,p[2]*.82];
    // Paired tapered truss ribs tie the perimeter railway into the occupied building chassis.
    k.beam('perimeter_bridge_lower_chord',m.white,anchor,[p[0],p[1]-.2,p[2]],.1);
    k.beam('perimeter_bridge_upper_chord',m.alloy,[anchor[0],p[1]-.48,anchor[2]],[p[0],p[1]-.2,p[2]],.075);
    k.box('perimeter_column',m.white,[anchor[0],(p[1]-.48-1.86)/2,anchor[2]],[.23,p[1]+1.38,.32],[0,a,0],.035);
    k.box('perimeter_footing',m.navy,anchor,[.62,.33,.78],[0,a,0]);
    // Building-edge beams connect supports back to the main foundation; no floating feet.
    k.beam('foundation_connection',m.navy,[s*Math.min(5.4,radius*.6),-2.18,c*Math.min(5.4,radius*.6)],anchor,.17);
    k.box('track_bearing_pad',m.blue,[p[0],p[1]-.19,p[2]],[.54,.08,.21],[0,a,0]);
   }
  }
 }
 for(let i=0;i<3;i++){const shuttle=k.group('hub_shuttle_'+i,motion.hubRailPoint(i%2,i*2.094).map((v,axis)=>axis===1?v+.112:v),()=>{
  k.box('shuttle_chassis',m.navy,[0,.11,0],[.65,.17,1.49],undefined,.07);architecture.slab('shuttle_floor',m.white,[0,.2,0],.71,1.7,.13,.24);architecture.slab('streamlined_shuttle_roof',m.white,[0,.94,0],.71,1.68,.07,.27);architecture.slab('roof_enamel_inset',m.blue,[0,1.023,0],.48,1.23,.012,.19)
  for(const side of [-1,1]){k.box('shuttle_sill',m.blue,[side*.33,.45,0],[.055,.24,1.49]);for(const z of [-.69,-.24,.26,.69])k.box('window_pillar',m.white,[side*.34,.73,z],[.042,.43,.045]);for(const z of [-.46,.02,.48])k.box('clear_side_window',m.glass,[side*.34,.74,z],[.015,.35,.36]);k.box('sliding_door_frame',m.alloy,[side*.353,.63,.02],[.023,.64,.39]);k.box('door_seam',m.navy,[side*.371,.64,.02],[.011,.55,.012]);k.box('door_handle',m.alloy,[side*.379,.61,.09],[.021,.1,.018]);for(const z of [-.5,.5])k.cyl('rail_wheel',m.dark,[side*.22,.045,z],.09,.09,.055,[0,0,Math.PI/2],low?8:20)}
  for(const sign of [-1,1]){k.box('windshield_gasket',m.navy,[0,.754,sign*.725],[.54,.37,.027],[sign*.38,0,0],.065);k.box('end_windshield',m.glass,[0,.754,sign*.744],[.47,.3,.018],[sign*.38,0,0]);k.sphere('curved_nose',m.blue,[0,.435,sign*.65],[.337,.19,.23]);k.box('nose_coupler',m.navy,[0,.295,sign*.834],[.13,.073,.097]);for(const x of [-.23,.23])k.box('shuttle_headlight',sign>0?m.warm:m.light,[x,.51,sign*.84],[.08,.028,.01]);k.box('interior_bench',m.navy,[0,.49,sign*.45],[.48,.12,.27]);k.box('bench_back',m.navy,[0,.66,sign*.55],[.48,.29,.07])}k.box('interior_light',m.warm,[0,.918,0],[.1,.015,1.13])
 },[motion.hubRailPitch(i%2,i*2.094),motion.hubRailYaw(i%2,i*2.094),0],true);shuttle.rotation.order='YXZ'}
 for(const a of [Math.PI*.45,Math.PI*1.45]){const x=Math.sin(a)*6.7,z=Math.cos(a)*6.7;k.group('reserved_expansion_port',[x,-1.58,z],()=>{k.box('port_collar',m.alloy,[0,0,0],[.87,.77,.39]);k.box('sealed_port',m.navy,[0,0,.22],[.68,.59,.045]);panel([0,0,.26],.54,.45)},[0,a,0])}
 return k.finish()
}
