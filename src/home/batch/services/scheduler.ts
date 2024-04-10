import type { NS, Server } from "@ns";

import type { BatchGenerator } from "/batch/services/batch_generator";
import type { PoolManager } from "/batch/services/pool_manager";
import { Batch, Task, TaskType } from "/batch/types/batch";
import { BatchError } from "/batch/types/errors";

import * as common from "/lib/common";

interface RunningTask {
  type: TaskType;
  delay: number;
}

interface RunningBatch {
  tasks: RunningTask[];
}

export class Scheduler {
  private taskQueue: RunningBatch[] = [];

  // TODO: Calculate interval dynamically?
  // potential idea is to find the minimal delay to fill enough batches to last
  // until the first one finishes, but would that improve performance?

  constructor(
    private ns: NS,
    private batchGenerator: BatchGenerator,
    private poolManager: PoolManager,
    private target: string,
  ) {}

  public async run() {
    let nextSleep = performance.now() + 200;
    const batch = this.batchGenerator.generateBatch();
    let count = 0;
    for (;;) {
      count++;
      if (count > 130000) {
        await this.awaitRemainingTasks();
        // completed tasks may have invalidated batch params, so we start over
        break;
      }
      try {
        if (performance.now() > nextSleep) {
          await this.ns.sleep(0);
          nextSleep = performance.now() + 200;
        }

        const worker = this.poolManager.getAvailableWorker(batch.ramSize);

        if (worker === undefined) {
          await this.awaitRemainingTasks();
          // completed tasks may have invalidated batch params, so we start over
          break;
        }

        // this.ns.printf(`INFO [SCHEDULER] Scheduling on ${worker.hostname}`);
        this.scheduleBatch(batch, worker);
      } catch (e) {
        if (e instanceof BatchError) {
          this.ns.printf(e.message);
          this.ns.printf("ERROR [SCHEDULER] Waiting for tasks to finish...");
          await this.awaitRemainingTasks();
        }
        this.ns.printf("ERROR [SCHEDULER] Tasks finished, relaunching...");
        throw e;
      }
    }
  }

  private async awaitRemainingTasks() {
    for (;;) {
      const graph = common.deepScan(this.ns);
      const servers = [...graph].map(([hostname, _parent]) =>
        this.ns.getServer(hostname),
      );
      const pservs = this.ns
        .getPurchasedServers()
        .map((hostname) => this.ns.getServer(hostname));
      const workers = [...servers, ...pservs];
      if (
        workers
          .map(
            (worker) =>
              this.ns.scriptRunning(TaskType.Grow, worker.hostname) ||
              this.ns.scriptRunning(TaskType.Hack, worker.hostname) ||
              this.ns.scriptRunning(TaskType.Grow, worker.hostname),
          )
          .includes(true)
      ) {
        await this.ns.sleep(100);
        continue;
      }
      break;
    }
    const handle = this.ns.getPortHandle(this.ns.pid);
    handle.clear();
  }

  private scheduleBatch(batch: Batch, worker: Server) {
    const maxTime = batch.maxTime;
    const runningTasks = [];
    for (const task of batch.tasks) {
      const delay = maxTime - task.runningTime;

      const runningTask = {
        type: task.type,
        delay: delay,
      };
      this.ns.scp(task.type, worker.hostname);
      const pid = this.ns.exec(
        task.type,
        worker.hostname,
        {
          temporary: true,
          threads: task.numThreads,
        },
        this.target,
        delay,
        this.ns.pid,
      );
      if (pid === 0) {
        throw new BatchError("ERROR [SCHEDULER] Couldn't run task");
      }
      runningTasks.push(runningTask);
    }
    // const runningBatch = { tasks: runningTasks };
    // this.taskQueue.push(runningBatch);
  }

  private async awaitCheck() {
    if (this.taskQueue.length === 0) {
      return await this.ns.sleep(100);
    }
    const runningBatch = this.taskQueue.shift()!;
    for (const task of runningBatch.tasks) {
      await this.ns.nextPortWrite(this.ns.pid);
      const res = this.ns.readPort(this.ns.pid);

      const delta = task.eta - performance.now();

      this.ns.printf(
        `DEBUG [SCHEDULER] ETA delta: ${this.ns.tFormat(delta, true)}`,
      );

      if (task.type !== res) {
        throw new BatchError(
          `ERROR [SCHEDULER] expected ${task.type}, got ${res}`,
        );
      }
    }

    const currentSec = this.ns.getServerSecurityLevel(this.target);
    const minSec = this.ns.getServerMinSecurityLevel(this.target);
    const moneyAvailable = this.ns.getServerMoneyAvailable(this.target);
    const maxMoney = this.ns.getServerMaxMoney(this.target);

    if (currentSec !== minSec || moneyAvailable !== maxMoney) {
      throw new BatchError(
        "ERROR [SCHEDULER] Server state not reset after batch",
      );
    }
  }
}
