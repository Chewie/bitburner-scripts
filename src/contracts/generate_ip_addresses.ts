import type { NS } from "@ns";

export class GenerateIPAddresses {
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }

  solve(input: string): string[] {
    const ret = this.#solve_rec(input, 0, []);
    return ret;
  }

  #solve_rec(input: string, index: number, blocks: string[]): string[] {
    if (index > input.length || blocks.some((block) => +block > 255)) {
      return [];
    }
    if (blocks.length === 4 && index === input.length) {
      return [blocks.join(".")];
    }
    const offsets = input[index] === "0" ? [1] : [1, 2, 3];
    return offsets
      .map((offset) =>
        this.#solve_rec(
          input,
          index + offset,
          blocks.concat(input.slice(index, index + offset)),
        ),
      )
      .reduce((acc, cur) => acc.concat(cur), []);
  }
}
