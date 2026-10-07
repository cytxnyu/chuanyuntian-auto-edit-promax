# 原源码使用合同

## 目录

- 快筛与状态
- 真实参数和素材
- 时间线与画幅
- Gate 调用
- 批量维护与验收

## 快筛与状态

本技能只从 Remocn、RemotionUI、video-shotcraft 的实际源码选择画面，使用 Remotion 渲染。选型顺序是**完整模板 → 完整场景 → 原版组件组合**；AI 编排包装镜头或沿用完整模板的内部时间线。保留上游设计优先，确有内容、画幅或技术冲突时才做必要薄适配。

```bash
npm run sources:recommend -- --query "中文需求" --kind scene --limit 8
npm run sources:show -- --id PROVIDER/SCENE
```

推荐命令先读取压缩模型索引，避免通读整个源码库。需要完整成片时查 `template`，需要组合时查 `component`。生成的 `model-index.json` 用于检索，`model-cards.jsonl` 提供按条目读取的卡片；以 `sources:show` 和对应真实源文件确认最终用法。

核对这些内容：来源 ID/固定版本、真正 export、条目类别、角色标签、实际参数类型与必需字段、素材文件和许可证、尺寸/fps/时长的出处、导入与验收状态。目录中的辅助函数、共享模块和转场工厂标为 `dependency`；不能把它们当成完整可播放场景或累计为视觉入口。

`installed` 说明真实导出已注册；`compile-ready` / `validationTier=compile` 只说明静态接通。`indexed` / `imported` / `missing-deps` 需根据报告完成注册、依赖或资源处理后再用。渲染通过与否单独记录，不从编译结果推断。历史渲染结果只覆盖其实际代码、参数和素材，不能直接替代当前任务的 Gate C。

## 真实参数和素材

从 `sources:show` 的参数定义、必填清单和源码 props 填写 JSON；各源的字段不统一。`--props` 是文件路径，不是内联 JSON 字符串。通用 `--text` 只适用于已明确实现文案映射的条目；其余使用真实 props。

```bash
npm run sources:show -- --id remotionui/title-card
npm run sources:plan -- --id remotionui/title-card --props props.json --start 0 --duration 3 --out source-plan.json
```

`props.json` 的教学示例（实际任务替换为当前台词）：

```json
{"title":"真实标题","subtitle":"真实补充","eyebrow":"","meta":""}
```

- 参数默认值是上游示例，不是当前视频事实。品牌、交易数字、工具输出、推荐语、截图、人物署名和网址都需来自真实材料；无事实依据时清空对应可选字段或换合适场景。
- 只有 `ReactNode` / JSX 子项的原组件需要显式组合。无可编辑 props 的硬编码样例按 `source-edit-required` 读取并薄改源文件，不杜撰参数。
- 中文字体、长文本、画幅与时长发生实际冲突时，可自主最小适配并记录原因/差异，无需逐次增加用户确认。不要重画原场景、随意替换其配色、构图、运镜或内部转场。
- 保留原文件、固定版本、许可证和 SHA；运行时副本与薄适配分开。登记的 `assets` 是实际复制合同，资源准备后仍检查字体加载和图像/视频内容。
- 场景 `assets: [{file, target}]` 将本次明确提供的文件复制到任务 public 的相对 target。多个场景共享同一 target 时只允许相同替换内容；不同素材使用不同 target 并绑定对应源参数。
- 波形组件的 `audioSrc` 是分析输入，不代替连续原音轨。涉及组件内字幕时，将真实字幕映射到内部场景时间，不能把合成 demo 音频/示例字幕用于真人任务。

## 时间线与画幅

`width`、`height`、`fps`、`durationInFrames` 可能来自上游 Composition、上游预览配置或宿主接入窗口。先查出处和真实实现；**预览窗口不等于原作者的原生声明**。没有独立 Composition 声明的组件，说明使用的是宿主配置，而不是编造“原生整片”。

来源计划由多个 `scenes` 组成：

```json
{
  "scenes": [{
    "id": "opening",
    "sourceId": "remotionui/title-card",
    "start": 0,
    "end": 3,
    "props": {"title":"真实标题","subtitle":"真实补充","eyebrow":"","meta":""},
    "timing": "native",
    "fit": "contain",
    "reason": "直接复用对应台词的原版开场场景",
    "text": "该区间的真实台词",
    "adaptations": [],
    "assets": []
  }]
}
```

