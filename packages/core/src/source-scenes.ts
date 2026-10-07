import {z} from 'zod';

export const SOURCE_PROVIDERS = ['remocn', 'remotionui', 'video-shotcraft'] as const;
export const SourceSceneSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9-]+$/),
  sourceId: z.string().regex(/^(remocn|remotionui|video-shotcraft)\/[a-zA-Z0-9_/-]+$/),
  revision: z.string().regex(/^[a-f0-9]{40}$/i),
  start: z.number().finite().min(0),
  end: z.number().finite().positive(),
  props: z.record(z.string(), z.unknown()).default({}),
  fit: z.enum(['contain', 'cover']).default('contain'),
  timing: z.enum(['native', 'fit']).default('native'),
  sourceStartFrame: z.number().int().min(0).default(0),
  nativeDurationInFrames: z.number().int().positive().max(1000000).optional(),
  reason: z.string().min(1),
  text: z.string().default(''),
  adaptations: z.array(z.string()).default([]),
  assets: z.array(z.object({file: z.string().min(1), target: z.string().min(1)})).default([]),
  transitionIn: z.number().finite().min(0).max(2).default(0),
  transitionOut: z.number().finite().min(0).max(2).default(0),
}).superRefine((scene, ctx) => {
  if (scene.end <= scene.start) ctx.addIssue({code: 'custom', message: 'Source scene duration must be positive'});
  if (scene.transitionIn + scene.transitionOut > scene.end - scene.start) ctx.addIssue({code: 'custom', message: 'Source transition exceeds scene duration'});
});
export type SourceScene = z.infer<typeof SourceSceneSchema>;

export type SourceEntry = {
  id: string; provider: typeof SOURCE_PROVIDERS[number]; title: string;
  kind: 'template' | 'scene' | 'component' | 'dependency'; status: 'indexed' | 'installed' | 'imported' | 'missing-deps';
  revision: string; sourceUrl: string; entry?: string; license: string;
  width?: number; height?: number; fps?: number; durationInFrames?: number;
  defaultProps?: Record<string, unknown>; editableProps?: unknown;
  assets?: Array<{source: string; target: string}>;
  tags?: string[]; adaptations?: string[];
  [key: string]: unknown;
};

export const nativeSourceFrame = (scene: Pick<SourceScene, 'start' | 'end' | 'timing' | 'sourceStartFrame'>,
  localFrame: number, hostFps: number, nativeFps: number, nativeFrames: number): number => {
  const available = Math.max(0, nativeFrames - scene.sourceStartFrame - 1);
  const hostFrames = Math.max(1, Math.round((scene.end - scene.start) * hostFps));
  const elapsed = scene.timing === 'fit'
    ? Math.max(0, localFrame) / Math.max(1, hostFrames - 1) * available
    : Math.max(0, localFrame) * nativeFps / hostFps;
  return Math.min(nativeFrames - 1, scene.sourceStartFrame + Math.floor(elapsed + 1e-7));
};
