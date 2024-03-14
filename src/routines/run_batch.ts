import type { NS } from "@ns";
import { BatchController } from "/lib/batch_controller";

export async function main(ns: NS): Promise<void> {
  const target = ns.getServer(ns.args[0] as string);
  const controller = new BatchController(ns, target);

  ns.printf(`INFO current sec: ${target.hackDifficulty}`);
  ns.printf(`INFO min sec: ${target.minDifficulty}`);
  ns.printf(`INFO current money: ${target.moneyAvailable}`);
  ns.printf(`INFO max money: ${target.moneyMax}`);

  const prepareBatch = controller.prepareServer();
  ns.print(JSON.stringify(prepareBatch, null, 2));
  for (const task of prepareBatch.tasks) {
    ns.run(task.taskType, task.numThreads, target.hostname, task.delay);
  }
  await ns.sleep(prepareBatch.executionTime);

  for (;;) {
    ns.printf(`INFO current sec: ${target.hackDifficulty}`);
    ns.printf(`INFO min sec: ${target.minDifficulty}`);
    ns.printf(`INFO current money: ${target.moneyAvailable}`);
    ns.printf(`INFO max money: ${target.moneyMax}`);

    const batch = controller.computeBatchParams();
    ns.print(JSON.stringify(batch, null, 2));

    for (const task of batch.tasks) {
      ns.run(task.taskType, task.numThreads, target.hostname, task.delay);
    }

    await ns.sleep(batch.executionTime);
  }
}
