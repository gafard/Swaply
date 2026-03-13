import prisma from "./prisma";
import { 
  AchievementCode, 
  XP_REWARDS, 
  getLevelFromXP, 
  getXPForLevel 
} from "./gamification-logic";

export { AchievementCode, XP_REWARDS, getLevelFromXP, getXPForLevel };

export async function addXP(userId: string, amount: number, reason: string) {

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true, username: true },
  });

  if (!user) return null;

  const newXP = user.xp + amount;
  const newLevel = getLevelFromXP(newXP);
  const leveledUp = newLevel > user.level;

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXP,
      level: newLevel,
    },
  });

  if (leveledUp) {
    // Notify user of level up
    await prisma.notification.create({
      data: {
        userId,
        type: "LEVEL_UP",
        title: "Nouveau Niveau !",
        body: `Félicitations ${user.username} ! Vous avez atteint le niveau ${newLevel}.`,
        link: "/profile",
      },
    });
  }

  return { leveledUp, newLevel, newXP };
}

export async function checkAndAwardAchievements(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      items: { where: { status: "AVAILABLE" } },
      requesterExchanges: { where: { status: "COMPLETED" } },
      ownerExchanges: { where: { status: "COMPLETED" } },
      achievements: true,
    },
  });

  if (!user) return [];

  const earnedCodes = new Set(user.achievements.map((a) => a.achievementId)); // Actually, this should be achievement.code
  // Re-fetch to get codes more easily or use a mapping
  const existingAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
  });
  const existingCodes = new Set(existingAchievements.map(ea => ea.achievement.code));

  const itemsPublished = await prisma.item.count({ where: { ownerId: userId } });
  const swapsCompleted = user.requesterExchanges.length + user.ownerExchanges.length;

  const toAward: AchievementCode[] = [];

  // 1. FIRST_PUBLISH
  if (itemsPublished >= 1 && !existingCodes.has(AchievementCode.FIRST_PUBLISH)) {
    toAward.push(AchievementCode.FIRST_PUBLISH);
  }

  // 2. TEN_PUBLISHES
  if (itemsPublished >= 10 && !existingCodes.has(AchievementCode.TEN_PUBLISHES)) {
    toAward.push(AchievementCode.TEN_PUBLISHES);
  }

  // 3. FIRST_SWAP
  if (swapsCompleted >= 1 && !existingCodes.has(AchievementCode.FIRST_SWAP)) {
    toAward.push(AchievementCode.FIRST_SWAP);
  }

  // 4. TEN_SWAPS
  if (swapsCompleted >= 10 && !existingCodes.has(AchievementCode.TEN_SWAPS)) {
    toAward.push(AchievementCode.TEN_SWAPS);
  }

  for (const code of toAward) {
    const achievement = await prisma.achievement.findUnique({ where: { code } });
    if (achievement) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });

      // Award XP
      if (achievement.xpReward > 0) {
        await addXP(userId, achievement.xpReward, `Badge débloqué: ${achievement.name}`);
      }

      // Notify
      await prisma.notification.create({
        data: {
          userId,
          type: "ACHIEVEMENT_UNLOCKED",
          title: "Badge Débloqué !",
          body: `Vous avez remporté le badge : ${achievement.name}`,
          link: "/profile",
        },
      });
    }
  }

  return toAward;
}
