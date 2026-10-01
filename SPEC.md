# SPEC：KELVIN ZERO · 零度美术馆（纯炫技向 three.js 沉浸式项目）

## 0. 你的任务与工作方式（必须遵守）

你是一位资深实时图形工程师 + 创意程序员 + 具有大师品味的视觉艺术家。请在当前目录从零实现一个"只存在于 GPU 里的数字美术馆"：一个单页应用（SPA），由 **中庭（主页）+ 6 个独立展厅（子页面）+ 索引页 + 策展声明** 构成，全站由一个 WebGL 画布驱动，用霜冻结晶式 shader 转场连接。目标：视觉震撼、技术密度极高、风格冷峻时尚、内容完整统一。

**自主执行规则：**
1. 全程自主完成，不向用户提问，自行做合理决策并记录。
2. 先创建 `PROGRESS.md`，把第 6 节里程碑 M0~M10 写成复选框。每完成一个里程碑：先 `npm run build` 必须 0 错误，再打勾，并追加一行"做了什么/遇到什么"。上下文丢失时重读 SPEC.md 与 PROGRESS.md 即可恢复进度。
3. 每个里程碑后若有 git：`git add -A && git commit -m "Mx: ..."`。
4. 遇到报错：读完整错误，最多尝试 3 次修复；仍失败则采用该功能标注的【降级方案】，记录到 PROGRESS.md 的"降级项"，继续推进。**禁止卡死。**
5. **任何时刻项目都必须可启动**：每个里程碑结束时 `npm run dev` 能正常打开、不白屏。某个展厅失败时，用占位 shader 顶上，不要拖垮全站。
6. 有 Playwright/截图工具时，在 M2、M6、M9 各截图检查白屏与控制台报错；没有则靠 build + 代码审查。
7. 代码必须完整可运行，禁止"省略""TODO 留给用户"。单个文件尽量 ≤ 300 行，shader 独立成文件。
8. 全部完成后输出简短总结：启动命令、技术清单→文件映射、降级项。

## 1. 概念、品牌与全部文案（唯一内容来源）

**名称**：KELVIN ZERO（中文：零度美术馆）。
**概念**：一座陈列"被计算出来的现象"的美术馆。每个展厅对应一个真实物理温度，越深入越"冷"，结构越纯粹。
**主标语**：A gallery of computed phenomena. ／ 一座陈列「被计算出来的现象」的美术馆。
**副标语**：At zero, only mathematics remains. ／ 在零度，只剩数学。

界面采用"英文为主 + 中文小字副标"的双语排版，不做语言切换。全站禁止出现：外部网址、备案信息、Lorem ipsum、占位图。

**六个展厅（顺序固定，温度递降）：**

| 编号 | 英文名 / 中文 | 温度标注 | 一句话 | 技术标签 | 交互 |
|---|---|---|---|---|---|
| 001 | TURING / 图灵 | 273.15 K（水的冰点） | Two chemicals, one rule, endless skin. ／ 两种化学物，一条规则，无尽的皮肤。 | Gray–Scott reaction-diffusion · GPU ping-pong · heightfield lighting | 拖动注入化学物；Space 重置；数字键 1–4 切换图案预设 |
| 002 | MERCURY / 水银 | 234.3 K（水银熔点） | A mirror that forgot its shape. ／ 一面忘了形状的镜子。 | Raymarched SDF · smooth union · procedural studio HDRI · dispersion | 鼠标牵引一滴水银；点击产生冲击波 |
| 003 | CURL / 旋度 | 77.4 K（液氮沸点） | A million particles obey one equation. ／ 百万粒子，服从同一个方程。 | GPGPU · curl noise · strange attractors（Aizawa/Thomas/Lorenz） | 鼠标吸引；点击爆发；数字键 1–4 切换：流场/Aizawa/Thomas/Lorenz |
| 004 | LATTICE / 晶格 | 4.2 K（液氦沸点） | Order, rendered as weather. ／ 秩序，被渲染成天气。 | InstancedMesh ×40,000 · vertex displacement · shockwaves · rim light | 点击产生冲击波；拖动改变视角 |
| 005 | ECHO / 回声 | 2.725 K（宇宙微波背景） | The oldest light, played as an instrument. ／ 最古老的光，被演奏成乐器。 | Web Audio synth · FFT waterfall · occlusion-line rendering | 鼠标即特雷门琴：X=音高（五声音阶量化），Y=滤波/音量；按住持续发声 |
| 006 | HORIZON / 事件视界 | 6.2×10⁻⁸ K（太阳质量黑洞霍金温度） | Where light stops arguing. ／ 光在此停止争辩。 | Geodesic ray bending · accretion disk · Doppler beaming · gravitational lensing | 拖动环绕；滚轮改变距离；滑块调质量 |

**策展声明（Manifesto，中庭点击左下 "MANIFESTO" 打开的全屏文字浮层，中英并排）：**
- 我们相信，每一个现象都可以被写成一个公式。
- 当温度降至零，噪声退场，结构显形——流体变成雕塑，粒子变成语法，声音变成地形。
- KELVIN ZERO 是一座只存在于 GPU 中的展馆。展品不会被收藏，只会被计算。
（并写出对应的英文译文）

**HUD 通用文案：** `SELECT AN EXHIBIT / 选择展品` ｜ `DRAG · WHEEL · ← →` ｜ `ENTER ↵` ｜ `ESC — ATRIUM` ｜ `INDEX / 索引` ｜ `SOUND ON/OFF` ｜ `ABSOLUTE ZERO [Z]`。
**无 WebGL2 降级页文案：** `KELVIN ZERO — 此展馆需要 WebGL2。请使用最新版 Chrome / Edge / Firefox / Safari 访问。`（同时列出六个展厅名称与一句话）

## 2. 设计系统（统一视觉语言）

**色板（CSS 变量 + GLSL 常量双份同步）：**
- INK `#050507`（背景）｜BONE `#ECEAE4`（主文字/高光）｜ACID `#C8FF2E`（唯一强调色）｜FROST `#8FA8FF`（冷色辅助）｜SIGNAL `#FF3D2E`（仅用于录制点/警示，极少量）
- 铬金属、虹彩只作为"材质"出现，不作为 UI 颜色。

