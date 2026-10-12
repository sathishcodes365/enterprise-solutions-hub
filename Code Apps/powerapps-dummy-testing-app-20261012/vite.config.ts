import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { powerApps } from "@microsoft/power-apps-vite/plugin"

const powerAppsPlugins = existsSync(resolve(process.cwd(), "power.config.json"))
  ? [powerApps()]
  : [];

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ...powerAppsPlugins],
});
