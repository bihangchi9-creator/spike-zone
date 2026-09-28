"""Deterministic, seamless surface microstructure; no photographic/AI room impostors."""
from pathlib import Path
import numpy as np
from PIL import Image
out=Path(__file__).resolve().parents[2]/'web/public/textures/worlds-refined-v1'
out.mkdir(parents=True,exist_ok=True)
n=512; rng=np.random.default_rng(260926);y,x=np.mgrid[0:n,0:n]/n
noise=rng.normal(0,1,(n,n)); smooth=(noise+np.roll(noise,1,0)+np.roll(noise,1,1))/3
surfaces={
 'coating':(.58+.035*smooth,.014*smooth),
 'aluminum':(.49+.055*np.sin(y*np.pi*2*180)+.025*smooth,.006*np.sin(y*np.pi*2*180)),
 'mineral':(.89+.04*smooth,.023*smooth+.01*np.sin(x*2*np.pi*17)*np.sin(y*2*np.pi*13)),
 'wood':(.71+.06*np.sin(y*2*np.pi*26+1.2*np.sin(x*2*np.pi*2)),.037*np.sin(y*2*np.pi*26+1.2*np.sin(x*2*np.pi*2)))
}
for name,(rough,h) in surfaces.items():
 Image.fromarray(np.uint8(np.clip(rough,0,1)*255),'L').save(out/f'{name}-rough.jpg',quality=91)
 dx=np.roll(h,-1,1)-np.roll(h,1,1);dy=np.roll(h,-1,0)-np.roll(h,1,0)
 v=np.stack([-dx,-dy,np.ones_like(dx)],axis=2);v/=np.linalg.norm(v,axis=2)[:,:,None]
 Image.fromarray(np.uint8((v*.5+.5)*255),'RGB').save(out/f'{name}-normal.png')
print('8 tileable 512px maps:',sum(p.stat().st_size for p in out.iterdir()),'bytes')
