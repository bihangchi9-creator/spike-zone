// Shared by the local model review and the actual portfolio's third-person viewer.
export default function HarborLighting(){return <>
 <hemisphereLight args={['#d0e5f5','#929181',.55]}/>
 <directionalLight position={[-9,12,10]} color="#ffe1b6" intensity={3.05} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} shadow-camera-near={.5} shadow-camera-far={55} shadow-normalBias={.015} shadow-bias={-.0001} shadow-radius={3}/>
 <directionalLight position={[10,7,-8]} color="#a7cdeb" intensity={1.4}/>
 <directionalLight position={[1,2,12]} color="#d3e9f4" intensity={.24}/>
</>}
