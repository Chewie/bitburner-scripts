import {NS, Server} from '@ns';

export function deepScan(ns: NS, depth: number): Map<string, string> {
  const mark = new Map();
  deepScanRec(ns, mark, 'home', '', depth);
  return mark;
}

function deepScanRec(
  ns: NS,
  mark: Map<string, string>,
  hostname: string,
  parent: string,
  depth: number
) {
  if (depth == 0) {
    return;
  }

  mark.set(hostname, parent);

  ns.scan(hostname)
    .filter(neigh => !neigh.includes('pserv-'))
    .filter(neigh => !mark.has(neigh))
    .forEach(neigh => deepScanRec(ns, mark, neigh, hostname, depth - 1));
}

export function isHackable(ns: NS, server: Server) {
  const numPortsTreshold = getPortOpeners()
    .map(opener => ns.fileExists(opener, 'home'))
    .reduce((acc, cur) => acc + +cur, 0);
  const ret =
    server.requiredHackingSkill! <= ns.getHackingLevel() &&
    server.numOpenPortsRequired! <= numPortsTreshold;

  if (ret && !server.hasAdminRights) {
    ns.printf(`WARN ${server.hostname}: not yet hacked!`);
  }
  return ret;
}

export function getPortOpeners() {
  return [
    'BruteSSH.exe',
    'FTPCrack.exe',
    'relaySMTP.exe',
    'HTTPWorm.exe',
    'SQLInject.exe',
  ];
}

export function getHackScript() {
  return '/scripts/basic_hack_loop.js';
}

export function getShareScript() {
  return '/routines/share.js';
}

export function superNuke(ns: NS, server: Server) {
  if (ns.fileExists('BruteSSH.exe', 'home')) {
    ns.brutessh(server.hostname);
  }
  if (ns.fileExists('FTPCrack.exe', 'home')) {
    ns.ftpcrack(server.hostname);
  }
  if (ns.fileExists('relaySMTP.exe', 'home')) {
    ns.relaysmtp(server.hostname);
  }
  if (ns.fileExists('HTTPWorm.exe', 'home')) {
    ns.httpworm(server.hostname);
  }
  if (ns.fileExists('SQLInject.exe', 'home')) {
    ns.sqlinject(server.hostname);
  }
  ns.nuke(server.hostname);
}

export function execHackScript(ns: NS, server: Server, target: string) {
  const script = getHackScript();
  const ramCost = ns.getScriptRam(script);
  const ramToUse =
    server.hostname == 'home' ? server.maxRam - 1000 : server.maxRam;
  const numThreads = Math.floor(ramToUse / ramCost);

  if (numThreads == 0) {
    ns.printf('%s: no RAM, not running', server.hostname);
  } else {
    ns.printf(
      'Run hack[%s] on %s : maxRam: %s, ramCost: %s, numThreads: %s',
      target,
      server.hostname,
      ramToUse,
      ramCost,
      numThreads
    );
    ns.scp(script, server.hostname);
    ns.kill(script, server.hostname, target);
    ns.scriptKill(getHackScript(), server.hostname);
    ns.scriptKill(getShareScript(), server.hostname);
    ns.exec(script, server.hostname, numThreads, target);
  }
}

export function execShare(ns: NS, server: Server) {
  const script = getShareScript();
  const ramCost = ns.getScriptRam(script);
  const numThreads = Math.floor(server.maxRam / ramCost);

  if (numThreads == 0) {
    ns.printf('%s: no RAM, not running', server.hostname);
  } else {
    ns.printf(
      'Run share on %s : maxRam: %s, ramCost: %s, numThreads: %s',
      server.hostname,
      server.maxRam,
      ramCost,
      numThreads
    );
    ns.scp(script, server.hostname);
    ns.scriptKill(getHackScript(), server.hostname);
    ns.scriptKill(getShareScript(), server.hostname);
    ns.exec(script, server.hostname, numThreads);
  }
}

export function spawnHackScript(ns: NS, target: string) {
  const server = ns.getServer('home');
  const hackScript = getHackScript();
  const ramCost = ns.getScriptRam(hackScript);
  const ramToUse = server.maxRam - 50;
  const numThreads = Math.floor(ramToUse / ramCost);

  ns.kill(hackScript, 'home', target);
  ns.printf(
    'Run hack[%s] on %s : ramToUse: %s, ramCost: %s, numThreads: %s',
    target,
    server.hostname,
    ramToUse,
    ramCost,
    numThreads
  );
  ns.spawn(hackScript, {threads: numThreads, spawnDelay: 500}, target);
}

export function printPath(
  ns: NS,
  hostname: string,
  graph: Map<string, string>
) {
  const path = [];
  while (hostname) {
    path.push(hostname);
    hostname = graph.get(hostname)!;
  }
  path.reverse();

  ns.tprintf(path.join(' -> '));
}
