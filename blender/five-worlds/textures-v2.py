"""Local deterministic PBR worktop with board variation and nonuniform longitudinal grain."""
from pathlib import Path
import numpy as np
from PIL import Image
out=Path(__file__).resolve().parents[2]/'web/public/textures/worlds-refined-v2';out.mkdir(parents=True,exist_ok=True)
n=1024;y,x=np.mgrid[:n,:n]/n;rng=np.random.default_rng(923)
warp=y+.009*np.sin(2*np.pi*x)+.004*np.sin(6*np.pi*x+2*np.sin(2*np.pi*y))
grain=np.sin(warp*2*np.pi*45+.8*np.sin(4*np.pi*x))*.5+.5
fine=np.sin(warp*2*np.pi*172)*.5+.5
pores=np.clip((grain-.86)*7,0,1)*(.6+.4*np.sin(x*2*np.pi*3)**2)
board=.015*np.floor(y*4)+.04*np.sin(y*2*np.pi*2)
v=.84+.12*grain+.035*fine-.07*pores+board+rng.normal(0,.006,(n,n))
color=np.stack([v*.81,v*.65,v*.45],axis=2)
Image.fromarray(np.uint8(np.clip(color,0,1)*255)).save(out/'oak-color.jpg',quality=94)
rough=np.clip(.67+.1*pores+.03*(1-grain),0,1)
Image.fromarray(np.uint8(rough*255)).save(out/'oak-rough.jpg',quality=91)
h=.01*grain-.013*pores;dx=(np.roll(h,-1,1)-np.roll(h,1,1))*8;dy=(np.roll(h,-1,0)-np.roll(h,1,0))*8
v=np.stack([-dx,-dy,np.ones_like(dx)],axis=2);v/=np.linalg.norm(v,axis=2)[:,:,None]
Image.fromarray(np.uint8((v*.5+.5)*255)).save(out/'oak-normal.png')
print(sum(p.stat().st_size for p in out.iterdir()))