- `revision` 省略时由 Gate A 补为已安装固定版本；指定时应准确匹配，不在继续阶段静默换源。
- `timing: native` 按登记的来源时钟播放；`fit` 把所选来源窗口映射到宿主区间。它们是播放策略，不替代元数据出处核查。速度变化、截取窗口、末帧停留都应与台词阅读时间一起检查并记录。
- `sourceStartFrame` 指明来源进入帧；尊重登记窗口及实际动画的有效区间。
- 对随 props 变化的流程或只有宿主预览窗口的条目，读取原始时长函数/动作时间线，按需填写 `nativeDurationInFrames`；CLI 对应 `--native-duration-frames`。这是本次选用的来源窗口，不冒称上游固定声明。未声明固定时长的条目在 `native` 播放时会延长到本次区间，避免被默认预览帧数硬截断；`fit` 仍需准确选择窗口。
- `fit: contain` 等比保全画面；`cover` 等比铺满并裁边。宿主区间、画幅和源画幅不同时先保全构图，再检查阅读区与主体是否被裁切。
- `transitionIn/transitionOut` 以秒表示场景间交接，默认 0。保留模板内部转场；额外重叠应有匹配的交接窗口并在方案中说明。
- 包装层可分段编排，源视频/原声持续按原时间运行。源视频剪辑有变更时重新匹配 SRT 和方案。

## Gate 调用

```bash
# A：方案，不渲染
npm run package-video -- --video INPUT.mp4 --srt INPUT.srt --source-plan source-plan.json --out RUN --renderer remotion --visual-source source-only

# A 已获批准：自动准备 B 并生成 C 预览，停在最终渲染前
npm run package-video -- --video INPUT.mp4 --srt INPUT.srt --out RUN --approve-gate-a --approve-gate-b

# 确认本次预览并授权 D：最终渲染及成片检查
npm run package-video -- --video INPUT.mp4 --srt INPUT.srt --out RUN --approve-gate-a --approve-gate-b --approve-gate-d --render
```

继续阶段复用 `RUN/storyboard.json`，不重新传 `--source-plan`。若只想准备资源，可在获批执行时增加 `--gate-b-only`；常规 B 后自动 C。无显式 source plan 的初始标题草案不是完成的导演选择，呈现方案前仍应检索并按内容选源。

C 检查本次选中场景在当前 props/资源下的起势、稳定可读段和交接；优先检查字体、中文、图片、裁切、字幕接续与真实人物遮挡。问题修正后重新预览。D 要有明确最终渲染授权，并检查成片元信息、完整解码、代表帧和输出哈希。成片里的原声连续性、起点与长度要与源片核对，不能只凭音轨存在就判通过。

合成片将模板声音静音，再连续复用原片音轨；兼容音轨直接复用，其余只进行必要的一次转码。透明层不带音轨。SRT-only overlay 需明确宽高/fps；没有原视频时只做语义与画布检查，不声称已检查真实人物手势。上游不透明背景不会自动变透明；使用上游透明字段或必要薄适配，再核验实际 Alpha。

## 批量维护与验收

```bash
npm run sources:sync
npm run sources:check
```

- 同步脚本批量处理三库原文件、共享依赖、真实 export、适配器和目录，生成 `model-index.json` / `model-cards.jsonl`；生成报告说明接通、缺依赖和辅助模块的区别。每次制作无需重复同步整个库。
- 原版完整源码与许可证留在 `vendor/<provider>/`，保留来源映射而不把上游技能入口安装为当前工作流。
- 静态检查统一完成类型/依赖检查与一次整合 bundle。它不代表批量渲染成功；不要求为了使用少量场景先对所有条目渲染完整影片。
- 新条目先准确标注导入/静态状态；实际选择后做 Gate C 预览，获批的最终任务做 Gate D 验收。记录真实通过范围，不用目录总数代替验收数。
- 需要修改时保持真源导出和最小适配，先修正依赖、字体、素材或时间配置，再验证受影响场景。本版始终在原源码通道内处理。
