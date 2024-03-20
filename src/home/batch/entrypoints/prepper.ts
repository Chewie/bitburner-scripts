import type { AutocompleteData, NS } from "@ns";
import { Prepper } from "/batch/services/prepper";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");

  const target = ns.args[0] as string;

  const prepper = new Prepper(ns, target);
  await prepper.run();
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
