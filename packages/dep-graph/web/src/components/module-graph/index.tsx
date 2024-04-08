import { useRef, useEffect } from 'react';

import { throttle } from 'lodash-es';
import { type DepGraph } from '@demo/dep-graph-core';
import { Graph } from '@antv/g6';

import { createDefaultOptions, stats2g6Data } from './utils';

import s from './index.module.less';

export const ModuleGraphChat = ({ graphData }: { graphData: DepGraph }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph>();

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const graphDataConfig = stats2g6Data(graphData);

    if (!graphRef.current) {
      const width = containerRef.current.scrollWidth;
      const height = containerRef.current.scrollHeight;

      const options = createDefaultOptions({
        container: containerRef.current,
        width,
        height,
      });
      const graph = new Graph(options);

      graph.data(graphDataConfig);
      // 渲染图
      graph.render();

      graphRef.current = graph;
    } else {
      // 绑定数据
      graphRef.current.changeData(graphDataConfig);
    }
  }, [graphData]);

  useEffect(() => {
    const RESIZE_THROTTLE_DURATION = 500;
    const onresize = throttle(() => {
      if (graphRef) {
        const $root = containerRef.current;
        graphRef.current!.changeSize($root!.scrollWidth, $root!.scrollHeight);
      }
    }, RESIZE_THROTTLE_DURATION);

    window.addEventListener('resize', onresize);
    return () => {
      window.removeEventListener('resize', onresize);
    };
  }, []);

  return <div className={s.container} ref={containerRef}></div>;
};
