import { answer, SUGGESTED } from "../src/lib/assistant";
for (const q of [...SUGGESTED, "बरैल में मड लॉस", "cement problems"]) {
  const a = answer(q);
  console.log("\nQ:", q, "|", a.parsed.join("; "));
  console.log(" ", a.intro.slice(0, 220));
  console.log("  bullets", a.bullets.length, "sources", a.sources.length);
}
