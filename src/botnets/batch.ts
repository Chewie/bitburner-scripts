import type { NS, Server } from "@ns";
import * as common from "/lib/common";

export async function main(ns: NS) {
  // ns.disableLog("ALL");
  const graph = common.deepScan(ns);

  for (;;) {
    const servers = [...graph]
      .map(([hostname, _parent]) => ns.getServer(hostname))
      .filter((server) => server.hostname !== "home")
      .filter((server) => common.isHackable(ns, server))
      // .filter(
      //   (server) => server.requiredHackingSkill! <= ns.getHackingLevel() / 2,
      // )
      .toSorted((a: Server, b: Server) => b.moneyMax! - a.moneyMax!);
      // .slice(0, 40);

    for (const server of servers) {
      common.superNuke(ns, server);
      ns.killall(server.hostname);
      common.execShare(ns, server);
    }

    const pservs = ns
      .getPurchasedServers()
      .map((hostname) => ns.getServer(hostname));

    for (const pserv of pservs) {
      ns.killall(pserv.hostname);
      common.execShare(ns, pserv);
    }


    ns.scriptKill("/routines/run_batch.js", "home");
    ns.scriptKill("/tasks/hack.js", "home");
    ns.scriptKill("/tasks/grow.js", "home");
    ns.scriptKill("/tasks/weaken.js", "home");
    const targets = servers.filter((server) => server.moneyMax !== 0);
    for (const target of targets) {
      ns.run("/routines/run_batch.js", 1, target.hostname);
    }
    ns.printf("Sleeping for 1h...");
    await ns.sleep(1000 * 60 * 60);
  }
}
