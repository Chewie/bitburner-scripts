import type { AutocompleteData, NS } from "@ns";
import * as common from "/lib/common";

export async function main(ns: NS) {

  const graph = common.deepScan(ns);

  await backdoor(ns, graph, "CSEC");
  await backdoor(ns, graph, "avmnite-02h");
  await backdoor(ns, graph, "I.I.I.I");
  await backdoor(ns, graph, "run4theh111z");

}

async function backdoor(ns: NS, graph: Map<string, string>, target: string) {
  common.superNuke(ns, ns.getServer(target));
  let hostname = target;
  const path = [];
  while (hostname !== "") {
    path.push(`${hostname}`);
    hostname = graph.get(hostname)!;
  }
  path.reverse();

  for (const node of path) {
    ns.singularity.connect(node);
  }

  await ns.singularity.installBackdoor();
  ns.singularity.connect("home");
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
