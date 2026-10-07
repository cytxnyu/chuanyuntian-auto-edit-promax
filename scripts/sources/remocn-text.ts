/** Bind source copy to native Remocn props without introducing upstream demo claims. */
export const splitRemocnText = (text: string, count = 5): string[] => {
  const normalized = text.replace(/\r\n?/g, '\n').trim();
  if (!normalized) throw new Error('Remocn text binding requires nonempty source text.');
  const graphemes = Array.from(new Intl.Segmenter('zh', {granularity: 'grapheme'}).segment(normalized), (x) => x.segment);
  if (graphemes.length < count) {
    // Native teaser always has five statements. Short copy repeats only source copy,
    // never the upstream marketing fallback; no source character is dropped.
    return Array.from({length: count}, (_, i) => graphemes[i % graphemes.length]);
  }
  const pieces: string[] = [];
  let from = 0;
  for (let i = 0; i < count - 1; i++) {
    const remaining = graphemes.length - from;
    const slots = count - i;
    const desired = from + Math.round(remaining / slots);
    const radius = Math.max(1, Math.floor(remaining / slots / 4));
    let cut = desired;
    let best = Infinity;
    for (let at = Math.max(from + 1, desired - radius); at <= Math.min(graphemes.length - (slots - 1), desired + radius); at++) {
      const previous = graphemes[at - 1];
      if (/[。！？!?；;，,\s]/u.test(previous) && /\S/u.test(graphemes.slice(from, at).join(''))) {
        const cost = Math.abs(at - desired) - (/[。！？!?；;]/u.test(previous) ? 0.5 : 0);
        if (cost < best) {best = cost; cut = at;}
      }
    }
    pieces.push(graphemes.slice(from, cut).join(''));
    from = cut;
  }
  pieces.push(graphemes.slice(from).join(''));
  // An all-whitespace native statement would trigger demo fallback. Merge its
  // spacing into its neighbor and use a source-derived repetition in that slot.
  return pieces.map((piece) => piece.trim() ? piece : normalized);
};

export const bindRemocnText = (id: string, text: string, title?: string): Record<string, unknown> => {
  if (id !== 'remocn/release-teaser') throw new Error(`No lossless general-copy binding for ${id}; supply its native content props.`);
  const statements = splitRemocnText(text);
  const cleanTitle = title?.trim();
  return {
    statements,
    brandName: cleanTitle || statements[0].trim(),
    release: '',
    tagline: statements[4].trim(),
    audioSrc: undefined,
    volume: 0,
  };
};
