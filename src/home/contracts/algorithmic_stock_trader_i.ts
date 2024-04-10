import type { NS } from "@ns";

export class AlgorithmicStockTraderI {
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }

  solve(input: number[]): number {
    return input.reduce(
      (acc, cur, i) =>
        Math.max(
          acc,
          input
            .slice(i)
            .reduce(
              (innerAcc, innerCur) => Math.max(innerAcc, innerCur - cur),
              0,
            ),
        ),
      0,
    );
  }
}