**字体（只用系统字体，不加载任何字体文件）：**
- 展示：`"Helvetica Neue","Arial Black","PingFang SC","Microsoft YaHei",sans-serif`，weight 900，字距 `-0.04em`，超大字号 `clamp(4rem, 14vw, 16rem)`，可做描边空心字（`-webkit-text-stroke:1px`，`color:transparent`）
- HUD/标签：`ui-monospace,"SF Mono",Menlo,Consolas,monospace`，11–12px，大写，字距 `0.12em`
- 中文副标：同上字体栈，字号为英文的 0.7 倍，透明度 0.6

**版式（编辑杂志 + 科研仪表盘）：** 12 栏网格，1px `rgba(236,234,228,.12)` 细线；四角带"配准十字标记（registration marks）"；顶部/底部各一条 HUD 栏；底部一条循环滚动的技术标签跑马灯（`GPGPU ✕ RAYMARCHING ✕ SDF ✕ FFT ✕ ...`）；全屏叠加极轻微的扫描线与颗粒（CSS 实现，`pointer-events:none`）。
**动效语言：** 入场 `power3.out`，大转场 `expo.inOut`，所有时长缓动集中在 `src/config/timings.ts`。文字入场统一用"逐字符遮罩上升"（自写 `ui/text.ts`，不依赖付费插件）。数字变化统一用"滚动计数"。
**自定义光标：** 细十字准星 + 带延迟的方框，`mix-blend-mode:difference`；悬停可交互元素时方框放大并显示上下文标签（如 `ENTER`、`DRAG`、`SHOCK`）；触屏设备禁用。

## 3. 技术栈（版本固定，禁止擅自更换）

- Vite ^5 + TypeScript ^5（`strict:false`、`noImplicitAny:false`，保证 build 易通过）
- `three@0.170.0` + `@types/three@0.170.0`
- `gsap@^3.12`（Timeline、转场、HUD 动效）
- 后处理只用 three 自带：`EffectComposer / Pass / UnrealBloomPass / ShaderPass / OutputPass`
- GPGPU：`three/examples/jsm/misc/GPUComputationRenderer.js`；其他模拟（反应扩散、光轨）用自己封装的 `PingPong` 类
- 反射地面：`three/examples/jsm/objects/Reflector.js`
- 着色器放在 `src/shaders/*.glsl`，Vite 原生 `import x from './x.glsl?raw'` 导入，**公共函数通过字符串拼接** `common + frag` 复用（不装 glsl 插件）；`src/vite-env.d.ts` 声明 `declare module '*.glsl?raw'`
- 路由：自己写的极简 hash 路由（`#/`、`#/room/1`…`#/room/6`、`#/index`），支持浏览器前进后退
- 不引入 UI 框架；不使用 Lenis（无页面滚动，交互由滚轮/拖拽/键盘自管）
- 调试：仅 `?debug` 时动态 import `stats.js`（可选依赖）
- 所有视觉内容程序化生成，**无任何外部图片/视频/字体/模型/CDN**

## 4. 目录结构

```
index.html / package.json / tsconfig.json / vite.config.ts / README.md / PROGRESS.md
src/main.ts, style.css, vite-env.d.ts
src/config/{palette.ts, timings.ts, rooms.ts(六展厅数据与文案), copy.ts}
src/core/{renderer.ts, router.ts, sceneManager.ts, transition.ts, input.ts, perf.ts, pingpong.ts, clock.ts, post.ts}
src/rooms/{room.ts, atrium.ts, indexPage.ts, turing.ts, mercury.ts, curl.ts, lattice.ts, echo.ts, horizon.ts}
src/ui/{hud.ts, loader.ts, cursor.ts, panel.ts, manifesto.ts, text.ts, marquee.ts}
src/audio/engine.ts
src/shaders/{common.glsl, frost.frag.glsl, final.frag.glsl, chromeText.frag.glsl, portal.frag.glsl,
             turing.sim.glsl, turing.vert.glsl, turing.frag.glsl, mercury.frag.glsl,
             curl.pos.glsl, curl.vert.glsl, curl.frag.glsl, lattice.vert.glsl, lattice.frag.glsl,
             echo.vert.glsl, echo.frag.glsl, horizon.frag.glsl, quad.vert.glsl, ...}
```

**Room 统一接口（`rooms/room.ts`）：**
```ts
export interface Room {
  id: string;
  init(ctx: Ctx): Promise<void> | void;      // 创建资源（只调用一次）
  enter(): void;  leave(): void;              // 进入/离开（控制 update 是否运行、绑定/解绑交互）
  update(t: number, dt: number): void;        // 模拟与 uniform 更新
  render(r: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget | null): void; // 渲染到 target（null=屏幕）
  resize(w: number, h: number): void;
  thumb?: THREE.WebGLRenderTarget;            // 缩略图（供中庭门户与索引页使用）
  dispose(): void;
}
// render 的标准实现：r.setRenderTarget(target); r.clear(); r.render(scene, camera);
```

## 5. 核心架构

### 5.1 渲染管线
单 renderer（`antialias:false`、`powerPreference:'high-performance'`、DPR 上限 `min(devicePixelRatio,2)`，`toneMapping = NoToneMapping`，色调映射与 sRGB 由最后的 `OutputPass` 处理）。管线：
`RoomPass（自定义，渲染当前展厅或转场混合）→ UnrealBloomPass → ShaderPass(final) → OutputPass`

`RoomPass` 的写法（模仿 RenderPass，needsSwap=false，渲染到 readBuffer）：
```ts
import { Pass } from 'three/examples/jsm/postprocessing/Pass.js';
class RoomPass extends Pass {
  constructor(private mgr: SceneManager){ super(); this.needsSwap = false; }
  render(renderer, writeBuffer, readBuffer){ this.mgr.renderInto(renderer, this.renderToScreen ? null : readBuffer); }
}
```
`SceneManager.renderInto(renderer, target)`：无转场时 `current.render(renderer, target)`；转场中分别渲染 `from→rtA`、`to→rtB`，再用转场 quad（5.2）把二者混合渲染到 `target`。注意每个 room 的模拟 pass 在 `update()` 中完成，`render()` 之后必须保证 `renderer.setRenderTarget(null)` 恢复状态。

