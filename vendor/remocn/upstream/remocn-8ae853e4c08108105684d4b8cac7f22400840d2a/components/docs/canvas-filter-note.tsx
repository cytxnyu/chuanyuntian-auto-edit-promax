import { Warning } from "@/components/docs/callout";

export function CanvasFilterNote() {
  return (
    <Warning title="Experimental — html-in-canvas">
      <p>
        This filter re-reads the real pixels of the scene it wraps through the
        experimental html-in-canvas browser API. The preview above shows the
        true effect in Chrome 149+ with{" "}
        <code>chrome://flags/#canvas-draw-element</code> enabled (nested
        canvases need 152.0.7944.0+). Every other browser — Safari, Firefox,
        Chrome without the flag — falls back to a CSS approximation, so the page
        and your video still play.
      </p>
      <p>
        Rendering is supported through the CLI, Studio, Lambda and SSR with{" "}
        <code>--gl=angle</code>, or <code>--gl=swangle</code> on a machine
        without a GPU. Chrome may change or discontinue the API; the fallback is
        what keeps your composition renderable if that happens.
      </p>
    </Warning>
  );
}
