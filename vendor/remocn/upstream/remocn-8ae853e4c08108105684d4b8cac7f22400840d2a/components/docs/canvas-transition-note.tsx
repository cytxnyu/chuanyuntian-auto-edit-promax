import { Warning } from "@/components/docs/callout";

export function CanvasTransitionNote() {
  return (
    <Warning title="Experimental — html-in-canvas">
      <p>
        This transition post-processes the real pixels of both scenes through
        the experimental html-in-canvas browser API. The preview above shows the
        true effect in Chrome 149+ with{" "}
        <code>chrome://flags/#canvas-draw-element</code> enabled (nested
        canvases need 152.0.7944.0+). Every other browser — Safari, Firefox,
        Chrome without the flag — falls back to a CSS approximation of the same
        cut, so the page and your video still play.
      </p>
      <p>
        Rendering is supported through the CLI, Studio, Lambda and SSR with{" "}
        <code>--gl=angle</code>, or <code>--gl=swangle</code> on a machine
        without a GPU. Chrome may change or discontinue the API; the CSS
        fallback is what keeps your composition renderable if that happens.
      </p>
    </Warning>
  );
}
