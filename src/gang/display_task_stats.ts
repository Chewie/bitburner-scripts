import type { NS } from "@ns";

export async function main(ns: NS) {
  const tasks = ns.gang
    .getTaskNames()
    .map((taskName) => ns.gang.getTaskStats(taskName))
    .filter((task) => task.isCombat);

  for (const task of tasks) {
    ns.tprint(JSON.stringify(task, null, 2));
  }

  const equipmentNames = ns.gang.getEquipmentNames();
  for (const equipmentName of equipmentNames) {
    const equipment = {
      name: equipmentName,
      stats: ns.gang.getEquipmentStats(equipmentName),
      type: ns.gang.getEquipmentType(equipmentName),
      cost: ns.gang.getEquipmentCost(equipmentName),
    };
    ns.tprint(JSON.stringify(equipment, null, 2));
  }

  const memberNames = ns.gang.getMemberNames();
  for (const memberName of memberNames) {
    const member = {
      info: ns.gang.getMemberInformation(memberName),
      ascend: ns.gang.getAscensionResult(memberName),
    };
    ns.tprint(JSON.stringify(member, null, 2));

  }
}
