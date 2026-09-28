# Spike／毕航驰主飞船 v2

可复建参数化曲面源，不是 Blender `.blend`。概念定稿、批准记录、旧版快照与每轮网页反馈在 `交付物/主飞船-Spike航驰-v2-20260927/`。五世界及崇振 P0 不属于本目录的改造范围。

在工程根目录运行：

```sh
python3 blender/explorer/textures-v2.py
node blender/explorer/export-v2.mjs
node blender/explorer/audit-v2.mjs
```

Python 使用 Pillow 与 macOS 系统字体进行准确文字排版；不使用概念图中文字或图像裁片。Three.js/TypeScript 来自 `web/node_modules`；glTF Transform/validator 使用已安装的 `交付物/node_modules`。几何基础函数只读复用 `blender/five-worlds/geometry-v2.mjs`。

源与接口：

- `model-v2.mjs`：连续船体与蓝色肩部、真实留空、座舱内部、喷口、多面字标。按材质合批，保留独立引擎节点和空对象。
- `textures-v2.py`：确定性粗糙度图、Spike 与毕航驰透明 PNG。图像嵌入 GLB，运行时不依赖系统字体。
- `web/src/universe/vesselDesignV2.ts`：坐标/尺度/喷口/碰撞及推进阻尼的共享契约。船首 -Z、上方 +Y，喷口朝 +Z。
- `export-v2.mjs`：高低档独立导出，生成 SHA、面数、材质/节点与纹理清单。每次导出覆盖当前候选资源前，先在交付目录保存版本快照。
- `Vessel.tsx`：按画质加载两档 GLB；Map 复用本实例材质克隆；不释放 loader 缓存的共享几何/纹理。

真实双喷口节点为 `exhaust_port` 和 `exhaust_starboard`，推进光材质为 `engine_core_0`、`engine_core_1`。尾焰读取实际导出锚点，不使用硬编码的旧船尾坐标。

碰撞包络与导航净空都应大于每档模型缩放后的包围半径。导航净空比碰撞推开半径小 0.05，允许接触后向外脱离；专项测试用真实 contact 返回点验证该边界，仍阻止穿越世界。

验证在 `web/`。首次克隆先运行 `npm ci`；测试所需的 glTF Transform 和 sharp 已声明为开发依赖，不依赖被 Git 忽略的 `交付物/` 工具包。上面的重新导出命令仍需要单独准备该本地工具包、Pillow 和 macOS 字体；运行网站或验证已提交的 GLB 无须重新导出。

```sh
node --test tests/vessel.test.mjs
npm run test
npm run typecheck
npx eslint src/universe/Vessel.tsx src/universe/Flight.tsx src/universe/flightMath.ts src/universe/vesselDesignV2.ts src/qa/VesselShowcase.tsx
npm run build
```

验船入口 `http://127.0.0.1:5173/?vessel=rear` 只在 DEV 开启。它复现现有主站灯组和高低档后处理供近看；主站 FOV、入场渐显、五世界同屏、近世界驾驶与小视口仍必须由设计任务在真实浏览器检查。CPU 结构预览与静态资产报告不能替代这些结果。

候选 c3 的主形控制分为 `hull-surfaces-v2.mjs`（共用纵向截面、舱罩边界、蓝肩/侧腹/底壳）和 `model-v2.mjs`（连接、内部、后罩与细节）。船体皮肤使用共用纵向采样点，推进罩使用同一个圆角多边形，不通过相互穿插的外壳填缝。精细/轻量档共享轮廓，仅改变采样预算。

铭牌空对象 `nameplate_port` / `nameplate_starboard` 保存实际刚性变换。查看器的左右铭牌机位读取该对象及法线；文字/底板共用同一变换，专项测试检查净距和镜头遮挡。另检查舱罩在座椅上方的实际射线净空。CPU 预览会跳过透明玻璃，且不会贴字标 PNG，不能据其白色矩形/裸露座椅判断最终材质。

候选 c4 只修局部连接与中文 V 方向：肩面与上推进罩使用同一网格，Hermite 桥两端匹配实际纵向导数；舱沿尾端导数连续，关键截面纳入两档共用采样并去除近似重复 Z。`inspect-vessel-joins.mjs` 从实际解码 GLB 检查连接位置、法线分裂、局部回落及相邻面方向；另解码真实内嵌 PNG，将“毕”上部的比、下部的十的实像素投影到铭牌镜头检查上下阅读。图像解码使用 `web/` 开发依赖中的 sharp。
