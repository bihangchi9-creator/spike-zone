import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
const directory=resolve('../交付物/explorer-upgrade-20260920')
export default {name:'local-qa-artifacts',configureServer(server){
 server.middlewares.use('/__qa-artifact',async(req,res)=>{
  const name=new URL(req.url||'', 'http://localhost').searchParams.get('name')||''
  if(req.method!=='POST'||!/^[-a-z0-9]+\.(png|webm)$/.test(name)){res.statusCode=400;res.end();return}
  const chunks=[];let size=0
  try{for await(const chunk of req){size+=chunk.length;if(size>40*1024*1024){res.statusCode=413;res.end();return}chunks.push(chunk)}const destination=name.startsWith('harbor-review-')?resolve('../交付物/崇振建模精调-20260922'):name.startsWith('promo-')?resolve('../交付物/个人网站宣传片-20260920'):name.startsWith('story-')?resolve('../交付物/five-designed-worlds-20260921'):name.startsWith('five-')?resolve('../交付物/five-worlds-20260920'):name.startsWith('hyundai-')?resolve('../交付物/hyundai-pilot-20260920'):directory;await mkdir(resolve(destination,'media'),{recursive:true});await writeFile(resolve(destination,'media',name),Buffer.concat(chunks));res.end(name)}catch{res.statusCode=500;res.end('capture failed')}
 })
 for(const [route,directory] of [['/__models-review',resolve('../交付物/五世界建模优化-20260920')],['/__story-review',resolve('../交付物/five-designed-worlds-20260921')],['/__qa-review',resolve('../交付物/explorer-upgrade-20260920')],['/__hyundai-review',resolve('../交付物/hyundai-pilot-20260920')],['/__five-review',resolve('../交付物/five-worlds-20260920')]])server.middlewares.use(route,async(req,res)=>{
  const name=(req.url||'/').split('?')[0].replace(/^\//,'')||'index.html'
  if(!/^(index\.html|media\/[-a-z0-9]+\.(png|webm))$/.test(name)){res.statusCode=404;res.end();return}
  try{const body=await readFile(resolve(directory,name));res.setHeader('Content-Type',name.endsWith('.html')?'text/html; charset=utf-8':name.endsWith('.png')?'image/png':'video/webm');res.setHeader('Accept-Ranges','bytes');const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');if(range){const start=Number(range[1]),end=Math.min(body.length-1,range[2]?Number(range[2]):body.length-1);if(start>end||start>=body.length){res.statusCode=416;res.end();return}res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${body.length}`);res.setHeader('Content-Length',end-start+1);res.end(body.subarray(start,end+1))}else{res.setHeader('Content-Length',body.length);res.end(body)}}catch{res.statusCode=404;res.end('Not found')}
 })
}}
