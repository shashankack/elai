import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  // Avoid wiping dist on every watch rebuild — that races with Vite and
  // produces "does not provide an export named …" chunk errors in dev.
  clean: !options.watch,
  dts: process.env.TSUP_DTS !== "0",
  entry: ["src/index.ts", "src/index.css", 'src/pages/index.ts'],
  format: ["esm"],
  external: ["react", "react-dom", "virtual:mercur/config", "virtual:mercur/routes", "virtual:mercur/components", "virtual:mercur/menu-items", "virtual:mercur/i18n"],
}));
