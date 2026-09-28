"""Local CPU construction comparisons; never a browser screenshot or live overlay proof."""
from pathlib import Path
from PIL import Image, ImageDraw
import subprocess,json,hashlib,datetime,html
root=Path(__file__).resolve().parents[2]
base=root/'交付物/五世界精修总计划-20260924/实施记录-20260926'
out=Path((base/'latest-integration-fix.txt').read_text().strip());frames=[]
views=[('hyundai','front',None,None),('hyundai','factory',[-3.9,4.8,15],[-2.3,3.8,5.7]),('hyundai','logo',[-3.6,5.7,12],[-2.43,4.76,6.25]),('hyundai','music',[3.6,8.5,4.4],[2,7.21,-.78]),('university','front',None,None),('university','theatre',[8.9,-1.1,12.8],[4.43,-2.25,4.91])]
for phase in ['before','after']:
 for world,view,camera,target in views:
  for low in [False,True]:
   rel=f'web/public/models/worlds/{world}-refined-v2{"-low" if low else ""}.glb';asset=(out/'before'/rel) if phase=='before' else root/rel
   binding=hashlib.sha256(asset.read_bytes()).hexdigest()
   args=['node','blender/five-worlds/structural-preview.mjs',world,view,'--v2','--asset',str(asset),'--output-dir',str(out/phase/'images')]
   if not low:args.append('--detailed')
   if camera:args+=['--camera',json.dumps(camera),'--target',json.dumps(target)]
   result=subprocess.run(args,cwd=root,capture_output=True,text=True,check=True);info=json.loads(result.stdout.strip().splitlines()[-1]);raw=Path(info['path']);im=Image.frombytes('RGBA',(1000,900),raw.read_bytes()).convert('RGB');d=ImageDraw.Draw(im);d.rectangle((0,858,1000,900),fill='#101b2b');d.text((16,869),f'{phase} / {world} / {view} / {"low" if low else "high"} | CPU CONSTRUCTION ONLY',fill='#d0d9e5');png=raw.with_suffix('.png');im.save(png);raw.unlink()
   assert binding==hashlib.sha256(asset.read_bytes()).hexdigest()
   info.update(phase=phase,image=str(png.relative_to(out)),asset=str(asset),assetSHA256=binding,imageSHA256=hashlib.sha256(png.read_bytes()).hexdigest(),fov=43)
   frames.append(info);print(phase,world,view,'low' if low else 'high',flush=True)
(out/'image-manifest.json').write_text(json.dumps({'time':datetime.datetime.now(datetime.timezone.utc).isoformat(),'method':'Actual GLB CPU raster, same camera/FOV43/1000x900/lights per pair. Excludes live logo/title/waveform overlays, texture, transparency, shadows, atmosphere. NOT browser evidence.','frames':frames},ensure_ascii=False,indent=2))
body=['<!doctype html><meta charset="utf-8"><title>四项接入修复对照</title><style>body{background:#111c2b;color:#dae1ed;font:16px system-ui;margin:32px}section{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:30px 0}img{width:100%}h2{grid-column:1/-1}a{color:#9bcaff}</style><h1>四项接入修复 · 同机位结构对照</h1><p>仅为实际 GLB 的离线结构图；不含网页运行时 Logo、剧名、波形、贴图与透明效果，不代替网页验收。覆盖面间距与支承见 <a href="actual-glb-surface-check.json">实际模型检测报告</a>。</p>']
for world,view,_,_ in views:
 for low in [False,True]:
  quality='light' if low else 'detailed';pair=[next(f for f in frames if f['world']==world and f['side']==view and f['quality']==quality and f['phase']==p) for p in ['before','after']]
  body.append(f'<section><h2>{world} · {view} · {quality}</h2>')
  for f in pair:body.append(f'<article>{f["phase"]}<img src="{html.escape(f["image"])}"></article>')
  body.append('</section>')
(out/'index.html').write_text(''.join(body));print('DONE',out,flush=True)
