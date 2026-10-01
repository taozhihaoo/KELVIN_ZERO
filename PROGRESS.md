# PROGRESS — KELVIN ZERO · 零度美术馆

> 恢复进度：重读 `SPEC.md` 与本文件。启动：`npm install && npm run dev`。

## 里程碑（SPEC §6）

- [x] M0 脚手架 + 核心
- [x] M1 转场 + HUD + Loader
- [x] M2 展厅 002 MERCURY
- [ ] M3 展厅 006 HORIZON
- [ ] M4 展厅 001 TURING
- [ ] M5 展厅 003 CURL
- [ ] M6 展厅 004 LATTICE
- [ ] M7 展厅 005 ECHO + 音频引擎
- [ ] M8 中庭 ATRIUM
- [ ] M9 索引页 + 绝对零度 + 细节打磨
- [ ] M10 性能、降级、无障碍、文档

## 验收清单（SPEC §8）

- [ ] `npm install && npm run build` 0 错误；`npm run dev` 控制台无报错；Network 无外域请求
- [ ] Loader 启动序列、`ENTER GALLERY`/`ENTER SILENT` 正常
- [ ] 中庭：铬字标题、6 门户、镜面地面、光束、尘埃；转盘顺滑吸附；Manifesto 可开关
- [ ] 6 展厅逐一可进入且效果达成
- [ ] 展厅间霜冻结晶转场 + 冰裂音效
- [ ] 索引页悬停预览 + 点击进入
- [ ] 绝对零度模式（Z）可进可退
- [ ] HUD：温度滚动、跑马灯、FPS/档位、指针坐标、面板 2~3 控件
- [ ] 性能分档自适应；WebGL2 降级页；reduced-motion 可用
- [ ] 语义化 HTML、skip link、键盘可达、SEO meta
- [ ] README 完整；PROGRESS 全部打勾

## 降级项

（暂无）

## 日志

- **M0** 做了什么：vite+ts 脚手架、设计系统 CSS（色板/双 HUD 栏/配准标记/扫描线颗粒/光标）、renderer(no tone mapping, DPR≤2)、clock、input(统一指针/滚轮/键盘)、perf(三档+降升档)、hash 路由、PingPong、Post(RoomPass+Bloom+Final+OutputPass)、SceneManager、8 个占位展厅、WebGL2 降级页。遇到什么：UnrealBloomPass 无 enable/disable 方法（改用 enabled 属性）；一次 build 通过。
- **M1** 做了什么：Voronoi 霜冻转场（双 RT + 点击原点 + gsap expo.inOut）、HUD（品牌/INDEX/SOUND/ABS ZERO、温度滚动计数、路由文案、FPS/档位/指针坐标）、跑马灯、左侧说明块逐字入场、参数面板、Manifesto 浮层、自定义光标、Loader（终端序列+光线步进小球熔融橙→霜白+双进入按钮）、绝对零度骨架。遇到什么：**重大 bug——`#fallback{display:flex}` 覆盖 `hidden` 属性导致空降级页全屏遮挡一切（黑屏）**，加 `[hidden]{display:none!important}` 修复；IAB 后台标签 rAF 节流导致截图动画冻结（环境现象）；grain 调低；loader 步进改 setTimeout 兼容节流。浏览器实测：Loader→中庭→展厅路由、HUD 滚动、107FPS/HIGH，0 报错。
- **M2** 做了什么：mercury.frag.glsl（90 步光线步进 SDF、smin 平滑并集 5 卫星珠+鼠标牵引珠、点击冲击波、studio 程序化环境反射+色散+iri 虹彩）、按 perf 档位低分辨率 RT 渲染再 blit 放大、WARP 滑块面板、uMouse3 lerp、点击 gsap 脉冲衰减；新增 `ui/registry.ts` 供展厅访问共享 UI。遇到什么：**全屏 shader 过曝——SPEC 参考代码是 Shadertoy 直出风格，而管线末端 OutputPass 做 linear→sRGB 会整体抬亮**；解法：全屏展厅 shader 输出统一 `pow(col,2.2)` 编码（该约定将用于所有全屏展厅）。浏览器实测：液态铬质感、跟随、辉光正常，70FPS，0 报错。