### 5.2 霜冻结晶转场（`shaders/frost.frag.glsl`，全站统一转场）
Voronoi 晶格从点击位置向外"结冰"，每个晶格有随机延迟，晶格边缘发出酸性绿裂纹光，晶格内部切换到目标画面并带轻微位移折射。
```glsl
precision highp float;
varying vec2 vUv;
uniform sampler2D tA, tB; uniform float uP, uAspect; uniform vec2 uOrigin;
vec2 h22(vec2 p){ p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))); return fract(sin(p)*43758.5453); }
// 返回 (到晶格边缘距离, 晶格随机值xy)
vec3 vor(vec2 x){
  vec2 n=floor(x), f=fract(x), mg=vec2(0.), mr=vec2(0.); float md=8.;
  for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
    vec2 g=vec2(float(i),float(j)); vec2 o=h22(n+g); vec2 r=g+o-f; float d=dot(r,r);
    if(d<md){ md=d; mr=r; mg=g; } }
  md=8.;
  for(int j=-2;j<=2;j++) for(int i=-2;i<=2;i++){
    vec2 g=mg+vec2(float(i),float(j)); vec2 o=h22(n+g); vec2 r=g+o-f;
    if(dot(mr-r,mr-r)>1e-5) md=min(md,dot(.5*(mr+r),normalize(r-mr))); }
  return vec3(md,h22(n+mg));
}
void main(){
  vec2 asp=vec2(uAspect,1.);
  vec3 v=vor(vUv*asp*14.);
  float dist=length((vUv-uOrigin)*asp);
  float delay=dist*.9+v.y*.35;
  float m=smoothstep(delay,delay+.18,uP*1.7);                 // 每个晶格的进度 0..1
  float pulse=sin(m*3.14159);
  vec2 shift=(v.yz-.5)*.025*pulse;
  vec3 a=texture2D(tA,vUv).rgb, b=texture2D(tB,vUv+shift).rgb;
  vec3 col=mix(a,b,step(.5,m));
  float crack=(1.-smoothstep(0.,.05,v.x))*pulse;
  col+=vec3(.784,1.,.18)*crack*2.2 + vec3(.56,.66,1.)*pulse*.15;
  gl_FragColor=vec4(col,1.);
}
```
JS：`go(roomId, originXY)` 用 gsap 将 `uP` 从 0→1（1.6s，`expo.inOut`），转场开始时调用目标 `enter()`，结束后对旧展厅 `leave()`；转场期间 final pass 的色散强度临时提高。

### 5.3 公共 GLSL（`shaders/common.glsl`，所有 shader 通过字符串拼接引入）
```glsl
#define PI 3.14159265359
const vec3 INK=vec3(.02,.02,.027);
const vec3 BONE=vec3(.925,.918,.894);
const vec3 ACID=vec3(.784,1.,.18);
const vec3 FROST=vec3(.56,.66,1.);
float hash12(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
float hash13(vec3 p3){ p3=fract(p3*.1031); p3+=dot(p3,p3.zyx+31.32); return fract((p3.x+p3.y)*p3.z); }
float vnoise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash12(i),hash12(i+vec2(1,0)),f.x),mix(hash12(i+vec2(0,1)),hash12(i+vec2(1,1)),f.x),f.y); }
float vnoise3(vec3 p){ vec3 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(mix(hash13(i),hash13(i+vec3(1,0,0)),f.x),mix(hash13(i+vec3(0,1,0)),hash13(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash13(i+vec3(0,0,1)),hash13(i+vec3(1,0,1)),f.x),mix(hash13(i+vec3(0,1,1)),hash13(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm2(vec2 p){ float v=0.,a=.5; for(int i=0;i<5;i++){ v+=a*vnoise(p); p=p*2.02+vec2(1.7,9.2); a*=.5; } return v; }
vec3 iri(float t){ return .5+.5*cos(6.28318*(vec3(0.,.33,.67)+t)); }       // 虹彩色
// 程序化"摄影棚环境"：给铬/水银材质提供反射内容
vec3 studio(vec3 d){
  float h=d.y*.5+.5;
  vec3 c=mix(vec3(.01,.012,.02),vec3(.55,.62,.8),pow(h,3.));
  c+=BONE*smoothstep(.93,.99,sin(d.x*4.+d.y*1.5+.5))*smoothstep(-.2,.6,d.y)*1.4;     // 条形灯
  c+=ACID*pow(max(dot(d,normalize(vec3(-.6,.25,.75))),0.),24.)*2.2;                   // 酸性主光
  c+=FROST*pow(max(dot(d,normalize(vec3(.7,.1,-.6))),0.),12.)*1.2;                    // 冷色轮廓光
  return c;
}
```
全屏 quad 顶点着色器 `quad.vert.glsl`：`varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`（配 `PlaneGeometry(2,2)`，材质 `depthTest:false, depthWrite:false`）。

### 5.4 最终后处理 `final.frag.glsl`（自定义 Pass）
uniforms：`tDiffuse, uTime, uVel(指针/转场速度), uFrost(0~1), uGrain, uAberr`。内容：①RGB 色散（边缘更强，随 uVel 与转场增强）；②暗角呼吸；③胶片颗粒；④**霜冻边缘**：`frost = smoothstep(.55,1., r + fbm2(uv*8.)*.25) * uFrost`，在边缘叠加冰晶噪声 `mix(col, vec3(.8,.9,1.)*(.5+fbm2(uv*40.)), frost*.7)` 并整体去饱和（`uFrost` 由「绝对零度」模式驱动）；⑤可选极细扫描线。Bloom：strength 0.7、radius 0.5、threshold 0.2（各展厅可微调）。

