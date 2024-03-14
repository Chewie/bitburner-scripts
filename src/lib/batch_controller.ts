import type { NS, Player, Server } from "@ns";

enum TaskType {
  Grow = "/tasks/grow.js",
  Weaken1 = "/tasks/weaken.js",
  Hack = "/tasks/hack.js",
  Weaken2 = "/tasks/weaken.js",
}

interface Task {
  taskType: TaskType;
  numThreads: number;
  delay: number;
  eta: string;
}

interface Batch {
  tasks: Task[];
  executionTime: number;
  eta: string;
}

export class BatchController {
  ns: NS;
  server: Server;
  player: Player;
  homeCores: number;
  delayMult = 1000;

  constructor(ns: NS, server: Server) {
    this.ns = ns;
    this.server = server;
    this.player = ns.getPlayer();
    this.homeCores = ns.getServer("home").cpuCores;
  }

  prepareServer(): Batch {
    if (this.server.hackDifficulty === this.server.minDifficulty) {
      return {
        tasks: [],
        executionTime: 0,
        eta: this.ns.tFormat(0, true),
      };
    }
    const weakenOneThread = this.ns.weakenAnalyze(1, this.homeCores);
    const weakenThreads =
      Math.ceil(
        (this.server.hackDifficulty! - this.server.minDifficulty!) /
          weakenOneThread,
      ) + 10;
    const weakenTime = this.ns.formulas.hacking.weakenTime(
      this.server,
      this.player,
    );

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

  computeBatchParams(): Batch {
    const fakeServer = {...this.server};
    fakeServer.hackDifficulty = fakeServer.minDifficulty;

    fakeServer.moneyAvailable = 0;
    const growThreads =
      Math.ceil(
        this.ns.formulas.hacking.growThreads(
          fakeServer,
          this.player,
          // biome-ignore lint/style/noNonNullAssertion: Guaranteed
          this.server.moneyMax!,
          this.homeCores,
        ),
      );

    fakeServer.moneyAvailable = fakeServer.moneyMax;
    const hackThreads = Math.ceil(
      1 / this.ns.formulas.hacking.hackPercent(fakeServer, this.player),
    );

    const growSecIncrease = this.ns.growthAnalyzeSecurity(
      growThreads,
      undefined,
      this.homeCores,
    );

    const hackSecIncrease = this.ns.hackAnalyzeSecurity(
      hackThreads,
      this.server.hostname,
    );

    const weakenOneThread = this.ns.weakenAnalyze(1, this.homeCores);

    const weakenThreadsAfterGrow =
      Math.ceil(growSecIncrease / weakenOneThread);
    const weakenThreadsAfterHack =
      Math.ceil(hackSecIncrease / weakenOneThread);

    const growTime = this.ns.formulas.hacking.growTime(
      this.server,
      this.player,
    );

    const hackTime = this.ns.formulas.hacking.hackTime(
      this.server,
      this.player,
    );

    const weakenTime = this.ns.formulas.hacking.weakenTime(
      this.server,
      this.player,
    );

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
