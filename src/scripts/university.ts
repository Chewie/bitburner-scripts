import type { NS, Server } from "@ns";
import * as common from "/lib/common";

export async function main(ns: NS) {
  const player = ns.getPlayer();

  for (const [kloc, vloc] of Object.entries(ns.enums.LocationName)) {
    for (const [kclass, vclass] of Object.entries(
      ns.enums.UniversityClassType,
    )) {
      ns.tprintf(`${vloc}, ${vclass}`);
      ns.tprint(ns.formulas.work.universityGains(player, vclass, vloc));
    }

  }
}
