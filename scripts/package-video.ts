import {StoryboardSchema,type Storyboard} from '../packages/core/src/schema';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {basename, join, resolve} from 'node:path';
import {copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {assertDirectorPlan} from '../packages/core/src/director-validation';
import {probeMedia} from '../packages/core/src/probe';
import {gateABrief, storyboardMarkdown} from '../packages/core/src/reports';
import {parseSrt} from '../packages/core/src/srt';
import {buildContactSheet, decodeEntireFile, detectBlackFrames, extractRepresentativeFrames, frameEvidenceFromFile, selectRepresentativeBeats, writeRenderManifest} from './lib/artifact-qa';
import {approvedGate, requireCumulativeApprovals, requireRenderAuthorization, type Args} from './lib/gates';
import {buildOverlayFfmpegArgs, buildOverlaySequenceFlags, buildRemotionOutputFlags, resolveOutputMode, syntheticOverlayProbe} from './lib/output-mode';
import {draftSourcePlan, withSourcePlan} from '../packages/core/src/source-planner';
import {validateSourceInputs, prepareSourceAssets, sourceUsageManifest} from './lib/source-inputs';
import {buildSourceAudioMuxArgs} from './lib/source-audio';

const parseArgs = (values: string[]): Args => {
  const args: Args = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith('--')) throw new Error(`Unexpected argument: ${value}`);
    const key = value.slice(2);
    const next = values[index + 1];
    if (!next || next.startsWith('--')) args[key] = true;
    else { args[key] = next; index += 1; }
  }
  return args;
};

const required = (args: Args, key: string): string => {
  const value = args[key];
  if (typeof value !== 'string' || !value) throw new Error(`Missing --${key}`);
  return value;
};

const sha256 = (path: string): string => createHash('sha256').update(readFileSync(path)).digest('hex').toUpperCase();

const run = (command: string, values: string[], cwd: string): void => {
  const result = spawnSync(command, values, {cwd, stdio: 'inherit', shell: false, windowsHide: true});
  if (result.status !== 0) throw new Error(`${command} failed with exit code ${result.status ?? 'unknown'}`);
};