### 5.5 全局输入、时钟、性能
- `input.ts`：统一鼠标/触摸：`pointer{x,y(-1..1), px,py(像素), vx,vy, down, dragDX, dragDY}`、`wheel` 增量、键盘事件分发；暴露 `on('click'|'drag'|'wheel'|'key')`。
- `clock.ts`：全局时间 `t` 与 `timeScale`（默认 1）。**绝对零度模式（按 Z / HUD 按钮）**：gsap 将 `timeScale` 平滑降到 0.02、`uFrost` 升到 1、HUD 温度读数滚动到 `0.000 K`、音频低通滤波收紧到 200Hz；再按一次恢复。所有展厅的时间一律使用 `clock.t`（而非 `performance.now`）。
- `perf.ts`：统计最近 60 帧平均耗时；>22ms 连续 2 秒降一档，<14ms 连续 5 秒可升一档。三档定义：
  - high：旋度粒子 1024²（≈105 万）、晶格 200×200（4 万）、反应扩散 512²×8 步/帧、水银/黑洞渲染比例 0.75、Bloom 全开、Reflector 512
  - mid：粒子 512²、晶格 140×140、反应扩散 384²×4 步、渲染比例 0.6、Reflector 384
  - low：粒子 256²、晶格 90×90、反应扩散 256²×2 步、渲染比例 0.45、关闭 Reflector（改假反射）、关闭 Bloom
  移动端/`hardwareConcurrency<=4` 从 mid 或 low 起步。HUD 右下显示当前档位与 FPS。
- 其他：`visibilitychange` 隐藏时暂停；`prefers-reduced-motion` 下关闭相机晃动并缩短转场；WebGL2 检测失败显示纯 DOM 降级页；所有资源 `dispose()` 完整。

### 5.6 浮动参数面板（`ui/panel.ts`，自写，不用 lil-gui）
按 schema 生成：`{type:'slider'|'buttons', label, min,max,step,value, onChange}`，右下角等宽字体半透明面板，风格与 HUD 一致，每个展厅注册 2~3 个控件。

## 6. 里程碑（严格按序，每个都必须 build 通过且可启动）

### M0 脚手架 + 核心
package.json/tsconfig/vite；`index.html` 语义骨架（`header/main/footer`，canvas 固定全屏 z-index 0，HUD 层 z-index 1，skip link）；`style.css`（变量、字体、网格线、配准标记、扫描线与颗粒）；renderer、clock、input、perf、router、post（RoomPass + Bloom + Final + OutputPass）；SceneManager 注册 6 个**占位展厅**（各自一个不同颜色渐变的全屏 quad）+ 中庭占位。
验收：可用 hash 路由在占位展厅间切换，无报错。

### M1 转场 + HUD + Loader
- 实现 5.2 霜冻转场，路由变化时自动触发（点击位置作为 uOrigin，无点击则取屏幕中心）。
- HUD（`ui/hud.ts`）：顶部：左 `KELVIN ZERO°` 字标，右 `INDEX` `SOUND` `ABSOLUTE ZERO [Z]`；底部：左温度读数（滚动计数，随展厅变化，如 `273.15 K`）、中 `003 / 006 — CURL / 旋度`、右 FPS+档位+指针坐标 `X 0.412 Y -0.203`；底部跑马灯（`ui/marquee.ts`）；展厅页左侧说明块（编号、英文名、中文名、一句话、技术标签列表、交互提示）逐字入场；右下参数面板；左右箭头切换上/下一展厅；`ESC` 回中庭。
- Loader：终端风格"启动序列"，逐行打印 `INIT RENDERER … OK` / `COMPILING SHADERS n/12` / `WARMING GPGPU` / `CHILLING 300 K → 0 K`；中央一枚小型光线步进球体，进度从 0→100% 时由熔融橙（SIGNAL 的变体）冷却为霜白；进度与真实初始化步骤（编译、展厅 init、缩略图预热）挂钩；结束出现 `ENTER GALLERY` 按钮（点击解锁 AudioContext，另有 `ENTER SILENT`）。
验收：Loader→中庭占位→展厅，霜冻转场正常，HUD 数据随路由变化。

### M2 展厅 002 MERCURY（最先做，最稳）
全屏 quad + `mercury.frag.glsl`。参考实现：
```glsl
precision highp float;
varying vec2 vUv;
uniform vec2 uRes; uniform float uTime, uPulse, uWarp; uniform vec3 uMouse3;
float smin(float a,float b,float k){ float h=max(k-abs(a-b),0.)/k; return min(a,b)-h*h*k*.25; }
float map(vec3 p){
  float t=uTime*.4;
  float d=length(p)-1.1;
  d+=uWarp*.12*sin(p.x*3.+t)*sin(p.y*3.+t*1.3)*sin(p.z*3.-t*.7);          // 低频形变
  d+=uWarp*.05*sin(p.x*9.+t*2.)*sin(p.y*9.-t*1.7)*sin(p.z*9.+t);           // 高频细节
  d+=uPulse*.1*sin(length(p)*8.-uTime*6.);                                  // 点击冲击波
  for(int i=0;i<5;i++){ float fi=float(i);                                  // 5 颗卫星水银珠
    vec3 c=vec3(sin(t*(.6+fi*.17)+fi*2.1)*1.9, cos(t*(.5+fi*.11)+fi)*1.1, sin(t*(.4+fi*.13)+fi*1.3)*1.5);
    d=smin(d,length(p-c)-(.35+.08*sin(fi*3.+t)),.6); }
  d=smin(d,length(p-uMouse3)-.45,.7);                                       // 鼠标牵引的一滴
  return d; }
vec3 nrm(vec3 p){ const vec2 k=vec2(1.,-1.); float e=.0015;
  return normalize(k.xyy*map(p+k.xyy*e)+k.yyx*map(p+k.yyx*e)+k.yxy*map(p+k.yxy*e)+k.xxx*map(p+k.xxx*e)); }
void main(){
  vec2 uv=(vUv-.5)*vec2(uRes.x/uRes.y,1.);
  vec3 ro=vec3(0.,0.,5.5), rd=normalize(vec3(uv,-1.9));
  float t=0.,d=0.,glow=0.; bool hit=false;
  for(int i=0;i<90;i++){ d=map(ro+rd*t); glow+=exp(-abs(d)*6.)*.015; if(d<.001){hit=true;break;} t+=d*.9; if(t>14.)break; }
  vec3 col=mix(INK*.6,INK*2.+FROST*.04,smoothstep(1.2,0.,length(uv)));
  if(hit){ vec3 p=ro+rd*t, n=nrm(p), r=reflect(rd,n); float fr=pow(1.+dot(rd,n),3.);
    vec3 refl=vec3(studio(r+vec3(.02,0.,0.)).r, studio(r).g, studio(r-vec3(.02,0.,0.)).b);   // 色散
    col=refl*(.55+.45*fr); col*=mix(vec3(1.),iri(dot(n,-rd)*1.2+uTime*.03),.18); }
  col+=ACID*glow*.5;
  gl_FragColor=vec4(col,1.); }
```
JS：`uMouse3` = 指针归一化坐标映射到 z=0 平面（x=pointer.x*asp*2.2, y=pointer.y*2.2），带 lerp 平滑；点击令 `uPulse=1` 并用 gsap 衰减到 0；面板：Warp 滑块（0~2）；渲染比例按 perf 档位（先渲染到低分辨率 RT 再放大，或直接缩小 quad 的 RT）。【降级方案】步数降到 60，卫星减到 3。
验收：水银球流动、跟随鼠标、点击有冲击波。

