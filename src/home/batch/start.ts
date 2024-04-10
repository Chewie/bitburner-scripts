import type { AutocompleteData, NS } from "@ns";

import { BatchGenerator } from "/batch/services/batch_generator";
import { PoolManager } from "/batch/services/pool_manager";
import { Prepper } from "/batch/services/prepper";
import { Scheduler } from "/batch/services/scheduler";
import { BatchError } from "/batch/types/errors";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");

  const target = ns.args[0] as string;

  ns.clearPort(ns.pid);

  for (;;) {
    try {
      const prepper = new Prepper(ns, target);
      const batchGenerator = new BatchGenerator(
        ns,
        ns.getServer(target),
        ns.getPlayer(),
      );
      const poolManager = new PoolManager(ns);
      const scheduler = new Scheduler(ns, batchGenerator, poolManager, target);

      await prepper.run();
      await scheduler.run();
    } catch (e) {
      if (e instanceof BatchError) {
        ns.printf(e.message);
        infoDump(ns, target);
        ns.printf("ERROR [CONTROLLER] Batch exception, relaunching.");
        continue;
      }
      throw e;
    }
  }
}

function infoDump(ns: NS, target: string) {
  const currentSec = ns.getServerSecurityLevel(target);
  const minSec = ns.getServerMinSecurityLevel(target);
  const moneyAvailable = ns.getServerMoneyAvailable(target);
  const maxMoney = ns.getServerMaxMoney(target);

  ns.printf(`INFO [SCHEDULER] Current sec: ${currentSec}/${minSec}`);
  ns.printf(
    `INFO [SCHEDULER] Current money: ${ns.formatNumber(
      moneyAvailable,
    )}/${ns.formatNumber(maxMoney)}`,
  );
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
