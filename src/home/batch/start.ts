import type { AutocompleteData, NS } from "@ns";

// Basically a poor man's symlink
export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");

  const entryPoint = "/batch/entrypoints/watchdog.js";

  ns.spawn(entryPoint, 1, ...ns.args);
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