### M3 展厅 006 HORIZON（黑洞引力透镜）
全屏 quad，射线逐步积分近似 Schwarzschild 光线偏折：
```glsl
precision highp float;
varying vec2 vUv;
uniform vec2 uRes; uniform float uTime, uMass, uDisk; uniform vec3 uCam, uRight, uUp, uFwd;
vec3 stars(vec3 d){
  vec3 col=vec3(0.);
  for(int i=0;i<2;i++){ float sc=(i==0)?50.:110.; vec3 p=d*sc; vec3 id=floor(p), f=fract(p)-.5;
    float h=hash13(id+float(i)*17.); float s=smoothstep(.12,0.,length(f))*step(.975,h);
    col+=mix(FROST,BONE,hash13(id+3.1))*s*(1.5+2.*hash13(id+7.7)); }
  float band=exp(-pow(d.y*3.+.3*sin(d.x*3.),2.)*2.);
  col+=FROST*.06*band*fbm2(d.xz*6.+d.y*3.);                                        // 银河带
  return col; }
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  vec3 rd=normalize(uv.x*uRight+uv.y*uUp+1.6*uFwd);
  vec3 p=uCam, v=rd; float rs=uMass;
  float h2=dot(cross(p,v),cross(p,v));                                              // 光子角动量²，沿路径守恒
  float rIn=2.0*rs, rOut=6.5*rs; vec3 col=vec3(0.); float ring=0.; bool hit=false;
  for(int i=0;i<150;i++){
    float r=length(p);
    if(r<rs){ hit=true; break; }
    if(r>30.&&dot(p,v)>0.) break;
    float dt=clamp(.06*r,.02,.5);
    ring+=exp(-abs(r-1.5*rs)*7.)*dt*.5;                                              // 光子环辉光
    v=normalize(v+(-1.5*rs*h2*p/(r*r*r*r*r))*dt);                                    // 引力偏折
    vec3 pn=p+v*dt;
    if(p.y*pn.y<0.){                                                                  // 穿过吸积盘平面 y=0
      float tt=p.y/(p.y-pn.y); vec3 q=mix(p,pn,tt); float rr=length(q.xz);
      if(rr>rIn&&rr<rOut){
        float ang=atan(q.z,q.x);
        float n=fbm2(vec2(rr*5., ang*3.+uTime*(1.4/sqrt(rr))));                      // 内圈转得更快
        float dens=smoothstep(rIn,rIn+.3,rr)*smoothstep(rOut,rIn+.8,rr)*(.35+.9*n);
        vec3 vel=normalize(vec3(-q.z,0.,q.x));
        float dop=1.+.65*dot(vel,-v);                                                 // 多普勒增亮：朝向观察者的一侧更亮
        float tc=clamp((rr-rIn)/(rOut-rIn),0.,1.);
        vec3 dc=mix(mix(BONE*1.6,ACID,smoothstep(0.,.35,tc)),FROST*.7,smoothstep(.3,1.,tc));
        col+=dc*dens*pow(max(dop,0.),3.)*1.8*uDisk; } }
    p=pn; }
  if(!hit) col+=stars(normalize(v));
  col+=mix(BONE,ACID,.3)*ring*.9;
  gl_FragColor=vec4(col,1.); }
```
JS：相机球坐标（theta、phi 仰角默认 ~12°、距离 6~14，拖动环绕带惯性，滚轮改距离，空闲时缓慢自转），每帧算出 `uRight/uUp/uFwd`（看向原点）与 `uCam`；面板：Mass（0.6~1.6）、Disk 亮度；渲染到低分辨率 RT 再放大（按 perf 比例）。Bloom 加强（strength 1.1）。【降级方案】步数 90，去掉银河带。
验收：能看到黑洞阴影、被扭曲的吸积盘（盘面在黑洞上下方弯曲成光环）、扭曲的星空；拖动环绕顺滑。

### M4 展厅 001 TURING（反应扩散）
- `PingPong` 双 RT（`FloatType`，如 `EXT_color_buffer_float` 不可用则 `HalfFloatType`；`NearestFilter`、`RepeatWrapping`），尺寸按档位 512/384/256；每帧运行 N 步（8/4/2）。
- 初始化：u=1、v=0，随机放置若干 v=1 的小方块作为种子。
- 模拟 shader（Karl Sims 配方：Du=1.0、Dv=0.5、dt=1.0；拉普拉斯权重：中心 -1，上下左右 .2，对角 .05）：
```glsl
uniform sampler2D uTex; uniform vec2 uTexel; uniform float uF,uK,uBrush; uniform vec2 uMouse; uniform float uAspect;
varying vec2 vUv;
vec2 S(vec2 o){ return texture2D(uTex,vUv+o*uTexel).rg; }
void main(){
  vec2 c=S(vec2(0.));
  vec2 lap=-c + (S(vec2(1,0))+S(vec2(-1,0))+S(vec2(0,1))+S(vec2(0,-1)))*.2
              + (S(vec2(1,1))+S(vec2(-1,1))+S(vec2(1,-1))+S(vec2(-1,-1)))*.05;
  float uvv=c.r*c.g*c.g;
  vec2 n=c+vec2(1.0*lap.r-uvv+uF*(1.-c.r), .5*lap.g+uvv-(uF+uK)*c.g);
  if(uBrush>0.){ vec2 d=(vUv-uMouse)*vec2(uAspect,1.); n.g+=smoothstep(uBrush,0.,length(d))*.6; }
  gl_FragColor=vec4(clamp(n,0.,1.),0.,1.); }
```
- 图案预设（键 1–4 / 面板按钮）：spots（f .035, k .065）｜maze（.029, .057）｜coral（.0545, .062）｜mitosis（.0367, .0649）。
- 渲染：`PlaneGeometry(10,10,255,255)` + 顶点 shader 采样 v 通道做位移（高度 = v*1.2），片元用纹理有限差分求法线，复用 `studio()` 做铬质反射 + `iri()` 虹彩 + 高 v 区域泛 ACID、低区域泛 FROST；相机俯视略倾斜并缓慢漂移；指针通过 Raycaster 命中该平面得到 uv 作为 `uMouse`。
- 面板：预设按钮 + Brush 大小滑块。
【降级方案】位移改为纯着色（不位移，平面渲染 + 伪法线）。
验收：图案持续生长，拖动可"画"出新图案，Space 重置。

