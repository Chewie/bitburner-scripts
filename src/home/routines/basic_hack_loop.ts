import type { NS } from "@ns";

export async function main(ns: NS) {
  const target = ns.args[0] as string;

  const moneyThresh = ns.getServerMaxMoney(target);

  const securityThresh = ns.getServerMinSecurityLevel(target);

  for (;;) {
    if (ns.getServerSecurityLevel(target) > securityThresh) {
      await ns.weaken(target);
    } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
      await ns.grow(target);
    } else {
      await ns.hack(target);
    }
  }
}
