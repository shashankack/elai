import { writeFileSync } from "fs";
import { join } from "path";
import fg from "fast-glob";
import resolveCwd from "resolve-cwd";
import { packageDirectory } from "pkg-dir";
import { logger } from "@/src/utils/logger";

/**
 * Route directories within @medusajs/medusa to disable.
 * All route.js files under these globs get patched with
 * defineFileConfig({ isDisabled: () => true }).
 *
 * Do NOT patch middleware files  Mercur plugin routes still rely on
 * Medusa's validateAndTransformQuery middleware for /admin/products.
 */
const ROUTE_GLOBS_TO_DISABLE = [
  "dist/api/admin/products/**/route.js",
  "dist/api/admin/product-variants/**/route.js",
];

const DISABLED_ROUTE_CONTENT = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
(0, utils_1.defineFileConfig)({
  isDisabled: () => true,
});
`;

export async function patchMedusa() {
  try {
    const resolved = resolveCwd("@medusajs/medusa");
    const medusaDir = await packageDirectory({ cwd: resolved });

    if (!medusaDir) {
      logger.warn("Could not find @medusajs/medusa package directory, skipping patches.");
      return;
    }

    // Patch route files (defineFileConfig isDisabled)
    for (const glob of ROUTE_GLOBS_TO_DISABLE) {
      const routeFiles = await fg(glob, { cwd: medusaDir, absolute: true });
      for (const routeFile of routeFiles) {
        writeFileSync(routeFile, DISABLED_ROUTE_CONTENT);
      }
    }
  } catch (err) {
    logger.error(`Failed to patch Medusa: ${err}`);
  }
}
