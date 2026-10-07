import {z} from 'zod';
import {SourceSceneSchema} from './source-scenes';
// ProMax has exactly one visual route. Historical local boards belong to Pro.
export const StoryboardSchema = z.object({
  version: z.literal('3.0'), sourceMode: z.literal('source-only'), presentation: z.literal('original-sources'),
  id:z.string().min(1), title:z.string(), duration:z.number().finite().positive(),
  width:z.number().int().positive(),height:z.number().int().positive(),fps:z.number().finite().positive(),
  captionsMode:z.enum(['burned-in','none','generated']),
  source:z.object({video:z.string().min(1),srt:z.string().optional()}).strict(),
  theme:z.object({background:z.string(),foreground:z.string(),accent:z.string()}).strict(),
  beats:z.array(z.never()).max(0).default([]),sourceScenes:z.array(SourceSceneSchema).min(1),
}).strict().superRefine((board,ctx)=>{
  const ids=new Set<string>();
  board.sourceScenes.forEach((scene,i)=>{
    if(ids.has(scene.id))ctx.addIssue({code:'custom',message:`Duplicate scene ID: ${scene.id}`});ids.add(scene.id);
    if(scene.end>board.duration+.001)ctx.addIssue({code:'custom',message:`Scene beyond video duration: ${scene.id}`});
    if(i){const previous=board.sourceScenes[i-1];
      if(scene.start<previous.start)ctx.addIssue({code:'custom',message:'Scenes must be ordered by start'});
      const overlap=previous.end-scene.start;
      if(overlap>.001&&(previous.transitionOut+.001<overlap||scene.transitionIn+.001<overlap))
        ctx.addIssue({code:'custom',message:`Overlapping scenes require matching transition windows: ${scene.id}`});
    }
  });
});
export type Storyboard=z.infer<typeof StoryboardSchema>;
