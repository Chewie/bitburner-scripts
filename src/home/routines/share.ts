import type { NS } from "@ns";

export async function main(ns: NS) {
  for (;;) {
    await ns.share();
  }
}
