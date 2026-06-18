import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: process.env.TSUP_DTS !== "0",
  entry: ["src/index.ts", "src/index.css", 'src/pages/index.ts'],
  format: ["esm"],
  external: ["react", "react-dom", "virtual:mercur/config", "virtual:mercur/routes", "virtual:mercur/components", "virtual:mercur/menu-items", "virtual:mercur/i18n"],
});
