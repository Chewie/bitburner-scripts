import {NS} from '@ns';
import {deepScan} from '/lib/common';
import {ContractSolver} from '/lib/contracts';

export async function main(ns: NS) {
  ns.disableLog('scan');

  const cs = new ContractSolver(ns);
  const graph = deepScan(ns, 20);

  for (;;) {
    for (const hostname of graph.keys()) {
      if (hostname == 'home') {
        continue;
      }
      for (const contract of ns.ls(hostname)) {
        if (contract.endsWith('.cct') && !ns.fileExists(contract)) {
          const type = ns.codingcontract.getContractType(contract, hostname);
          if (!cs.solvables.includes(type)) {
            ns.printf(`${hostname}: skipping ${contract}, ${type}`);
            continue;
          }
          ns.printf(`${hostname}: found ${contract}, ${type}`);
          const reward = cs.solve(contract, hostname);
          ns.printf(`Reward: ${reward}`);
        }
      }
    }

    await ns.sleep(1000 * 10 * 60);
  }
}
