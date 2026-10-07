import {StoryboardSchema, type Storyboard} from './schema';
import {SourceSceneSchema, type SourceScene} from './source-scenes';
import {requireInstalledSource, installedSources} from './source-catalog';
import type {SrtCue} from './types';

// Pinned native TitleCard: 960x540; safe inset 71x50 => 818x440.
// u=min(818/1120,440/620), fontSize=80u=56.774px, maximum text
// push=1.02. Reserving 12% width yields floor(818/(56.774*1.02)*.88)=12
// full-em CJK graphemes. Ignore negative tracking for a conservative bound.
// Only newline props change; the upstream line masks/stagger/easing stay intact.
const TITLE_CARD_CJK_LINE = 12;
const TITLE_CARD_DRAFT_LINES = 3;
const hasCjk = (text: string) => /\p{Script=Han}/u.test(text);
type NativeTextLine = {text: string; end: number};
const cjkLines = (text: string): NativeTextLine[] => {
  const result: NativeTextLine[] = [];
  let line = '', count = 0;
  for (const {segment, index} of new Intl.Segmenter('zh', {granularity: 'grapheme'}).segment(text)) {
    if (/\r?\n/.test(segment)) {
      result.push({text: line, end: index + segment.length}); line = ''; count = 0;
    } else {
      if (count === TITLE_CARD_CJK_LINE) {result.push({text: line, end: index}); line = ''; count = 0;}
      line += segment; count++;
    }
  }
  if (line || !result.length || /\r?\n$/.test(text)) result.push({text: line, end: text.length});
  return result;
};
const nativeTitleText = (text: string) => hasCjk(text) ? cjkLines(text).map(line => line.text).join('\n') : text;
const splitChineseCue = (text: string) => {
  const lines = hasCjk(text) ? cjkLines(text) : [{text, end: text.length}];
  const parts: Array<{text: string; startOffset: number; endOffset: number}> = [];
  let startOffset = 0;
  for (let i = 0; i < lines.length; i += TITLE_CARD_DRAFT_LINES) {
    const endOffset = lines[Math.min(i + TITLE_CARD_DRAFT_LINES, lines.length) - 1].end;
    if (endOffset > startOffset) parts.push({text: text.slice(startOffset, endOffset), startOffset, endOffset});
    startOffset = endOffset;
  }
  return parts.length ? parts : [{text, startOffset: 0, endOffset: text.length}];
};

// Binding copies supplied language. It never imports demo brands, metrics or
// testimonial authors into a real job. Other templates use explicit props.
export const bindSourceText = (id: string, lines: string[], title: string): Record<string, unknown> => {
  const text = lines.join(' ');
  if (id === 'remotionui/title-card') return {title: nativeTitleText(text), subtitle: '', eyebrow: title, meta: ''};
  if (id === 'remotionui/quote-card') return {quote: text, emphasis: '', author: '', role: '', initials: ''};
  if (id === 'remocn/release-teaser') return {text, title, volume: 0};
  if (id.includes('basic-3d')) return {steps: Array.from({length: 4}, (_, i) => ({title: i === 3 ? lines.slice(3).join(' ') : lines[i] ?? '', subtitle: ''}))};
  const entry=requireInstalledSource(id);
  const fields=entry.sourceProps as Array<{name:string;type?:string}>|undefined;
  const names=(fields??[]).filter(f=>/^(text|title|headline|quote|label|heading)$/.test(f.name)&&(!f.type||/string/.test(f.type))).map(f=>f.name);
  if(names.length)return Object.fromEntries(names.map(name=>[name,text]));
  throw new Error(`Source needs explicit props rather than guessed text mapping: ${id}. Inspect it with sources:show.`);
};

export const withSourcePlan = (base: Storyboard, scenes: unknown[], keepLocalBeats: string[] = []): Storyboard => {
  const resolved = scenes.map((value, i) => {
    const raw = value as Partial<SourceScene>;
    const entry = requireInstalledSource(String(raw.sourceId));
    if (raw.revision && raw.revision !== entry.revision) throw new Error(`Pinned source revision mismatch: ${raw.sourceId}`);
    return SourceSceneSchema.parse({...raw, id: raw.id ?? `source-${i + 1}`, revision: entry.revision,
      reason: raw.reason ?? 'Selected upstream original scene; native design retained'});
  });
  if(keepLocalBeats.length)throw new Error('ProMax has no local beat route');
  return StoryboardSchema.parse({...base,version:'3.0',sourceMode:'source-only',presentation:'original-sources',sourceScenes:resolved,beats:[]});
};

export const draftSourcePlan = (base: Storyboard, cues: SrtCue[], {transparent = false}: {transparent?: boolean} = {}): Storyboard => {
  const generic = installedSources().find((entry) => entry.id === 'remotionui/title-card');
  if (!generic) throw new Error('Source-only draft requires the installed original remotionui/title-card');
  const groups: Array<{start: number; end: number; lines: string[]; split: boolean}> = [];
  for (const cue of cues) {
    const parts = splitChineseCue(cue.text);
    for (const part of parts) {
      const length = Math.max(1, cue.text.length), span = cue.end - cue.start;
      const start = cue.start + span * part.startOffset / length;
      const end = cue.start + span * part.endOffset / length;
      const previous = groups.at(-1);
      const candidate = previous ? [...previous.lines, part.text].join(' ') : part.text;
      const fits = hasCjk(candidate) ? cjkLines(candidate).length <= TITLE_CARD_DRAFT_LINES : candidate.length < 65;
      // Long Chinese cues become consecutive draft scenes with all original
      // source-text offsets retained. Timing interpolation is explicit, not
      // a recut or a claim of word-aligned SRT timing.
      if (previous && start - previous.end < .35 && end - previous.start <= 7.5 && fits) {
        previous.end = end; previous.lines.push(part.text); previous.split ||= parts.length > 1;
      } else groups.push({start, end, lines: [part.text], split: parts.length > 1});
    }
  }
  const scenes = groups.map((group, i) => ({
    id: `source-${i + 1}`, sourceId: generic.id, revision: generic.revision,
    start: group.start, end: Math.min(base.duration, group.end),
    props: {...bindSourceText(generic.id, group.lines, base.title), ...(transparent ? {backgroundColor: 'transparent'} : {})},
    timing: 'fit', fit: 'contain', sourceStartFrame: 0,
    text: group.lines.join(' '),
    reason: 'Source-only automatic draft: original title-card scene with source cue text; agent may replace with a better catalog match before Gate A approval',
    adaptations: ['Native scene timeline fitted to its source cue group; original layout/easing retained',
      ...(hasCjk(group.lines.join(' ')) ? ['CJK copy uses native TitleCard newline props: <=12 graphemes/line, conservative 818px safe width / 56.774px headline / 1.02 push; original line animation retained'] : []),
      ...(group.split ? ['Long Chinese cue split without truncation into <=3-line scenes; proportional source-text-offset timing is a draft for manual semantic/reading review, not word timestamps or media recutting'] : []),
      ...(transparent ? ['Native backgroundColor=transparent for the requested alpha overlay'] : [])],
  }));
  return withSourcePlan(base, scenes);
};
