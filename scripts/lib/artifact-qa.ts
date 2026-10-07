import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {basename, join, resolve} from 'node:path';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import type {Storyboard} from '../../packages/core/src/schema';
import {probeMedia} from '../../packages/core/src/probe';
import type {OutputMode} from './output-mode';

export type RepresentativeBeat = {
  id: string;
  timestamp: number;
  structure: 'source-scene';
  presentationMode: 'source-native';
};

export type FrameEvidence = RepresentativeBeat & {
  file: string;
  sha256: string;
  width: number;
  height: number;
};

const runChecked = (command: string, args: string[]): string => {
  const result = spawnSync(command, args, {stdio: 'pipe', shell: false, windowsHide: true, encoding: 'utf8'});
  if (result.status !== 0) {
    throw new Error(`${command} failed: ${(result.stderr || result.stdout || '').trim()}`);
  }
  return `${result.stdout ?? ''}${result.stderr ?? ''}`;
};

const sha256 = (file: string): string => createHash('sha256').update(readFileSync(file)).digest('hex').toUpperCase();

export const probeOutput = (file: string) => probeMedia(file);

export const probePixelFormat = (file: string): string => {
  const output = runChecked('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=pix_fmt', '-of', 'default=noprint_wrappers=1:nokey=1', resolve(file)]).trim();
  if (!output) throw new Error('Unable to read rendered pixel format');
  return output;
};

export const parseAlphaSignalStats = (output: string): {min: number; max: number; samples: number} => {
  const mins = [...output.matchAll(/lavfi\.signalstats\.YMIN=([0-9.]+)/g)].map((match) => Number(match[1]));
  const maxs = [...output.matchAll(/lavfi\.signalstats\.YMAX=([0-9.]+)/g)].map((match) => Number(match[1]));
  if (mins.length === 0 || mins.length !== maxs.length) throw new Error('Unable to read sampled alpha-plane signal statistics');
  return {min: Math.min(...mins), max: Math.max(...maxs), samples: mins.length};
};

export const probeAlphaRange = (file: string): {min: number; max: number; samples: number} => parseAlphaSignalStats(runChecked('ffmpeg', [
  '-v', 'error', '-i', resolve(file),
  '-vf', 'fps=1,alphaextract,signalstats,metadata=print:file=-',
  '-an', '-f', 'null', '-',
]));

export const verifyAlphaChannel = (file: string): {pixelFormat: string; min: number; max: number; samples: number} => {
  const pixelFormat = probePixelFormat(file);
  if (!pixelFormat.startsWith('yuva')) throw new Error(`Transparent overlay is missing an alpha-capable pixel format: ${pixelFormat}`);
  const range = probeAlphaRange(file);
  if (range.min >= range.max) throw new Error(`Transparent overlay contains no sampled alpha variation: ${range.min}–${range.max}`);
  return {pixelFormat, ...range};
};

export const decodeEntireFile = (file: string): void => {
  runChecked('ffmpeg', ['-v', 'error', '-i', resolve(file), '-f', 'null', '-']);
};

export const detectBlackFrames = (file: string): Array<{start: number; end?: number; duration?: number}> => {
  const output = runChecked('ffmpeg', ['-v', 'info', '-i', resolve(file), '-vf', 'blackdetect=d=0.10:pix_th=0.05', '-an', '-f', 'null', '-']);
  const findings: Array<{start: number; end?: number; duration?: number}> = [];
  for (const match of output.matchAll(/black_start:([0-9.]+)(?:\s+black_end:([0-9.]+)\s+black_duration:([0-9.]+))?/g)) {
    findings.push({
      start: Number(match[1]),
      ...(match[2] ? {end: Number(match[2])} : {}),
      ...(match[3] ? {duration: Number(match[3])} : {}),
    });
  }
  return findings;
};

