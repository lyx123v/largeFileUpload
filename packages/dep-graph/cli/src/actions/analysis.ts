import path from 'path';

import { drawGraph } from '@demo/dep-graph-web/bootstrap';
import { PnpmLockGraph } from '@demo/dep-graph-core';

export const doAnalysis = async (filename: string) => {
  const graph = new PnpmLockGraph({ lockPath: path.dirname(filename) });
  const deps = await graph.parse();
  await drawGraph({ graph: deps });
};
