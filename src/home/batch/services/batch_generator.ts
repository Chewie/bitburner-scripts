import type { NS } from "@ns";

import { type Batch, TaskType } from "/batch/types/batch";

export class BatchGenerator {
  constructor(
    private ns: NS,
    private server: string,
  ) {}

  generateBatch(): Batch {
    const homeCores = this.ns.getServer("home").cpuCores;
    const currentMoney = this.ns.getServerMoneyAvailable(this.server);
    const maxMoney = this.ns.getServerMaxMoney(this.server);

    // TODO: Compute hackThreads dynamically?
    // Potential idea: find the biggest thread count that still
    // requires only 1 weaken thread
    const hackThreads = 5;

    const moneyStolen =
      this.ns.hackAnalyze(this.server) * hackThreads * currentMoney;
    const growthFactor = maxMoney / Math.max(1, currentMoney - moneyStolen);
    const growThreads = Math.ceil(
      this.ns.growthAnalyze(this.server, growthFactor, homeCores),
    );

    const growSecIncrease = this.ns.growthAnalyzeSecurity(
      growThreads,
      undefined,
      homeCores,
    );

    const hackSecIncrease = this.ns.hackAnalyzeSecurity(
      hackThreads,
      this.server,
    );

    const totalSecIncrease = hackSecIncrease + growSecIncrease;
    const weakenOneThread = this.ns.weakenAnalyze(1, homeCores);
    const weakenThreads = Math.ceil(totalSecIncrease / weakenOneThread);

    const growTime = this.ns.getGrowTime(this.server);
    const hackTime = this.ns.getHackTime(this.server);
    const weakenTime = this.ns.getWeakenTime(this.server);

    const tasks = [
      {
        type: TaskType.Hack,
        numThreads: hackThreads,
        runningTime: hackTime,
      },
      {
        type: TaskType.Grow,
        numThreads: growThreads,
        runningTime: growTime,
      },
      {
        type: TaskType.Weaken,
        numThreads: weakenThreads,
        runningTime: weakenTime,
      },
    ];

    return {
      tasks: tasks,
    };
  }
}
