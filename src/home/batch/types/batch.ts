import type { NS } from "@ns";

export enum TaskType {
  Hack = "/tasks/hack.js",
  Grow = "/tasks/grow.js",
  Weaken = "/tasks/weaken.js",
}

export interface Task {
  type: TaskType;
  numThreads: number;
  runningTime: number;
}

export class Batch {
  constructor(
    private ns: NS,
    public tasks: Task[],
  ) {}

  get maxTime(): number {
    return Math.max(...this.tasks.map((task) => task.runningTime));
  }

  get ramSize(): number {
    return this.tasks
      .map((task) => this.ns.getScriptRam(task.type) * task.numThreads)
      .reduce((acc, cur) => acc + cur, 0);
  }
}
