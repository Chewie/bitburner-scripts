import type { NS } from "@ns";

import type { BatchGenerator } from "/batch/services/batch_generator";
import type { Batch, Task, TaskType } from "/batch/types/batch";

interface RunningTask {
  type: TaskType;
  eta: number;
}

export class Scheduler {
  private taskQueue: RunningTask[] = [];

  // TODO: Calculate interval dynamically?
  // potential idea is to find the minimal delay to fill enough batches to last
  // until the first one finishes, but would that improve performance?
  private taskInterval = 20;

  constructor(
    private ns: NS,
    private batchGenerator: BatchGenerator,
    private target: string,
  ) {}

  public async run() {
    for (;;) {
      const batch = this.batchGenerator.generateBatch();
      const freeRam =
        this.ns.getServerMaxRam("home") - this.ns.getServerUsedRam("home");

      if (this.batchRamSize(batch) > freeRam) {
        await this.awaitCheck();
        // completed tasks may have invalidated batch params, so we start over
        continue;
      }

      this.scheduleBatch(batch);
    }
  }

  private scheduleBatch(batch: Batch) {
    this.ns.printf("INFO [SCHEDULER] new batch");
    const maxTime = Math.max(
      ...batch.tasks.map((task: Task) => task.runningTime),
    );
    this.ns.printf(
      `DEBUG [SCHEDULER] batch max time: ${this.ns.tFormat(maxTime, true)}`,
    );

    for (const task of batch.tasks) {
      this.ns.printf("INFO [SCHEDULER] new task");
      this.ns.printf(`DEBUG [SCHEDULER] task type: ${task.type}`);
      this.ns.printf(
        `DEBUG [SCHEDULER] task time: ${this.ns.tFormat(
          task.runningTime,
          true,
        )}`,
      );

      // FIXME: Ugly logic, can surely be rewritten
      const now = performance.now();
      let eta: number;
      if (this.taskQueue.length === 0) {
        eta = now + maxTime;
      } else {
        eta = this.taskQueue.at(-1)!.eta + this.taskInterval;
      }
      let delay = eta - now - task.runningTime;

      if (delay < 0) {
        // We arrived too late to fit the eta, use the earliest possible eta instead.
        // (I think) this happens when there isn't enough RAM to cover the first
        // task duration with enough in-flight batches
        eta = now + maxTime;
        delay = 0;
      }

      this.ns.printf(`DEBUG [SCHEDULER] now: ${this.ns.tFormat(now, true)}`);
      this.ns.printf(`DEBUG [SCHEDULER] eta: ${this.ns.tFormat(eta, true)}`);
      this.ns.printf(
        `DEBUG [SCHEDULER] delay: ${this.ns.tFormat(delay, true)}`,
      );

      const runningTask = {
        type: task.type,
        eta: eta,
      };
      const pid = this.ns.run(
        task.type,
        task.numThreads,
        this.target,
        delay,
        this.ns.pid,
      );
      if (pid === 0) {
        this.ns.printf("ERROR [SCHEDULER] Couldn't run task");
        this.ns.exit();
      }
      this.taskQueue.push(runningTask);
    }
  }

  private async awaitCheck() {
    // FIXME: magic constant.
    // * Hold a dummy batch to get batch structure?
    // * Store complete batches instead of tasks in the queue?
    for (let i = 0; i < 3; i++) {
      await this.ns.nextPortWrite(this.ns.pid);
      const res = this.ns.readPort(this.ns.pid);
      const finishedTask = this.taskQueue.shift();

      if (finishedTask?.type !== res) {
        this.ns.printf(
          `ERROR [SCHEDULER] expected ${finishedTask?.type}, got ${res}`,
        );
        this.ns.exit();
      }
    }

    const currentSec = this.ns.getServerSecurityLevel(this.target);
    const minSec = this.ns.getServerMinSecurityLevel(this.target);
    const moneyAvailable = this.ns.getServerMoneyAvailable(this.target);
    const maxMoney = this.ns.getServerMaxMoney(this.target);

    if (currentSec !== minSec || moneyAvailable !== maxMoney) {
      this.ns.printf("ERROR [SCHEDULER] Server state not reset after batch");
      this.ns.printf(`INFO [SCHEDULER] Current sec: ${currentSec}/${minSec}`);
      this.ns.printf(
        `INFO [SCHEDULER] Current money: ${this.ns.formatNumber(
          moneyAvailable,
        )}/${this.ns.formatNumber(maxMoney)}`,
      );
      this.ns.exit();
    }
  }

  // TODO: Make batch a real object with ramSize as property
  private batchRamSize(batch: Batch) {
    return batch.tasks
      .map((task) => this.ns.getScriptRam(task.type) * task.numThreads)
      .reduce((acc, cur) => acc + cur, 0);
  }
}
