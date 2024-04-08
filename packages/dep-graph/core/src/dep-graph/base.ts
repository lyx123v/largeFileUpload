import { type DepGraph } from '../types';

// 这里可以继续扩展出更多类型，支持 pnpm、npm 等场景
export abstract class BaseDepGraph {
  abstract parse(): Promise<DepGraph>;
}
