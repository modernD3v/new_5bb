import { WEIGHTS } from "./weights";

export type ScoreInputs = {
  recentSnowIn: number;
  weekendSnowIn: number;
  dayTempF: number;
  rainIn: number;
  coldNights: number;
  maxGustMph: number;
};

export type ScoreResult = {
  score: number;
  label: string;
  reasons: string[];
};

export type IndoorScoreResult = {
  score: null;
  label: "Indoor: always on";
  reasons: string[];
};

type Reason = { text: string; impact: number };

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function scoreLabel(score: number): string {
  if (score >= 8) return "Send it";
  if (score >= 6) return "Solid";
  if (score >= 4) return "Meh";
  return "Skip it";
}

export function indoorScore(): IndoorScoreResult {
  return {
    score: null,
    label: "Indoor: always on",
    reasons: ["Indoor snow, open year-round"],
  };
}

/**
 * Pure weekend snow score. No I/O. Indoor mountains should call `indoorScore()` instead.
 */
export function scoreWeekend(i: ScoreInputs): ScoreResult {
  const w = WEIGHTS;
  let raw = w.base;
  const reasons: Reason[] = [];

  const fresh = Math.min(i.recentSnowIn * w.recentSnowPerInch, w.recentSnowCap);
  raw += fresh;
  if (i.recentSnowIn > 0.1) {
    reasons.push({
      text: `${round1(i.recentSnowIn)} in of fresh snow since Wednesday`,
      impact: fresh,
    });
  }

  const weekendSnow = Math.min(
    i.weekendSnowIn * w.weekendSnowPerInch,
    w.weekendSnowCap,
  );
  raw += weekendSnow;
  if (i.weekendSnowIn > 0.1) {
    reasons.push({
      text: `${round1(i.weekendSnowIn)} in expected Sat–Sun`,
      impact: weekendSnow,
    });
  }

  if (i.dayTempF >= w.idealTempMinF && i.dayTempF <= w.idealTempMaxF) {
    raw += w.idealTempBonus;
    reasons.push({
      text: `Daytime temps around ${Math.round(i.dayTempF)}°F`,
      impact: w.idealTempBonus,
    });
  } else if (i.dayTempF > w.softTempMaxF) {
    const warm = Math.min(
      (i.dayTempF - w.softTempMaxF) * w.warmPenaltyPerDegree,
      w.warmPenaltyCap,
    );
    raw -= warm;
    reasons.push({
      text: `Warm days (~${Math.round(i.dayTempF)}°F)`,
      impact: -warm,
    });
  } else if (i.dayTempF < w.brutalColdBelowF) {
    raw -= w.brutalColdPenalty;
    reasons.push({
      text: `Brutally cold (~${Math.round(i.dayTempF)}°F)`,
      impact: -w.brutalColdPenalty,
    });
  }

  if (i.rainIn > w.rainThresholdIn) {
    const rainPen = Math.min(i.rainIn * w.rainPerInch, w.rainCap);
    raw -= rainPen;
    reasons.push({
      text: `Rain expected (${round1(i.rainIn)} in Fri–Sun)`,
      impact: -rainPen,
    });
  }

  const snowmaking = Math.min(
    i.coldNights * w.snowmakingPerNight,
    w.snowmakingCap,
  );
  raw += snowmaking;
  if (i.coldNights > 0) {
    reasons.push({
      text: `${i.coldNights} cold night${i.coldNights === 1 ? "" : "s"} for snowmaking`,
      impact: snowmaking,
    });
  }

  if (i.maxGustMph > w.gustSevereMph) {
    raw -= w.gustSeverePenalty;
    reasons.push({
      text: `Gusts up to ${Math.round(i.maxGustMph)} mph may hold lifts`,
      impact: -w.gustSeverePenalty,
    });
  } else if (i.maxGustMph > w.gustWarnMph) {
    raw -= w.gustWarnPenalty;
    reasons.push({
      text: `Gusts up to ${Math.round(i.maxGustMph)} mph may hold lifts`,
      impact: -w.gustWarnPenalty,
    });
  }

  const score = Math.min(
    w.scoreMax,
    Math.max(w.scoreMin, Math.round(raw)),
  );

  reasons.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return {
    score,
    label: scoreLabel(score),
    reasons: reasons.slice(0, 4).map((r) => r.text),
  };
}
