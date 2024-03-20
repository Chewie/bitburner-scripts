import type { NS, Player } from "@ns";

export enum TaskType {
  Grow = "/tasks/grow.js",
  Weaken1 = "/tasks/weaken.js",
  Hack = "/tasks/hack.js",
  Weaken2 = "/tasks/weaken.js",
}

export interface Task {
  taskType: TaskType;
  numThreads: number;
  delay: number;
  eta: string;
}

export interface Batch {
  tasks: Task[];
  executionTime: number;
  eta: string;
}

export class BatchController {
  ns: NS;
  server: string;
  player: Player;
  homeCores: number;
  delayMult = 200;

  constructor(ns: NS, server: string) {
    this.ns = ns;
    this.server = server;
    this.player = ns.getPlayer();
    this.homeCores = ns.getServer("home").cpuCores;
  }

  initialWeaken(): Batch {
    const currentSec = this.ns.getServerSecurityLevel(this.server);
    const minSec = this.ns.getServerMinSecurityLevel(this.server);

    if (currentSec === minSec) {
      return {
        tasks: [],
        executionTime: 0,
        eta: this.ns.tFormat(0, true),
      };
    }
    const weakenOneThread = this.ns.weakenAnalyze(1, this.homeCores);
    const weakenThreads = Math.ceil((currentSec - minSec) / weakenOneThread);
    const weakenTime = this.ns.getWeakenTime(this.server);

    return {
      tasks: [
        {
          taskType: TaskType.Weaken1,
          numThreads: weakenThreads,
          delay: 0,
          eta: this.ns.tFormat(weakenTime, true),
        },
      ],
      executionTime: weakenTime + this.delayMult,
      eta: this.ns.tFormat(weakenTime + this.delayMult, true),
    };
  }

  initialGrow(): Batch {
    const currentMoney = this.ns.getServerMoneyAvailable(this.server);
    const maxMoney = this.ns.getServerMaxMoney(this.server);

    if (currentMoney === maxMoney) {
      return {
        tasks: [],
        executionTime: 0,
        eta: this.ns.tFormat(0, true),
      };
    }

    const growthFactor = maxMoney / Math.max(currentMoney, 1);

    const growThreads =
      Math.ceil(
        this.ns.growthAnalyze(this.server, growthFactor, this.homeCores),
      ) + 10;

    const growSecIncrease = this.ns.growthAnalyzeSecurity(
      growThreads,
      undefined,
      this.homeCores,
    );
    const weakenOneThread = this.ns.weakenAnalyze(1, this.homeCores);
    const weakenThreads = Math.ceil(growSecIncrease / weakenOneThread);
    const weakenTime = this.ns.getWeakenTime(this.server);
    const growTime = this.ns.getGrowTime(this.server);

    const maxTime = Math.max(growTime, weakenTime);

    return {
      tasks: [
        {
          taskType: TaskType.Grow,
          numThreads: growThreads,
          delay: maxTime - growTime,
          eta: this.ns.tFormat(growTime, true),
        },
        {
          taskType: TaskType.Weaken1,
          numThreads: weakenThreads,
          delay: maxTime - weakenTime + this.delayMult,
          eta: this.ns.tFormat(weakenTime, true),
        },
      ],
      executionTime: maxTime + 2 * this.delayMult,
      eta: this.ns.tFormat(maxTime + 2 * this.delayMult, true),
    };
  }

  computeBatchParams(): Batch {
    const currentMoney = this.ns.getServerMoneyAvailable(this.server);
    const maxMoney = this.ns.getServerMaxMoney(this.server);

    const hackThreads = 5;

    const moneyStolen =
      this.ns.hackAnalyze(this.server) * hackThreads * currentMoney;

    const growthFactor = maxMoney / Math.max(1, currentMoney - moneyStolen);

    this.ns.printf(
      `INFO money: (${currentMoney} - ${moneyStolen})/${maxMoney}`,
    );
    this.ns.printf(`INFO ratio: ${growthFactor}`);
    const growThreads = Math.ceil(
      this.ns.growthAnalyze(this.server, growthFactor, this.homeCores),
    );

    const growSecIncrease = this.ns.growthAnalyzeSecurity(
      growThreads,
      undefined,
      this.homeCores,
    );

    const hackSecIncrease = this.ns.hackAnalyzeSecurity(
      hackThreads,
      this.server,
    );

    const weakenOneThread = this.ns.weakenAnalyze(1, this.homeCores);

    const weakenThreadsAfterGrow = Math.ceil(growSecIncrease / weakenOneThread);
    const weakenThreadsAfterHack = Math.ceil(hackSecIncrease / weakenOneThread);

    const growTime = this.ns.getGrowTime(this.server);
    const hackTime = this.ns.getHackTime(this.server);
    const weakenTime = this.ns.getWeakenTime(this.server);

    const maxTime = Math.max(growTime, hackTime, weakenTime);

    const tasks = [
      {
        taskType: TaskType.Hack,
        numThreads: hackThreads,
        delay: maxTime - hackTime,
        eta: this.ns.tFormat(hackTime, true),
      },
      {
        taskType: TaskType.Weaken1,
        numThreads: weakenThreadsAfterHack,
        delay: maxTime - weakenTime + this.delayMult,
        eta: this.ns.tFormat(weakenTime, true),
      },
      {
        taskType: TaskType.Grow,
        numThreads: growThreads,
        delay: maxTime - growTime + 2 * this.delayMult,
        eta: this.ns.tFormat(growTime, true),
      },
      {
        taskType: TaskType.Weaken2,
        numThreads: weakenThreadsAfterGrow,
        delay: maxTime - weakenTime + 3 * this.delayMult,
        eta: this.ns.tFormat(weakenTime, true),
      },
    ];

    return {
      tasks: tasks,
      executionTime: maxTime + 4 * this.delayMult,
      eta: this.ns.tFormat(maxTime + 4 * this.delayMult, true),
    };
  }
}
