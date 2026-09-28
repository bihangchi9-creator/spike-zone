# 五世界精修 v2：可重建模型与本地接入

2026-09-26：字节、开源、大工、现代的 v2 高/低档已接入本地主站与集中查看器。崇振 v3.2 保留。**当前为精修待网页复检，未达到整轮视觉验收完成状态。** 原 GLB、v1 模型和启动快照保留；不提交、不推送、不部署。

## 重建

在工程根目录执行，复用 `web/` 和 `交付物/` 已安装依赖。导出共享临时文件，以下命令串行运行：

```sh
python3 blender/five-worlds/textures-v2.py
node blender/five-worlds/export-v2.mjs bytedance
node blender/five-worlds/export-v2.mjs opensource
node blender/five-worlds/export-v2.mjs university
node blender/five-worlds/export-v2.mjs hyundai
node blender/five-worlds/audit-assets-v2.mjs
node blender/five-worlds/audit-hub-clearance.mjs
node blender/five-worlds/audit-motor-clearance-v2.mjs
node blender/five-worlds/audit-motor-clearance-v2.mjs --high
python3 blender/five-worlds/render-review-v2.py
```

前端检查在 `web/` 执行：`npm run typecheck`、`npm run lint`、`npm run test`、`npm run build`。本轮有 38 项测试，不能沿用早期 CLAUDE 的 No tests 描述。

本次交付参数化三维源与重建命令，**没有 .blend 文件**。GLB 使用已有 KHR_mesh_quantization；不需要下载在线解码器。按材质合批，动态组单独保留，UV、法线及顶点色保留。高档近景加载、远景/轻量使用低档；局部功能灯仅近处开启。资产图元数不等于浏览器绘制调用数。

## 同源几何与运行

- `hubMotionV2.ts` 同时提供字节轨道、穿梭舱朝向与运动；字节五项目 slug 不变。仓库官方 ByteDance 头图留有来源与哈希。
- `treeMotionV2.ts` 提供开源升降机、两消息舱路径；主根干为连续等值面，细根为贴气罩内底的解析圆厚曲面；独立连通检查保留。
- `campusSurfaceV2.ts` 为大工弧形围护及刚性显示屏提供统一定位。建筑弯曲，桌椅/设备保持刚性；无学生模型，真实三段经历不变。
- `motorMotionV2.ts` 提供现代道路、工厂/座舱局部缩放和平移/旋转、车体抬升。导出、车辆、标牌/Logo、音乐屏、跟车相机及故事机位同源。车体净空包括后视镜与下缘，高/低档分别检查。
- `modelRevisions.ts` 统一主站版本与现代故事锚点；DEV 查询参数 `world-version=original` / `world-version=v1` 回看其余三颗原版/首轮版本，默认 v2。字节首轮回看用 `hub-version=v1`。
- 玻璃仅用有限厚度线索与实际三维室内，未用生成图替代房间。材质克隆由各实例释放，共享 GLB 几何与贴图原件留给加载缓存；色彩图按 sRGB，法线/粗糙度按非颜色数据。

## 证据与边界

集中入口为 `交付物/五世界精修总计划-20260924/实施记录-20260926/index.html`。实际网页查看器为 `/?refinement-review=1`，证据页路由 `/__refinement-review/`。在 2026-09-26T13:59:33.261Z 浏览器工具拒绝本地访问后未绕过；后续 v2 图片均标注为 CPU 结构检查，省略玻璃/材质贴图/阴影/标志/迷雾，不能替代网页截图或网页交互/性能验收。

完整完成与剩余清单、资源/导航验证、独立保护审计在实施记录目录。实际浏览器的透明排序、灯光色彩、旋转缩放、项目阅读/返回、中英、减少动态、低视口、五世界同屏性能尚待相应访问条件恢复。不会用静态导出或测试通过宣布用户验收完成。
