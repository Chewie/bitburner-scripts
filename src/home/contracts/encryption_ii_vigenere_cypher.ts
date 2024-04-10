import type { NS } from "@ns";

export class EncryptionIIVigenereCypher {
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }

  solve(input: string[]): string {
    const [plaintext, keyword] = input;
    const output = [...plaintext];

    for (let i = 0; i < plaintext.length; i++) {
      const offset =
        (plaintext.charCodeAt(i) + keyword.charCodeAt(i % keyword.length)) % 26;

      const encryptedLetter = String.fromCharCode("A".charCodeAt(0) + offset);
      output[i] = encryptedLetter;
    }

    return output.join("");
  }
}
