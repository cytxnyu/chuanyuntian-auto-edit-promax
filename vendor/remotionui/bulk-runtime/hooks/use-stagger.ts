import { staggerDelay } from "../lib/timing";

export type UseStaggerOptions = {
  index: number;
  staggerInFrames?: number;
  baseDelayInFrames?: number;
};

export function useStagger({
  index,
  staggerInFrames = 8,
  baseDelayInFrames = 0,
}: UseStaggerOptions): number {
  return staggerDelay(index, staggerInFrames, baseDelayInFrames);
}
