import {NS} from '@ns';

export class ShortestPastInAGrid {
  ns: NS;
  height!: number;
  width!: number;
  map!: number[][];
  parents!: string[][];

  constructor(ns: NS) {
    this.ns = ns;
  }

  solve(map: number[][]) {
    this.height = map.length;
    this.width = map[0].length;
    this.map = map;

    const queue = [[0, 0]];

    this.parents = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill('X'));
    this.parents[0][0] = 'H';

    while (queue.length > 0) {
      const [x, y] = queue.shift()!;

      if (this.#canGoUp(x, y)) {
        this.parents[x - 1][y] = 'U';
        queue.push([x - 1, y]);
      }
      if (this.#canGoLeft(x, y)) {
        this.parents[x][y - 1] = 'L';
        queue.push([x, y - 1]);
      }
      if (this.#canGoDown(x, y)) {
        this.parents[x + 1][y] = 'D';
        queue.push([x + 1, y]);
      }
      if (this.#canGoRight(x, y)) {
        this.parents[x][y + 1] = 'R';
        queue.push([x, y + 1]);
      }
    }

    const path = [];
    let [curX, curY] = [this.height - 1, this.width - 1];
    let direction = this.parents[curX][curY];

    while (direction != 'X' && direction != 'H') {
      path.push(direction);

      if (direction === 'U') {
        curX++;
        direction = this.parents[curX][curY];
      } else if (direction === 'L') {
        curY++;
        direction = this.parents[curX][curY];
      } else if (direction === 'D') {
        curX--;
        direction = this.parents[curX][curY];
      } else if (direction === 'R') {
        curY--;
        direction = this.parents[curX][curY];
      }
    }

    path.reverse();
    return path.join('');
  }

  #canGoUp(x: number, y: number) {
    return x > 0 && this.map[x - 1][y] == 0 && this.parents[x - 1][y] === 'X';
  }

  #canGoLeft(x: number, y: number) {
    return y > 0 && this.map[x][y - 1] == 0 && this.parents[x][y - 1] === 'X';
  }

  #canGoDown(x: number, y: number) {
    return (
      x < this.height - 1 &&
      this.map[x + 1][y] == 0 &&
      this.parents[x + 1][y] === 'X'
    );
  }

  #canGoRight(x: number, y: number) {
    return (
      y < this.width - 1 &&
      this.map[x][y + 1] == 0 &&
      this.parents[x][y + 1] === 'X'
    );
  }
}
