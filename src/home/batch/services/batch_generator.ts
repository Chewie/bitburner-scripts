import type { NS, Player, Server } from "@ns";

import { Batch, TaskType } from "/batch/types/batch";
import { BatchError } from "/batch/types/errors";

export class BatchGenerator {
  constructor(
    private ns: NS,
    private preppedServer: Server,
    private player: Player,
  ) {}

  private checkPrepped() {
    if (
      this.preppedServer.minDifficulty! !==
        this.ns.getServerMinSecurityLevel(this.preppedServer.hostname) ||
      this.preppedServer.moneyAvailable! !==
        this.ns.getServerMoneyAvailable(this.preppedServer.hostname)
    ) {
      throw new BatchError("ERROR [GENERATOR] Server not prepped!");
    }
  }

  generateBatch(): Batch {
    this.preppedServer = this.ns.getServer(this.preppedServer.hostname);
    this.checkPrepped();

    const hackForms = this.ns.formulas.hacking;
    const server = { ...this.preppedServer };
    const currentMoney = server.moneyAvailable!;
    const maxMoney = server.moneyMax!;
    const cores = 1;

    const currentPlayer = this.ns.getPlayer();

    const growTime = hackForms.growTime(server, currentPlayer);
    const hackTime = hackForms.hackTime(server, currentPlayer);
    const weakenTime = hackForms.weakenTime(server, currentPlayer);

    // TODO: Compute hackThreads dynamically?
    // Potential idea: find the biggest thread count that still
    // requires only 1 weaken thread
    const hackThreads = 5;

    const moneyStolen =
      hackForms.hackPercent(server, this.player) * hackThreads * currentMoney;

    const hackSecIncrease = this.ns.hackAnalyzeSecurity(hackThreads, undefined);

    server.moneyAvailable! -= moneyStolen;
    server.hackDifficulty! += hackSecIncrease;

    this.player.exp.hacking +=
      hackForms.hackExp(server, this.player) * hackThreads;

    this.player.skills.hacking = this.ns.formulas.skills.calculateSkill(
      this.player.exp.hacking,
      this.player.mults.hacking,
    );

    const growThreads = 1 + hackForms.growThreads(
      server,
      this.player,
      maxMoney,
      cores,
    );

    const growSecIncrease = this.ns.growthAnalyzeSecurity(
      growThreads,
      undefined,
      cores,
    );

    server.hackDifficulty! += growSecIncrease;

    this.player.exp.hacking +=
      hackForms.hackExp(server, this.player) * growThreads;

    this.player.skills.hacking = this.ns.formulas.skills.calculateSkill(
      this.player.exp.hacking,
      this.player.mults.hacking,
    );

    const totalSecIncrease = hackSecIncrease + growSecIncrease;
    const weakenOneThread = this.ns.weakenAnalyze(1, cores);
    const weakenThreads = Math.ceil(totalSecIncrease / weakenOneThread);

    this.player.exp.hacking +=
      hackForms.hackExp(server, this.player) * weakenThreads;

    this.player.skills.hacking = this.ns.formulas.skills.calculateSkill(
      this.player.exp.hacking,
      this.player.mults.hacking,
    );

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

    return new Batch(this.ns, tasks);
  }
}
