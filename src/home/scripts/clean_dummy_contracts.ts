import type { NS } from "@ns";

export async function main(ns: NS) {
  for (const contract of ns.ls("home", ".cct")) {
    ns.rm(contract);
  }
}
