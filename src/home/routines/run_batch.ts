import type { AutocompleteData, NS } from "@ns";
import { BatchController, type Task, TaskType } from "/lib/batch_controller";

async function awaitCheck(ns: NS, server: string, task: Task): Promise<void> {
  await ns.nextPortWrite(ns.pid);
  const res = ns.readPort(ns.pid);
  ns.printf(res);
  // if (res !== task.taskType) {
  //   ns.alert(`Expected ${task.taskType}, got ${res}`);
  //   ns.exit();
  // }
  // if (task.taskType === TaskType.Grow) {
  //   const moneyAvailable = ns.getServerMoneyAvailable(server);
  //   const moneyMax = ns.getServerMaxMoney(server);
  //   const deltaPercent = moneyMax - moneyAvailable;
  //   if (deltaPercent > 0.02) {
  //     ns.alert(`Grow: Expected ${moneyMax}, got ${moneyAvailable}`);
  //     ns.exit();
  //   }
  // }
  // if ([TaskType.Weaken1, TaskType.Weaken2].includes(task.taskType)) {
  //   const currentSec = ns.getServerSecurityLevel(server);
  //   const minSec = ns.getServerMinSecurityLevel(server);
  //   if (currentSec !== minSec) {
  //     ns.alert(`Weaken: Expected ${minSec}, got ${currentSec}`);
  //     ns.exit();
  //   }
  // }
}

export async function main(ns: NS): Promise<void> {
  ns.disableLog("getServerSecurityLevel");
  ns.disableLog("getServerMinSecurityLevel");
  ns.disableLog("getServerMoneyAvailable");
  ns.disableLog("getServerMaxMoney");
  ns.disableLog("run");

  const target = ns.args[0] as string;

  if (ns.args[1] !== undefined) {
    const watchdogPID = ns.args[1] as number;
    ns.atExit(() => ns.writePort(watchdogPID, ns.pid));
  }

  const controller = new BatchController(ns, target);

  ns.printf(`INFO current sec: ${ns.getServerSecurityLevel(target)}`);
  ns.printf(`INFO min sec: ${ns.getServerMinSecurityLevel(target)}`);
  ns.printf(`INFO current money: ${ns.getServerMoneyAvailable(target)}`);
  ns.printf(`INFO max money: ${ns.getServerMaxMoney(target)}`);

  const initialWeakenBatch = controller.initialWeaken();
  ns.print(JSON.stringify(initialWeakenBatch, null, 2));
  for (const task of initialWeakenBatch.tasks) {
    while (
      ns.run(task.taskType, task.numThreads, target, task.delay, ns.pid) === 0
    ) {
      await ns.sleep(1000);
    }
  }
  for (const task of initialWeakenBatch.tasks) {
    await awaitCheck(ns, target, task);
  }

  ns.printf(`INFO current sec: ${ns.getServerSecurityLevel(target)}`);
  ns.printf(`INFO min sec: ${ns.getServerMinSecurityLevel(target)}`);
  ns.printf(`INFO current money: ${ns.getServerMoneyAvailable(target)}`);
  ns.printf(`INFO max money: ${ns.getServerMaxMoney(target)}`);

  const initialGrowBatch = controller.initialGrow();
  ns.print(JSON.stringify(initialGrowBatch, null, 2));
  for (const task of initialGrowBatch.tasks) {
    const maxRam = ns.getServerMaxRam(ns.getHostname()) - 50;
    const ramCost = ns.getScriptRam(TaskType.Grow);
    const maxThreads = Math.min(maxRam / ramCost);
    while (
      ns.getServerMoneyAvailable(target) !== ns.getServerMaxMoney(target)
    ) {
      ns.run(
        task.taskType,
        Math.min(maxThreads, task.numThreads),
        target,
        task.delay,
        ns.pid,
      );
      await awaitCheck(ns, target, task);
    }
  }

  ns.printf(`INFO current sec: ${ns.getServerSecurityLevel(target)}`);
  ns.printf(`INFO min sec: ${ns.getServerMinSecurityLevel(target)}`);
  ns.printf(`INFO current money: ${ns.getServerMoneyAvailable(target)}`);
  ns.printf(`INFO max money: ${ns.getServerMaxMoney(target)}`);

  const secondWeakenBatch = controller.initialWeaken();
  ns.print(JSON.stringify(secondWeakenBatch, null, 2));
  for (const task of secondWeakenBatch.tasks) {
    while (
      ns.run(task.taskType, task.numThreads, target, task.delay, ns.pid) === 0
    ) {
      await ns.sleep(1000);
    }
  }
  for (const task of secondWeakenBatch.tasks) {
    await awaitCheck(ns, target, task);
  }

  const batch = controller.computeBatchParams();
  ns.print(JSON.stringify(batch, null, 2));
  const delayMult = 200;
  const slottableBatches = Math.ceil(batch.executionTime / (delayMult * 4));
  ns.printf(
    `can slot ${slottableBatches} batches in a ${batch.executionTime} window`,
  );
  for (let i = 0; i < slottableBatches; i++) {
    for (const task of batch.tasks) {
      ns.run(
        task.taskType,
        task.numThreads,
        target,
        task.delay + i * delayMult * 4,
        ns.pid,
      );
    }
  }
  for (;;) {
    // ns.printf(`INFO current sec: ${ns.getServerSecurityLevel(target)}`);
    // ns.printf(`INFO min sec: ${ns.getServerMinSecurityLevel(target)}`);
    // ns.printf(`INFO current money: ${ns.getServerMoneyAvailable(target)}`);
    // ns.printf(`INFO max money: ${ns.getServerMaxMoney(target)}`);

    for (const task of batch.tasks) {
      await awaitCheck(ns, target, task);
    }
    const newBatch = controller.computeBatchParams();
    for (const task of newBatch.tasks) {
      ns.run(
        task.taskType,
        task.numThreads,
        target,
        task.delay + 4 * delayMult,
        ns.pid,
      );
    }
  }
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
