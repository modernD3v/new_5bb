/**
 * Feature flags (server-only). Shop is fully built later but hidden at launch.
 * See docs/PLAN.md §12.1.
 */
export function isShopEnabled(): boolean {
  return process.env.SHOP_ENABLED === "true";
}