const ensurePreviewMedia = (source: string, destination: string, codec: string, cwd: string): void => {
  if (codec === 'h264') {
    copyFileSync(source, destination);
    return;
  }
  run('ffmpeg', ['-y', '-v', 'warning', '-i', source, '-map', '0:v:0', '-map', '0:a?', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', destination], cwd);
};

export const main = (argv = process.argv.slice(2)): void => {
  const args = parseArgs(argv);
  for(const key of ['style-mix','style-seed','style-pool','subject-frames'])if(args[key]!==undefined)throw new Error(`ProMax has no --${key} route; select original sources`);
  if(args['visual-source']!==undefined&&args['visual-source']!=='source-only')throw new Error('ProMax requires --visual-source source-only');
  const srt = resolve(required(args, 'srt'));
  const out = resolve(required(args, 'out'));
  const video = typeof args.video === 'string' ? resolve(args.video) : undefined;
  const outputMode = resolveOutputMode(args, video);
  if (!existsSync(srt)) throw new Error('Input SRT does not exist');
  if (video && !existsSync(video)) throw new Error('Input video does not exist');
  const renderer = typeof args.renderer === 'string' ? args.renderer : 'remotion';
  const captionsMode = typeof args.captions === 'string' ? args.captions : 'burned-in';
  const renderConcurrency = typeof args.concurrency === 'string' ? args.concurrency : '2';
  const renderTimeout = typeof args.timeout === 'string' ? args.timeout : '120000';
  if (!['burned-in', 'none', 'generated'].includes(captionsMode)) throw new Error('Invalid --captions mode');
  if(renderer!=='remotion')throw new Error('ProMax renderer is remotion');
  if (!/^[1-9]\d*$/.test(renderConcurrency) || Number(renderConcurrency) > 16) throw new Error('Invalid --concurrency; expected an integer from 1 to 16');
  if (!/^[1-9]\d*$/.test(renderTimeout) || Number(renderTimeout) < 7000) throw new Error('Invalid --timeout; expected an integer of at least 7000 milliseconds');

  const cues = parseSrt(readFileSync(srt, 'utf8'));
  const width = Number(typeof args.width === 'string' ? args.width : 1920);
  const height = Number(typeof args.height === 'string' ? args.height : 1080);
  const fps = Number(typeof args.fps === 'string' ? args.fps : 30);
  mkdirSync(out, {recursive: true});
  const probe = video ? probeMedia(video) : syntheticOverlayProbe({cues, width, height, fps});
  const gate = approvedGate(args);
  const storyboardFile = typeof args.storyboard === 'string' ? resolve(args.storyboard)
    : gate !== 'A' && existsSync(join(out, 'storyboard.json')) ? join(out, 'storyboard.json') : undefined;
  if (storyboardFile && args['source-plan']) throw new Error('Saved storyboard preserves its source choices; create a new Gate A plan to change sources');
  const previousManifest = join(out, 'input-manifest.json');
  if (gate !== 'A' && existsSync(previousManifest)) {
    const previous = JSON.parse(readFileSync(previousManifest, 'utf8'));
    if (previous.srt?.sha256 !== sha256(srt) || (video ? previous.video?.sha256 !== sha256(video) : previous.video !== null)) {
      throw new Error('Input changed since Gate A; prepare a new matching plan before continuing');
    }
  }
  const id = typeof args.id === 'string' ? args.id : basename(out).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'video-package';
  const base:Storyboard={version:'3.0',sourceMode:'source-only',presentation:'original-sources',id,title:typeof args.title==='string'?args.title:id,duration:probe.duration,width:probe.video.width,height:probe.video.height,fps:probe.video.fps,captionsMode:captionsMode as Storyboard['captionsMode'],source:{video:'input.mp4',srt:'input.srt'},theme:{background:'#000',foreground:'#fff',accent:'#fff'},beats:[],sourceScenes:[]};
  let storyboard=storyboardFile?StoryboardSchema.parse(JSON.parse(readFileSync(storyboardFile,'utf8'))):base;
  if(!storyboardFile){
    if(typeof args['source-plan']==='string'){
      const selection=JSON.parse(readFileSync(resolve(args['source-plan']),'utf8'));
      if(!Array.isArray(selection.scenes)||!selection.scenes.length)throw new Error('Source plan requires scenes');
      storyboard=withSourcePlan(base,selection.scenes,selection.keepLocalBeats??[]);
    }else storyboard=draftSourcePlan(base,cues,{transparent:outputMode==='overlay'});
  }else if(Math.abs(storyboard.duration-probe.duration)>.1||storyboard.width!==probe.video.width||storyboard.height!==probe.video.height||Math.abs(storyboard.fps-probe.video.fps)>.01)throw new Error('Saved storyboard does not match source media');
  assertDirectorPlan(storyboard);
  validateSourceInputs(storyboard);
  writeFileSync(join(out, 'BRIEF.md'), gateABrief({storyboard, probe, cues}), 'utf8');
  writeFileSync(join(out, 'SOURCE_PROBE.json'), `${JSON.stringify(probe, null, 2)}\n`, 'utf8');
  writeFileSync(join(out, 'STORYBOARD.md'), storyboardMarkdown(storyboard), 'utf8');
  writeFileSync(join(out, 'storyboard.json'), `${JSON.stringify(storyboard, null, 2)}\n`, 'utf8');
  if (storyboard.sourceScenes?.length) writeFileSync(join(out, 'SOURCE_USAGE.json'), `${JSON.stringify(sourceUsageManifest(storyboard), null, 2)}\n`, 'utf8');
  writeFileSync(join(out, 'input-manifest.json'), `${JSON.stringify({
    outputMode,
    video: video ? {sha256: sha256(video), size: probe.size, duration: probe.duration, codec: probe.video.codec} : null,
    canvas: {width: probe.video.width, height: probe.video.height, fps: probe.video.fps, duration: probe.duration},
    srt: {sha256: sha256(srt), cues: cues.length},
  }, null, 2)}\n`, 'utf8');

  if (args.render === true && gate !== 'D') requireRenderAuthorization(args);
  if (gate === 'A') {
    process.stdout.write(`Gate A complete: ${out}\n`);
    return;
  }
  requireCumulativeApprovals(args, gate);

  const repo = resolve(import.meta.dirname, '..');
  const publicDir = join(out, 'public');
  mkdirSync(publicDir, {recursive: true});
  if (video) ensurePreviewMedia(video, join(publicDir, 'input.mp4'), probe.video.codec, repo);
  copyFileSync(srt, join(publicDir, 'input.srt'));
  if (storyboard.sourceScenes?.length) prepareSourceAssets(storyboard, repo, publicDir);
  const propsPath = join(out, 'props.json');
  writeFileSync(propsPath, `${JSON.stringify({storyboard, cues, overlayOnly: outputMode === 'overlay'}, null, 2)}\n`, 'utf8');

  if (gate === 'B') {
    process.stdout.write(`Gate B composition inputs ready: ${out}\n`);
    return;
  }
  if (renderer !== 'remotion') throw new Error('Gate C review stills and Gate D final rendering currently require --renderer remotion');

  const entry = join(repo, 'packages', 'remotion-renderer', 'src', 'index.ts');
  const reviewDir = join(out, 'gate-c-review');
  mkdirSync(reviewDir, {recursive: true});
  const reviewFrames = selectRepresentativeBeats(storyboard).map((beat, index) => {
    const file = join(reviewDir, `${String(index + 1).padStart(2, '0')}-${beat.structure}-${beat.timestamp.toFixed(3)}s.png`);
    run(process.execPath, [join(repo, 'node_modules', '@remotion', 'cli', 'remotion-cli.js'), 'still', entry, 'VideoPackaging', file, '--frame', String(Math.round(beat.timestamp * storyboard.fps)), '--props', propsPath, '--public-dir', publicDir, '--timeout', renderTimeout, '--overwrite'], repo);
    return frameEvidenceFromFile(beat, file);
  });
  const reviewContact = buildContactSheet(reviewFrames, join(reviewDir, 'contact-sheet.jpg'));
  writeFileSync(join(out, 'GATE_C_REPORT.json'), `${JSON.stringify({
    status: 'manual-review-required',
    stableFrameProgress: null,
    sampling: 'eight selected original scene readable and motion samples',
    contactSheet: reviewContact,
    frames: reviewFrames.map((frame) => ({...frame, file: basename(frame.file)})),
    blockingChecklist: ['native-assets', 'font-and-copy', 'original-scene-coverage', 'clipping', 'contrast', 'semantic-fit', 'subtitle-continuity', 'scene-handoff'],
    rule: 'Any failed or unchecked item blocks Gate D.',
  }, null, 2)}\n`, 'utf8');

  if (gate === 'C') {
    process.stdout.write(`Gate C review ready; no final video rendered: ${reviewContact}\n`);
    return;
  }

  requireRenderAuthorization(args);
  const renders = join(out, 'renders');
  mkdirSync(renders, {recursive: true});
  const output = join(renders, outputMode === 'overlay' ? 'overlay.mov' : 'packaged.mp4');
  const remotionCli = join(repo, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
  if (outputMode === 'overlay') {
    const sequenceDir = mkdtempSync(join(tmpdir(), 'ai-self-media-overlay-'));
    try {
      const sequenceArgs = [remotionCli, 'render', entry, 'VideoPackaging', sequenceDir, '--props', propsPath, '--public-dir', publicDir];
      sequenceArgs.push(...buildOverlaySequenceFlags(), '--concurrency', renderConcurrency, '--timeout', renderTimeout, '--overwrite');
      run(process.execPath, sequenceArgs, repo);
      run('ffmpeg', buildOverlayFfmpegArgs({
        sequenceDir,
        output,
        fps: storyboard.fps,
        totalFrames: Math.ceil(storyboard.duration * storyboard.fps),
      }), repo);
    } finally {
      rmSync(sequenceDir, {recursive: true, force: true});
    }
  } else {
    const renderArgs = [remotionCli, 'render', entry, 'VideoPackaging', output, '--props', propsPath, '--public-dir', publicDir];
    renderArgs.push(...buildRemotionOutputFlags(outputMode));
    if (storyboard.sourceScenes?.length) renderArgs.push('--muted');
    renderArgs.push('--concurrency', renderConcurrency, '--timeout', renderTimeout, '--disallow-parallel-encoding', '--overwrite');
    run(process.execPath, renderArgs, repo);
    if (storyboard.sourceScenes?.length && video && probe.audio) {
      // Remotion's AAC path can introduce encoder priming. For source-first
      // packaging, retain the continuous original voice rather than re-encode it.
      const muxed = join(renders, 'packaged.source-audio.mp4');
      run('ffmpeg', buildSourceAudioMuxArgs({renderedVideo: output, sourceVideo: video,
        output: muxed, duration: storyboard.duration, audioCodec: probe.audio.codec}), repo);
      copyFileSync(muxed, output);
      rmSync(muxed);
    }
  }
  decodeEntireFile(output);
  const finalFrames = extractRepresentativeFrames(output, storyboard, join(renders, 'qa-frames'));
  buildContactSheet(finalFrames, join(renders, 'contact-sheet.jpg'));
  const manifest = writeRenderManifest({output, storyboard, frames: finalFrames, target: join(out, 'RENDER_MANIFEST.json'), outputMode});
  if (outputMode === 'composite') {
    const blackFrames = detectBlackFrames(output);
    if (blackFrames.length > 0) throw new Error(`Artifact QA failed: detected ${blackFrames.length} black segment(s)`);
  }
  process.stdout.write(`Gate D render complete: ${output}\nSHA-256: ${manifest.output.sha256}\n`);
};

const isDirect = process.argv[1] && existsSync(process.argv[1])
  && realpathSync(resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url));
if (isDirect) main();
