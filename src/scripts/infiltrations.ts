import type { NS } from "@ns";

export async function main(ns: NS) {
  const infiltrations = ns.infiltration
    .getPossibleLocations()
    .map((loc) => ns.infiltration.getInfiltration(loc.name));

  infiltrations.sort((a, b) => a.difficulty - b.difficulty);
  for (const infiltration of infiltrations) {
    ns.tprint(infiltration);
  }
}
