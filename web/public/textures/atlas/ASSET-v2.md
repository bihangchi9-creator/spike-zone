# 五颗经历星球 · 星图底图 v2

2026-09-20，内置 GPT image_gen 生成。非天文照片，不包含固定经历星球、名称、项目数、玩家标记或导航路线。所有位置和交互均由网页叠加。

- 网页压缩版：star-atlas-v2.jpg，1536 × 1024，JPEG 质量 86。仅格式压缩，未修改构图。
- 原图归档：交付物/five-worlds-20260920/star-atlas-v2-original.png。
- 原始生成文件：/Users/bytedance/.codex/generated_images/01a0b27d-b376-7c30-ac37-407ced58f59f/exec-8c5b9de3-bd6b-4c29-b0a0-28b8df3c701e.png。
- 使用模式：内置工具、全新图片生成，未调用 CLI/API fallback。

## 完整提示词

Create an exquisite production BACKGROUND ART for an interactive celestial atlas in a personal Chinese bilingual portfolio. Landscape 3:2 image, 1536x1024. Cinematic deep navy and blue-grey astronomical mist, fine photographic dust filaments, restrained pearl-blue edge light and tiny warm amber star glints, refined miniature-world sensibility but NO PLANETS, NO SPHERICAL OBJECTS, no buildings, no spacecraft, no logos, no readable text, no numbers, no routes, no orbit lines, no UI, no fixed large bright star markers. The actual five experience worlds and their labels will move in an interactive overlay. Compositional hierarchy only through lighting and airy wisps: two loosely adjacent soft blue luminous negative-space windows in the central middle-left and middle-right, a quieter spacious blue-green-tinted mist area toward upper middle, balanced dark open breathing space on the two far wings for secondary worlds. Do not turn these areas into five discrete islands, circles or clickable-looking features. One coherent, spacious celestial field, with very fine tiny star grains distributed organically. Nebula filaments mostly around edges, framing a clear middle area for precise live cartography. Deep blacks with rich blue details, subtle amber accents, very little purple. High end cinematic restraint, no grey blanket, no bright white blobs, no plastic glossy spheres, no over-dense stars, no illustrative infographic aesthetic. Background image only; dynamic marks and typography will be drawn separately in the website.

## 交互投影

底图不表达五颗星球的固定坐标。网页叠加使用同一固定斜俯视投影：相对共享中心的 dx、dy、dz 映射到 1000 × 667 图幅：x = 500 + .58dx，y = 310 + .4dz − .28dy。轨道线、星球、飞船、路线顶点全部共用该公式；名称避让时用引线连回实际投影点。图幅外飞船标记在边缘标注“图幅之外”。打开星图暂停世界，关闭后连续恢复。

## 占位球配色来源边界

字节占位球参考官方品牌设计团队文章明确说明的蓝绿方向，使用 #347acf / #64c9c3 作场景适配色，不称其为官方标准 HEX，也不使用 TikTok 的红青黑方案。
官方来源：[Creating the ByteDance Logo: A Look Into Our Brand Design Team](https://joinbytedance.com/blog/detail/20240601173339)，文章说明蓝色与少量绿色的设计方向。

大连理工采用学校蓝方向 #27679b / #8cb7de，未核验标准色，不能作为官方色值声明。开源绿色、崇振橙色为本轮占位方案。现代沿用已归档的官方深蓝 #002C5F 与白色材质及标识来源。
