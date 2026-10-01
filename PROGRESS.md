# PROGRESS — KELVIN ZERO · 零度美术馆

> 恢复进度：重读 `SPEC.md` 与本文件。启动：`npm install && npm run dev`。

## 里程碑（SPEC §6）

- [x] M0 脚手架 + 核心
- [x] M1 转场 + HUD + Loader
- [x] M2 展厅 002 MERCURY
- [x] M3 展厅 006 HORIZON
- [x] M4 展厅 001 TURING
- [x] M5 展厅 003 CURL
- [x] M6 展厅 004 LATTICE
- [x] M7 展厅 005 ECHO + 音频引擎
- [x] M8 中庭 ATRIUM
- [x] M9 索引页 + 绝对零度 + 细节打磨
- [x] M10 性能、降级、无障碍、文档

## 验收清单（SPEC §8）

- [x] `npm install && npm run build` 0 错误；`npm run dev` 控制台无报错；Network 无外域请求
- [x] Loader 启动序列、`ENTER GALLERY`/`ENTER SILENT` 正常
- [x] 中庭：铬字标题、6 门户（缩略图正确）、镜面地面、光束、尘埃；转盘拖动/滚轮/键盘/吸附顺滑；Manifesto 可开关
- [x] 6 展厅逐一可进入且效果达成（001 可画 / 002 跟随鼠标 / 003 四模式 / 004 冲击波 / 005 可演奏+瀑布 / 006 可环绕）
- [x] 展厅间霜冻结晶转场 + 冰裂音效（开声音时）
- [x] 索引页悬停预览 + 点击进入
- [x] 绝对零度模式（Z）：时间冻结、霜冻边缘、温度归零、音频变闷，可恢复
- [x] HUD：温度滚动、跑马灯、FPS/档位、指针坐标、每展厅 2~3 控件
- [x] 性能分档自适应（实测 107–180 FPS/HIGH）；WebGL2 降级页；reduced-motion
- [x] 语义化 HTML、skip link、键盘可达、SEO meta（title/description/og/theme-color/favicon）
- [x] README 完整；PROGRESS 全部打勾，降级项已记录

## 降级项

- 水银/黑洞按档位 0.75/0.6/0.45 渲染到低分辨率 RT 再放大（降级方案内建，非事后补救）。
- 反应扩散按档位 512²×8 / 384²×4 / 256²×2；`EXT_color_buffer_float` 缺失自动回退 HalfFloat。
- 低档设备关闭 Reflector（改纯渐变网格地面）与 Bloom；粒子/晶格按档位缩减。
- 水银 SPEC 步数 90/卫星 5 未触发降级（60 步/卫星 3），high 档实测满帧。
- 铬字模糊高度用 GLSL3 `textureLod`（three r170 显式 GLSL3 不再宏定义 gl_FragColor，shader 内自声明 out）。

## 日志

- **M0** 脚手架：vite/ts、设计系统 CSS、renderer/clock/input/perf/router/pingpong/post(RoomPass+Bloom+Final+OutputPass)/sceneManager、8 占位展厅、降级页。UnrealBloomPass 用 `enabled` 属性启停。
- **M1** 霜冻转场+HUD+Loader+光标+面板+Manifesto。**重大 bug：`#fallback{display:flex}` 覆盖 `hidden` 属性 → 空降级页全屏遮挡（黑屏）**；加 `[hidden]{display:none!important}` 修复。IAB 后台标签 rAF/setTimeout 节流拖慢动画（环境现象）。浏览器实测：Loader→中庭→路由、HUD 滚动、107FPS/HIGH、0 报错。
- **M2** MERCURY：raymarched SDF、色散反射、WARP 面板；新增 `ui/registry.ts`。**确立全屏 shader `pow(col,2.2)` 输出约定**（抵消 OutputPass sRGB，否则整体过曝）。
- **M3** HORIZON：测地线偏折+吸积盘+多普勒+光子环+透镜星空；HDR 累积过曝 → filmic 曝光压缩 `1-exp(-col*1.35)` + 调低发光/Bloom 阈值。
- **M4** TURING：ping-pong 反应扩散、高度场位移+有限差分法线、四预设/画笔/Space。修复 `vV` varying 缺失（片元未声明）。新增 `__kz.advance()` 测试钩子供自动化推进模拟。
- **M5** CURL：GPUComp 百万粒子、四模式、点击爆发。查证 r170 GPUComputationRenderer **自动前置注入** `uniform sampler2D texturePosition`（不可重复声明）、`resolution` 为 define；点径公式量纲修正 + α 0.22 得丝带感；`input.hasMoved` 防初始指针堆芯。
- **M6** LATTICE：4 万实例、顶点位移场、冲击波。**冲击波 d 单位修正为格数（×uN）**，否则波环瞬间扫完全场。
- **M7** ECHO：FFT 瀑布（环形缓冲 DataTexture+遮挡线地形）、五声音阶特雷门琴、CMB 尘埃、音高环。音频引擎实测 `ctx.state=running`；无头环境无法产生真实用户手势点击（自动化限制，非缺陷）。
- **M8** ATRIUM：铬字（canvas→mipmap 高度→studio 反射）、六门户转盘（视差+色散+悬停框+实时缩略图）、镜面地面、光束、尘埃、目标角吸附物理。修复：portal/chromeText 漏拼 common；**r170 显式 GLSL3 材质不提供 gl_FragColor 宏**（自声明 out）；转盘 target 被每帧覆写（改目标角模型）；选中索引符号反向。
- **M9** 索引页（描边巨字+速度色散预览卡+统计行）、routeTitle 带展厅名、reduced-motion 停 CSS 动画。
- **M10** `?debug`(动态 import stats.js，可选依赖)、dispose 审计（Reflector.dispose 存在）、README、全站最终浏览器回归（见下）。**转场链改进**：转场进行中的路由变更不再被丢弃，记录最新请求并在转场结束时自动接续（快速连按 ←→ 视图始终追上 hash）。WebGL2 降级页用 `--disable-webgl2` 实测渲染正确。

## 最终浏览器回归（无头 Edge + ZCode IAB）

全路由遍历 `#/#/room/1..6/#/index`：0 控制台错误、0 白屏；霜冻转场、HUD 数据、
绝对零度（Z 进/出）、Manifesto 开合、索引悬停预览均验证通过。截图检查点 M2/M6/M9 完成。