export const selectRepresentativeBeats = (storyboard: Storyboard): RepresentativeBeat[] => {
  if (storyboard.sourceScenes?.length) {
    const spans = [
      ...storyboard.sourceScenes.map((scene) => ({id: scene.id, start: scene.start, end: scene.end, structure: 'source-scene' as const, presentationMode: 'source-native' as const})),
    ].sort((a, b) => a.start - b.start);
    const sampled = spans.length >= 8
      ? Array.from({length: 8}, (_, i) => ({span: spans[Math.floor(i * (spans.length - 1) / 7)], positions: [.72]}))
      : spans.map((span, i) => {
        const count = Math.floor(8 / spans.length) + (i < 8 % spans.length ? 1 : 0);
        const positions = count === 1 ? [.72] : count === 2 ? [.25, .72] : count === 3 ? [.18, .72, .9]
          : count === 4 ? [.15, .4, .72, .9] : [.1, .2, .35, .5, .6, .72, .85, .95].slice(8 - count);
        return {span, positions};
      });
    return sampled.flatMap(({span, positions}) => positions.map((within, i) => ({
      id: `${span.id}-review-${i + 1}`,
      timestamp: Number(Math.min(storyboard.duration - 1 / storyboard.fps, span.start + (span.end - span.start) * within).toFixed(3)),
      structure: span.structure, presentationMode: span.presentationMode,
    })));
  }
  throw new Error('ProMax requires source scenes');
};

export const frameEvidenceFromFile = (beat: RepresentativeBeat, file: string): FrameEvidence => {
  const probe = probeMedia(file);
  return {...beat, file, sha256: sha256(file), width: probe.video.width, height: probe.video.height};
};

export const extractRepresentativeFrames = (file: string, storyboard: Storyboard, targetDir: string): FrameEvidence[] => {
  mkdirSync(targetDir, {recursive: true});
  return selectRepresentativeBeats(storyboard).map((beat, index) => {
    const target = join(targetDir, `${String(index + 1).padStart(2, '0')}-${beat.structure}-${beat.timestamp.toFixed(3)}s.png`);
    runChecked('ffmpeg', ['-y', '-v', 'error', '-ss', String(beat.timestamp), '-i', resolve(file), '-frames:v', '1', target]);
    return frameEvidenceFromFile(beat, target);
  });
};

export const buildContactSheet = (frames: FrameEvidence[], target: string): string => {
  if (frames.length !== 8) throw new Error(`Contact sheet requires exactly eight frames; received ${frames.length}`);
  const inputs = frames.flatMap((frame) => ['-i', resolve(frame.file)]);
  const scales = frames.map((_, index) => `[${index}:v]scale=480:270:force_original_aspect_ratio=decrease,pad=480:270:(ow-iw)/2:(oh-ih)/2:color=0x0b1325[v${index}]`).join(';');
  const filter = `${scales};[v0][v1][v2][v3]hstack=inputs=4[top];[v4][v5][v6][v7]hstack=inputs=4[bottom];[top][bottom]vstack=inputs=2[out]`;
  mkdirSync(resolve(target, '..'), {recursive: true});
  runChecked('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', filter, '-map', '[out]', '-frames:v', '1', '-q:v', '2', resolve(target)]);
  return resolve(target);
};

export const writeRenderManifest = ({output, storyboard, frames, target, outputMode = 'composite'}: {output: string; storyboard: Storyboard; frames: FrameEvidence[]; target: string; outputMode?: OutputMode}) => {
  const probe = probeOutput(output);
  const pixelFormat = probePixelFormat(output);
  const alphaChannel = outputMode === 'overlay' ? verifyAlphaChannel(output) : null;
  const manifest = {
    rendererVersion: '3.0',
    outputMode,
    output: {file: basename(output), sha256: sha256(output), pixelFormat, ...probe},
    storyboard: {id: storyboard.id, duration: storyboard.duration, structures: [],
      sourceScenes: (storyboard.sourceScenes ?? []).map(scene => ({id: scene.id, sourceId: scene.sourceId, revision: scene.revision}))},
    frames: frames.map((frame) => ({...frame, file: basename(frame.file)})),
    visualQuality: {
      stableFrameProgress: null,
      presentationContract: 'source-native; selected scene samples',
      gateCApproval: 'confirmed-before-render',
    },
    fullDecode: 'pass',
    alphaChannel: alphaChannel ? {verified: true, ...alphaChannel} : null,
    blackFrames: outputMode === 'composite' ? detectBlackFrames(output) : [],
  };
  writeFileSync(target, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return manifest;
};
