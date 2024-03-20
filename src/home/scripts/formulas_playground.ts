import type { NS, Server } from "@ns";
import * as common from "/lib/common";

export async function main(ns: NS) {
  const home = ns.getServer("home");
  const homeCores = home.cpuCores;
  const graph = common.deepScan(ns);
  const player = ns.getPlayer();

  const servs = [...graph]
    .map(([hostname, _parent]) => ns.getServer(hostname))
    .filter((server) => server.hostname !== "home")
    .filter((server) => common.isHackable(ns, server))
    .toSorted((a: Server, b: Server) => a.moneyMax! - b.moneyMax!);

  for (const serv of servs) {
    serv.hackDifficulty = serv.minDifficulty;
    const chance = ns.formulas.hacking.hackChance(serv, player);
    ns.tprintf(`INFO ${serv.hostname}`);
    ns.tprintf(
      `hack chance: ${chance} (minhack: ${serv.requiredHackingSkill}, minsec = ${serv.minDifficulty})`,
    );
    serv.moneyAvailable = 0;
    const growThreads = Math.ceil(
      ns.formulas.hacking.growThreads(serv, player, serv.moneyMax!, homeCores),
    );
    ns.tprintf(`Grow threads (${serv.moneyMax}): ${growThreads}`);
    const growSecIncrease = ns.growthAnalyzeSecurity(
      growThreads,
      undefined,
      homeCores,
    );
    ns.tprintf(`Growth sec increase: ${growSecIncrease}`);
    serv.moneyAvailable = serv.moneyMax;
    const hackThreads = Math.ceil(
      1 / ns.formulas.hacking.hackPercent(serv, player),
    );
    ns.tprintf(`Hack threads: ${hackThreads}`);
    const hackSecIncrease = ns.hackAnalyzeSecurity(hackThreads, serv.hostname);
    ns.tprintf(`Hack sec increase: ${hackSecIncrease}`);
    const weakenOneThread = ns.weakenAnalyze(1, homeCores);
    ns.tprintf(`Weaken 1 thread: ${weakenOneThread}`);
    const weakenThreadsAfterGrow = Math.ceil(growSecIncrease / weakenOneThread);
    ns.tprintf(`Num threads to weaken from growth: ${weakenThreadsAfterGrow}`);
    const weakenThreadsAfterHack = Math.ceil(hackSecIncrease / weakenOneThread);
    ns.tprintf(`Num threads to weaken from hack: ${weakenThreadsAfterHack}`);
    ns.tprintf(`grow time: ${ns.formulas.hacking.growTime(serv, player)}`);
    ns.tprintf(`hack time: ${ns.formulas.hacking.hackTime(serv, player)}`);
    ns.tprintf(`weaken time: ${ns.formulas.hacking.weakenTime(serv, player)}`);
  }
}
