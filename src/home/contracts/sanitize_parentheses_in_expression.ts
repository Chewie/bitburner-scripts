import type { NS } from "@ns";

export class SanitizeParenthesesinExpression {
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }

  solve(input: string): string[] {
    const seen = new Set<string>();
    this.allSubStrings(input, seen);
    const validExprs = [...seen].filter(this.isValid);
    const maxLength = validExprs.reduce(
      (acc, cur) => Math.max(acc, cur.length),
      0,
    );
    const result = validExprs.filter((str) => str.length === maxLength);
    return result;
  }

  private allSubStrings(str: string, seen: Set<string>): void {
    if (seen.has(str)) {
      return;
    }

    seen.add(str);

    for (let i = 0; i < str.length; i++) {
      if ("()".includes(str[i])) {
        this.allSubStrings(str.slice(0, i) + str.slice(i + 1), seen);
      }
    }
  }

  private isValid(str: string): boolean {
    let count = 0;
    for (const char of str) {
      if (char === "(") {
        count++;
      }
      if (char === ")") {
        if (count === 0) {
          return false;
        }
        count--;
      }
    }
    return count === 0;
  }
}
