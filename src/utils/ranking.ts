export function calculateRank(score: number): string {
    if (score >= 1000) return "ChronoMaster";
    if (score >= 750) return "Legacy Keeper";
    if (score >= 500) return "Time Sentinel";
    if (score >= 250) return "Memory Guardian";
    return "Time Explorer";
}

export function calculateScore(interactions: number, contributions: number, streaks: number): number {
    return (interactions * 2) + (contributions * 3) + (streaks * 5);
}
