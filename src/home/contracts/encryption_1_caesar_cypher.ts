import type { NS } from "@ns";

export class EncryptionICaesarCypher {
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }

  solve(input: (string | number)[]): string {
    const plaintext = input[0] as string;
    const key = input[1] as number;
    const output = [...plaintext];

    for (let i = 0; i < plaintext.length; i++) {
      if (plaintext[i] === " ") {
        continue;
      }
      const offset = ("A".charCodeAt(0) + plaintext.charCodeAt(i) - key) % 26;

      const encryptedLetter = String.fromCharCode("A".charCodeAt(0) + offset);
      output[i] = encryptedLetter;
    }

    return output.join("");
  }
}
