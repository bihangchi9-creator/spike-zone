from pathlib import Path
import json,hashlib,datetime,shutil,struct,html,subprocess
from PIL import Image
root=Path(__file__).resolve().parents[2];base=root/'交付物/五世界精修总计划-20260924/实施记录-20260926';total=base.parent
out=Path((base/'latest-offline-review.txt').read_text());manifest=json.loads((out/'manifest.json').read_text());stamp=datetime.datetime.now().strftime('%Y%m%d-%H%M%S');checkpoint=base/('v2-checkpoint-'+stamp);checkpoint.mkdir()
names={'bytedance':'字节','opensource':'开源','university':'大工','hyundai':'现代'}
concepts={'bytedance':'交付物/字节立体枢纽城-v5-20260920/字节立体枢纽城-v5-待确认.png','opensource':'交付物/开源能力树城-v3-20260920/开源能力树城-底部生根-v3-待确认.png','university':'交付物/大工校园叙事星球-v6-20260920/大工校园叙事星球-v6-待确认.png','hyundai':'交付物/现代星球-用户选定-20260920/现代星球-用户选定.png'}
for world in names:
 d=checkpoint/world;d.mkdir()
 for suffix in ['.glb','-low.glb','.json']:shutil.copy2(root/f'web/public/models/worlds/{world}-refined-v2{suffix}',d/f'{world}-refined-v2{suffix}')
 shutil.copy2(root/concepts[world],d/'已确认总体图.png')
 (d/'资料说明.md').write_text(f'# {names[world]} v2 本地检查点\n\n总体图来自 `{concepts[world]}`，用户已确认；原文件名的“待确认”不是当前状态。新截图为实际 GLB 的 CPU 结构图，不是生成概念图或网页验收。\n\n模型源见检查点 source/blender/five-worlds/；前端同源定位与接入见 source/web/src/universe/worlds/。重建方式见 source/blender/five-worlds/README-v2.md。未新增个人经历或项目。\n\n差异、自检与缺项见上级的 当前完成与剩余-v2.md；检查点不包含 .blend。\n')
for f in (total/'字节细节参考-v1').iterdir():
 if f.is_file():shutil.copy2(f,checkpoint/'bytedance'/f.name)
sourceFiles=list((root/'blender/five-worlds').glob('*'))+list((root/'web/src/universe/worlds').glob('*'))+list((root/'web/tests').glob('*'))+[root/'web/src/universe/worldConfig.ts']
for f in sourceFiles:
 if f.is_file():dest=checkpoint/'source'/f.relative_to(root);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(f,dest)
for directory in ['web/public/textures/worlds-refined-v1','web/public/textures/worlds-refined-v2']:
 shutil.copytree(root/directory,checkpoint/'source'/directory)
# Compare protected current files against both startup hashes and actual snapshot bytes.
before={r['path']:r for r in json.loads((base/'manifest-before.json').read_text())};protected=json.loads((base/'protected-file-audit.json').read_text());audit=[]
for item in protected:
 rel=item['path'];raw=(root/rel).read_bytes();audit.append({'path':rel,'sha256':hashlib.sha256(raw).hexdigest(),'matchesStartupHash':hashlib.sha256(raw).hexdigest()==before[rel]['sha256'],'matchesSnapshotBytes':raw==(base/'source-before'/rel).read_bytes()})
