# Spike 个人深空探索艇

本项目原创程序化模型，无外部下载模型或纹理。设计采用深蓝灰压力主舱、暖陶瓷上壳、紧凑双侧推进器、侧置测绘探头。唯一个人识别图案是源自首页格纹帽子的四乘四格纹板，位于背部右肩。

可编辑源：../../web/src/universe/vesselModel.ts（截面、设备位置、材质和合批规则）。
导出：在仓库根目录运行 `node blender/explorer/export.mjs`。
网页资产：../../web/public/models/explorer/spike-explorer.glb（93660 字节，7 个材质组，无纹理依赖）。
GLB 可以导入 Blender 继续编辑；本轮未使用 Blender，源文件为可重建的参数化 TypeScript。

坐标：船首 -Z，右舷 +X，上方 +Y；发动机喷口约为 X=±0.88、Y=-0.02、Z=1.94。网页尾焰独立绘制；推进器亮度由航速驱动。主体几何按材质合批，7 组，避免每个螺钉单独绘制。

本地开发展示：/?vessel=side、front、rear、pilot，可检查侧面、前侧、后侧、驾驶方向；正常网站不展示这些开发工具。
