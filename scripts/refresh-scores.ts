import { getWeekendScores } from "../src/lib/snow/get-scores";
import { refreshWeekendScores } from "../src/lib/snow/refresh";

async function main() {
  const r = await refreshWeekendScores({});
  console.log("refresh:", r);
  const scores = await getWeekendScores({ scheduleBackgroundRefresh: false });
  console.log(
    "weekend",
    scores.weekend.saturday,
    "count",
    scores.mountains.length,
  );
  for (const m of scores.mountains) {
    console.log(
      " ",
      m.slug.padEnd(16),
      "score=",
      String(m.score).padStart(4),
      m.label,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