### M5 展厅 003 CURL（百万粒子）
- `GPUComputationRenderer`（尺寸 1024²/512²/256²，`setDataType(THREE.HalfFloatType)` 若 Float 不可用）。位置纹理 RGBA：xyz=位置，w=寿命。
- 位置更新 shader（先拼接 common.glsl）要点：
```glsl
uniform float uTime,uDt,uSpeed,uBurst; uniform int uMode; uniform vec3 uMouse; uniform float uReset;
vec3 pot(vec3 p){ return vec3(vnoise3(p+vec3(0.,31.4,5.)), vnoise3(p+vec3(17.1,0.,53.)), vnoise3(p+vec3(9.2,41.,0.))); }
vec3 curl(vec3 p){ float e=.1; vec3 dx=vec3(e,0,0),dy=vec3(0,e,0),dz=vec3(0,0,e);
  vec3 x0=pot(p-dx),x1=pot(p+dx),y0=pot(p-dy),y1=pot(p+dy),z0=pot(p-dz),z1=pot(p+dz);
  return vec3(y1.z-y0.z-(z1.y-z0.y), z1.x-z0.x-(x1.z-x0.z), x1.y-x0.y-(y1.x-y0.x))/(2.*e); }
// 吸引子：输入"状态空间坐标" s，输出导数
vec3 aizawa(vec3 s){ float a=.95,b=.7,c=.6,d=3.5,e=.25,f=.1;
  return vec3((s.z-b)*s.x-d*s.y, d*s.x+(s.z-b)*s.y, c+a*s.z-s.z*s.z*s.z/3.-(s.x*s.x+s.y*s.y)*(1.+e*s.z)+f*s.z*s.x*s.x*s.x); }
vec3 thomas(vec3 s){ float b=.208186; return vec3(sin(s.y)-b*s.x, sin(s.z)-b*s.y, sin(s.x)-b*s.z); }
vec3 lorenz(vec3 s){ return vec3(10.*(s.y-s.x), s.x*(28.-s.z)-s.y, s.x*s.y-(8./3.)*s.z); }
void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  vec4 d=texture2D(texturePosition,uv); vec3 p=d.xyz; float life=d.w;
  vec3 v=vec3(0.);
  if(uMode==0){ v=curl(p*.35+uTime*.05)*1.2; vec3 m=uMouse-p; v+=m*.6/(1.+dot(m,m)); }      // 流场 + 鼠标吸引
  else if(uMode==1){ float S=2.2;  p+=aizawa(p/S)*S*uDt*.6; }                                   // 吸引子：state=p/S，世界尺度=S
  else if(uMode==2){ float S=.7;   p+=thomas(p/S)*S*uDt*3.; }
  else            { float S=.12;  p+=lorenz(p/S)*S*uDt*.35; }
  if(uMode==0) p+=v*uDt*uSpeed;
  p+=normalize(p+1e-4)*uBurst*.15;                                                              // 点击爆发的径向冲量
  life-=uDt*.12*(.5+hash12(uv)); 
  if(life<0.||uReset>.5){ vec3 r=vec3(hash12(uv+uTime),hash12(uv*1.7+uTime),hash12(uv*2.3+uTime))-.5;
    p=(uMode==0? r*5. : r*1.2+vec3(.1,0.,0.)); life=.6+hash12(uv*3.1)*.8; }
  gl_FragColor=vec4(p,life); }
```
（吸引子的 S 与 dt 倍率为推荐初值，请调到"形状清晰、粒子不飞散"为止；切换模式时 `uReset=1` 持续一帧。）
- 渲染：`THREE.Points`，几何 `position` 填 0 + `reference` 属性（每粒子在纹理中的 uv）；顶点 shader 取位置，`gl_PointSize` 随寿命衰减、随距离缩放；片元圆点软边，颜色按速度/寿命映射 FROST→ACID→BONE，`AdditiveBlending, depthWrite:false`。鼠标 3D 位置：指针射线与 z=0 平面求交。相机缓慢自转 + 视差。
- 面板：模式按钮（Flow/Aizawa/Thomas/Lorenz）+ Speed 滑块；说明块显示当前粒子数（如 `1,048,576 PARTICLES`，随档位变化）。
【降级方案】粒子数降一档，`HalfFloat` 抖动严重时改用 Float。
验收：百万粒子流动成丝带，切换吸引子形态清晰，点击有爆发。

