import {Workshop,T,mat,vec} from './geometry-v2.mjs'
import {growTree,groundRoots} from './tree-growth-v2.mjs'
import {branch,leafCanopy} from './organic-v2.mjs'
export function buildOpenSource(low=false,treeMotion){
 const k=new Workshop('OpenSource_refined_v2',low),m={wood:mat('tree_structural_wood','#be9d6b',.76),pale:mat('tree_cut_wood','#d9c7a0',.72),white:mat('tree_ivory','#e6e8dc',.59),metal:mat('tree_bronze_alloy','#78978a',.44,.48),green:mat('tree_enamel','#277a60',.45,.22),dark:mat('tree_recess','#254137',.89),glass:mat('tree_clear_glass','#afd8c8',.18,.04),canopy:mat('tree_leaf_glass','#3b9d79',.28,.15),light:mat('tree_warm_lamp','#ffe0a1',.45,0,'#ffcb86'),signal:mat('tree_connection_light','#75cbb4',.43,0,'#5dab9c'),leaf:mat('tree_leaf_dark','#468258',.9),leaf2:mat('tree_leaf_fresh','#80a95e',.86),screen:mat('tree_display','#294d4b',.5,.1)}
 m.leaf.side=T.DoubleSide;m.leaf2.side=T.DoubleSide;m.glass.transparent=true;m.glass.opacity=.13;m.glass.depthWrite=false;m.glass.side=T.DoubleSide;m.canopy.side=T.DoubleSide;m.canopy.transparent=true;m.canopy.opacity=.67;m.canopy.depthWrite=false
 const platforms=[{id:'bridge',p:[-4.9,-.45,3.1],r:2.18,roof:5.5,turn:-.2},{id:'tools',p:[5.2,-.45,2.4],r:2.15,roof:5.3,turn:.25},{id:'shared_lower',p:[-2.7,-3.4,-2.9],r:1.8,roof:4.55,turn:-.5},{id:'shared_upper',p:[-3.3,3.1,-1.75],r:1.75,roof:4.45,turn:.3},{id:'library',p:[3.2,3.7,-2.2],r:1.7,roof:4.4,turn:-.3},{id:'crown',p:[.6,6,1],r:1.35,roof:3.45,turn:.4}]
 const growth=growTree(k,m,platforms);const roots=groundRoots(k,m);const bridgeChecks=[];
 function deck(r){k.cyl('platform_structure',m.white,[0,-.12,0],r,r*.96,.26);k.arc('wood_fascia_inlay',m.wood,[0,-.19,0],r-.012,r+.012,.08);for(let brace=0;brace<8;brace++){const a=brace*Math.PI/4;k.beam('laminated_underdeck_rib',m.pale,[Math.sin(a)*.25,-.47,Math.cos(a)*.25],[Math.sin(a)*r*.89,-.2,Math.cos(a)*r*.89],.048)}for(let i=0;i<Math.ceil(r*2/.2);i++){const x=-r+.1+i*.2,half=Math.sqrt(Math.max(0,r*r-x*x));if(half>.14)k.box('deck_plank',m.pale,[x,.035,0],[.188,.055,half*2-.06])}k.ring('bent_laminated_rim',m.wood,[0,-.06,0],r,.055)}
 function rail(r,inward){const count=36;for(let i=0;i<count;i++){const a=i/count*Math.PI*2,b=(i+1)/count*Math.PI*2,mid=(a+b)/2,gap=t=>Math.abs(Math.atan2(Math.sin(mid-t),Math.cos(mid-t)))<.23;if(gap(inward)||gap(0))continue;for(const t of [a,b])k.beam('balustrade_post',m.wood,[Math.sin(t)*r,.07,Math.cos(t)*r],[Math.sin(t)*r,.62,Math.cos(t)*r],.025);k.beam('balustrade_top',m.pale,[Math.sin(a)*r,.62,Math.cos(a)*r],[Math.sin(b)*r,.62,Math.cos(b)*r],.026)}}
 function desk(p,w=1.15){k.group('studio_desk',p,()=>{k.box('wood_worktop',m.pale,[0,.71,0],[w,.085,.6]);for(const x of [-w*.37,w*.37])k.box('trestle',m.wood,[x,.36,0],[.055,.66,.46]);k.box('screen_stand',m.metal,[0,.88,-.15],[.04,.28,.04]);k.box('screen_frame',m.green,[0,1,-.15],[.58,.37,.045]);k.box('display',m.screen,[0,1,-.12],[.51,.3,.013]);for(let i=0;i<3;i++)k.box('abstract_connection_line',m.signal,[-.07,1.08-i*.07,-.108],[.24-i*.035,.011,.006]);k.box('keyboard',m.dark,[0,.767,.14],[.34,.024,.13]);k.box('chair_seat',m.green,[0,.41,.71],[.43,.065,.39]);k.box('chair_back',m.wood,[0,.63,.87],[.44,.38,.055]);for(const x of [-.16,.16])for(const z of [.55,.86])k.beam('chair_leg',m.wood,[x,.02,z],[x,.41,z],.023)})}
 function greenery(p,size=1){k.group('living_foliage',p,()=>{branch(k,'living_shoot',m.wood,[[0,0,0],[.1,.34*size,0],[.06,.76*size,-.05]],[.035,.025,.004]);for(let i=0;i<(low?5:9);i++){const a=i*2.399,s=.14*size,x=Math.sin(a)*.2*size,z=Math.cos(a)*.2*size,y=.25*size+i*.05*size;k.beam('petiole',m.leaf,[.07,y,0],[x,y+.04,z],.009);const pos=[],uv=[],index=[];for(let row=0;row<=6;row++)for(const side of [-1,1]){const t=row/6;pos.push((t-.5)*s*2,.04*size*Math.sin(t*Math.PI),side*Math.sin(t*Math.PI)*s*.43);uv.push(t,(side+1)/2);if(row<6&&side<0){const q=row*2;index.push(q,q+2,q+1,q+1,q+2,q+3)}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(index);geo.computeVertexNormals();const leaf=k.mesh('natural_leaf',geo,i%2?m.leaf:m.leaf2,[x,y+.04,z],[.2,a,.35])}})}
 platforms.forEach(({id,p,r,roof,turn},i)=>{
  k.group('workspace_'+id,p,()=>{deck(r);rail(r-.05,Math.atan2(-p[0],-p[2]));
   // Curved occupied room behind the open project terrace, with real window openings.
   const rear=r*.83;

   k.arc('room_header',m.white,[0,1.64,0],rear-.09,rear+.045,.19,0,Math.PI);
   for(let bay=0;bay<8;bay++){const a=bay*Math.PI/8,b=(bay+1)*Math.PI/8,door=Math.atan2(p[2],-p[0]);if(Math.abs((a+b)/2-door)<.24)continue;k.arc('ivory_room_plinth',m.white,[0,.075,0],rear-.09,rear+.045,.22,a,b-a);k.arc('room_curved_glazing',m.glass,[0,.31,0],rear-.01,rear+.005,1.29,a+.018,b-a-.036);k.box('laminated_window_stile',m.wood,[Math.cos(a)*rear,.94,-Math.sin(a)*rear],[.065,1.35,.085],[0,a+Math.PI/2,0]);k.arc('window_sill_reveal',m.pale,[0,.295,0],rear-.055,rear+.075,.035,a,b-a)}
   k.arc('room_ceiling_warm_lamp',m.light,[0,1.615,0],rear-.16,rear-.135,.02,Math.PI*.05,Math.PI*.9);
for(const x of [-r*.69,r*.69]){k.beam('curved_roof_stay',m.wood,[x,0,-.5],[x*.72,1.89,-.43],.049);k.box('roof_bolt_plate',m.metal,[x*.72,1.9,-.43],[.15,.055,.15])}leafCanopy(k,m.canopy,m.green,[0,1.91,-.25],roof,r*1.05,turn)
   const width=r*1.12;k.box('cabinet_back',m.wood,[0,.77,-r*.56],[width,1.47,.15]);for(let shelf=0;shelf<4;shelf++)k.box('storage_shelf',m.pale,[0,.16+shelf*.35,-r*.45],[width,.05,.37]);for(let shelf=0;shelf<3;shelf++)for(let b=0;b<4;b++){const h=.18+b*.025;k.box('stored_notebook',b%2?m.green:m.white,[-width*.35+b*.12,.21+shelf*.35+h/2,-r*.41],[.085,h,.16])}
   if(i<2){k.box('message_docking_sill',m.white,[0,.04,r+.18],[.81,.13,.75]);k.box('dock_cushion',m.green,[0,.122,r+.18],[.57,.025,.51]);desk([-.52,0,-.02],1.05);desk([.68,0,-.18],.9);k.box('workshop_corner_window',m.glass,[-r*.76,.93,-.15],[.018,1.38,1.2]);for(const z of [-.73,.4])k.beam('window_frame',m.wood,[-r*.76,.2,z],[-r*.76,1.62,z],.025);k.box('entry_canopy_light',m.light,[0,1.76,.38],[.6,.03,.04]);
    k.box('message_connection_table',m.white,[0,.52,r*.6],[1.08,.11,.43]);for(const x of [-.38,.38])k.box('console_leg',m.wood,[x,.28,r*.6],[.05,.46,.28]);if(i===0){for(const x of [-.33,.33]){k.box('bridge_terminal',m.green,[x,.78,r*.6],[.23,.4,.26]);k.box('terminal_signal',m.signal,[x,.88,r*.74],[.14,.06,.018])}k.tube('message_bridge_link',m.metal,[[-.33,.68,r*.6],[0,.94,r*.6],[.33,.68,r*.6]],.025)}else{for(let b=0;b<3;b++){k.box('tool_module',b%2?m.white:m.green,[-.33+b*.33,.72,r*.6],[.24,.28,.25]);k.box('module_connection',m.signal,[-.33+b*.33,.72,r*.74],[.14,.04,.012])}}
   }else{if(i===2)desk([0,0,0],1.25);else if(i===5){k.cyl('shared_meeting_table',m.pale,[0,.61,.2],.56,.56,.075);k.cyl('meeting_table_pedestal',m.wood,[0,.33,.2],.12,.2,.55);}k.box('reading_bench',m.pale,[r*.63,.38,.35],[.36,.11,.83]);for(const z of [-.01,.71])k.box('bench_leg',m.wood,[r*.63,.19,z],[.08,.32,.1])}
   greenery([-r*.65,.07,r*.36],.8);if(i<4)greenery([r*.68,.07,.35],.65)
  })
 })
 // Occupied lower galleries join the two project workshops into a continuous tree city.
 for(const {p,r}of platforms.slice(0,2))k.group('lower_project_gallery',[p[0],p[1]-1.7,p[2]],()=>{
  k.arc('gallery_floor',m.pale,[0,0,0],.75,r-.07,.11,Math.PI,Math.PI);k.arc('gallery_ivory_fascia',m.white,[0,-.12,0],r-.23,r-.04,.17,Math.PI,Math.PI);
  for(let bay=0;bay<7;bay++){const a=Math.PI+(bay+.5)/7*Math.PI,x=Math.cos(a)*(r-.18),z=-Math.sin(a)*(r-.18);k.box('gallery_arched_pier',m.white,[x,.82,z],[.12,1.52,.19],[0,a+Math.PI/2,0]);if(bay!==3)k.arc('gallery_glass_window',m.glass,[0,.23,0],r-.16,r-.14,1.22,a-Math.PI/14+.035,Math.PI/7-.07);k.box('gallery_reading_seat',m.pale,[x*.76,.37,z*.76],[.44,.11,.38],[0,a+Math.PI/2,0]);}
  k.arc('gallery_header',m.white,[0,1.52,0],r-.31,r-.06,.13,Math.PI,Math.PI);k.arc('gallery_cove_light',m.light,[0,1.47,0],r-.34,r-.315,.025,Math.PI,Math.PI);
 });
 const sharedBridge=[[-4.1,-2.15,4.8],[-2.2,-2.15,5.1],[0,-2.15,5.13],[2.4,-2.15,4.83],[4.35,-2.15,4.13]];
 k.ribbon('shared_front_gallery_connection',m.pale,sharedBridge,.74,.15);
 for(const side of [-1,1]){k.tube('gallery_bridge_guardrail',m.wood,sharedBridge.map(p=>[p[0],p[1]+.62,p[2]+side*.36]),.026);for(const p of sharedBridge)k.beam('gallery_bridge_post',m.wood,[p[0],p[1],p[2]+side*.36],[p[0],p[1]+.62,p[2]+side*.36],.025)}
 for(const side of [-1,1])branch(k,'gallery_bough_support',m.wood,[[side*.4,-5.2,1],[side*1.3,-3.3,3.25],[side*2.2,-2.3,5.1]],[.27,.21,.07]);
 // Platforms connect to real stair landings around the trunk, not a tube posing as a walkway.
 const spiral=[];for(let i=0;i<=132;i++){const f=i/132,a=f*Math.PI*5.25;spiral.push([Math.sin(a)*1.8,-6.5+f*12.5,Math.cos(a)*1.8])}k.ribbon('helical_walkway',m.pale,spiral,.63,.12)
 for(let i=0;i<spiral.length;i+=2){const p=spiral[i],a=Math.atan2(p[0],p[2]);k.box('stair_tread',m.pale,p,[.61,.045,.23],[0,a+Math.PI/2,0]);for(const side of [-1,1]){const r=1.8+side*.32;k.beam('spiral_guard_post',m.wood,[Math.sin(a)*r,p[1],Math.cos(a)*r],[Math.sin(a)*r,p[1]+.55,Math.cos(a)*r],.016)}}for(const side of [-1,1])k.tube('helical_guardrail',m.wood,spiral.map(p=>[p[0]*(1+side*.32/1.8),p[1]+.56,p[2]*(1+side*.32/1.8)]),.022)
 for(const {p,r,id}of platforms){
  const near=spiral.reduce((a,b)=>Math.abs(a[1]-p[1])<Math.abs(b[1]-p[1])?a:b),a0=Math.atan2(near[0],near[2]),a1=Math.atan2(p[0],p[2]),delta=Math.atan2(Math.sin(a1-a0),Math.cos(a1-a0)),count=Math.max(6,Math.ceil(Math.abs(delta)*12)),pts=[];
  for(let j=0;j<=count;j++){const f=j/count,a=a0+delta*f;pts.push([Math.sin(a)*1.8,near[1]*(1-f)+p[1]*f,Math.cos(a)*1.8])}
  const end=vec(p).addScaledVector(new T.Vector3(p[0],0,p[2]).normalize(),id==='crown'?r*.65:-r*.74).toArray();pts.push(end);
  k.ribbon('bridge_to_'+id,m.pale,pts,.66,.1);
  const bridgeCurve=new T.CatmullRomCurve3(pts.map(vec)),hits=[];let minimum=Infinity;for(let j=0;j<=160;j++){const q=bridgeCurve.getPoint(j/160),d=bridgeCurve.getTangent(j/160),side=new T.Vector3(d.z,0,-d.x).normalize();for(const edge of [-.3,0,.3])for(const height of [.12,.65,1.2]){const sample=q.clone().addScaledVector(side,edge);sample.y+=height;const distance=growth.field(sample.x,sample.y,sample.z);minimum=Math.min(minimum,distance);if(distance<.015)hits.push({position:sample.toArray(),distance})}}bridgeChecks.push({id,minimumClearance:minimum,hits});
  for(const side of [-1,1]){const edge=pts.map((p,j)=>{const prev=pts[Math.max(0,j-1)],next=pts[Math.min(pts.length-1,j+1)],dx=next[2]-prev[2],dz=prev[0]-next[0],len=Math.hypot(dx,dz)||1;return[p[0]+dx/len*side*.32,p[1]+.55,p[2]+dz/len*side*.32]});k.tube('bridge_handrail',m.wood,edge,.025);for(let j=0;j<edge.length;j+=2){const a=edge[j];k.beam('bridge_guard_post',m.wood,[a[0],a[1]-.55,a[2]],a,.018)}}
 }
 const lift=treeMotion.TREE_LIFT;for(const x of [lift.x-.28,lift.x+.28])k.beam('lift_guide',m.metal,[x,lift.minY-.3,lift.z],[x,lift.maxY+1.15,lift.z],.035)
 k.group('tree_lift',[lift.x,(lift.minY+lift.maxY)/2,lift.z],()=>{k.cyl('lift_floor',m.white,[0,.05,0],.48,.48,.12);k.cyl('lift_canopy',m.green,[0,1.07,0],.49,.49,.09);for(let i=0;i<4;i++){const a=i*Math.PI/2;k.beam('lift_frame',m.metal,[Math.sin(a)*.4,.11,Math.cos(a)*.4],[Math.sin(a)*.4,1.03,Math.cos(a)*.4],.025)}k.mesh('lift_glazing',new T.CylinderGeometry(.42,.42,.86,low?16:32,1,true,Math.PI*.25,Math.PI*1.5),m.glass,[0,.57,0]);k.box('lift_control',m.green,[.27,.67,.09],[.12,.25,.1]);k.ring('lift_roof_light',m.light,[0,1.01,0],.37,.016)},undefined,true)
 for(let i=0;i<2;i++)k.group('tree_pod_'+i,treeMotion.treePodPose(i,1).position,()=>{k.box('message_pod_hull',m.white,[0,.18,0],[.55,.27,.83],undefined,.1);k.box('message_pod_glass',m.glass,[0,.42,0],[.46,.3,.55],undefined,.08);k.box('pod_roof',m.green,[0,.6,0],[.53,.08,.75]);k.box('envelope',m.pale,[0,.37,0],[.22,.21,.12]);for(const side of [-1,1])k.box('pod_navigation_lamp',m.signal,[side*.19,.21,.423],[.065,.024,.015])},undefined,true)
 // Layered glazed leaf crowns are supported by slender timber ribs, distinct from living leaves.
 for(const [p,length,width,turn]of [[[-.7,4.84,1.25],5.8,2.28,-.63],[[1.4,2.06,-1.6],5.35,2.18,1.1],[[-1.3,-.9,-1.35],4.85,2.03,-.8]]){
  branch(k,'canopy_support_branch',m.wood,[[.15,p[1]-1.85,0],[p[0]*.55,p[1]-.6,p[2]*.55],p],[.24,.14,.035]);leafCanopy(k,m.canopy,m.green,p,length,width,turn);
 }
 // Four small neutral seed rooms sit among the roots, as in the approved overall concept.
 for(let room=0;room<4;room++){
  const a=room*Math.PI/2+.48,r=4.65,x=Math.sin(a)*r,z=Math.cos(a)*r,y=-Math.sqrt(9.94**2-r*r)+.57;
  k.group('shared_root_seed_room',[x,y,z],()=>{
   for(const side of [-1,1])branch(k,'seed_room_root_cradle',m.wood,[[side*.7,-Math.sqrt(9.85**2-(x+side*.7)**2-(z-.28)**2)-y+.16,-.28],[side*.56,-.2,-.12],[side*.57,-.06,.27]],[.17,.13,.065]);
   k.cyl('seed_room_base',m.white,[0,0,0],.81,.76,.16);k.cyl('seed_floor',m.pale,[0,.098,0],.72,.72,.06);
   for(let bay=0;bay<10;bay++){const a=bay*Math.PI/5;k.beam('seed_room_frame',m.wood,[Math.sin(a)*.69,.13,Math.cos(a)*.69],[Math.sin(a)*.69,1.07,Math.cos(a)*.69],.032);k.arc('seed_glass',m.glass,[0,.14,0],.682,.698,.9,a+.024,Math.PI/5-.048)}
   k.cyl('seed_roof',m.white,[0,1.13,0],.67,.79,.16);k.ring('seed_roof_lamp',m.light,[0,1.055,0],.66,.018);k.box('seed_worktop',m.pale,[0,.55,-.14],[.85,.075,.43]);for(const xx of [-.32,.32])k.box('seed_worktop_leg',m.wood,[xx,.32,-.14],[.045,.43,.3]);k.box('seed_storage',m.green,[0,.47,-.47],[.61,.72,.15]);
  });
  const pts=Array.from({length:20},(_,j)=>{const rr=1.55+j/19*3.1;return[Math.sin(a)*rr,-Math.sqrt(9.94**2-rr*rr)+.54,Math.cos(a)*rr]});k.ribbon('root_walking_connection',m.pale,pts,.4,.085);
 }
 roots.plantings.forEach((p,i)=>greenery(p,.55+(i%3)*.13));
 for(const {p,r}of platforms)for(let i=0;i<7;i++){const a=i/7*Math.PI*1.7+Math.PI*.15;greenery([p[0]+Math.sin(a)*r*.87,p[1]+.04,p[2]+Math.cos(a)*r*.87],.5+(i%3)*.14)}
 for(let i=0;i<8;i++){const a=i*2.399,y=4.3+(i%3)*.75;greenery([Math.sin(a)*1.5,y,Math.cos(a)*1.5],.85)}
 k.root.userData.checks={bridgeChecks,rootTrunkConnectivity:growth.connectivity};return k.finish()
}
