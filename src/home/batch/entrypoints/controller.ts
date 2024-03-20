import type { AutocompleteData, NS } from "@ns";

import { BatchGenerator } from "/batch/services/batch_generator";
import { Prepper } from "/batch/services/prepper";
import { Scheduler } from "/batch/services/scheduler";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");

  const target = ns.args[0] as string;

  if (ns.args[1] !== undefined) {
    const watchdogPID = ns.args[1] as number;
    ns.atExit(() => ns.writePort(watchdogPID, ns.pid));
  }

  const prepper = new Prepper(ns, target);
  await prepper.run();

  const batchGenerator = new BatchGenerator(ns, target);
  const scheduler = new Scheduler(ns, batchGenerator, target);
  await scheduler.run();
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
