import type { AutocompleteData, NS, Server } from "@ns";

import * as common from "/lib/common";

import { TaskType } from "/batch/types/batch";

export class Prepper {
  constructor(
    private ns: NS,
    private target: string,
  ) {}

  async run(): Promise<void> {
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

    for (const worker of [...serverWorkers, ...pservs]) {
      this.ns.killall(worker.hostname);
    }

    const home = this.ns.getServer("home");
    const workers = [home, ...serverWorkers, ...pservs];

    // step 1 : weaken until minSec
    await this.#weakenUntilMinSec(workers);
    // step 2 : grow until max money
    await this.#growUntilMaxMoney(workers);
    // step 3 : weaken until minSec again
    await this.#weakenUntilMinSec(workers);

    // TODO: should that be the role of the prepper?
    // Workers are now unused, use them for faction rep share
    for (const worker of [...serverWorkers, ...pservs]) {
      common.execShare(this.ns, worker);
    }
  }

  async #weakenUntilMinSec(workers: Server[]): Promise<void> {
    this.ns.printf("[PREPPER] Weakening until min sec...");

    let currentSec = this.ns.getServerSecurityLevel(this.target);
    let minSec = this.ns.getServerMinSecurityLevel(this.target);

    while (currentSec !== minSec) {
      this.ns.printf(`[PREPPER] Current sec: ${currentSec}/${minSec}`);
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

      currentSec = this.ns.getServerSecurityLevel(this.target);
      minSec = this.ns.getServerMinSecurityLevel(this.target);
    }
    this.ns.printf("[PREPPER] Weakening done.");
  }

  async #growUntilMaxMoney(workers: Server[]): Promise<void> {
    this.ns.printf("[PREPPER] Growing until max money...");

    let moneyAvailable = this.ns.getServerMoneyAvailable(this.target);
    let maxMoney = this.ns.getServerMaxMoney(this.target);

    while (moneyAvailable !== maxMoney) {
      this.ns.printf(
        `[PREPPER] Current money: ${this.ns.formatNumber(
          moneyAvailable,
        )}/${this.ns.formatNumber(maxMoney)}`,
      );
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

      moneyAvailable = this.ns.getServerMoneyAvailable(this.target);
      maxMoney = this.ns.getServerMaxMoney(this.target);
    }
    this.ns.printf("[PREPPER] Growing done.");
  }

  #getMaxThreads(scriptName: string, server: Server): number {
    const ramCost = this.ns.getScriptRam(scriptName);
    const ramToUse =
      server.hostname === "home" ? server.maxRam * 0.9 : server.maxRam;
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
