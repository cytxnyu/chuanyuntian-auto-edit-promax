export const buildSourceAudioMuxArgs = ({renderedVideo, sourceVideo, output, duration, audioCodec}: {
  renderedVideo: string; sourceVideo: string; output: string; duration: number; audioCodec: string;
}): string[] => [
  '-y', '-v', 'error', '-i', renderedVideo, '-i', sourceVideo,
  '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
  '-c:a', ['aac', 'mp3', 'alac', 'ac3', 'eac3'].includes(audioCodec) ? 'copy' : 'aac',
  '-t', String(duration), '-map_metadata', '-1', '-movflags', '+faststart', output,
];