### M6 展厅 004 LATTICE（4 万实例晶格）
- `InstancedMesh(BoxGeometry(.8,1,.8), ShaderMaterial, N*N)`，用 `InstancedBufferAttribute aGrid(vec2, 0..1)` 存格点坐标（不使用 instanceMatrix 做变换，`frustumCulled=false`）。
- 顶点 shader：高度 `h = vnoise(aGrid*3.+uTime*.15)*.6 + .4*sin(length(aGrid-.5)*18.-uTime*1.4) + 音频低频项 + Σ冲击波项`；冲击波：uniform 数组 `uShock[3]`（xy=格点坐标，z=起始时间，w=振幅）→ `amp*exp(-pow(d-(uTime-start)*9.,2.)*.5)*exp(-(uTime-start)*.8)`。把 box 的 y∈[-.5,.5] 映射为 `[0,1]*(0.15+h*H)` 并平移到格点位置。
- 片元：低处 INK+FROST 微光，高处渐变到 ACID，顶面更亮；加边缘轮廓光（基于法线与视线）、距离雾（淡入 INK）。
- 交互：点击射线对地面平面求交 → 写入一个冲击波槽位（轮换）；拖动环绕相机；全局低频（来自音频引擎，未开声音时用 0）微弱驱动整体起伏。面板：Amplitude、Wave speed。
【降级方案】实例数降档；若自定义 shader 出问题，用 MeshStandardMaterial + 在 CPU 更新 instanceMatrix（降到 90×90）。
验收：整片晶格如海面般起伏，点击冲击波环向外扩散。

### M7 展厅 005 ECHO（合成器 + FFT 瀑布）+ 音频引擎
**`audio/engine.ts`**：`AudioContext`，主链路 `voices → lowpass → master → analyser → destination`，另有 delay 反馈回路（0.42s，反馈 0.45）营造空间感。
- 环境铺底（drone）：每个展厅不同根音（001:110Hz，002:98，003:87.3，004:82.4，005:关闭 drone 改乐器，006:55 并加深沉次低频），用 2~3 个略失谐的 sawtooth/triangle 振荡器 + 0.07Hz LFO 调制滤波器；切换展厅用 `setTargetAtTime` 平滑变调。
- UI 音效：悬停细微滴答、点击确认音、转场"冰裂"噪声爆（白噪声 + 高通 + 快速包络）。
- 每帧提供 `bass/mid/high`（0~1，供 Bloom、晶格等使用）与原始 FFT 数据。
- 默认静音，用户通过 Loader 或 SOUND 开关启用后 `ctx.resume()` 并淡入。

**ECHO 展厅：**
- 乐器：鼠标 X 映射到 A 小调五声音阶（A2 110、C3 130.81、D3 146.83、E3 164.81、G3 196、A3 220、C4 261.63、D4 293.66、E4 329.63、G4 392、A4 440、C5 523.25，量化），Y 控制滤波截止（200~4000Hz）与音量；按下发声、松开释放（ADSR）；每个音为 saw + sub-sine，经过 delay。
- 可视化：**FFT 瀑布（Joy Division《Unknown Pleasures》式）**：128 频点 × 64 行历史，存入 `DataTexture(RedFormat, UnsignedByteType)`（每帧写入一行，环形缓冲 + `uRow` 偏移，`NearestFilter`），渲染一个 `PlaneGeometry(10,6,127,63)`，顶点 shader 采样纹理位移 y；片元：底色 INK（遮挡后方行）+ 行线 `1.-smoothstep(0.,.08,abs(fract(rowCoord+.5)-.5))` 用 ACID 绘制，越高越亮；相机低角度。背景加入"宇宙微波背景"稀疏闪烁点（Points，噪声闪烁，颜色 FROST）；指针处显示一个随音高缩放的发光环。
- 面板：Octave 偏移、Delay 湿度。未开声音时展厅用内部虚拟频谱（正弦合成数据）演示，并在 HUD 提示 `ENABLE SOUND`。
【降级方案】若 DataTexture 流程出错，改用 64 条 `THREE.Line` + CPU 更新。
验收：能"演奏"并看到瀑布起伏，无声模式下也有演示动画。

### M8 中庭 ATRIUM（主页，最重要的"门面"）
**构图：** 一座无边黑暗大厅。远处墙面悬浮巨幅"铬金属标题" `KELVIN ZERO`（位置约 y=4.2, z=-16，宽 ~26 单位）；前景是一圈由 6 个竖向"门户"组成的环形展架（半径 ~5.5，每 60° 一个，门户尺寸 2.6×3.6，面朝外，前方那个正对相机）；地面是镜面反射 + 径向网格；空气中漂浮尘埃粒子与自上而下的光束。相机位置 `(0,1.6,12)` 看向 `(0,1.8,0)`，空闲时缓慢漂移，鼠标视差。
**细节：**
1. **铬金属标题 `chromeText.frag.glsl`**：用离屏 Canvas 2D 绘制 `KELVIN ZERO`（黑底白字，粗体，系统字体），生成带 mipmap 的 `CanvasTexture`；shader 用 `textureLod(tText, uv, 3.0)` 取"模糊高度"，对其做有限差分求法线 `n=normalize(vec3(-dx*S,-dy*S,1.))`，`r=reflect(vec3(0,0,-1),n)` → `studio(r)` 采样环境，叠加菲涅尔与 `iri()` 虹彩，以文字亮度作为遮罩。形成"假挤出的液态铬字"，并随鼠标缓慢扫过高光。
2. **门户 `portal.frag.glsl`**：圆角矩形遮罩；显示对应展厅缩略图（RT 纹理），带轻微视差与色散；悬停时亮度提高、出现 1px ACID 外框与角标；背面（DoubleSide）整体压暗。门户上方显示展厅编号小字（可用 Canvas 纹理或 DOM 跟随）。
3. **缩略图预热**：Loader 阶段对每个展厅 `init` 后各渲染约 30 帧到自己的 `thumb`（512×640 RT），之后冻结；**只有悬停/聚焦的那个门户**以约 20fps 更新实时画面（其余保持静帧），以节省性能。【降级方案】若预热失败/低档设备，缩略图使用每个展厅一段简单的 2D 渐变 shader 占位。
4. **镜面地面**：`Reflector(PlaneGeometry(60,60),{textureWidth:512,textureHeight:512,clipBias:.003})` 旋转铺地，其上再叠一块半透明径向渐变 + 网格线 + 噪声的 ShaderMaterial 平面（让反射变暗、边缘淡出到 INK）。低档关闭 Reflector，仅保留渐变地面。
5. **光束**：6 道从上方照向门户的锥形体（`ConeGeometry`，加法混合，菲涅尔衰减 shader）；尘埃粒子 2000 个（Points，噪声漂移，在光束中更亮）。
6. **环形转盘交互**：拖动/滚轮/触摸/左右箭头旋转，角度带惯性并**吸附**到最近的 60° 倍数；当前选中的展厅信息显示在 HUD（编号、名称、温度、一句话、`ENTER ↵`）；点击前方门户或按 Enter 进入展厅：相机向门户推进 + 触发霜冻转场。
7. 底部 `MANIFESTO` 按钮 → 全屏文字浮层（逐行遮罩入场，背景暗化并轻微模糊 canvas），Esc 或 `CLOSE` 关闭。
8. 初次进入的 3 秒内显示操作提示：`DRAG · WHEEL · ← →`。
验收：中庭构图震撼，转盘顺滑吸附，缩略图正确，点击进入对应展厅。

