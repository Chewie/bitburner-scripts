import type { NS } from "@ns";

export async function main(ns: NS) {
  const hackForms = ns.formulas.hacking;
  const player = ns.getPlayer();

  const server = ns.getServer("ecorp");

  ns.tprintf(JSON.stringify(player, null, 2));
  ns.tprintf(ns.tFormat(hackForms.growTime(server, player), true));;

  player.exp.hacking = 100;
  player.skills.hacking = ns.formulas.skills.calculateSkill(
    100,
    player.mults.hacking,
  );
  ns.tprintf(JSON.stringify(player, null, 2));
  ns.tprintf(ns.tFormat(hackForms.growTime(server, player), true));;


  // for (const target of targets) {
  //   const hackChance = ns.formulas.hacking.hackChance(target, player);
  //   ns.tprintf(`Server: ${target.hostname}`);
  //   ns.tprintf(`Hack difficulty: ${player.skills.hacking}/${target.requiredHackingSkill!}`);
  //   ns.tprintf(`Hack chance: ${hackChance}`);
  // }
}
