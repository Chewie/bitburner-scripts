import type { NS } from "@ns";
import { Logger } from "tslog";

export async function main(ns: NS) {
  ns.printf("coucou");
  const logger = new Logger({ type: "hidden" });
}
