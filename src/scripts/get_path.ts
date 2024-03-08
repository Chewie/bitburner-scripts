import {AutocompleteData, NS} from '@ns';
import * as common from '/lib/common';

export async function main(ns: NS) {
  if (ns.args.length != 1) {
    ns.tprintf('ERROR missing arg target');
    return;
  }

  const target = ns.args[0] as string;

  const graph = common.deepScan(ns, 20);
  common.printPath(ns, target, graph);
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
