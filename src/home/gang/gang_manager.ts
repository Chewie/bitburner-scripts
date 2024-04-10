import type { GangMemberInfo, NS } from "@ns";

export class GangManager {
  private static readonly TICKS_IN_CYCLES = 10;
  private tick = 0;

  constructor(private ns: NS) {
    ns.disableLog("gang.setMemberTask");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("gang.setTerritoryWarfare");
  }

  async run() {
    await this.syncToCycle();
    for (;;) {
      this.handleTick();
      await this.updateTick();
    }
  }

  private async syncToCycle() {
    this.ns.printf("Syncing to next cycle start...");
    let totalPower = this.getTotalPower();
    for (;;) {
      await this.ns.gang.nextUpdate();
      const newTotalPower = this.getTotalPower();
      if (totalPower !== newTotalPower) {
        this.ns.printf("Syncing done!");
        return;
      }
      totalPower = newTotalPower;
    }
  }

  private handleTick() {
    this.tryRecruit();
    this.ascendAndUpgrade();
    this.setToWork();
    if (this.isLastTick()) {
      this.handleWarfare();
    }
  }

  private async updateTick() {
    await this.ns.gang.nextUpdate();
    this.tick++;
    if (this.tick === GangManager.TICKS_IN_CYCLES) {
      this.tick = 0;
    }
  }

  private isLastTick() {
    return this.tick === GangManager.TICKS_IN_CYCLES - 1;
  }

  private getTotalPower() {
    const gang = this.ns.gang.getGangInformation();
    const otherGangs = this.ns.gang.getOtherGangInformation();
    return Object.keys(otherGangs)
      .filter((faction) => faction !== gang.faction)
      .map((faction) => otherGangs[faction].power)
      .reduce((acc, cur) => acc + cur, 0);
  }

  private tryRecruit() {
    const current = this.ns.gang.getMemberNames().length;
    if (this.ns.gang.canRecruitMember()) {
      const name = `jeanmich-${current}`;
      this.ns.gang.recruitMember(name);
      this.ns.gang.setMemberTask(name, "Train Combat");
    }
  }

  private ascendAndUpgrade() {
    const members = this.ns.gang
      .getMemberNames()
      .map(this.ns.gang.getMemberInformation);

    for (const member of members) {
      if (this.worthAscending(member.name)) {
        this.ns.printf(`Ascending ${member.name}`);
        this.ns.gang.ascendMember(member.name);
      }

      for (const equipment of this.ns.gang.getEquipmentNames()) {
        if (this.shouldBuyEquipment(equipment, member)) {
          this.ns.gang.purchaseEquipment(member.name, equipment);
        }
      }
    }
  }
  private worthAscending(member: string): boolean {
    const ascensionStats = this.ns.gang.getAscensionResult(member);
    return (
      ascensionStats !== undefined &&
      ascensionStats.agi +
        ascensionStats.dex +
        ascensionStats.def +
        ascensionStats.str >=
        6
    );
  }

  private shouldBuyEquipment(equipment: string, member: GangMemberInfo) {
    return (
      this.ns.gang.getEquipmentCost(equipment) <
        this.ns.getServerMoneyAvailable("home") * 0.1 &&
      !member.upgrades.includes(equipment) &&
      !member.augmentations.includes(equipment)
    );
  }

  private handleWarfare() {
    const gang = this.ns.gang.getGangInformation();
    const otherGangs = this.ns.gang.getOtherGangInformation();

    const worthFighting = Object.keys(otherGangs)
      .filter((faction) => faction !== gang.faction)
      .filter((faction) => otherGangs[faction].territory > 0)
      .map(this.ns.gang.getChanceToWinClash)
      .every((chance) => chance > 0.6);

    this.ns.gang.setTerritoryWarfare(worthFighting);

    if (gang.territoryClashChance < 0.001) {
      for (const member of this.ns.gang.getMemberNames()) {
        this.ns.gang.setMemberTask(member, "Territory Warfare");
      }
    }
  }

  private setToWork() {
    const gang = this.ns.gang.getGangInformation();
    const members = this.ns.gang
      .getMemberNames()
      .map(this.ns.gang.getMemberInformation);
    const focus =
      this.ns.gang.getMemberNames().length > 10 ? "moneyGain" : "respectGain";

    for (const member of members) {
      const bestTask = this.ns.gang
        .getTaskNames()
        .map(this.ns.gang.getTaskStats)
        .filter((task) => task.isCombat)
        .toSorted(
          (a, b) =>
            this.ns.formulas.gang[focus](gang, member, b) -
            this.ns.formulas.gang[focus](gang, member, a),
        )[0];
      const selectedTask =
        bestTask.baseMoney + bestTask.baseRespect !== 0
          ? bestTask.name
          : "Train Combat";
      this.ns.gang.setMemberTask(member.name, selectedTask);
    }
  }
}
