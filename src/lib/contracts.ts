import type { NS } from "@ns";

import { CompressionIRLECompression } from "/contracts/compression_i_rle_compression";
import { GenerateIPAddresses } from "/contracts/generate_ip_addresses";
import { MinimumPathSumInATriangle } from "/contracts/minimum_path_sum_in_a_triangle";
import { ShortestPastInAGrid } from "/contracts/shortest_path_in_grid";
import { SubarrayWithMaximumSum } from "/contracts/subarray_max_sum";
import { UniquePathsInAGridI } from "/contracts/unique_paths_in_a_grid_i";
import { MergeOverlappingIntervals } from "/contracts/merge_overlapping_intervals";

interface Solver {
  // biome-ignore lint/suspicious/noExplicitAny: forced by API
  solve(data: any): any;
}

export class ContractSolver {
  ns: NS;
  solvers: Map<string, Solver>;

  constructor(ns: NS) {
    this.ns = ns;

    this.solvers = new Map(
      Object.entries({
        "Subarray with Maximum Sum": new SubarrayWithMaximumSum(this.ns),
        "Shortest Path in a Grid": new ShortestPastInAGrid(this.ns),
        "Unique Paths in a Grid I": new UniquePathsInAGridI(this.ns),
        "Minimum Path Sum in a Triangle": new MinimumPathSumInATriangle(
          this.ns,
        ),
        "Compression I: RLE Compression": new CompressionIRLECompression(
          this.ns,
        ),
        "Generate IP Addresses": new GenerateIPAddresses(this.ns),
        "Merge Overlapping Intervals": new MergeOverlappingIntervals(this.ns),
      }),
    );
  }
  solvables = [
    "Subarray with Maximum Sum",
    "Shortest Path in a Grid",
    "Unique Paths in a Grid I",
    "Minimum Path Sum in a Triangle",
    "Compression I: RLE Compression",
    "Generate IP Addresses",
  ];

  solve(contract: string, hostname: string) {
    const type = this.ns.codingcontract.getContractType(contract, hostname);
    const data = this.ns.codingcontract.getData(contract, hostname);

    if (!this.solvers.has(type)) {
      return "";
    }

    const res = this.solvers.get(type)?.solve(data);

    return this.ns.codingcontract.attempt(res, contract, hostname);
  }

  test() {
    this.ns.tprintf("Running tests...");
    for (const type of this.solvers.keys()) {
      const contract = this.ns.codingcontract.createDummyContract(type);

      this.ns.atExit(() => this.ns.rm(contract));

      const reward = this.solve(contract, "home");

      if (reward === "") {
        this.ns.tprintf(`ERROR ${type}`);
      } else {
        this.ns.tprintf(`OK ${type}`);
      }
    }
  }
}
