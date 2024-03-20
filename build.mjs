import { context } from "esbuild";
import { BitburnerPlugin } from "esbuild-bitburner-plugin";

const createContext = async () =>
  await context({
    entryPoints: ["src/**/*.js", "src/**/*.jsx", "src/**/*.ts", "src/**/*.tsx"],
    outbase: "./src/",
    outdir: "./build/",
    plugins: [
      BitburnerPlugin({
        port: 12525,
        types: "NetscriptDefinitions.d.ts",
        pushOnConnect: true,
        mirror: {
          // mirror: ["home"],
        },
        distribute: {},
      }),
    ],
    bundle: true,
    format: "esm",
    platform: "browser",
    logLevel: "debug",
  });

const ctx = await createContext();
ctx.watch();
