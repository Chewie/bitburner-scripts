import type { NS, Server } from "@ns";
import * as common from "/lib/common";

export async function main(ns: NS) {
  // ns.disableLog("ALL");
  const graph = common.deepScan(ns);

  const target = [...graph]
    .map(([hostname, _parent]) => ns.getServer(hostname))
    .filter((server) => server.hostname !== "home")
    .filter((server) => common.isHackable(ns, server))
    .filter(
      (server) =>
        server.requiredHackingSkill! <= Math.ceil(ns.getHackingLevel() / 2),
    )
    .toSorted(
      (a: Server, b: Server) =>
        b.moneyMax! / b.minDifficulty! - a.moneyMax! / a.minDifficulty!,
    )[0];

  ns.tprint(target.hostname);
}