(base/'protected-file-audit-v2.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2));assert all(r['matchesStartupHash'] and r['matchesSnapshotBytes'] for r in audit)
assetAudit=json.loads((base/'asset-audit-v2.json').read_text());rows=[];materials=[]
for a in assetAudit:
 p=root/'web/public/models/worlds'/a['filename'];raw=p.read_bytes();assert hashlib.sha256(raw).hexdigest()==a['sha256'];doc=json.loads(raw[20:20+struct.unpack_from('<I',raw,12)[0]]);counts={}
 for mesh in doc['meshes']:
  for prim in mesh['primitives']:
   name=doc['materials'][prim['material']]['name'];count=doc['accessors'][prim['indices']]['count']//3;counts[name]=counts.get(name,0)+count
 materials.append({'world':a['world'],'quality':a['quality'],'sha256':a['sha256'],'byMaterial':counts})
 rows.append(f"| {names[a['world']]} | {'精细' if a['quality']=='detailed' else '轻量'} | {a['bytes']/1e6:.2f} MB | {a['triangles']:,} | {a['assetPrimitiveCount']} | {a['navigation']['modelRadiusAtCurrentScale']:.3f} / {a['navigation']['worldRadius']} |")
(base/'material-budget-v2.json').write_text(json.dumps(materials,ensure_ascii=False,indent=2))
textures=[]
for d in ['worlds-refined-v1','worlds-refined-v2']:
 for p in (root/'web/public/textures'/d).iterdir():
  if p.suffix in ['.jpg','.png']:
   im=Image.open(p);textures.append({'path':str(p.relative_to(root)),'size':im.size,'bytes':p.stat().st_size})
(base/'texture-inventory-v2.json').write_text(json.dumps(textures,ensure_ascii=False,indent=2))
for label in ['tests','lint','build']:
 shutil.copy2(Path('/tmp')/f'five-worlds-{label}.log',base/f'checks-v2-{label}.log')
for label in ['asset-audit-v2','motor-clearance-low','motor-clearance-high']:
 shutil.copy2(Path('/tmp')/f'{label}.log',base/f'{label}.log')
checkrows='''| 当前源/资产保护 | 通过 | protected-file-audit-v2.json；73 项与启动快照相同 |
| 四颗高低档资源合法性 | 通过 | asset-audit-v2.json；8 个 GLB 均 0 错误、0 警告、完整 UV/法线 |
| 真实项目对应关系 | 文件检查通过 | 现有世界归属测试、catalog/works；未改变 slug 或履历 |
| 字节两轨道与舱体 | 离线通过 | byte-v2-clearance.json；各 360 采样，0 非预期静态命中 |
| 开源主根干与桥 | 离线通过 | opensource-refined-v2.json 的连通与六桥检查；气罩边界测试 |
| 大工三段经历可读 | 离线结构已复查 | 实验室/剧场/篮球场均有最新故事镜头；球场地形和植被遮挡已修 |
| 现代道路车体 | 离线通过 | motor-v2-clearance-light/detailed.json；含后视镜/下缘，每档 720 采样零命中 |
| 世界导航范围 | 通过 | 八档实际导出顶点检查，保持原尺度和导航半径 |
| 新旧同机位比较 | 离线图已保存，网页受限 | 相机/FOV/光照/档位相同的 v1→v2 CPU 对照；不能代替网页前后图 |
| 正侧背底与叙事近景 | 离线图已保存，网页受限 | 本次 47 张图及 manifest，明确不含透明/贴图/阴影/运行时标识 |
| 材质与透明排序 | 文件结构通过、视觉待验 | 真实室内、有限玻璃及独立反光响应；网页效果未验 |
| 旋转/缩放/进入项目/返回 | 待网页复检 | 集成分支与节点保留，不把源码检查当交互验收 |
| 中英/减少动态/阅读暂停/画质切换 | 新版待网页复检 | 已有自动测试有效；新模型的实际全流程仍待验 |
| 崇振 v3.2 | 保留与已完成回归 | 独立保护审计、已有真实 48 秒起降/阅读/中英/档位回归 |
| 桌面与小视口 | 新版待网页复检 | 历史 Chromium 桌面与模拟小视口不算 v2 的新证据 |
| 控制台/资源请求 | 新版待网页复检 | 构建通过不代替浏览器无错误验证 |
| 类型/测试/代码检查/构建 | 通过，保留已知警告 | 38 项测试；lint 0 错误，已有 SocialIcons 警告；build 有体积提示 |
| 五世界同屏实际性能 | 未测 | 不提供推测帧率、调用数或“所有机器流畅”结论 |
| 用户整体验收 | 尚未开始 | 未将模型导出/自检通过当成用户认可；不进入新玩法 |'''
report=f'''# 当前完成与剩余 · v2 本地检查点

当前状态：四颗精修模型已在本地接入，结构与文件检查已留档；**五世界整轮尚未完成，等待网页复检及其后的观感收敛**。崇振 v3.2 保留。不提交、不推送、不部署。

## 实际完成的改动
- 字节：宽圆角工作厅、五个不同工区、真实室内与机械关节、背侧窗带/底座、同源双轨道及穿梭舱；官方标志留档保留。
- 开源：连续根干、圆厚回接根、球内承托、弧形工坊与连接廊、分层叶棚、真实工作家具；两条真实项目及既有升降/消息舱保持。
- 大工：三栋校园背景建筑、湖桥、银杏；嵌入弧形实验室/剧场、刚性设备、贯通阶梯；球场上方开挖并排除遮挡植物与岩台。没有学生或新增个人经历。
- 现代：宽化嵌入工厂、机械臂/车身细节、小座舱、可见海湾与桥台、道路挡土与隧道；车辆、跟车、标志、音乐屏和故事点同步新位置。
- 主站和查看器均加载 v2；三颗自然世界共用局部灯光，未改崇振或全局曝光。原版和 v1 资产保留，查看入口支持回看。

## 完成项与缺项
| 项目 | 状态 | 证据与边界 |
| --- | --- | --- |
{checkrows}

## 资源实测（文件级）
| 世界 | 档位 | GLB 大小 | 三角面 | 资产图元 | 外包半径 / 导航半径 |
| --- | --- | --- | --- | --- | --- |
{chr(10).join(rows)}

外包半径已乘现有世界尺度，另以 1 单位余量作静态导航检查；车辆另有运动包络报告。资产图元不是浏览器 draw calls。GLB 使用已支持的 KHR_mesh_quantization，无外部在线解码器；真实浏览器解码时间未测。运行时贴图大小见 texture-inventory-v2.json，材质面数细分见 material-budget-v2.json。

高档资源仍有网页加载预算压力，当前采用远/近景分档与材质合批。是否进一步压缩、简化及其画质损失，应在真实网页加载/旋转采样后判断；未宣称已达全设备性能目标。

## 仍需网页确认的品质问题
自然岩体、树根分枝和植被相对原图仍是风格化简化，不能凭离线底色图判为与确认图同等品质。玻璃透视、木石纹理尺度、暖窗/蓝白高光、迷雾遮挡、故事机位可读性和五世界合看需要真实渲染；若出现问题继续精修。当前没有新的核心设计待批准，也没有扩大玩法。

浏览器工具在 2026-09-26T13:59:33.261Z 明确报告用户拒绝本地访问。具体返回保存于 05-模型续接回执.md。此后未绕过、未通过其他进程或浏览器进入被拒地址；设计任务已提出相应访问确认。新的网页验收依赖该条件恢复。

## 归档与入口
- 本地集中页：index.html；网页可旋转入口为 `/?refinement-review=1`，证据页 `/__refinement-review/`。
- 最新离线图册：{out.name}/index.html；47 张图逐张绑定实际 GLB 哈希、机位与档位。
- 本次源/模型/已确认参考/字节原提示词快照：{checkpoint.name}/。
- 原始网页基线、首轮真实网页图、崇振真实回归均在总计划目录保留；未拿 CPU 图冒充其新版网页对照。
- 可重建参数源：blender/five-worlds/README-v2.md；没有 .blend 文件。

本批已知的独立结构修正、导出、资源/导航检查和工程检查已处理；后续先恢复真实网页复检，再依据可见问题修正。此暂停不表示整轮目标达成。
'''
(base/'当前完成与剩余-v2.md').write_text(report)
# A readable local album. CPU images and web history are explicitly separate.
css='body{margin:0;background:#0d1726;color:#e6edf5;font:15px/1.7 system-ui}main{max-width:1180px;margin:auto;padding:42px 24px}h1{font-weight:500}h2{margin-top:48px;font-size:23px}p,small{color:#afbed0}a{color:#a9d5ff}nav{display:flex;gap:20px;flex-wrap:wrap}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px}figure{margin:0}img{width:100%;height:auto;background:#132034}figcaption{font-size:13px;color:#aebfd0;margin:8px 0 20px}.note{padding:18px;border-left:2px solid #cca572;background:#ffffff06}table{width:100%;border-collapse:collapse}td,th{text-align:left;padding:10px;border-bottom:1px solid #ffffff18}details{margin:20px 0}summary{cursor:pointer}button{font:inherit}.tag{font-size:12px;color:#dec7a4}'
parts=[f'<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>四世界 v2 · 离线结构对照</title><style>{css}</style><main><p class="tag">本地检查点 · 尚待网页复检</p><h1>结构对照与近景记录</h1><p class="note">这里展示实际 GLB 的 CPU 光栅图，不是网页截图。玻璃、贴图、阴影、星空、官方标识与迷雾未参与本次绘制。前后图同机位、同分辨率与同档位；不能据此评判最终电影感或交互性能。</p><nav>']
parts += [f'<a href="#{w}">{name}</a>' for w,name in names.items()];parts+=['<a href="../当前完成与剩余-v2.md">完整检查与缺项</a></nav>']
for w,name in names.items():
 parts.append(f'<h2 id="{w}">{name}</h2><h3>同机位：首轮 v1 → 本轮 v2（均为 CPU 图）</h3>')
 for view in ['overview','back','under']:
  parts.append('<div class="grid">')
  for folder,version,label in [('before','v1','首轮'),('after','v2','本轮')]:parts.append(f'<figure><a href="{folder}/{w}-{view}-{version}-high-cpu.png"><img loading="lazy" src="{folder}/{w}-{view}-{version}-high-cpu.png"></a><figcaption>{label} · {view} · 精细档 / CPU</figcaption></figure>')
  parts.append('</div>')
 parts.append('<details open><summary>侧面、正面与叙事近景</summary><div class="grid">')
 for f in manifest['frames']:
  if f['world']==w and f['image'].startswith('after/') and f['side'] not in ['overview','back','under']:parts.append(f'<figure><a href="{f["image"]}"><img loading="lazy" src="{f["image"]}"></a><figcaption>{html.escape(f["side"])} · 精细档 / CPU</figcaption></figure>')
 parts.append('</div></details>')
parts.append('<p><a href="manifest.json">相机、资产与图片哈希清单</a></p></main></html>');(out/'index.html').write_text(''.join(parts))
if (base/'index.html').exists():shutil.copy2(base/'index.html',checkpoint/'previous-progress-index.html')
intro=f'<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>五世界精修 · 本地进度</title><style>{css}</style><main><p class="tag">v2 本地已接入 · 整轮尚未完成</p><h1>五世界精修</h1><p>崇振 v3.2 保留；字节、开源、大工、现代已完成本批结构修改与接入。下一步是新版真实网页复检和观感收敛。</p><p class="note">浏览器工具明确拒绝了本地访问，当前等待恢复对应权限。没有绕过，也没有将离线图或测试通过当成用户验收。</p><nav><a href="http://127.0.0.1:5173/?refinement-review=1">可旋转查看器</a><a href="{out.name}/index.html">47 张离线结构对照</a><a href="当前完成与剩余-v2.md">完成与剩余清单</a></nav><h2>本地留档</h2><p>38 项测试通过；8 个 GLB 验证零错误与警告；73 项保护文件保持原字节。现代精细/轻量档各 720 个位置车体检查零命中。以上均有明确范围，不能代替网页视觉、交互与性能验收。</p><div class="grid">'
for w,name in names.items():intro+=f'<figure><a href="{out.name}/index.html#{w}"><img src="{out.name}/after/{w}-overview-v2-high-cpu.png"></a><figcaption>{name} · 本轮离线结构图，非网页验收</figcaption></figure>'
intro+=f'</div><p>重建源、旧版快照和已确认参考保留在 {checkpoint.name}；完整证据与限制见上方清单。未推送、部署或开启新玩法。</p></main></html>'; (base/'index.html').write_text(intro)
files=[]
for p in checkpoint.rglob('*'):
 if p.is_file():files.append({'path':str(p.relative_to(checkpoint)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(checkpoint/'manifest.json').write_text(json.dumps(files,ensure_ascii=False,indent=2));(base/'latest-v2-checkpoint.txt').write_text(str(checkpoint));print('checkpoint',checkpoint,'files',len(files),'protected',len(audit))
