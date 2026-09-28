> 最新 v2 实施与重建见 [README-v2.md](README-v2.md)。以下为首轮 v1 历史记录。

# 五世界精修候选源（2026-09-26）

当前状态是进行中：字节首轮重建已接入主站；开源、大工、现代为独立结构候选，仅在开发查看器出现。四颗都没有通过实际浏览器视觉验收。崇振 v3.2 原样保留。

## 重建
从工程根目录运行，依赖复用 web/ 与 交付物/ 已安装的软件包，不安装全局工具：

```sh
python3 blender/five-worlds/textures.py
node blender/five-worlds/export.mjs bytedance
node blender/five-worlds/export.mjs opensource
node blender/five-worlds/export.mjs university
node blender/five-worlds/export.mjs hyundai
node blender/five-worlds/audit-assets.mjs
```

导出命令串行运行，临时编译文件在 finally 中删除。GLB 按材质合批，保留 UV/法线/顶点色、材质分区和独立动态组；只使用 KHR_mesh_quantization，不依赖在线解码器。静态网格合批后，穿梭舱、转塔、消息舱、升降机、机械臂、车辆、篮球仍独立。

模型输出为 public/models/worlds/*-refined-v1.glb 和 *-low.glb；早期同名世界 GLB 均不覆盖。每个模型附同名前缀 JSON，记录资源尺寸、三角面、网格数、包围盒和构件清单。它们是资产指标，不等于浏览器实际 draw calls / 帧率。

本次交付是参数源与重建命令，没有 .blend 文件，不宣称完成 Blender 工程。

## 实现依据
- 字节：原 v5 总体与 2026-09-26 批准的 v1 四格板，后三工区按现有五个真实项目与 v5 图实现，无新增项目。
- 开源、大工、现代：仍以任务书指定的已确认原图为范围。目前是结构准备候选，未完成新一轮局部美术确认与全部细节收敛，不作为整轮精修交付。
- geometry.mjs：按实际构件尺寸倒角；闭合截面轨梁、圆弧墙、材质合批及 UV 保留。
- organic.mjs：沿弧长变化的截面、根干与叶棚；短分枝自适应分段。
- implicit-terrain.mjs：有符号距离体积与 marching tetrahedra 提取，真正开凿房间及道路孔道，避免拉伸旧球体三角面制造缺口。自然表面和局部接合仍需视觉精调。
- 字节轨道来自 web/src/universe/worlds/hubMotion.ts；现代道路从现有 motor.ts 的 motorRoad 读取。没有改变履历与项目 slug。
- textures.py 生成可平铺的 512px 法线与粗糙度微结构，没有生成图片冒充房间内部。ByteDance 标志从已留档官网的 header 原始 PNG 提取，有 JSON 来源与哈希。

## 本地检查入口
在 web/ 启动 npm run dev 后：
- `http://127.0.0.1:5173/?refinement-review=1`：固定机位、旧/候选、五方向、项目近景、精细/轻量、动态暂停、截图及采样面板。
- `http://127.0.0.1:5173/__refinement-review/`：进度、历史基线与证据。
- `http://127.0.0.1:5173/?world=bytedance`：主站世界入口。

当前执行环境拒绝监听 5173，并无法启动 Chromium；入口代码已经创建，但尚未运行验证。不能根据这些地址的存在声称页面已经可用。

## 离线结构预览

```sh
node blender/five-worlds/structural-preview.mjs bytedance overview
node blender/five-worlds/structural-preview.mjs bytedance story-1 --detailed
```

脚本输出 1000×900 RGBA 原始帧。它是 CPU 深度缓冲的构造检查，省略玻璃、真实 PBR、阴影、官方标志、气罩和迷雾等运行时内容。图片必须标注“CPU STRUCTURE CHECK / NOT BROWSER RENDER”。不能替代网页截图、性能报告或用户验收。
