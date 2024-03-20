import type { NS } from "@ns";

function worthAscending(ns: NS, member: string): boolean {
  const ascensionStats = ns.gang.getAscensionResult(member);
  return (
    ascensionStats !== undefined &&
    // ascensionStats?.agi >= 2 &&
    ascensionStats.hack >= 2 &&
    ascensionStats.dex >= 2 &&
    ascensionStats.cha >= 2 &&
    ascensionStats.def >= 2 &&
    ascensionStats.str >= 2
  );
}

export async function main(ns: NS) {
  ns.disableLog("getServerMoneyAvailable");
  let current = ns.gang.getMemberNames().length;

  for (;;) {
    await ns.gang.nextUpdate();
    if (ns.gang.canRecruitMember()) {
      const name = `jeanmich-${current}`;
      ns.gang.recruitMember(name);
      ns.gang.setMemberTask(name, "Train Combat");
      current++;
      continue;
    }

    const members = ns.gang
      .getMemberNames()
      .map((name) => ns.gang.getMemberInformation(name));
    for (const member of members) {
      if (worthAscending(ns, member.name)) {
        ns.printf(`Ascending ${member.name}`);
        ns.gang.ascendMember(member.name);
      }

      for (const equipment of ns.gang.getEquipmentNames()) {
        if (
          ns.gang.getEquipmentCost(equipment) <
            ns.getServerMoneyAvailable("home") * 0.1 &&
          !member.upgrades.includes(equipment) &&
          !member.augmentations.includes(equipment)
        ) {
          ns.gang.purchaseEquipment(member.name, equipment);
        }
      }
    }
  }
}
