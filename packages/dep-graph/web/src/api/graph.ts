import { type DepGraph } from '@demo/dep-graph-core';

export const fetchGraph = async () => {
  const res = await fetch('/api/graph');
  const stats = await res.json();
  return stats as DepGraph;
};
