---
name: auto-edit-promax
description: Package talking-head video or SRT using original Remocn, RemotionUI and video-shotcraft source scenes only, with AI-directed sequencing, minimal autonomous adaptation, continuous original audio and plan/preview/render approvals.
---

# 自动剪辑promax

直接调用三库原源码，不根据网页预览重画效果。优先完整成片模板，其次完整场景，最后用原版组件组合补充。AI 负责理解台词、选择来源、绑定真实内容、编排包装镜头及必要薄适配；尽量保留上游构图、图形、运镜、缓动与内部转场。

本版仅使用 `source-only` 视觉通道和 Remotion 渲染器。旧 Pro 是独立技能，本版的制作、检索与失败处理均不转入旧版流程。

## 快速模型路由

在本技能工程目录执行，先筛少量候选，再按需读源码，不把完整目录灌入上下文：

```bash
npm run sources:recommend -- --query "中文需求" --kind scene --limit 8
npm run sources:show -- --id PROVIDER/SCENE
npm run sources:plan -- --id PROVIDER/SCENE --props props.json --out source-plan.json
npm run package-video -- --video INPUT.mp4 --srt INPUT.srt --source-plan source-plan.json --out RUN --renderer remotion --visual-source source-only
```

- 按完整模板需求改查 `--kind template`，确需组装时再查 `--kind component`。推荐结果只是候选，不代替语义判断。
- `sources:show` 后核对真实 export、参数类型、必需字段、素材、许可证与时间/画幅出处。`--props` 接收 JSON 文件路径；不能假设每个源都支持 `title` 或 `fontFamily`。
- `dependency` 是辅助模块或转场工厂，不是可单独调用的完整画面。`installed` 表示存在可调用导出；静态 `compile` / `compile-ready` 不等于实际画面 `render` 通过。
- 目录中的预览窗口是宿主采用的取景/时间配置；只有上游 Composition 等明确声明的值才称原生声明。查看真实源后决定保留、截取或速度适配，并在方案中写清依据。
- 按真实 SRT 合并多个场景到一个 `scenes` 时间线。直接运行包装 CLI 的初始标题草案只是起点，不能代替检索和导演选型。

字段、接入及时间线细节见 [原源码使用合同](references/original-sources.md)。

## 两次确认，四个阶段

1. **Gate A：只做方案。** 读取全部 SRT，探测并记录视频/字幕哈希、画幅、帧率和时长；SRT-only 锁定用户目标规格。列出场景来源、台词区间、选型理由、真实参数、素材替换、适配和遮挡关系。先交方案，等本次方案明确获批。
2. **Gate B：按获批方案接线。** 准备原源码、素材与持久化 storyboard。B 的 CLI 标志记录获批方案的执行，不再额外向用户重复要一次批准。
3. **Gate C：B 后自动预览。** 对本次选中的场景生成代表帧与联系表，检查起势、稳定可读段、交接、中文溢出、图片/字体加载、原人物与字幕连续性。发现问题在本次方案内做必要修正并重出预览；交给用户检查，停在最终导出之前。
4. **Gate D：明确确认后导出。** 用户确认预览并授权最终渲染后才生成成片；核对 ffprobe、完整解码、代表帧、输出哈希及 manifest。合成片检查黑场与原声音画时序；透明层检查 Alpha 和无音轨。

继续 B/C/D 使用同一 `RUN` 和已保存 `storyboard.json`，不重新挑选来源或重复传 `--source-plan`。素材或方案有实质变化时更新 Gate A。`--gate-b-only` 仅用于用户明确只要接线、不出预览的情况。

```bash
# 本次 Gate A 已获批准：自动完成 B 和 C，不导出最终视频
npm run package-video -- --video INPUT.mp4 --srt INPUT.srt --out RUN --approve-gate-a --approve-gate-b

# 本次预览确认且 Gate D 已获授权：最终渲染与验收
npm run package-video -- --video INPUT.mp4 --srt INPUT.srt --out RUN --approve-gate-a --approve-gate-b --approve-gate-d --render
```

## 内容、声音与薄适配

- 包装镜头编排不重排或剪切真人源片/原声。合成片将模板声音静音，连续复用原片音轨；兼容音轨直接复用，需转码时只做必要的一次。透明包装层不含音轨。
- 只使用当前真实台词与材料；上游品牌、数字、命令输出、截图和示例字幕不是用户事实。原模板没有对应参数时，读取并薄改真实源码，记录改动，不编造通用参数或重新仿制画面。
- 文案、中文字体、长度、画幅、时长、资源与依赖发生实际冲突时，可自主做最小适配，不为每一处技术修正再请求确认。保留原始文件、固定版本、差异、资源许可与来源记录。
- 字体、图片、音频和 3D 数据需按条目准备；静态编译不会证明这些资源在渲染时可读。无参数的硬编码样例按 `source-edit-required` 处理。
- 原视频已带字幕用 `--captions burned-in`；需要唯一生成字幕层时用 `generated`；仅做画面包装时用 `none`。不要重复字幕；有意覆盖时让对应可读内容承接原意。

## 输出与维护

默认 `composite`：提供视频与对应 SRT，交付 `packaged.mp4`。需要叠回剪辑软件时选择 `overlay`：交付无音轨 ProRes 4444 `overlay.mov`；至少提供 SRT、宽高和 fps。只给 SRT 时，没有真实人物位置/手势证据。原版场景的不透明底色不会因输出 MOV 自动透明；使用上游透明参数或必要薄适配，并在 Gate C/D 实测。

```bash
# 透明层 Gate A 示例，仍只产出方案
npm run package-video -- --srt INPUT.srt --source-plan source-plan.json --out RUN --output-mode overlay --width 1920 --height 1080 --fps 30

# 升级/补齐源码时运行，不是每次制作的必做前置
npm run sources:sync
npm run sources:check
```

`sources:sync` 批量处理三库来源、依赖与适配注册，生成 `model-index.json` 和 `model-cards.jsonl` 供快筛。`sources:check` 做静态检查与一次整合 bundle；只对本次选中场景做 Gate C 预览，再做获批成片的 Gate D 验收，不要求整库逐项渲染完整影片。维护报告与用户成片验收分开记录。

## 可复用调用

```text
使用 $auto-edit-promax 处理我的视频和 SRT。优先三库原版完整模板/场景，先检索真实参数，再按台词编排；保留原声和上游设计，必要时自主薄适配。先给 Gate A 方案，确认后自动出预览，最终渲染等我确认。
```
