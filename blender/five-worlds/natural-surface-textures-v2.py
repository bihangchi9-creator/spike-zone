"""Deterministic seamless rock microrelief and crossing water ripples; no masonry grid."""
from pathlib import Path
import numpy as np
from PIL import Image
import json,hashlib
out=Path(__file__).resolve().parents[2]/'web/public/textures/worlds-refined-v2';out.mkdir(exist_ok=True)
n=512;y,x=np.mgrid[:n,:n]/n;rng=np.random.default_rng(927)
def field(bands):
 v=np.zeros((n,n))
 for freq,amp,count in bands:
  for _ in range(count):
   a,b=rng.integers(-freq,freq+1,2)
   if a==b==0:a=1
   v+=amp/count*np.sin(2*np.pi*(a*x+b*y)+rng.uniform(0,2*np.pi))
 return v
coarse=field([(3,1,10),(7,.45,15),(17,.21,18),(41,.085,20)])
warp=.018*np.sin(2*np.pi*(3*x+2*y))+.01*np.sin(2*np.pi*(-x+4*y))
# Interlocking irregular ridges, with no axis-aligned seams or laid stone blocks.
rock=coarse+.12*np.sin(2*np.pi*(7*x+3*y+warp*5))
rock-=rock.mean();rock/=rock.std()
water=np.zeros_like(x)
for a,b,amp,phase in [(7,2,.008,.2),(3,-8,.005,2),(12,5,.0024,.7),(-5,15,.0015,1.3),(21,-4,.001,3)]:
 water+=amp*np.sin(2*np.pi*(a*x+b*y+warp)+phase)
def normal(h,name):
 dx=(np.roll(h,-1,1)-np.roll(h,1,1))*n*.5;dy=(np.roll(h,-1,0)-np.roll(h,1,0))*n*.5
 v=np.stack([-dx,-dy,np.ones_like(dx)],axis=2);v/=np.linalg.norm(v,axis=2)[:,:,None]
 Image.fromarray(np.uint8(np.clip(v*.5+.5,0,1)*255)).save(out/name)
normal(rock*.007,'natural-rock-normal-v1.png')
Image.fromarray(np.uint8(np.clip(.82+rock*.035,.72,.93)*255)).save(out/'natural-rock-rough-v1.jpg',quality=94)
normal(water,'natural-water-normal-v1.png')
Image.fromarray(np.uint8(np.clip(.68+water*4,.57,.79)*255)).save(out/'natural-water-rough-v1.jpg',quality=94)
files=[p for p in out.glob('natural-*-v1.*')]
(out/'natural-surfaces-v1.json').write_text(json.dumps({'source':'blender/five-worlds/natural-surface-textures-v2.py','resolution':[n,n],'normalConvention':'tangent-space +Z; linear texture; no color-space conversion','files':[{'name':p.name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]},indent=2))
print('Generated',len(files),'maps;',sum(p.stat().st_size for p in files),'bytes')
