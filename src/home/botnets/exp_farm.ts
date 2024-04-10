import type { AutocompleteData, NS, Server } from "@ns";
import * as common from "/lib/common";

export async function main(ns: NS) {
  ns.disableLog("ALL");

  const target = ns.args[0] as string;

  const graph = common.deepScan(ns);

  const bots = [...graph]
    .map(([hostname, _parent]) => ns.getServer(hostname))
    .filter((server) => server.hostname !== "home")
    .filter((server) => common.isHackable(ns, server));

  for (const bot of bots) {
    common.superNuke(ns, bot);
    common.execEternalGrow(ns, bot, target);
  }

  const pservs = ns
    .getPurchasedServers()
    .map((hostname) => ns.getServer(hostname));

  for (const pserv of pservs) {
    common.execEternalGrow(ns, pserv, target);
  }

  common.execEternalGrow(ns, ns.getServer("home"), target);
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
