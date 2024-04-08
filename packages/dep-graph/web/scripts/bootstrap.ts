import path from 'path';

import { createRsbuild } from '@rsbuild/core';
import { type DepGraph } from '@demo/dep-graph-core';

import createRsbuildConfig from './rsbuild.config';

interface Params {
  graph: DepGraph;
}

export const drawGraph = async (params: Params) => {
  const config = await createRsbuildConfig({
    readStats: () => Promise.resolve(params.graph),
  });
  const rsbuild = await createRsbuild({
    cwd: path.resolve(__dirname, '../'),
    rsbuildConfig: config,
  });
  await rsbuild.startDevServer();
};
