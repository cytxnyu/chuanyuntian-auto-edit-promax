import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import {
  ensureBrowser,
  renderMedia,
  renderStill,
  selectComposition,
} from "@remotion/renderer";
import { tsconfigWebpackAlias } from "./tsconfig-webpack-alias.mts";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const THEMES = ["dark", "light"] as const;

function remotionConcurrency(): number {
  const parsed = Number(process.env.REMOTION_CONCURRENCY);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 4;
}

async function main() {
  const entryPoint = path.join(root, "src", "remotion", "not-found-root.tsx");
  const publicDir = path.join(root, "public");

  await ensureBrowser();

  const tsAliases = tsconfigWebpackAlias(root);

  console.log("Bundling not-found entry…");
  const serveUrl = await bundle({
    entryPoint,
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
        resolve: {
          ...config.resolve,
          alias: [...existing, ...tsAliases],
        },
      };
    },
  });
  console.log("Bundle ready.");

  const concurrency = remotionConcurrency();

  for (const theme of THEMES) {
    const inputProps = { theme };
    const composition = await selectComposition({
      serveUrl,
      id: "not-found",
      inputProps,
    });

    await renderMedia({
      serveUrl,
      composition,
      codec: "h264",
      crf: 28,
      inputProps,
      outputLocation: path.join(publicDir, `not-found-${theme}.mp4`),
      concurrency,
      chromiumOptions: { gl: "swangle" },
      onProgress: ({ progress }) => {
        process.stdout.write(
          `\rnot-found-${theme}.mp4 ${Math.round(progress * 100)}%   `,
        );
      },
    });
    process.stdout.write(`\rnot-found-${theme}.mp4 ✓            \n`);

    await renderStill({
      serveUrl,
      composition,
      frame: 0,
      inputProps,
      output: path.join(publicDir, `not-found-${theme}.jpg`),
      imageFormat: "jpeg",
      jpegQuality: 90,
      chromiumOptions: { gl: "swangle" },
    });
    console.log(`not-found-${theme}.jpg ✓`);
  }

  console.log(`Done. Wrote ${THEMES.length} clip(s) + posters to public/.`);
}

main().catch((err) => {
  console.error("\nrender-not-found failed:", err);
  process.exit(1);
});
