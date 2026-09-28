"""Deterministic finish maps and exact name typography. No concept-image pixels."""
from pathlib import Path
import json, random, hashlib
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT=Path(__file__).resolve().parents[2]/'web/public/textures/explorer-v2'
OUT.mkdir(parents=True,exist_ok=True)
fonts={'Spike':'/System/Library/Fonts/Supplemental/Arial Bold Italic.ttf',
       '毕航驰':'/System/Library/Fonts/STHeiti Medium.ttc'}
for text,filename in [('Spike','spike-wordmark.png'),('毕航驰','bihangchi-nameplate.png')]:
    im=Image.new('RGBA',(1024,256),(255,255,255,0));d=ImageDraw.Draw(im)
    f=ImageFont.truetype(fonts[text],210 if text=='Spike' else 205)
    box=d.textbbox((0,0),text,font=f);w,h=box[2]-box[0],box[3]-box[1]
    d.text(((1024-w)/2-box[0],(256-h)/2-box[1]),text,font=f,fill=(255,255,255,255))
    im.save(OUT/filename)
rng=random.Random(270927)
for name,center,variation,brushed in [('paint-roughness.png',238,5,False),('titanium-roughness.png',238,3,True),('seat-roughness.png',236,9,False)]:
    im=Image.new('L',(512,512));p=im.load()
    lines=[rng.randint(-variation,variation) for _ in range(512)]
    for y in range(512):
        for x in range(512):p[x,y]=max(0,min(255,center+(lines[y] if brushed else rng.randint(-variation,variation))))
    if not brushed:im=im.filter(ImageFilter.GaussianBlur(.65))
    im.convert('RGB').save(OUT/name)
(OUT/'manifest.json').write_text(json.dumps({'text':['Spike','毕航驰'],'source':'blender/explorer/textures-v2.py','font_files':fonts,'files':[{'name':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'size':Image.open(p).size} for p in OUT.glob('*.png')]},ensure_ascii=False,indent=2))
print(OUT)
