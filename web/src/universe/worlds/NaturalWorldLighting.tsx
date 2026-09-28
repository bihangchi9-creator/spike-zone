// Local scene lighting only; shared review integration is maintained by the design task.
export default function NaturalWorldLighting({id}:{id:string}){return <>
 <hemisphereLight args={['#d9ecf7',id==='opensource'?'#858d72':'#968c77',.55]}/>
 <directionalLight position={[-9,13,12]} color={id==='university'?'#ffe4b7':'#ffeacf'} intensity={2.65} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} shadow-camera-near={.5} shadow-camera-far={55} shadow-normalBias={.014} shadow-bias={-.0001} shadow-radius={3}/>
 <directionalLight position={[11,6,-8]} color="#b2d3ee" intensity={1.05}/>
 <directionalLight position={[1,1,13]} color="#d1e5e5" intensity={.24}/>
</>}
