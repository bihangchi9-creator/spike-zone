import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

// Editable model source. Units are metres in the design scene; nose points toward -Z.
export const VESSEL_DESIGN={length:4.65,width:2.65,height:1.48,scale:.82,engineX:.88,engineY:-.02,engineZ:1.8}
function loft(sections:number[][]){
 const cross=[[0,1],[.72,.72],[1,0],[.72,-.65],[0,-.8],[-.72,-.65],[-1,0],[-.72,.72]],v:number[]=[],idx:number[]=[]
 for(const [z,w,h] of sections)for(const [x,y] of cross)v.push(x*w,y*h,z)
 for(let r=0;r<sections.length-1;r++)for(let j=0;j<8;j++){const a=r*8+j,b=r*8+(j+1)%8,c=a+8,d=b+8;idx.push(a,c,b,b,c,d)}
 const end=(sections.length-1)*8;for(let j=1;j<7;j++)idx.push(0,j,j+1,end,end+j+1,end+j)
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();return g
}
function roof(g:THREE.BufferGeometry,rows:number[]){const indices:number[]=[];for(const r of rows)for(const side of [7,0])for(let i=0;i<6;i++)indices.push(g.index!.array[r*48+side*6+i]);const shell=g.clone();shell.setIndex(indices);return shell}
export function buildExplorer(){
 const root=new THREE.Group();root.name='SPIKE_personal_deep_space_explorer'
 const material=(name:string,color:string,roughness:number,metalness:number,emissive?:string)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness,emissive:emissive||'#000',emissiveIntensity:emissive?.35:0});m.name=name;return m}
 const paint=material('blue_grey_coating','#344c62',.64,.42),ceramic=material('warm_ceramic_panels','#d2c7b1',.7,.15),metal=material('exposed_titanium','#627583',.46,.72),dark=material('recess_and_radiator','#0c1822',.72,.3),glass=material('smoked_cockpit','#0c2634',.2,.5),amber=material('warm_cabin_light','#ce955a',.5,.15,'#c28645'),blue=material('engine_core','#6597ac',.5,.4,'#538ba9')
 const box=new THREE.BoxGeometry(1,1,1),hull=loft([[-2.45,.13,.14],[-1.75,.47,.43],[-.55,.67,.64],[.65,.67,.56],[1.65,.43,.36],[1.95,.32,.27]])
 const pod=loft([[-1.1,.13,.2],[-.75,.28,.35],[.75,.3,.35],[1.1,.24,.28]])
 const add=(name:string,g:THREE.BufferGeometry,m:THREE.Material,p=[0,0,0],s=[1,1,1],r=[0,0,0])=>{const mesh=new THREE.Mesh(g,m);mesh.name=name;mesh.position.set(...p as [number,number,number]);mesh.scale.set(...s as [number,number,number]);mesh.rotation.set(...r as [number,number,number]);root.add(mesh);return mesh}
 add('pressure_hull',hull,paint)
 add('belly_keel',hull,dark,[0,-.24,.2],[.7,.68,.9])
 add('cockpit_glass',hull,glass,[0,.37,-.68],[.64,.45,.42])
 add('cockpit_brow',box,ceramic,[0,.64,-.68],[.56,.055,.22],[.13,0,0])
 add('aft_ceramic_spine',roof(hull,[2,3]),ceramic,[0,.005,0],[1.005,1.012,1.001])
 add('stern_service_hatch',box,metal,[0,.05,1.9],[.38,.28,.07])
 add('warm_cabin_slit',box,amber,[0,.53,-1.02],[.45,.022,.045])
 for(const side of [-1,1]){
  add('short_structural_arm',box,metal,[side*.68,-.06,.45],[.52,.25,.75],[0,-side*.18,side*.1])
  add('engine_pod',pod,paint,[side*.88,-.02,.68])
  add('pod_ceramic_cap',roof(pod,[1,2]),ceramic,[side*.88,-.016,.68],[1.008,1.015,1.002])
  add('nozzle_shroud',new THREE.CylinderGeometry(.24,.28,.3,20),metal,[side*.88,-.02,1.78],[1,1,1],[Math.PI/2,0,0])
  add('nozzle_recess',new THREE.CircleGeometry(.21,24),dark,[side*.88,-.02,1.937])
  add('nozzle_core',new THREE.CircleGeometry(.12,20),blue,[side*.88,-.02,1.941])
  for(let j=0;j<6;j++)add('heat_exchanger',box,dark,[side*.43,.545,.2+j*.14],[.18,.028,.042],[0,0,-side*.18])
  add('recessed_navigation_light',box,side<0?amber:blue,[side*1.17,.04,.05],[.025,.04,.15])
  add('landing_skid',box,metal,[side*.43,-.5,.45],[.09,.1,1.65])
 }
 // A single personal device: restrained plaid patch, translated from the portrait's cap.
 for(let x=0;x<4;x++)for(let z=0;z<4;z++)add('cap_plaid_signature',box,(x+z)%2?ceramic:paint,[.04+x*.065,.61,.05+z*.065],[.057,.008,.055])
 // Functional asymmetry: port survey camera and deployable sensor stem.
 add('survey_mount',box,metal,[-.72,.23,-.74],[.29,.12,.2])
 add('survey_camera',new THREE.CylinderGeometry(.12,.15,.26,12),dark,[-.87,.27,-.81],[1,1,1],[Math.PI/2,0,0])
 add('survey_lens',new THREE.CircleGeometry(.088,16),glass,[-.87,.27,-.945],[1,1,1],[0,Math.PI,0])
 add('sensor_stem',box,metal,[-.47,.7,.88],[.025,.42,.025],[0,0,.18])
 add('sensor_head',box,ceramic,[-.505,.91,.88],[.12,.055,.08])
 // Bake static transforms and batch by material: seven draw groups, no texture downloads.
 root.updateMatrixWorld(true);const batches=new Map<THREE.Material,THREE.BufferGeometry[]>(),original=new Set<THREE.BufferGeometry>()
 for(const o of root.children){const m=o as THREE.Mesh;original.add(m.geometry);const g=m.geometry.clone().applyMatrix4(m.matrixWorld).toNonIndexed();g.deleteAttribute('uv');const list=batches.get(m.material as THREE.Material)||[];list.push(g);batches.set(m.material as THREE.Material,list)}
 root.clear();for(const [m,list] of batches){const merged=mergeGeometries(list);if(merged){const mesh=new THREE.Mesh(merged,m);mesh.name=m.name;mesh.castShadow=true;root.add(mesh)}list.forEach(g=>g.dispose())}original.forEach(g=>g.dispose())
 return root
}
