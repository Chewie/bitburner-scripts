import * as common from '/lib/common';
import {NS, Server} from '@ns';

export async function main(ns: NS) {
  ns.disableLog('ALL');
  const graph = common.deepScan(ns, 20);
  const home = ns.getServer('home');

  for (;;) {
    const bots = [...graph]
      .map(([hostname, _parent]) => ns.getServer(hostname))
      .filter(server => server.hostname != 'home')
      .filter(server => common.isHackable(ns, server));

    bots.forEach(function (server) {
      common.superNuke(ns, server);
      common.execShare(ns, server);
    });

    const pservs = ns
      .getPurchasedServers()
      .map(hostname => ns.getServer(hostname));

    const workers = [home].concat(pservs);

    const targets = bots
      .filter(
        server => server.requiredHackingSkill! <= ns.getHackingLevel() / 2
      )
      .toSorted((a: Server, b: Server) => b.moneyMax! - a.moneyMax!);

    for (let i = 0; i < workers.length; i++) {
      if (targets[i]) {
        common.execHackScript(ns, workers[i], targets[i].hostname);
      } else {
        common.execShare(ns, workers[i]);
      }
    }

    ns.printf('Sleeping for 10mins...');
    await ns.sleep(1000 * 60 * 10);
  }
}
