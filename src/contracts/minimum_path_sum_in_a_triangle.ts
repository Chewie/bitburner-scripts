import type { NS } from "@ns";

export class MinimumPathSumInATriangle {
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }

  solve(triangle: number[][]): number {
    return this.#solve_rec(triangle, 0, 0);
  }

  #solve_rec(triangle: number[][], row: number, col: number): number {
    const current = triangle[row][col];
    if (row === triangle.length - 1) {
      return current;
    }
    return (
      current +
      Math.min(
        this.#solve_rec(triangle, row + 1, col),
        this.#solve_rec(triangle, row + 1, col + 1),
      )
    );
  }
}
