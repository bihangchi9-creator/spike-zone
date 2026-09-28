import {createRequire} from 'node:module'
import {readFile} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import {T} from './geometry-v2.mjs'
const require=createRequire(new URL('../../web/package.json',import.meta.url)),{TessellateModifier}=await import(pathToFileURL(require.resolve('three/addons/modifiers/TessellateModifier.js')))
const ts=require('typescript'),code=ts.transpileModule(await readFile(new URL('../../web/src/universe/worlds/campusSurfaceV2.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
export const {campusRoomOffset:roomOffset,campusRoomPose:roomPose,THEATRE_SIGN,theatreWallBehindSign}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'))
// Curves structural slabs and openings, rather than attaching rectangular rooms to a sphere.
export function curveRoom(group,cx,front,low,theatre=false){
 group.updateMatrixWorld(true);const inv=group.matrixWorld.clone().invert(),objects=[];group.traverse(o=>{if(o.isMesh)objects.push(o)});
 for(const o of objects){const original=o.geometry;let g=original.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inv,o.matrixWorld));
  const structural=/room_slab|floor_board|room_header|room_rear|retaining_cheek|retaining_masonry|stage_platform|seating_riser|layered_valance|lab_facade_frame|lab_glass_return|lab_ceiling_diffuser/.test(o.name);
  if(structural){
   if(/room_slab|room_header|room_rear|retaining_cheek|stage_platform|seating_riser|layered_valance/.test(o.name)){const subdivided=new TessellateModifier(low?.8:.35,6).modify(g);g.dispose();g=subdivided}
   const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),arch=theatre&&y> -1.7?Math.min(1,(y+1.7)/1.1)*.5*((x-cx)/2.9)**2:0;p.setXYZ(i,x,y-arch,z+roomOffset(x,cx,front))}g.computeVertexNormals();
  }else{
   // Furniture/equipment keep rigid shapes. Items belonging to one desk share its anchor.
   g.computeBoundingBox();const c=g.boundingBox.getCenter(new T.Vector3());let anchorX=c.x,anchorZ=c.z;
   if(!theatre){if(/digital_human_screen/.test(o.name)){anchorX=-4.4;anchorZ=5.3;}else if(/voice_display|abstract_voice_wave/.test(o.name)){anchorX=-2.2;anchorZ=5.29;}else if(/lab_worktop|lab_desk_leg|lab_monitor|lab_keyboard|lab_seat|lab_backrest|chair_leg|microphone|lab_desktop_computer|computer_vent/.test(o.name)){anchorX=c.x<-3.8?-5.6:-2.2;anchorZ=6.23;}}
   const pose=roomPose(anchorX,0,anchorZ,cx,front),matrix=new T.Matrix4().makeTranslation(anchorX,0,pose.position[2]).multiply(new T.Matrix4().makeRotationY(pose.yaw)).multiply(new T.Matrix4().makeTranslation(-anchorX,0,-anchorZ));g.applyMatrix4(matrix);
  }
  o.geometry=g;original.dispose();o.parent.remove(o);group.add(o);o.position.set(0,0,0);o.rotation.set(0,0,0);o.scale.set(1,1,1);
 }
}
