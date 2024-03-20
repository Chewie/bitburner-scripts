import type { NS } from "@ns";

export async function main(ns: NS) {
  for (;;) {
    await ns.gang.nextUpdate();
    ns.tprint(JSON.stringify(ns.gang.getOtherGangInformation(), null, 2));
  }
}
