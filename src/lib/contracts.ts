import {NS} from '@ns';

import {SubarrayWithMaximumSum} from '/contracts/subarray_max_sum';
import {ShortestPastInAGrid} from '/contracts/shortest_path_in_grid';

interface Solver {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  solve(data: any): any;
}

export class ContractSolver {
  ns: NS;
  solvers: Map<string, Solver>;

  constructor(ns: NS) {
    this.ns = ns;

    this.solvers = new Map(
      Object.entries({
        'Subarray with Maximum Sum': new SubarrayWithMaximumSum(this.ns),
        'Shortest Path in a Grid': new ShortestPastInAGrid(this.ns),
      })
    );
  }
  solvables = ['Subarray with Maximum Sum', 'Shortest Path in a Grid'];

  solve(contract: string, hostname: string) {
    const type = this.ns.codingcontract.getContractType(contract, hostname);
    const data = this.ns.codingcontract.getData(contract, hostname);

    if (!this.solvers.has(type)) {
      return '';
    }

    const res = this.solvers.get(type)!.solve(data);

    return this.ns.codingcontract.attempt(res, contract, hostname);
  }

  test() {
    for (const type in this.solvers) {
      const contract = this.ns.codingcontract.createDummyContract(type);

      this.ns.atExit(() => this.ns.rm(contract));

      const reward = this.solve(contract, 'home');

      if (reward === '') {
        this.ns.tprintf(`ERROR ${type}`);
      } else {
        this.ns.tprintf(`OK ${type}`);
      }
    }
  }
}
