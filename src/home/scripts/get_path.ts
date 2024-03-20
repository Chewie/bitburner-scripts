import type { AutocompleteData, NS } from "@ns";
import * as common from "/lib/common";

export async function main(ns: NS) {
  if (ns.args.length !== 1) {
    ns.tprintf("ERROR missing arg target");
    return;
  }

  let hostname = ns.args[0] as string;

  const graph = common.deepScan(ns);

  const path = [];
  while (hostname !== "") {
    path.push(`connect ${hostname}`);
    hostname = graph.get(hostname)!;
  }
  path.reverse();

  ns.tprintf(path.join("; "));
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
