import type {Storyboard} from './schema';
import type {MediaProbe,SrtCue} from './types';
export const gateABrief=({storyboard,probe,cues}:{storyboard:Storyboard;probe:MediaProbe;cues:SrtCue[]})=>`# Gate A — 自动剪辑promax

- Route: source-only / schema 3.0 / original upstream source
- Title: ${storyboard.title}
- Duration: ${probe.duration.toFixed(3)}s; ${probe.video.width}×${probe.video.height}; ${probe.video.fps}fps
- Voice: ${probe.audio?`${probe.audio.codec}, ${probe.audio.sampleRate}Hz, ${probe.audio.channels}ch`:'none'}; source track remains continuous
- SRT cues: ${cues.length}; captions: ${storyboard.captionsMode}
- Original scenes: ${storyboard.sourceScenes.length}; local visual mode: absent

Approve A to prepare inputs and preview C automatically. Approve D to render.
Bulk registration/import/compile readiness is not a full-render receipt. Review selected scenes in C, especially required assets, typography, original full-screen coverage and subtitles.
`;
export const storyboardMarkdown=(board:Storyboard)=>`# Original-source storyboard

${board.sourceScenes.map(s=>`- **${s.id}** ${s.start.toFixed(3)}–${s.end.toFixed(3)}s: ${s.sourceId}@${s.revision}
  - Reason: ${s.reason}
  - Text: ${s.text}
  - Clock: ${s.timing}; fit: ${s.fit}
  - Props: ${JSON.stringify(s.props)}
  - Adaptations: ${s.adaptations.join('; ')||'native design retained'}`).join('\n')}
`;
