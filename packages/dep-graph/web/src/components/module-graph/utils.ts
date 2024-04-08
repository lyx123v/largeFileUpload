import { map } from 'lodash-es';
import { type DepGraph } from '@demo/dep-graph-core';
import { type GraphData } from '@antv/g6';

export const stats2g6Data = (graphStats: DepGraph): GraphData => {
  const depRecords = graphStats;
  const nodes: GraphData['nodes'] = [];
  const edges: GraphData['edges'] = [];

  for (const rec of depRecords) {
    const { name, dependencies } = rec;
    const nodeId = name;
    if (nodes.findIndex(r => r.id === nodeId) < 0) {
      nodes.push({
        id: nodeId,
        text: nodeId,
      });
    }
    dependencies.forEach(dep => {
      const edgeId = dep.name;
      const edge = edges.find(e => e.source === nodeId && e.target === edgeId);
      const point = [name, dep.name];
      if (edge) {
        (edge.points as unknown[]).push(point);
      } else {
        edges.push({
          source: nodeId,
          target: edgeId,
          points: [point],
        });
      }
    });
  }

  return {
    nodes: map(nodes, n => ({ ...n })),
    edges,
  };
};

export const createDefaultOptions = partial => {
  const options = {
    fitView: true,
    fitViewPadding: 50,
    animate: true,
    groupByTypes: false,
    minZoom: 0.00000001,
    layout: {
      type: 'force',
      preventOverlap: true,
    },
    defaultNode: {
      size: 15,
      style: {
        lineWidth: 2,
        fill: '#C6E5FF',
      },
    },
    defaultEdge: {
      size: 2,
      color: '#e2e2e2',
      style: {
        endArrow: true,
      },
    },
    defaultCombo: {
      type: 'rect',
    },
    modes: {
      default: [
        'drag-combo',
        'drag-canvas',
        'zoom-canvas',
        {
          type: 'tooltip',
          formatText(model) {
            return model.text;
          },
          offset: 10,
        },
        {
          type: 'edge-tooltip',
          formatText(model) {
            return `<div style="background: #fff; border: 1px solid #eee;padding: 4px 12px;">${model.points
              .map(
                ([from, to]) =>
                  `<p> <strong>${from}</strong> to <strong>${to}</strong></p>`,
              )
              .join('')}</div>`;
          },
          offset: 10,
        },
      ],
    },
    ...partial,
  };
  return options;
};
