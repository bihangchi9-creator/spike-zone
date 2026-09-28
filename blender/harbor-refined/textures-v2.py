"""Original, deterministic 1m-scale PBR surfaces and decorative studio drawings.
Run with Python 3 + numpy + Pillow. No concept-image pixels are copied.
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
root=Path(__file__).resolve().parents[2]/'web/public/textures/harbor-v2';root.mkdir(parents=True,exist_ok=True)
rng=np.random.default_rng(92202);n=1024;y,x=np.mgrid[:n,:n]
def field(k):
 return np.asarray(Image.fromarray(np.uint8(rng.random((k,k))*255)).resize((n,n),Image.Resampling.BICUBIC),dtype=float)/255-.5
coarse=field(24);broad=field(7);fine=field(170);noise=rng.normal(0,1,(n,n))
for name in ['plaster','stone','wood','slate','metal']:
 if name in ('plaster','stone'):
  rows=3 if name=='plaster' else 2;cell=n/rows;row=np.floor(y/cell);u=(x+row*n/4)%(n/2);v=y%cell
  distance=np.minimum(np.minimum(u,n/2-u),np.minimum(v,cell-v));edge=np.clip((distance-2)/7,0,1)
  tint=np.zeros((n,n));marks=np.zeros((n,n))
  for j in range(rows):
   for i in range(3):
    mask=(row==j)&(np.floor((x+row*n/4)/(n/2))==i);tint[mask]=rng.uniform(-13,8)
  val=232+tint+broad*11+coarse*8+fine*5+noise*.9-(1-edge)*29
  height=edge*.7+coarse*.025+fine*.015;rough=211+coarse*25+(1-edge)*19
  # Small mineral variation, not dirt. Sparse, low contrast.
  val+=np.clip(fine-.24,0,.3)*22
 elif name=='wood':
  warp=np.sin(x*.004)*7+np.sin(x*.013+1.2)*2.5
  grain=np.sin((y+warp)*.19)+np.sin((y+warp)*.059)*.6+np.sin((y+warp)*.83)*.18
  val=224+grain*8+coarse*7+broad*14+fine*2
  height=grain*.035+fine*.008;rough=171+grain*8+coarse*18
 elif name=='slate':
  val=225+broad*15+coarse*6+fine*4+noise*.8;height=fine*.014+coarse*.015;rough=150+broad*35+fine*18
 else:
  val=236+broad*7+fine*2;height=fine*.005;rough=131+broad*23+fine*15
 rgb=np.repeat(val[...,None],3,axis=2)
 if name=='wood':rgb*=np.array([1,.974,.936])
 Image.fromarray(np.uint8(np.clip(rgb,0,255))).save(root/f'{name}-color.jpg',quality=92)
 Image.fromarray(np.uint8(np.clip(rough+np.zeros_like(x),0,255))).save(root/f'{name}-rough.jpg',quality=90)
 dy,dx=np.gradient(height);normal=np.stack([-dx*13,-dy*13,np.ones_like(dx)],axis=-1);normal/=np.linalg.norm(normal,axis=-1,keepdims=True)
 Image.fromarray(np.uint8((normal*.5+.5)*255)).save(root/f'{name}-normal.png')
# Different, project-neutral engineering sketches and stylized landscapes.
for i in range(6):
 w,h=600,760;im=Image.new('RGB',(w,h),'#e9dabd');d=ImageDraw.Draw(im)
 if i<3:
  d.rectangle((22,22,w-22,h-22),outline='#b99b72',width=2)
  for yy in range(80,650,30):d.line((45,yy,555,yy),fill='#ddceb1')
  for xx in range(60,550,30):d.line((xx,55,xx,665),fill='#ddceb1')
  ink='#7b6950';secondary='#ad9572'
  if i==0:
   d.line([(110,510),(485,510),(445,570),(180,570),(110,510)],fill=ink,width=3)
   d.line([(310,120),(310,505),(148,490),(310,140),(463,480),(315,490)],fill=ink,width=3)
   for j in range(5):d.line((310,150+j*63,160+j*27,490),fill=secondary,width=2)
  elif i==1:
   verts=[(300,105),(150,290),(450,290),(116,440),(484,440),(300,580)]
   for a,b in [(0,1),(0,2),(0,4),(0,3),(1,2),(1,3),(2,4),(3,4),(3,5),(4,5),(1,5),(2,5)]:d.line([verts[a],verts[b]],fill=ink,width=3)
   for xx,yy in verts:d.ellipse((xx-4,yy-4,xx+4,yy+4),fill=ink)
  else:
   for j in range(3):
    a=240+j*95;d.line([(100,a+90),(290,a+10),(496,a+90),(296,a+175),(100,a+90)],fill=ink,width=3)
   for xx,yy in [(100,330),(290,250),(496,330),(296,415)]:d.line((xx,yy,xx,yy+190),fill=secondary,width=2)
   d.rectangle((259,165,331,258),outline=ink,width=3)
  for j in range(7):d.line((50,665+j*7,190+(j%3)*48,665+j*7),fill=secondary,width=2)
  d.line((510,105,510,600),fill=secondary,width=2);d.line((90,610,510,610),fill=secondary,width=2)
 else:
  d.rectangle((0,0,w,h),fill=['#88b5bc','#d3ae84','#83a4af'][i-3]);d.ellipse((434,95,486,147),fill='#f4dbac')
  d.polygon([(0,480),(112,300),(186,390),(325,160),(426,420),(522,328),(600,480),(600,760),(0,760)],fill='#4e6b77')
  d.polygon([(221,520),(325,160),(350,428),(457,544)],fill=['#b18859','#ba895e','#ab8563'][i-3]);d.polygon([(325,160),(339,268),(306,259)],fill='#ede0bf')
  d.rectangle((0,544,600,760),fill='#3e7583')
  for j in range(65):
   xx=int(rng.integers(0,580));yy=int(rng.integers(555,757));d.line((xx,yy,min(w,xx+int(rng.integers(15,90))),yy),fill='#9db8ad',width=2)
 im.save(root/f'art-{i}.jpg',quality=93)
# Water normal = low rounded overlapping ripples. Albedo remains deliberately quiet.
ripple=np.sin(x*.042+np.sin(y*.019)*1.6)+np.sin(y*.034+np.cos(x*.025))*.65
light=np.exp(-np.abs(ripple)*14);rgb=np.zeros((n,n,3));rgb[:,:,0]=54+light*10;rgb[:,:,1]=158+light*15;rgb[:,:,2]=170+light*14
Image.fromarray(np.uint8(rgb)).save(root/'pool-color.jpg',quality=91)
dy,dx=np.gradient(ripple);normal=np.stack([-dx*2.5,-dy*2.5,np.ones_like(dx)],axis=-1);normal/=np.linalg.norm(normal,axis=-1,keepdims=True)
Image.fromarray(np.uint8((normal*.5+.5)*255)).save(root/'pool-normal.png')
print('Created',len(list(root.iterdir())),'original material maps')
