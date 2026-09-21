
// Recessed emitters follow the actual factory fascia and cockpit furniture.
// No billboard halo or atmospheric sphere: depth testing keeps light on the model.
const strips: {position: [number,number,number]; size: [number,number,number]}[] = [
 {position:[-3.9,5.51,7.115],size:[6.3,.07,.025]},
 {position:[-3.9,4.94,7.115],size:[6.3,.055,.025]},
 {position:[-7.08,5.22,7.115],size:[.055,.52,.025]},
 {position:[-.72,5.22,7.115],size:[.055,.52,.025]},
 {position:[3.25,8.43,1.155],size:[2.1,.045,.025]},
 {position:[3.25,7.04,-.915],size:[3.45,.045,.025]},
 {position:[1.15,8.5,-.6],size:[.06,.045,2.4]},
 {position:[5.35,8.5,-.6],size:[.06,.045,2.4]},
]
export default function MotorSurfaceLights({near}:{near:boolean}) {
 return <group>
  {strips.map(({position,size},i)=><mesh key={i} position={position} raycast={()=>{}}>
   <boxGeometry args={size}/>
   <meshStandardMaterial color="#103e83" emissive="#1767ff" emissiveIntensity={3.2} roughness={.4} toneMapped />
  </mesh>)}
  {near&&<>
   <pointLight position={[-3.9,4.65,7.35]} color="#2674ff" intensity={5} distance={3.8} decay={2}/>
   <pointLight position={[3.25,7.8,.2]} color="#2674ff" intensity={3} distance={2.8} decay={2}/>
  </>}
 </group>
}
