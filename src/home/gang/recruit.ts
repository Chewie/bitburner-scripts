import type { GangMemberInfo, NS } from "@ns";

export async function main(ns: NS) {
  ns.disableLog("getServerMoneyAvailable");

  for (;;) {
    await ns.gang.nextUpdate();

    const members = ns.gang
      .getMemberNames()
      .map((name) => ns.gang.getMemberInformation(name));

  }
}

function worthAscending(ns: NS, member: string): boolean {
  const ascensionStats = ns.gang.getAscensionResult(member);
  return (
    ascensionStats !== undefined &&
    ascensionStats.agi >= 2 &&
    ascensionStats.hack >= 2 &&
    ascensionStats.dex >= 2 &&
    ascensionStats.cha >= 2 &&
    ascensionStats.def >= 2 &&
    ascensionStats.str >= 2
  );
}

function shouldBuyEquipment(ns: NS, equipment: string, member: GangMemberInfo) {
  return (
    ns.gang.getEquipmentCost(equipment) <
      ns.getServerMoneyAvailable("home") * 0.1 &&
    !member.upgrades.includes(equipment) &&
    !member.augmentations.includes(equipment)
  );
}
