import type { NS } from "@ns";
import { ContractSolver } from "/lib/contracts";

export async function main(ns: NS): Promise<void> {
  const cs = new ContractSolver(ns);
  cs.test();
}
