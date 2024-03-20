import type { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0] as string;
  const delay = ns.args[1] as number;
  const monitorPort = ns.args[2] as number;
  await ns.hack(target, { additionalMsec: delay });
  ns.atExit(() => ns.writePort(monitorPort, `/${ns.getScriptName()}`));
}
