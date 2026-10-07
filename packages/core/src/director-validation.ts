import {StoryboardSchema} from './schema';
export const validateDirectorPlan=(value:unknown):string[]=>{
  const result=StoryboardSchema.safeParse(value);
  return result.success?[]:result.error.issues.map(issue=>`${issue.path.join('.')}: ${issue.message}`);
};
export const assertDirectorPlan=(value:unknown):void=>{
  const issues=validateDirectorPlan(value);if(issues.length)throw new Error(issues.join('\n'));
};
