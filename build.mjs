import * as esbuild from "esbuild";

(async () => {
  // actually build
  let ctx = await esbuild.context({
    entryPoints: ["src/main.js"],
    outdir: "./build",
    plugins: [],
    bundle: true,
    loader: {
      ".html": "text",
    },
    sourcemap: true,
    format: "esm",
    // publicPath: "/spa",
    minify: false,
    define: {
      global: "window",
    },
  });

  ctx.watch();
})();
