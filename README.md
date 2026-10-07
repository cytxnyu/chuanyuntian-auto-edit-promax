# 川云添 · 自动剪辑 ProMax

以 **Remocn、RemotionUI、video-shotcraft 的原源码**包装真人口播或 SRT。优先完整模板和完整场景，AI 选择并编排镜头、替换真实文案/素材，在必要时做最小适配，不从网站截图重新仿画。

本技能只使用 `source-only` 视觉通道和 Remotion。旧 Pro 独立保留；两者不是同一技能中的切换模式。


维护与发布：[川云添 / cytxnyu](https://github.com/cytxnyu)。
公开仓库：[chuanyuntian-auto-edit-promax](https://github.com/cytxnyu/chuanyuntian-auto-edit-promax)。
这是独立的 **auto-edit-promax** Skill；另一个 [auto-edit-pro 仓库](https://github.com/cytxnyu/chuanyuntian-auto-edit-pro) 使用不同的原生制作方式，不在这里自动切换。

## 安装

环境：Node.js 24+、Git、FFmpeg 与 ffprobe。

```bash
git clone https://github.com/cytxnyu/chuanyuntian-auto-edit-promax.git
cd chuanyuntian-auto-edit-promax
npm ci
npm test
npm run typecheck
```

将**整个仓库**放入你的 Agent Skills 目录，保留 `SKILL.md`、`references/`、`scripts/`、`packages/` 和 `vendor/`；入口名称仍为 `auto-edit-promax`。不要只复制入口文件。固定依赖来自 package-lock.json，源码、字体及来源索引随仓库保存。

## 直接调用

```text
使用 $auto-edit-promax：输入 input.mp4 和 input.srt。
优先三库原版完整模板或场景，让 AI 按台词编排并做必要薄适配，保留连续原声和上游设计。
先给方案；我确认后自动生成预览；最终导出再等我确认。
```

提供已剪辑定稿的视频与严格对应的 SRT。默认输出合成 MP4；需要透明包装层时说明目标画幅、fps，并选择 `overlay`。源片已有字幕时选择 `burned-in`，避免重复字幕。

## 制作流程

| 阶段 | 产出 | 用户确认 |
|---|---|---|
| A | 媒体信息、来源选择、时间线、真实 props/素材与适配方案 | 先确认方案 |
| B | 准备源码、资源和持久化 storyboard | 承接 A，无额外确认 |
| C | 选中场景的代表帧、联系表、修正后的预览 | 检查预览，确认最终导出 |
| D | 成片、完整解码检查、输出哈希与 manifest | 获明确渲染授权后执行 |

镜头编排只改变包装层，不剪动或重排源片声音。合成片保持连续原声，模板音频静音；透明 MOV 无音轨。真实人物遮挡、字幕接续、中文排版和透明区域都以本次预览为准。

## 模型友好的查找与调用

在技能工程目录执行，环境需要 Node.js、FFmpeg 和 ffprobe，以及已安装的锁定依赖。

```bash
npm run sources:recommend -- --query "中文需求" --kind scene --limit 8
npm run sources:show -- --id remotionui/title-card
npm run sources:plan -- --id remotionui/title-card --props props.json --out source-plan.json
npm run package-video -- --video INPUT.mp4 --srt INPUT.srt --source-plan source-plan.json --out RUN --renderer remotion --visual-source source-only
```

这里的 TitleCard 只演示命令，不代表每次都选标题卡。完整成片先查 `--kind template`，需要组合时再查 `--kind component`。`--props` 是按真实组件字段填写的 JSON 文件路径；模型应先读取 `sources:show`，再填写而不是猜参数。

Gate A 获批后自动预览：

```bash
npm run package-video -- --video INPUT.mp4 --srt INPUT.srt --out RUN --approve-gate-a --approve-gate-b
```

确认预览并授权 Gate D 后导出：

```bash
npm run package-video -- --video INPUT.mp4 --srt INPUT.srt --out RUN --approve-gate-a --approve-gate-b --approve-gate-d --render
```

后续阶段复用同一 `RUN` 中的 `storyboard.json`，不重新传来源计划。透明层、时间适配、参数/资源合同见 [原源码使用合同](references/original-sources.md)。代理入口见 [SKILL.md](SKILL.md)。

## 目录与验收状态

- **视觉条目**：完整模板、完整场景、可组合的原版视觉组件；实际 export 已接线才可调用。
- **dependency**：辅助函数、共享模块或转场工厂；不是额外可单独播放的场景。
- **imported/indexed、missing-deps**：按报告处理剩余导入或依赖事项，不当作已接通画面。
- **compile-ready / compile**：静态代码接通；不等于字体/素材可用，也不等于画面已渲染验收。
- **render**：只对报告中实际检查过的内容、参数与版本成立；本次用户内容仍须经过预览。

目录尺寸和时长可能来自上游 Composition，也可能是站点预览或宿主接入窗口。按条目出处区分，不把预览窗口宣传成原作者的固定原生声明。示例品牌、数值、图片和字幕也不自动成为用户的真实材料。

## 更新源码库

```bash
npm run sources:sync
npm run sources:check
```

同步流程批量接入固定版本三库源码与依赖映射，并生成 `model-index.json`、`model-cards.jsonl`。静态检查统一 bundle 一次；制作时预览选中的场景，不为使用少量组件先渲染整个库。源码、许可证、来源哈希、薄适配和验收记录分别保留；最新数量与状态以生成报告为准。


## 公开发行说明

- 本次发布保留所选 skill 的四阶段流程、连续原声和原版场景策略；没有加入任何用户原片、字幕、剪辑工程或比较测试成片。
- `node_modules`、下载缓存和生成的 bundle 由本地安装/构建产生，不随仓库发布。
- 三库上游源码和各自的 MIT / Apache-2.0 许可证、字体 OFL 与署名文件保留。根目录许可不替代第三方资产的独立许可；具体见 [NOTICE](NOTICE)。
- Shotcraft 模板的独立 MP3 音效不随公开仓库分发；原有 [音效来源记录](vendor/video-shotcraft/AUDIO_ATTRIBUTION.md)保留。包装流程沿用模板静音路径，只复制所需视觉素材，静音时不加载模板音效节点，用户原片的音轨仍连续保留。
- 上游模板中可选音效的源代码引用和历史哈希用于追溯，并不表示音频原件附带分发。独立使用带声音的模板时，需自行准备相应素材。不要把维护同步下载的音频作为仓库文件提交。
- 上游演示视频与生成验证 bundles 不作为成片证据；本次选择的场景仍须经过真实 Gate C/D。

## 开发与反馈

```bash
npm test
npm run typecheck
npm run sources:check
```

问题反馈：[GitHub Issues](https://github.com/cytxnyu/chuanyuntian-auto-edit-promax/issues)。发布核验记录见 `PUBLIC_RELEASE.json`；源码版本、来源及资产的既有记录保留在 `vendor/`。
