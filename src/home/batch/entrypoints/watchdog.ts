import type { AutocompleteData, NS } from "@ns";
import { TaskType } from "../types/batch";

// TODO: Find a way to grab logs from the controller and display them
export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");

  const entryPoint = "/batch/entrypoints/controller.js";
  ns.printf(`INFO [WATCHDOG] Launching ${entryPoint}`);

  for (;;) {
    ns.run(entryPoint, 1, ...ns.args, ns.pid);
    await ns.nextPortWrite(ns.pid);
    ns.readPort(ns.pid);

    ns.printf("ERROR [WATCHDOG] Batcher died, relaunching.");
    ns.printf("INFO [WATCHDOG] Waiting for current tasks to finish...");

    while (
      ns.scriptRunning(TaskType.Hack, "home") ||
      ns.scriptRunning(TaskType.Grow, "home") ||
      ns.scriptRunning(TaskType.Weaken, "home")
    ) {
      await ns.sleep(1000);
    }
    ns.printf("INFO [WATCHDOG] All tasks completed, relaunching.");
  }
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
