import type { NS } from "@ns";

export class UniquePathsInAGridII {
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }

  solve(map: number[][]) {
    const height = map.length;
    const width = map[0].length;

    map[0][0] = 1;

    for (let i = 1; i < width; i++) {
      if (map[0][i] === 1) {
        map[0][i] = 0;
      } else {
        map[0][i] = map[0][i - 1];
      }
    }

    for (let j = 1; j < height; j++) {
      if (map[j][0] === 1) {
        map[j][0] = 0;
      } else {
        map[j][0] = map[j - 1][0];
      }
    }

    for (let i = 1; i < width; i++) {
      for (let j = 1; j < height; j++) {
        if (map[j][i] === 1) {
          map[j][i] = 0;
        } else {
          map[j][i] = map[j - 1][i] + map[j][i - 1];
        }
      }
    }

    return map[height - 1][width - 1];
  }
}
