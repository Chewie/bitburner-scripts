import type { NS } from "@ns";

export class ArrayJumpingGameI {
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }

  solve(input: number[]): number {
    const dp = [...input].fill(0);
    dp[0] = 1;

    for (let i = 0; i < dp.length; i++) {
      if (dp[i] === 0) {
        continue;
      }
      const maxOffset = input[i];
      for (let j = 1; j <= maxOffset; j++) {
        if (i + j >= input.length) {
          break;
        }
        dp[i + j] = 1;
      }
    }

    return dp.at(-1)!;
  }
}
