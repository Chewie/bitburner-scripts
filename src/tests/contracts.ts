import {ContractSolver} from '/lib/contracts';
import {NS} from '@ns';

export async function main(ns: NS): Promise<void> {
  const cs = new ContractSolver(ns);
  cs.test();
}
