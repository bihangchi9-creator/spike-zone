// Use in the real third-person scene and the review scene; no global exposure change.
export default function HubLighting(){return <>
 <hemisphereLight args={['#d5e7fa','#858178',.48]}/>
 <directionalLight position={[-9,13,11]} color="#ffe5bd" intensity={2.7} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} shadow-camera-near={.5} shadow-camera-far={55} shadow-normalBias={.012} shadow-bias={-.0001} shadow-radius={3}/>
 <directionalLight position={[11,8,-7]} color="#b9d9f8" intensity={1.1}/>
 <directionalLight position={[2,2,13]} color="#d2e5f2" intensity={.2}/>
</>}
