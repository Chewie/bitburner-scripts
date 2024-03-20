import type { NS } from "@ns";

export class CompressionIRLECompression {
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }

  solve(input: string): string {
    let output = "";
    let previous = input[0];
    let count = 1;

    for (const current of input.slice(1)) {
      if (current !== previous || count === 9) {
        output = output.concat(count.toString(), previous);
        count = 1;
      } else {
        count++;
      }
      previous = current;
    }
    output = output.concat(count.toString(), previous);
    return output;
  }
}
