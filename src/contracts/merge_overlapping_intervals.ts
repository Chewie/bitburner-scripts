import type { NS } from "@ns";

export class MergeOverlappingIntervals {
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }

  solve(intervals: number[][]): number[][] {
    intervals.sort((a, b) => a[0] - b[0]);
    this.ns.tprint(intervals);
    intervals.slice



    for (const current of intervals) {
      intervals = intervals.filter((candidate) => current[1] < candidate[0]);
      this.ns.tprint(intervals);
    }
    this.ns.tprint(intervals);
    return intervals;
  }
}
