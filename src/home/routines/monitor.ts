import type { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  for (;;) {
    await ns.nextPortWrite(ns.pid);
    ns.printf(ns.readPort(ns.pid));
  }
}
