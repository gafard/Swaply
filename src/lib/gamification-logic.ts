export enum AchievementCode {
  FIRST_PUBLISH = "FIRST_PUBLISH",
  TEN_PUBLISHES = "TEN_PUBLISHES",
  FIRST_SWAP = "FIRST_SWAP",
  TEN_SWAPS = "TEN_SWAPS",
  FIVE_STAR_PILOT = "FIVE_STAR_PILOT",
  LOCAL_LEGEND = "LOCAL_LEGEND",
}

export const XP_REWARDS = {
  PUBLISH_ITEM: 15,
  COMPLETE_EXCHANGE: 50,
  RECEIVE_REVIEW_5: 20,
  RECEIVE_REVIEW_4: 10,
  GIVE_REVIEW: 5,
  DAILY_LOGIN: 2,
};

export function getLevelFromXP(xp: number): number {
  // Simple quadratic scale: level 1 = 0, level 2 = 100, level 3 = 300, level 4 = 600...
  // xp = 50 * (level-1) * level
  if (xp < 100) return 1;
  return Math.floor((1 + Math.sqrt(1 + 8 * xp / 50)) / 2);
}

export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return 50 * (level - 1) * level;
}
