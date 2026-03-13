export type UserMetrics = {
  completionRate: number; // 0-100
  avgResponseTime: number; // minutes
  avgPhotoQuality: number; // 0-1
  level: number;
  xp: number;
};

export function calculateSwapCredit(metrics: UserMetrics): number {
  // Weights
  // Completion Rate: 40%
  // Response Time: 20%
  // Photo Quality: 20%
  // XP/Level: 20%

  const completionScore = metrics.completionRate;
  
  // Inverse response time: 0 mins = 100 pts, 24h = 0 pts
  const responseScore = Math.max(0, 100 - (metrics.avgResponseTime / 14.4)); 
  
  const photoScore = metrics.avgPhotoQuality * 100;
  
  const xpScore = Math.min(100, (metrics.level * 5) + (metrics.xp / 1000) * 5);

  const total = (completionScore * 0.4) + (responseScore * 0.2) + (photoScore * 0.2) + (xpScore * 0.2);
  
  return Math.round(total);
}
