import type { NS } from "@ns";

export async function main(ns: NS) {
  ns.disableLog("ALL");

  for (let power = 3; power <= 20; power++) {
    const newRam = 2 ** power;

    let i = 0;
    while (i < ns.getPurchasedServerLimit()) {
      const hostname = `pserv-${i}`;
      const exists = ns.serverExists(hostname);

      if (exists && ns.getServerMaxRam(hostname) >= newRam) {
        ns.printf(`${hostname}: already upgraded, skipping`);
        i++;
        continue;
      }

      if (
        exists &&
        ns.getServerMoneyAvailable("home") >
          ns.getPurchasedServerUpgradeCost(hostname, newRam)
      ) {
        ns.printf(`${hostname}: upgrading to ${newRam}GB (2^${power})`);
        ns.upgradePurchasedServer(hostname, newRam);
        i++;
      }
      if (
        !exists &&
        ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(newRam)
      ) {
        ns.printf(`${hostname}: buying with ${newRam}GB (2^${power})`);
        ns.purchaseServer(hostname, newRam);
        i++;
      }
      await ns.sleep(100);
    }
  }
}
