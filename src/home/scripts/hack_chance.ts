import type { NS, Server } from "@ns";
import * as common from "/lib/common";

export async function main(ns: NS) {
  function sortServers(a: Server, b: Server) {
    const player = ns.getPlayer();
    const aMinSec = { ...a };
    aMinSec.hackDifficulty = aMinSec.minDifficulty!;

    const bMinSec = { ...b };
    bMinSec.hackDifficulty = bMinSec.minDifficulty!;

    const aRes = ns.formulas.hacking.hackPercent(aMinSec, player) * a.moneyMax!;
    const bRes = ns.formulas.hacking.hackPercent(bMinSec, player) * b.moneyMax!;

    return bRes - aRes;
  }

  // ns.disableLog("ALL");
  const graph = common.deepScan(ns);

  const targets = [...graph]
    .map(([hostname, _parent]) => ns.getServer(hostname))
    .filter((server) => server.hostname !== "home")
    .filter((server) => common.isHackable(ns, server))
    .filter(
      (server) =>
        server.requiredHackingSkill! <= Math.ceil(ns.getHackingLevel() / 2),
    )
    .toSorted(sortServers);

  const player = ns.getPlayer();

  for (const target of targets) {
    const hackChance = ns.formulas.hacking.hackChance(target, player);
    ns.tprintf(`Server: ${target.hostname}`);
    ns.tprintf(`Hack difficulty: ${player.skills.hacking}/${target.requiredHackingSkill!}`);
    ns.tprintf(`Hack chance: ${hackChance}`);
  }
}
