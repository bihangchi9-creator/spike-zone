# 崇振创想港 · 可编辑建模源文件

当前本地版本：v2（2026-09-22），状态为 **崇振精细建模待用户验收**。

本目录名称沿用项目的 3D 源文件分区。本轮使用 Three.js 参数化建模，未使用 Blender，也没有交付 `.blend` 文件。可编辑源文件是 TypeScript 场景构造器；GLB 可导入 Blender 继续雕琢，但已按材质合并，不保留每把椅子的独立物体层级。

## 源文件与重建

- 几何：`web/src/universe/worlds/builders/harborRefinedV2.ts`，入口 `buildHarborRefinedV2(low)`。
- 材质图：本目录 `textures-v2.py`，Python 3、NumPy、Pillow，固定随机种子，可重复生成。
- 模型导出：本目录 `export-v2.mjs`，使用前端的 TypeScript、Three.js，以及本目录 `package.json` 声明的 glTF Transform 4.4.2。
- 网页材质与局部光：`web/src/universe/worlds/HarborRefined.tsx`。
- 共用布光：`web/src/universe/worlds/HarborLighting.tsx`，由模型验收页和实际第三人称查看页共同使用。

在仓库根目录安装及重建：

```sh
npm --prefix web install
npm --prefix blender/harbor-refined install
python3 -m venv /tmp/chongzhen-model-venv
/tmp/chongzhen-model-venv/bin/python -m pip install numpy Pillow
/tmp/chongzhen-model-venv/bin/python blender/harbor-refined/textures-v2.py
node blender/harbor-refined/export-v2.mjs
npm --prefix web test
npm --prefix web run build
npm --prefix web run dev
```

导出器优先使用本目录依赖；当前工作区也可复用本地 `交付物/node_modules` 中的同版本建模工具。执行重建会覆盖 **v2** 生成文件；v1 源文件、GLB 和贴图保留。

## 输出及网页组合

模型输出到 `web/public/models/worlds/chongzhen-refined-v2{,-low}.glb`；元数据在同目录 JSON。23 张原创程序材质图输出到 `web/public/textures/harbor-v2/`。参考图只用于造型参考，没有复制参考图片像素、下载第三方成品模型或替换用户真实项目内容。

GLB 包含实几何、UV、法线、顶点色和命名材质；网页按材质名绑定 PBR 贴图、玻璃、水面和已有环境图。仅在独立 GLB 查看器里打开，外观不等于网站最终渲染。导入 Blender 后需要重新连接外部贴图和设置光照。中文招牌由既有 `WorldSigns.tsx` 在网页生成。

顶层分组为建筑道具、两只港池小艇、右侧灵感艇。船只保持静态；本轮没有船航线、第一人称或步行系统。单位约为米，网站飞行场景使用原有 3.8 倍缩放。模型半径约 12.1611，飞行避让半径据此调整为 48。

导出会保留六个不同插画材质名；不可用普通无名称保护的材质去重，否则运行时图稿会错误合并。量化保留平铺 UV，不需要外部解压服务。

## 本地验收入口

- `http://127.0.0.1:5173/?harbor-review=1`：11 个固定机位、v1/v2 切换、精细/轻量切换、拖动旋转、缩放。
- `http://127.0.0.1:5173/?world=chongzhen`：实际第三人称查看组件及项目入口。
- `http://127.0.0.1:5173/__harbor-review/`：本机留档的同机位对比图册。图册位于被 Git 忽略的 `交付物/崇振精细建模-v2-20260922/`，只在开发服务器可用。

## 资源与限制

| 资源 | 精细 | 轻量 |
| --- | ---: | ---: |
| GLB 字节 | 11,759,888 | 5,362,572 |
| 三角面 | 428,805 | 139,821 |
| 合批后网格 | 55 | 55 |

两档共用 23 张纹理，共 3,320,672 字节；还复用网站已有环境图。55 是网格数，不是含阴影和玻璃额外通道的总绘制次数。精细档启用透射玻璃、水面透射、环境遮蔽和抗锯齿；轻量档降低几何、像素比并关闭后期，玻璃改为透明材质。

水面是波纹法线与环境反射近似，不是流体模拟；玻璃不是离线路径追踪。家具、叶片、插画保持风格化，墙面有程序材质的重复性。图稿、机械臂和微缩作品属于装饰道具，不代表用户真实成果。后排窄屋仅完成建筑外部，没有新增室内可玩空间。

本轮浏览器数据仅代表本机自动化 Chromium 环境，不等同于用户设备帧率或手机性能保证。详细验证、截图及 glTF 校验报告保存在本地交付物目录。未自动提交、推送或部署。
