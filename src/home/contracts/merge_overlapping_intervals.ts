import type { NS } from "@ns";

export class MergeOverlappingIntervals {
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }

  solve(input: number[][]): number[][] {
    let intervals = input;
    intervals.sort((a, b) => a[0] - b[0]);
    intervals.slice;

    for (let i = 0; i < intervals.length; i++) {
      const prefix = intervals.slice(0, i);
      const pivot = intervals[i];
      const suffix = intervals.slice(i + 1, undefined);

      const newSuffix = [];
      for (const candidate of suffix) {
        if (pivot[1] >= candidate[0]) {
          pivot[1] = Math.max(pivot[1], candidate[1]);
        } else {
          newSuffix.push(candidate);
        }
      }
      intervals = [...prefix, pivot, ...newSuffix];
    }
    return intervals;
  }
}
