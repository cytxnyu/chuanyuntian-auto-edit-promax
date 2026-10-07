import { createHash } from "node:crypto";
import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import {
  ensureBrowser,
  getCompositions,
  renderFrames,
} from "@remotion/renderer";
import { tsconfigWebpackAlias } from "./tsconfig-webpack-alias.mts";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

function getFlag(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && i + 1 < process.argv.length) return process.argv[i + 1];
  const eq = process.argv.find((a) => a.startsWith(`--${name}=`));
  return eq ? eq.slice(name.length + 3) : undefined;
}

function hashFile(file: string): string {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function frameHashes(dir: string): { name: string; hash: string }[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".png"))
    .sort()
    .map((name) => ({ name, hash: hashFile(path.join(dir, name)) }));
}

async function main() {
  const id = getFlag("id") ?? "glitch-cut";
  const from = Number(getFlag("from") ?? "30");
  const to = Number(getFlag("to") ?? "48");
  const gl = (getFlag("gl") ?? "swangle") as "swangle" | "angle" | "vulkan";
  const chromeMode = getFlag("chrome-mode") as
    | "chrome-for-testing"
    | "headless-shell"
    | undefined;

  const outDir = path.join(root, "out", "canvas-spike");
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  await ensureBrowser();

  console.log("Bundling canvas spike entry…");
  const tsAliases = tsconfigWebpackAlias(root);
  const serveUrl = await bundle({
    entryPoint: path.join(root, "src", "remotion", "canvas-spike-root.tsx"),
    webpackOverride: (config) => {
      const existing = Object.entries(config.resolve?.alias ?? {}).map(
        ([name, alias]) => ({
          name: name.replace(/\$$/, ""),
          alias: alias as string,
          onlyModule: name.endsWith("$"),
        }),
      );
      return {
        ...config,
        resolve: { ...config.resolve, alias: [...existing, ...tsAliases] },
      };
    },
  });

  const composition = (
    await getCompositions(serveUrl, { inputProps: {} })
  ).find((c) => c.id === id);
  if (!composition) {
    console.error(`No composition "${id}" in the canvas spike bundle`);
    process.exit(1);
  }

  const probes = new Set<string>();

  const run = async (label: string, concurrency: number) => {
    const dir = path.join(outDir, label);
    mkdirSync(dir, { recursive: true });
    process.stdout.write(
      `Run ${label} (concurrency=${concurrency}, gl=${gl})… `,
    );
    await renderFrames({
      serveUrl,
      composition,
      outputDir: dir,
      inputProps: {},
      imageFormat: "png",
      frameRange: [from, to],
      concurrency,
      chromiumOptions: { gl },
      ...(chromeMode ? { chromeMode } : {}),
      onStart: () => undefined,
      onFrameUpdate: () => undefined,
      onBrowserLog: (log) => {
        if (log.text.includes("[canvas-spike]")) probes.add(log.text.trim());
      },
    });
    console.log("done");
    return dir;
  };

  const dirA = await run("a", 1);
  const dirB = await run("b", 4);

  console.log("");
  for (const probe of probes) console.log(`  ${probe}`);

  const supported = [...probes].some((p) =>
    p.includes("htmlInCanvasSupported=true"),
  );
  const unsupported = [...probes].some((p) =>
    p.includes("htmlInCanvasSupported=false"),
  );

  const a = frameHashes(dirA);
  const b = frameHashes(dirB);
  console.log("");

  if (a.length === 0) {
    console.error("No frames were written — nothing to compare.");
    process.exit(1);
  }
  if (a.length !== b.length) {
    console.error(`Frame count differs: run a=${a.length}, run b=${b.length}`);
    process.exit(1);
  }

  const mismatches = a.filter((frame, i) => frame.hash !== b[i].hash);
  const peak = a[Math.floor(a.length / 2)];
  copyFileSync(path.join(dirA, peak.name), path.join(outDir, "peak.png"));

  console.log(
    `Frames ${from}–${to}: ${a.length} compared, ${mismatches.length} differ`,
  );
  for (const frame of mismatches) console.log(`  differs: ${frame.name}`);
  console.log(
    `Peak frame for eyeballing: ${path.relative(root, path.join(outDir, "peak.png"))}`,
  );
  console.log("");

  if (unsupported) {
    console.log(
      "html-in-canvas was NOT available in the render browser — this run measured the CSS",
    );
    console.log(
      "fallback, which is deterministic on its own. The result says nothing about the canvas",
    );
    console.log("path. Try --chrome-mode chrome-for-testing.");
    process.exit(1);
  }
  if (!supported) {
    console.log(
      "No support probe reached the script. Cannot tell which path rendered — treat as inconclusive.",
    );
    process.exit(1);
  }

  if (mismatches.length > 0) {
    console.log(
      "NOT deterministic: the same frames rendered differently across runs.",
    );
    process.exit(1);
  }
  console.log(
    "Deterministic: identical pixels across two runs at different concurrency, on the canvas path.",
  );
}

main().catch((err) => {
  console.error("\ncanvas-determinism failed:", err);
  process.exit(1);
});
