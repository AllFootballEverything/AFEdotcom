/**
 * Primary navigation.
 *
 * This is site structure rather than editorial content, so it lives in code —
 * adding an item here without a matching route would 404, which is not
 * something an editor should be able to do from the studio.
 */
export const NAV_ITEMS = [
  { label: "TRAINING", href: "/training" },
  { label: "WORK WITH AFE", href: "/work" },
  { label: "EXCLUSIVE", href: "/exclusive" },
  { label: "MEMBERS", href: "/members" },
  { label: "SHOP", href: "/shop" },
  { label: "ABOUT", href: "/about" },
] as const;
