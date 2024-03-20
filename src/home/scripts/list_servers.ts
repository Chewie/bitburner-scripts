import type { NS } from "@ns";
import * as common from "/lib/common";

export async function main(ns: NS) {
  const graph = common.deepScan(ns);

  for (const [hostname, _parent] of graph) {
    ns.tprintf(hostname);
  }
}
