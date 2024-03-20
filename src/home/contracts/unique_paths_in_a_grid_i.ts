import type { NS } from "@ns";

export class UniquePathsInAGridI {
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }

  solve(dimensions: number[]) {
    const [height, width] = dimensions;
    const matrix = Array(height)
      .fill(null)
      .map(() => Array(width).fill(0));

    for (let i = 0; i < width; i++) {
      matrix[0][i] = 1;
    }

    for (let j = 0; j < height; j++) {
      matrix[j][0] = 1;
    }

    for (let i = 1; i < width; i++) {
      for (let j = 1; j < height; j++) {
        matrix[j][i] = matrix[j - 1][i] + matrix[j][i - 1];
      }
    }

    return matrix[height - 1][width - 1];
  }
}
