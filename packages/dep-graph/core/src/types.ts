type DepTypes = 'dev' | 'prod' | 'peer';

export interface DepGraphNode {
  /**
   * 包名
   */
  name: string;
  /**
   * 标识该 package 是否为外部依赖
   */
  external: boolean;
  /**
   * 包依赖列表
   */
  dependencies: { name: string; version: string; depType: DepTypes }[];
}

export type DepGraph = DepGraphNode[];
