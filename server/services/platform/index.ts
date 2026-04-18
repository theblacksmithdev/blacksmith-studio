import { PlatformInfo } from "./platform-info.js";

/**
 * Default shared instance for quick lookups. Prefer this for small
 * helpers / one-off checks. For classes that want the primitive to be
 * injectable in tests, accept `PlatformInfo` through the constructor
 * and pass this instance from main.ts / the composition root.
 */
export const platform = new PlatformInfo();

export { PlatformInfo };
export type { PlatformId } from "./platform-info.js";
