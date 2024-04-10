import type { AutocompleteData, NS, Server } from "@ns";

import * as common from "/lib/common";

import { TaskType } from "/batch/types/batch";

export class Prepper {
  constructor(
    private ns: NS,
    private target: string,
  ) {}

  async run(): Promise<void> {
    // step 1 : weaken until minSec
    await this.weakenUntilMinSec();
    // step 2 : grow until max money
    await this.growUntilMaxMoney();
    // step 3 : weaken until minSec again
    await this.weakenUntilMinSec();
  }

  private getWorkers() {
    const graph = common.deepScan(this.ns);

    const servers = [...graph]
      .map(([hostname, _parent]) => this.ns.getServer(hostname))
      .filter((server) => server.hostname !== "home")
      .filter((server) => common.isHackable(this.ns, server));

    for (const server of servers) {
      common.superNuke(this.ns, server);
    }
    const serverWorkers = servers.filter((server) => server.maxRam !== 0);

    const pservs = this.ns
      .getPurchasedServers()
      .map((hostname) => this.ns.getServer(hostname));

    const home = this.ns.getServer("home");
    const workers = [home, ...serverWorkers, ...pservs];
    return workers;
  }

  private async weakenUntilMinSec(): Promise<void> {
    this.ns.printf("[PREPPER] Weakening until min sec...");

    let currentSec = this.ns.getServerSecurityLevel(this.target);
    let minSec = this.ns.getServerMinSecurityLevel(this.target);

    while (currentSec !== minSec) {
      this.ns.printf(`[PREPPER] Current sec: ${currentSec}/${minSec}`);
      const workers = this.getWorkers();

      await this.weakenSalve(workers);

      currentSec = this.ns.getServerSecurityLevel(this.target);
      minSec = this.ns.getServerMinSecurityLevel(this.target);
    }
    this.ns.printf("[PREPPER] Weakening done.");
  }

  private async growUntilMaxMoney(): Promise<void> {
    this.ns.printf("[PREPPER] Growing until max money...");

    let moneyAvailable = this.ns.getServerMoneyAvailable(this.target);
    let maxMoney = this.ns.getServerMaxMoney(this.target);

    while (moneyAvailable !== maxMoney) {
      this.ns.printf(
        `[PREPPER] Current money: ${this.ns.formatNumber(
          moneyAvailable,
        )}/${this.ns.formatNumber(maxMoney)}`,
      );
      const workers = this.getWorkers();
      await this.growSalve(workers);
      await this.weakenSalve(workers);

      moneyAvailable = this.ns.getServerMoneyAvailable(this.target);
      maxMoney = this.ns.getServerMaxMoney(this.target);
    }
    this.ns.printf("[PREPPER] Growing done.");
  }

  private async weakenSalve(workers: Server[]): Promise<void> {
    for (const worker of workers) {
      const taskType = TaskType.Weaken;
      const threadCount = this.#getMaxThreads(taskType, worker);
      this.ns.scp(TaskType.Weaken, worker.hostname);
      this.ns.exec(
        taskType,
        worker.hostname,
        threadCount,
        this.target,
        0,
        this.ns.pid,
      );
    }
    for (const _worker of workers) {
      await this.ns.nextPortWrite(this.ns.pid);
      this.ns.readPort(this.ns.pid);
    }
  }

  private async growSalve(workers: Server[]): Promise<void> {
    for (const worker of workers) {
      const taskType = TaskType.Grow;
      const threadCount = this.#getMaxThreads(taskType, worker);
      this.ns.scp(TaskType.Grow, worker.hostname);
      this.ns.exec(
        taskType,
        worker.hostname,
        threadCount,
        this.target,
        0,
        this.ns.pid,
      );
    }

    for (const _worker of workers) {
      await this.ns.nextPortWrite(this.ns.pid);
      this.ns.readPort(this.ns.pid);
    }
  }

  #getMaxThreads(scriptName: string, server: Server): number {
    const ramCost = this.ns.getScriptRam(scriptName);
    const freeRam = server.maxRam - server.ramUsed;
    const ramToUse = server.hostname === "home" ? freeRam * 0.9 : freeRam;
    const numThreads = Math.max(1, Math.floor(ramToUse / ramCost));

    return numThreads;
  }
}

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  const target = ns.args[0] as string;

  const prepper = new Prepper(ns, target);
  await prepper.run();
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
