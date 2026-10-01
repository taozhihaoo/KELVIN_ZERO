# KELVIN ZERO — 零度美术馆

**A gallery of computed phenomena.** 一座陈列「被计算出来的现象」的美术馆。
**At zero, only mathematics remains.** 在零度，只剩数学。

一座只存在于 GPU 中的数字美术馆：中庭 + 六个展厅 + 索引页 + 策展声明，全站由一个
WebGL 画布驱动，以 Voronoi 霜冻结晶转场相连。所有视觉内容程序化生成——
**零外部图片 / 视频 / 字体 / 模型 / CDN**。

## 启动

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 产物在 dist/
npm run preview
```

要求支持 WebGL2 的浏览器（Chrome / Edge / Firefox / Safari 最新版）。
URL 参数：`?autoenter`（跳过启动按钮，用于自动化测试）、`?debug`（FPS 面板，需自行安装可选依赖 `stats.js`）。

## 六个展厅

| # | 展厅 | 温度 | 算法 |
|---|---|---|---|
| 001 | TURING / 图灵 | 273.15 K | Gray–Scott 反应扩散（GPU ping-pong，Du=1.0 / Dv=0.5 / dt=1.0，九点拉普拉斯核）。v 通道驱动平面顶点位移构成高度场，片元用有限差分求法线做铬质 studio 反射。可拖动画入化学物、Space 重置、1–4 切换 spots/maze/coral/mitosis 预设。 |
| 002 | MERCURY / 水银 | 234.3 K | 90 步光线步进 SDF：主球体低频+高频噪声形变、5 颗卫星珠 smooth-union（k=0.6）、鼠标牵引珠；命中点以程序化摄影棚环境 `studio()` 做色散反射（RGB 三向偏移采样）+ `iri()` 虹彩。点击注入冲击波脉冲。 |
| 003 | CURL / 旋度 | 77.4 K | `GPUComputationRenderer` 位置纹理（xyz=位置,w=寿命）最多 1024²=1,048,576 粒子。模式 0：三通道 value-noise 的旋度场（解析 ∇×F）+ 鼠标吸引；模式 1–3：Aizawa / Thomas / Lorenz 奇异吸引子（状态空间缩放积分）。加法混合点精灵，颜色按寿命 FROST→ACID→BONE。 |
| 004 | LATTICE / 晶格 | 4.2 K | 200×200=40,000 实例柱体（InstancedMesh + InstancedBufferAttribute aGrid，不使用 instanceMatrix）。顶点着色器叠加 value-noise 波 + 径向驻波 + 音频低频 + 4 通道冲击波环 `amp·exp(−(d−9t)²/2)·exp(−0.8t)`；片元按高度 INK→FROST→ACID、边缘轮廓光、距离雾。 |
| 005 | ECHO / 回声 | 2.725 K | 鼠标即特雷门琴：X 量化到 A 小调五声音阶（110–523 Hz），Y 控制低通截止（200–4000 Hz）与音量；saw+sub-sine 经 0.42s 延迟回声。FFT 瀑布：128 频点 × 64 行环形缓冲 `DataTexture(RedFormat)`，每帧写入一行，顶点位移成 Joy-Division 式遮挡线地形；背景为 CMB 闪烁尘埃。静音时用内部合成频谱演示。 |
| 006 | HORIZON / 事件视界 | 6.2×10⁻⁸ K | 近似 Schwarzschild 测地线：`dv = −1.5·rs·h²·p/r⁵ · dt`（h²=|p×v|² 沿路径守恒），150 步积分。吸积盘按穿越平面检测着色，内快外慢的 fbm 湍流、多普勒增亮 `max(1+0.65·v·(−v̂),0)³`、光子环辉光、逃逸光线采样引力透镜星空。球坐标环绕相机带惯性与空闲自转。 |

中庭 ATRIUM：Canvas 绘制 `KELVIN ZERO` → mipmap 高度（`textureLod` 取 lod 3）→ 有限差分法线 → 液态铬字；六个门户组成转盘（拖拽/滚轮/←→/吸附 60°），悬停的门户以 ~20fps 实时刷新对应展厅缩略图；Reflector 镜面地面 + 网格叠加、6 道加法光束、2000 尘埃粒子。

## 技术清单 → 文件映射

| 技术 | 文件 |
|---|---|
| 单 renderer SPA + hash 路由 + 展厅生命周期 | `src/main.ts` · `src/core/router.ts` · `src/core/sceneManager.ts` · `src/rooms/room.ts` |
| 自定义 RoomPass 接入 EffectComposer | `src/core/post.ts`（needsSwap=false，渲染到 readBuffer） |
| Voronoi 霜冻转场（双 RT 混合） | `src/core/transition.ts` · `src/shaders/frost.frag.glsl` |
| GPGPU 百万粒子 + 旋度 + 三吸引子 | `src/rooms/curl.ts` · `src/shaders/curl.pos.glsl` / `curl.vert.glsl` / `curl.frag.glsl` |
| Gray–Scott 反应扩散 + 高度场光照 | `src/rooms/turing.ts` · `src/core/pingpong.ts` · `src/shaders/turing.sim.glsl` / `turing.vert.glsl` / `turing.frag.glsl` |
| 光线步进 SDF 液态金属 | `src/rooms/mercury.ts` · `src/shaders/mercury.frag.glsl` |
| 黑洞测地线 / 吸积盘 / 多普勒 / 光子环 / 透镜 | `src/rooms/horizon.ts` · `src/shaders/horizon.frag.glsl` |
| InstancedMesh 4 万 + 顶点位移 + 冲击波 | `src/rooms/lattice.ts` · `src/shaders/lattice.vert.glsl` / `lattice.frag.glsl` |
| WebAudio 合成 + FFT 瀑布 + 音频驱动 | `src/audio/engine.ts` · `src/rooms/echo.ts` · `src/shaders/echo.*.glsl` |
| 程序化 studio 环境 / 铬字 / Canvas→mipmap | `src/shaders/common.glsl`（`studio()`/`iri()`） · `src/rooms/atrium.ts` · `src/shaders/chromeText.frag.glsl` |
| Reflector 镜面地面 + 光束 + 尘埃 | `src/rooms/atrium.ts` · `src/shaders/grid.frag.glsl` / `beam.*.glsl` / `dust.*.glsl` |
| 缩略图 RT 预热 + 焦点节流 | `src/core/sceneManager.ts`（`warmThumb`） · `src/rooms/atrium.ts` / `indexPage.ts` |
| 最终后处理（色散/颗粒/暗角/霜冻边缘）+ Bloom | `src/shaders/final.frag.glsl` · `src/core/post.ts` |
| 自适应性能三档 + 绝对零度时间膨胀 | `src/core/perf.ts` · `src/core/clock.ts` · `src/main.ts`（Z 键） |
| HUD / 光标 / 文字入场 / 滚动计数 / 跑马灯 / 面板 | `src/ui/hud.ts` · `cursor.ts` · `text.ts` · `marquee.ts` · `panel.ts` · `loader.ts` · `manifesto.ts` · `fallback.ts` |

## 结构

```
index.html            语义骨架 + SEO/og/内联 SVG favicon + 降级容器
src/config/           palette · timings(全部缓动/时长) · rooms(六展厅数据) · copy(全部文案)
src/core/             renderer · clock · input · perf · router · sceneManager · transition · post · pingpong · debug
src/rooms/            room(接口+工具) · atrium · indexPage · turing · mercury · curl · lattice · echo · horizon
src/ui/               hud · loader · cursor · panel · manifesto · text · marquee · registry · fallback
src/audio/engine.ts   AudioContext 图：voices → lowpass → master → analyser → destination（+延迟回路）
src/shaders/          全部 GLSL（?raw 导入，common.glsl 字符串拼接复用）
```

## 性能分档

`src/core/perf.ts`：60 帧均值 >22ms 持续 2s 降档、<14ms 持续 5s 升档。
high：粒子 1024² / 晶格 200² / RD 512²×8 步 / 渲染比例 0.75 / Reflector+Bloom 全开；
mid：512² / 140² / 384²×4 / 0.6；low：256² / 90² / 256²×2 / 0.45、关 Reflector 与 Bloom。
移动端或 `hardwareConcurrency ≤ 4` 从 mid/low 起步。HUD 右下实时显示档位与 FPS。

## 无障碍与降级

- WebGL2 缺失 → 纯 DOM 降级页（`src/ui/fallback.ts`，列出六展厅与一句话）
- `prefers-reduced-motion` → 相机晃动/自转关闭、转场缩短、CSS 动画停止
- 语义化 header/main/footer、skip link、全部按钮 aria-label、Tab 可达、Esc 关浮层
- 全部展厅文案保留在 DOM（`#info-block`、索引页、降级页）
- `visibilitychange` 暂停；所有 RT/几何/材质在 `dispose()` 释放

## 降级项与已知限制

- **降级项（已实现，无需触发）**：水银/黑洞始终走低分辨率 RT + 放大（按档位 0.75/0.6/0.45）；
  反应扩散按档位降尺寸与步数；Float 不可用自动回退 HalfFloat；低档关闭 Reflector/Bloom。
- 水银 SPEC 参考步数 90（降级方案 60/卫星 3）未触发：high 档实测满帧。
- 铬字模糊高度依赖 mipmap `textureLod`，材质使用 GLSL3（three r170 对显式 GLSL3 不再提供
  `gl_FragColor` 兼容宏，shader 内自行声明 out）。
- 已知限制：Bloom 作用于 LDR 半浮点缓冲，极高亮区域可能整片泛白（各展厅已调阈值/曝光压缩）；
  iOS Safari 的 `AudioContext` 需首次触摸后启动（Loader 的 ENTER GALLERY 已处理）。
- 零 localStorage 使用；零外部网络请求（Network 面板只有本站资源）。
