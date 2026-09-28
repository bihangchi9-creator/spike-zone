from pathlib import Path
from PIL import Image, ImageDraw
import subprocess,json,hashlib,datetime
root=Path(__file__).resolve().parents[2]
base=root/'交付物/五世界精修总计划-20260924/实施记录-20260926'
out=base/('离线对照-v2-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))
out.mkdir();frames=[];bindings={}
for world,count in [('bytedance',5),('opensource',2),('university',3),('hyundai',1)]:
 for version,views,quality,folder in [('v1',['overview','back','under'],'high','before'),('v2',['overview','front','side','back','under']+[f'story-{i}' for i in range(1,count+1)],'high','after'),('v2',['overview'],'low','light')]:
  asset=root/f'web/public/models/worlds/{world}-refined-{version}{"-low" if quality=="low" else ""}.glb';bindings[str(asset.relative_to(root))]=hashlib.sha256(asset.read_bytes()).hexdigest()
  for view in views:
   args=['node','blender/five-worlds/structural-preview.mjs',world,view,'--output-dir',str(out/folder)]
   if version=='v2':args.append('--v2')
   if quality=='high':args.append('--detailed')
   result=subprocess.run(args,cwd=root,capture_output=True,text=True,check=True)
   info=json.loads(result.stdout.strip().splitlines()[-1]);raw=Path(info['path']);im=Image.frombytes('RGBA',(1000,900),raw.read_bytes()).convert('RGB');d=ImageDraw.Draw(im);d.rectangle((0,858,1000,900),fill='#101b2b');d.text((16,869),f'{world} / {view} / {version} / {quality} | CPU STRUCTURE, NOT BROWSER ACCEPTANCE',fill='#d0d9e5');png=raw.with_suffix('.png');im.save(png);raw.unlink();info['image']=str(png.relative_to(out));info['sha256']=hashlib.sha256(png.read_bytes()).hexdigest();frames.append(info);print(world,version,quality,view,flush=True)
  assert bindings[str(asset.relative_to(root))]==hashlib.sha256(asset.read_bytes()).hexdigest(),'Asset changed during capture'
manifest={'time':datetime.datetime.now(datetime.timezone.utc).isoformat(),'method':'CPU rasterization of actual exported GLB; excludes transparency, texture maps, shadows, runtime badges, fog and atmosphere. No browser/interaction/performance claims. v1 and v2 comparisons share camera, 1000x900, FOV43 and CPU lights.','bindings':bindings,'frames':frames}
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));(base/'latest-offline-review.txt').write_text(str(out));print('DONE',out,flush=True)
