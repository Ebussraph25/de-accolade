export type AdPlacement = "leaderboard" | "rectangle" | "inline";

/** Where each advert placement shows, and the artwork size to ask advertisers for. */
export const adPlacements: Record<AdPlacement, { label: string; where: string; size: string }> = {
  leaderboard: { label: "Wide banner", where: "Across the home page, between sections", size: "1456 × 180 px (or 728 × 90)" },
  rectangle: { label: "Sidebar box", where: "Beside stories, on section pages and on the home page", size: "600 × 500 px (or 300 × 250)" },
  inline: { label: "Inside stories", where: "In the middle of every story", size: "1200 × 300 px" },
};