### M9 索引页 + 绝对零度 + 细节打磨
- **索引页（`#/index`）**：左侧 DOM 巨型行列表（6 行，每行：编号 / 超大英文名 / 中文名 / 温度 / 技术简称），悬停某行 → WebGL 中一块跟随光标的缩略图平面（带速度驱动的位移/色散，lerp 跟随，画面为该展厅 `thumb`）；点击进入展厅（霜冻转场）。底部显示一行统计：`6 EXHIBITS · 4 RAYMARCHED/SIMULATED ON GPU · 0 EXTERNAL ASSETS`（内容可自行润色，但保持事实一致）。
- **绝对零度模式（Z）**：见 5.5。
- 光标、自定义 HUD 交互音效、所有按钮的磁吸/悬停反馈、`prev/next` 展厅箭头、键盘全覆盖（←→ 切换展厅，Esc 回中庭，Space 视展厅而定，数字键视展厅而定）。
- 展厅页面左侧说明块与参数面板在转场结束后再入场，避免遮挡。

### M10 性能、降级、无障碍、文档
- perf 自适应联调；低档设备实际验证可用。
- WebGL2 检测失败：显示纯 DOM 降级页（使用第 1 节文案，列出六个展厅与一句话，样式沿用设计系统）。
- `prefers-reduced-motion`：关闭相机晃动/自转与转场夸张效果。
- 无障碍：语义化标签；所有按钮 `aria-label`；Tab 顺序合理；Esc 关闭浮层；DOM 中保留全部展厅文案（供读屏与 SEO）；文字对比度达标。
- SEO：`<title>KELVIN ZERO — 零度美术馆</title>`、description（用主标语）、`theme-color #050507`、og 标签、内联 SVG favicon（一个 `0°` 小标）。路由切换时更新 `document.title`。
- 所有 `dispose()`、事件解绑检查；README：启动命令、技术清单→文件映射、各展厅算法说明（每个 3~5 行）、降级项、已知限制。
- 全量过一遍第 8 节验收清单。

## 7. 技术覆盖清单（全部必须落地，并在 README 中标注文件）

1. 单 renderer SPA + hash 路由 + 展厅生命周期管理
2. 自定义 Pass（RoomPass）接入 EffectComposer
3. Voronoi 霜冻 shader 转场（双 RT 混合）
4. GPGPU 百万粒子 + 旋度噪声 + 三种奇异吸引子
5. Gray–Scott 反应扩散（GPU ping-pong）+ 高度场光照
6. 光线步进 SDF 液态金属（smooth union、色散反射）
7. 黑洞：测地线光线偏折、吸积盘、多普勒增亮、光子环、引力透镜星空
8. InstancedMesh 4 万实例 + 顶点位移 + 冲击波
9. WebAudio 合成（多振荡器/滤波/延迟）+ FFT 瀑布 + 音频驱动视觉
10. 程序化摄影棚环境 + 铬金属/虹彩材质；Canvas 文字 → mipmap 高度 → 铬字 shader
11. Reflector 镜面地面 + 光束 + 尘埃粒子
12. 缩略图 RT 预热 + 只更新被聚焦者的节流策略
13. 自定义最终后处理（色散/颗粒/暗角/霜冻边缘）+ Bloom
14. 自适应性能分档；时间膨胀"绝对零度"模式（全局时钟缩放）
15. 全套 HUD/光标/文字入场/滚动计数/跑马灯等界面工程

## 8. 最终验收清单（全部打勾才算完成）

- [ ] `npm install && npm run build` 0 错误；`npm run dev` 控制台无报错；Network 无任何外域请求
- [ ] Loader 启动序列、`ENTER GALLERY`/`ENTER SILENT` 正常
- [ ] 中庭：铬字标题、6 个门户（缩略图正确）、镜面地面、光束、尘埃；转盘拖动/滚轮/键盘/吸附全部顺滑；Manifesto 浮层可开关
- [ ] 6 个展厅逐一可进入且效果达成（001 图灵可画图案 / 002 水银跟随鼠标 / 003 百万粒子 4 种模式 / 004 晶格冲击波 / 005 可演奏且瀑布起伏 / 006 黑洞可环绕）
- [ ] 展厅间切换为霜冻结晶转场，且有冰裂音效（开声音时）
- [ ] 索引页悬停预览 + 点击进入
- [ ] 绝对零度模式（Z）：时间近乎冻结、霜冻边缘、温度读数归零、音频变闷，可恢复
- [ ] HUD：温度读数滚动、跑马灯、FPS/档位、指针坐标、参数面板每展厅 2~3 控件
- [ ] 性能分档自适应可工作；低档设备可用；WebGL2 缺失有降级页；减少动态效果模式可用
- [ ] 语义化 HTML、skip link、键盘可达、SEO meta 齐全
- [ ] README.md 完整；PROGRESS.md 所有里程碑已打勾，降级项已记录

## 9. 禁止事项

- 禁止使用外部图片、视频、字体、模型、CDN；禁止出现任何网址与备案信息；禁止 Lorem ipsum 与占位图
- 禁止擅自新增第 3 节之外的依赖
- 禁止没有 build 通过就勾选里程碑
- 禁止输出"由于篇幅省略"之类的残缺代码
- 禁止用 localStorage 保存必须状态
- 禁止引入与设计系统冲突的新配色（只允许 INK/BONE/ACID/FROST/SIGNAL）