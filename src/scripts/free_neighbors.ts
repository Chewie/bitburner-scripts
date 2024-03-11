import type { NS } from "@ns";

export async function main(ns: NS) {
  const neighbors = ns.scan();
  for (const neighbor of neighbors) {
    if (
      ns.getServerNumPortsRequired(neighbor) === 0 &&
      !ns.hasRootAccess(neighbor)
    ) {
      ns.tprintf("nuking %s", neighbor);
      ns.nuke(neighbor);
    }
  }
}
