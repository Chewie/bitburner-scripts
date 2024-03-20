import type { NS, Server } from "@ns";
import * as common from "/lib/common";

export async function main(ns: NS) {
  // ns.disableLog("ALL");
  const graph = common.deepScan(ns);

  const servers = [...graph]
    .map(([hostname, _parent]) => ns.getServer(hostname))
    .filter((server) => server.hostname !== "home")
    .filter((server) => common.isHackable(ns, server));

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
  const targets = servers
    .filter((server) => server.moneyMax !== 0)
    .filter(
      (server) => server.requiredHackingSkill! <= ns.getHackingLevel() / 2,
    )
    .toSorted(
      (a: Server, b: Server) =>
        b.moneyMax! / b.minDifficulty! - a.moneyMax! / a.minDifficulty!,
    )
    .slice(0, 1);
  const runners = new Map();
  for (const target of targets) {
    const runnerPID = ns.run(
      "/routines/run_batch.js",
      1,
      target.hostname,
      ns.pid,
    );
    runners.set(runnerPID, target.hostname);
  }
  ns.printf("Sleeping until runner falls...");
  for (;;) {
    await ns.nextPortWrite(ns.pid);
    const fallenPID = ns.readPort(ns.pid);
    const target = runners.get(fallenPID);
    ns.printf(`${target} has fallen, relaunching in 5min...`);
    await ns.sleep(1000 * 60 * 5);
    const newPID = ns.run("/routines/run_batch.js", 1, target, ns.pid);
    runners.set(newPID, target.hostname);
  }
}
