import type { NS } from "@ns";

export async function main(ns: NS) {
  const target = ns.args[0] as string;

  for (;;) {
    await ns.grow(target);
  }
}
