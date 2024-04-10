import type { NS } from "@ns";
import { GangManager } from "./gang_manager";



export async function main(ns: NS) {
  const gangManager = new GangManager(ns);

  await gangManager.run();
}
