"""Deterministic original material maps and illustrative workshop props. No reference image pixels used."""
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFilter
root=Path(__file__).resolve().parents[2]/'web/public/textures/harbor-v1'
root.mkdir(parents=True,exist_ok=True)
rng=np.random.default_rng(220922)
n=512;y,x=np.mgrid[0:n,0:n];noise=rng.normal(0,1,(n,n))
for name in ['plaster','stone','wood','slate','metal']:
 coarse=np.asarray(Image.fromarray(np.uint8(rng.random((32,32))*255)).resize((n,n),Image.Resampling.BICUBIC))/255-.5
 if name=='wood':
  grain=np.sin(x*.12+np.sin(y*.012)*2+np.sin(y*.031)*.8)*.5+np.sin(x*.49+np.sin(y*.015)*3)*.16
  val=234+grain*8+coarse*5+noise*1.3;rough=176+grain*12;height=grain*.5+coarse*.2
 elif name=='stone':
  row=y//128;seam=((x+row*91)%256<3)|(y%128<3);val=232+coarse*12+noise*1.8-seam*23;rough=214+coarse*15;height=coarse*.25-seam*.6
 elif name=='plaster':
  row=y//128;seam=((x+row*128)%256<2)|(y%128<2);val=242+coarse*8+noise*1.3-seam*12;rough=222+coarse*12;height=coarse*.3-seam*.35
 elif name=='slate':val=234+coarse*9+noise*1.8;rough=153+coarse*25;height=coarse*.2+noise*.04
 else:val=245+coarse*4+noise*.6;rough=142+coarse*18;height=coarse*.07+noise*.013
 rgb=np.repeat(np.clip(val,0,255)[...,None],3,axis=2).astype('uint8');Image.fromarray(rgb).save(root/f'{name}-color.jpg',quality=90)
 Image.fromarray(np.uint8(np.clip(rough+np.zeros_like(x),0,255))).save(root/f'{name}-rough.jpg',quality=88)
 dy,dx=np.gradient(height);v=np.stack([-dx*.5,-dy*.5,np.ones_like(dx)],axis=-1);v/=np.linalg.norm(v,axis=-1,keepdims=True);Image.fromarray(np.uint8((v*.5+.5)*255)).save(root/f'{name}-normal.png')
# Decorative drawings and paintings, intentionally not labelled as real project outputs.
for i in range(6):
 im=Image.new('RGB',(384,480),'#e2cea6');d=ImageDraw.Draw(im)
 if i<3:
  d.rectangle((18,18,366,462),outline='#b79b6e',width=2)
  for ox in [0,2]:
   c='#7f7056';d.line([(70+ox,340),(300+ox,340),(267,378),(106,378),(70+ox,340)],fill=c,width=2)
   d.line([(195,85),(195,342),(92,322),(195,100),(290,315),(198,323)],fill=c,width=2)
   for j in range(4):d.line((195,110+j*55,106+j*18,320),fill='#a48b65',width=1)
  for j in range(6):d.line((36,411+j*5,150+(j%3)*37,411+j*5),fill='#bca780',width=1)
  d.line((46,55,46,392),fill='#baa785',width=1);d.line((35,390,334,390),fill='#baa785',width=1)
 else:
  d.rectangle((0,0,384,480),fill=['#86aaba','#d3aa79','#89a6a2'][i-3]);d.ellipse((274,50,323,99),fill='#f0d5a2')
  d.polygon([(0,310),(80,192),(132,251),(211,106),(290,261),(331,211),(384,300),(384,480),(0,480)],fill='#596e72')
  d.polygon([(136,320),(211,106),(231,281),(287,335)],fill='#bd9870');d.polygon([(211,106),(224,195),(200,178)],fill='#ece0bc')
  d.rectangle((0,341,384,480),fill='#456f7a')
  for j in range(20):
   xx=int(rng.integers(0,360));yy=int(rng.integers(352,471));d.line((xx,yy,min(384,xx+int(rng.integers(12,85))),yy),fill='#799592',width=2)
 im.save(root/f'art-{i}.jpg',quality=91)
# Bounded pool surface: fine waves and a restrained caustic network.
a=(np.sin(x*.065+np.sin(y*.03)*1.5)+np.sin(y*.057+np.cos(x*.025)*2))
lines=np.exp(-np.abs(a)*12);b=coarse*.5
c=np.zeros((n,n,3));c[:,:,0]=30+lines*30+b*7;c[:,:,1]=122+lines*48+b*11;c[:,:,2]=132+lines*43+b*14
Image.fromarray(np.uint8(np.clip(c,0,255))).save(root/'pool-color.jpg',quality=94)
print('Created',len(list(root.iterdir())),'material and prop maps')
