import type { NS, Server } from "@ns";

import * as common from "/lib/common";

export class PoolManager {
  constructor(private ns: NS) {}

  getAvailableWorker(ramSize: number): Server | undefined {
    const graph = common.deepScan(this.ns);

    const servers = [...graph]
      .map(([hostname, _parent]) => this.ns.getServer(hostname))
      .filter((server) => server.hostname !== "home")
      .filter((server) => common.isHackable(this.ns, server));
    for (const server of servers) {
      common.superNuke(this.ns, server);
    }
    const pservs = this.ns
      .getPurchasedServers()
      .map((hostname) => this.ns.getServer(hostname));
    const home = this.ns.getServer("home");
    const workers = [home, ...servers, ...pservs];
    for (const worker of workers) {
      // Some RAM to keep as headroom for running scripts
      const headRoom = worker.hostname === "home" ? 20 : 0;
      const freeRam = worker.maxRam - worker.ramUsed - headRoom;

      if (freeRam > ramSize) {
        return worker;
      }
    }
    return undefined;
  }
}
