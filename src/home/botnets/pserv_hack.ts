import type { NS, Server } from "@ns";
import * as common from "/lib/common";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const graph = common.deepScan(ns);

  for (;;) {
    const bots = [...graph]
      .map(([hostname, _parent]) => ns.getServer(hostname))
      .filter((server) => server.hostname !== "home")
      .filter((server) => common.isHackable(ns, server));

    for (const bot of bots) {
      common.superNuke(ns, bot);
      common.execShare(ns, bot);
    }

    const pservs = ns
      .getPurchasedServers()
      .map((hostname) => ns.getServer(hostname));

    const targets = bots
      .filter(
        (server) => server.requiredHackingSkill! <= ns.getHackingLevel() / 2,
      )
      .toSorted((a: Server, b: Server) => b.moneyMax! - a.moneyMax!);

    for (let i = 0; i < pservs.length; i++) {
      if (targets[i]) {
        common.execHackScript(ns, pservs[i], targets[i].hostname);
      } else {
        common.execHackScript(ns, pservs[i], targets[0].hostname);
        //common.execShare(ns, pservs[i]);
      }
    }

    ns.printf("Sleeping for 1h...");
    await ns.sleep(1000 * 60 * 60);
  }
}
