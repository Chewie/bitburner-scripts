import type { NS } from "@ns";

export class SubarrayWithMaximumSum {
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }

  solve(arr: number[]) {
    let max = arr[0];

    for (let i = 0; i <= arr.length; i++) {
      for (let j = i + 1; j <= arr.length; j++) {
        const candidate = arr.slice(i, j);

        const sum = candidate.reduce((acc, cur) => acc + cur, 0);
        max = Math.max(sum, max);
      }
    }
    return max;
  }
}
