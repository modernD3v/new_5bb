/**
 * Tunable scoring weights — keep all formula knobs here (docs/PLAN.md §7.4).
 */
export const WEIGHTS = {
  base: 5,

  recentSnowPerInch: 0.5,
  recentSnowCap: 3,

  weekendSnowPerInch: 0.3,
  weekendSnowCap: 1.5,

  idealTempMinF: 15,
  idealTempMaxF: 30,
  softTempMaxF: 35,
  idealTempBonus: 1,
  warmPenaltyPerDegree: 0.2,
  warmPenaltyCap: 3,
  brutalColdBelowF: 5,
  brutalColdPenalty: 1,

  rainThresholdIn: 0.1,
  rainPerInch: 6,
  rainCap: 4,

  coldNightMaxF: 24,
  snowmakingPerNight: 0.25,
  snowmakingCap: 1,

  gustWarnMph: 30,
  gustSevereMph: 40,
  gustWarnPenalty: 1,
  gustSeverePenalty: 2,

  scoreMin: 1,
  scoreMax: 10,
} as const;

export type Weights = typeof WEIGHTS;
