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

export interface Batch {
  tasks: Task[];
}
