import type { NS } from "@ns";

export async function main(ns: NS) {
  ns.codingcontract.createDummyContract(
    (await ns.prompt("What type of contract to generate?", {
      type: "select",
      choices: ns.codingcontract.getContractTypes(),
    })) as string,
  );
}
