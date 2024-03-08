import {NS} from '@ns';
import {deepScan} from '/lib/common';

export async function main(ns: NS) {
  const graph = deepScan(ns, 20);

  for (const hostname of graph.keys()) {
    if (hostname == 'home') {
      continue;
    }
    for (const lit of ns.ls(hostname)) {
      if (lit.endsWith('.lit') && !ns.fileExists(lit)) {
        ns.tprintf(`${hostname}: copying ${lit}`);
        ns.scp(lit, 'home', hostname);
      }
    }
  }
}
