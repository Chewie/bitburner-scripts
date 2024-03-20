import type { AutocompleteData, NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  const pservIndex = ns.args[0] !== undefined ? (ns.args[0] as number) : 0;
  const hostname = `pserv-${pservIndex}`;
  const exists = ns.serverExists(hostname);
  if (!exists) {
    ns.purchaseServer(hostname, 2);
  }
  let power = 3;

  while (power <= 20) {
    const newRam = 2 ** power;
    if (
      ns.getServerMaxRam(hostname) < newRam &&
      ns.getServerMoneyAvailable("home") >
        ns.getPurchasedServerUpgradeCost(hostname, newRam)
    ) {
      ns.printf(`${hostname}: upgrading to ${newRam}GB`);
      ns.upgradePurchasedServer(hostname, newRam);
      power++;
    }
    await ns.sleep(1000);
  }
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
